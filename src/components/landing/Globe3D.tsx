'use client'

import { useRef, useMemo, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { GlobeFallback2D } from './GlobeFallback2D'
import type { GlobeDataPoint } from './HeroSection'

/**
 * 3D 지구본 컴포넌트 (globe.md 설계서 기반)
 * - 솔리드 meshPhysicalMaterial 재질
 * - Html 기반 DOM 썸네일 핀 (호버 시 프리뷰 카드)
 * - 노드 분산 알고리즘 (겹침 방지)
 * - 드래그 회전 + 자동 회전
 * Requirements: 1.2, 1.3, 1.4, 7.1
 */

interface Globe3DProps {
  dataPoints?: GlobeDataPoint[]
  className?: string
}

const GLOBE_RADIUS = 1.8
const AUTO_ROTATE_SPEED = 0.003
const RESUME_DELAY = 800
const DRAG_SENSITIVITY = 0.008
/** 노드 간 최소 거리 (분산 알고리즘 임계값) */
const MIN_NODE_DISTANCE = 0.35

/** 카테고리별 색상 */
const CATEGORY_COLORS: Record<string, string> = {
  animation: '#7CB9E8',
  sports: '#77DD77',
  movie_drama: '#FFB347',
  music: '#DDA0DD',
  game: '#FF6961',
  other: '#CFCFC4',
}

/** 위도/경도를 3D 구 좌표로 변환 */
function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * 노드 분산 알고리즘 (Repulsive Force)
 * 가까운 노드들을 서로 밀어내어 겹침을 방지한다.
 */
function disperseNodes(
  positions: THREE.Vector3[],
  minDist: number,
  iterations: number = 10
): THREE.Vector3[] {
  const dispersed = positions.map((p) => p.clone())
  const radius = GLOBE_RADIUS + 0.02

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < dispersed.length; i++) {
      for (let j = i + 1; j < dispersed.length; j++) {
        const dist = dispersed[i].distanceTo(dispersed[j])
        if (dist < minDist && dist > 0.001) {
          // 반발력: 두 노드를 서로 밀어냄
          const force = (minDist - dist) / 2
          const dir = new THREE.Vector3()
            .subVectors(dispersed[i], dispersed[j])
            .normalize()
          dispersed[i].add(dir.clone().multiplyScalar(force))
          dispersed[j].sub(dir.clone().multiplyScalar(force))
          // 구 표면에 다시 투영
          dispersed[i].normalize().multiplyScalar(radius)
          dispersed[j].normalize().multiplyScalar(radius)
        }
      }
    }
  }
  return dispersed
}

// ─── GlobeMesh: 솔리드 지구본 + 드래그/자동 회전 ───

function GlobeMesh({ dataPoints }: { dataPoints: GlobeDataPoint[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const previousPointer = useRef({ x: 0, y: 0 })
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRotateActive = useRef(true)
  const { gl } = useThree()

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      isDragging.current = true
      autoRotateActive.current = false
      previousPointer.current = { x: e.clientX, y: e.clientY }
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
      gl.domElement.setPointerCapture(e.pointerId)
    },
    [gl]
  )

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current || !groupRef.current) return
    const dx = e.clientX - previousPointer.current.x
    const dy = e.clientY - previousPointer.current.y
    groupRef.current.rotation.y += dx * DRAG_SENSITIVITY
    groupRef.current.rotation.x += dy * DRAG_SENSITIVITY
    groupRef.current.rotation.x = THREE.MathUtils.clamp(
      groupRef.current.rotation.x,
      -Math.PI / 3,
      Math.PI / 3
    )
    previousPointer.current = { x: e.clientX, y: e.clientY }
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    resumeTimer.current = setTimeout(() => {
      autoRotateActive.current = true
    }, RESUME_DELAY)
  }, [])

  useMemo(() => {
    const el = gl.domElement
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointerleave', onPointerUp)
    el.style.cursor = 'grab'
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointerleave', onPointerUp)
    }
  }, [gl, onPointerDown, onPointerMove, onPointerUp])

  useFrame(() => {
    if (groupRef.current && autoRotateActive.current && !isDragging.current) {
      groupRef.current.rotation.y += AUTO_ROTATE_SPEED
    }
    gl.domElement.style.cursor = isDragging.current ? 'grabbing' : 'grab'
  })

  // 노드 좌표 계산 + 분산 알고리즘 적용
  const nodes = useMemo(() => {
    const rawPositions = dataPoints.map((dp) =>
      latLngToVector3(dp.lat, dp.lng, GLOBE_RADIUS + 0.02)
    )
    const dispersed = disperseNodes(rawPositions, MIN_NODE_DISTANCE)
    return dataPoints.map((dp, i) => ({
      ...dp,
      position: dispersed[i],
      color: CATEGORY_COLORS[dp.category] || CATEGORY_COLORS.other,
    }))
  }, [dataPoints])

  // 연결선 (인접 노드 간)
  const connectionLines = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] =
      []
    for (let i = 0; i < nodes.length - 1; i++) {
      const dist = nodes[i].position.distanceTo(nodes[i + 1].position)
      if (dist < 2.5) {
        lines.push({
          start: nodes[i].position,
          end: nodes[i + 1].position,
          color: nodes[i].color,
        })
      }
    }
    return lines
  }, [nodes])

  return (
    <group ref={groupRef}>
      {/* 지구본 본체 — meshPhysicalMaterial 솔리드 */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshPhysicalMaterial
          color="#e5e7eb"
          roughness={0.4}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 와이어프레임 격자 (미세한 경위선) */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.003, 24, 24]} />
        <meshBasicMaterial
          color="#94a3b8"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Html 기반 핀 노드 */}
      {nodes.map((node, i) => (
        <SpotPin
          key={i}
          position={node.position}
          color={node.color}
          label={node.label}
          category={node.category}
          thumbnail={node.thumbnail}
        />
      ))}

      {/* 연결선 */}
      {connectionLines.map((line, i) => (
        <ConnectionLine
          key={`line-${i}`}
          start={line.start}
          end={line.end}
          color={line.color}
        />
      ))}

      {/* 글로우 */}
      <GlobeGlow />
    </group>
  )
}

// ─── SpotPin: Html 기반 DOM 썸네일 핀 ───

function SpotPin({
  position,
  color,
  label,
  category,
  thumbnail,
}: {
  position: THREE.Vector3
  color: string
  label: string
  category: string
  thumbnail?: string
}) {
  const [hovered, setHovered] = useState(false)
  const normal = useMemo(() => position.clone().normalize(), [position])
  // 핀 끝 위치 (구 표면에서 바깥으로)
  const pinTip = useMemo(
    () => position.clone().add(normal.clone().multiplyScalar(0.15)),
    [position, normal]
  )

  return (
    <group>
      {/* 구 표면 발광 점 */}
      <mesh position={position}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Html 오버레이 핀 (occlude로 구체 뒤에서 숨김) */}
      <Html
        position={pinTip}
        center
        occlude
        distanceFactor={6}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          className="flex flex-col items-center"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {/* 썸네일 핀 */}
          <div
            className="flex items-center justify-center overflow-hidden rounded-full border-2 transition-transform duration-200"
            style={{
              borderColor: color,
              width: hovered ? 48 : 32,
              height: hovered ? 48 : 32,
              backgroundColor: '#1a1a2e',
              transform: hovered ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt={`${label} ${category}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <span className="text-xs font-bold text-white">{label[0]}</span>
            )}
          </div>

          {/* 호버 시 프리뷰 카드 */}
          {hovered && (
            <div
              className="mt-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-white shadow-lg"
              style={{
                backgroundColor: '#1a1a2eee',
                borderLeft: `3px solid ${color}`,
              }}
            >
              {label}
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

// ─── ConnectionLine: 곡선 연결선 ───

function ConnectionLine({
  start,
  end,
  color,
}: {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
}) {
  const lineRef = useRef<THREE.Line>(null)
  const lineObj = useMemo(() => {
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(GLOBE_RADIUS + 0.3)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const pts = curve.getPoints(20)
    const geometry = new THREE.BufferGeometry().setFromPoints(pts)
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
    })
    return new THREE.Line(geometry, material)
  }, [start, end, color])
  return <primitive ref={lineRef} object={lineObj} />
}

// ─── GlobeGlow: 외부 글로우 ───

function GlobeGlow() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.015
      meshRef.current.scale.set(scale, scale, scale)
    }
  })
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS + 0.06, 32, 32]} />
      <meshBasicMaterial color="#7CB9E8" transparent opacity={0.06} />
    </mesh>
  )
}

// ─── Globe3D: 최상위 export ───

export function Globe3D({ dataPoints = [], className = '' }: Globe3DProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <GlobeFallback2D className={className} />
  }

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="전 세계 성지순례 포인트를 표시하는 인터랙티브 3D 지구본"
    >
      <ErrorBoundaryFallback onError={() => setHasError(true)}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 3, 5]} intensity={1.0} />
          <directionalLight
            position={[-3, -2, -4]}
            intensity={0.3}
            color="#b0d4e8"
          />
          <pointLight position={[0, 5, 0]} intensity={0.2} color="#ffffff" />
          <Suspense fallback={null}>
            <GlobeMesh dataPoints={dataPoints} />
          </Suspense>
        </Canvas>
      </ErrorBoundaryFallback>
    </div>
  )
}

// ─── ErrorBoundary ───

import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  onError: () => void
}
interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundaryFallback extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError()
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
