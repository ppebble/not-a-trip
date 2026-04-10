'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GlobeFallback2D } from './GlobeFallback2D'
import type { GlobeDataPoint } from './HeroSection'

/**
 * 3D 지구본 컴포넌트
 * @react-three/fiber + @react-three/drei 기반 인터랙티브 3D 지구본
 * 마우스 반응 회전, 데이터 포인트 표시, 연결선 효과
 * Requirements: 1.2, 1.3, 1.4, 7.1
 */

interface Globe3DProps {
  dataPoints?: GlobeDataPoint[]
  className?: string
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

/** 카테고리별 포인트 색상 */
const CATEGORY_COLORS: Record<string, string> = {
  animation: '#7CB9E8',
  sports: '#77DD77',
  movie_drama: '#FFB347',
  music: '#DDA0DD',
  game: '#FF6961',
  other: '#CFCFC4',
}

const GLOBE_RADIUS = 1.8

/** 자동 회전 속도 (rad/frame) */
const AUTO_ROTATE_SPEED = 0.003
/** 드래그 종료 후 자동 회전 복귀까지 대기 시간 (ms) */
const RESUME_DELAY = 1500
/** 드래그 감도 */
const DRAG_SENSITIVITY = 0.008

/** 지구본 메시 — 자동 회전 + 드래그 회전 (드래그 중 자동 회전 일시정지) */
function GlobeMesh({ dataPoints }: { dataPoints: GlobeDataPoint[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const previousPointer = useRef({ x: 0, y: 0 })
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRotateActive = useRef(true)
  const { gl } = useThree()

  // 드래그 이벤트 핸들러를 Canvas DOM에 직접 바인딩
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
    // X축 기울기 제한 (-60° ~ 60°)
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

  // DOM 이벤트 바인딩
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

  // 매 프레임: 자동 회전 (드래그 중이 아닐 때만)
  useFrame(() => {
    if (groupRef.current && autoRotateActive.current && !isDragging.current) {
      groupRef.current.rotation.y += AUTO_ROTATE_SPEED
    }
    // 드래그 중 커서 변경
    gl.domElement.style.cursor = isDragging.current ? 'grabbing' : 'grab'
  })

  // 데이터 포인트 위치 계산
  const points = useMemo(
    () =>
      dataPoints.map((dp) => ({
        position: latLngToVector3(dp.lat, dp.lng, GLOBE_RADIUS + 0.02),
        color: CATEGORY_COLORS[dp.category] || CATEGORY_COLORS.other,
        label: dp.label,
      })),
    [dataPoints]
  )

  // 연결선 생성 (인접 포인트 간)
  const connectionLines = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] =
      []
    for (let i = 0; i < points.length - 1; i++) {
      const dist = points[i].position.distanceTo(points[i + 1].position)
      if (dist < 2.0) {
        lines.push({
          start: points[i].position,
          end: points[i + 1].position,
          color: points[i].color,
        })
      }
    }
    return lines
  }, [points])

  return (
    <group ref={groupRef}>
      {/* 지구본 구체 */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#e8f4f8"
          transparent
          opacity={0.85}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* 와이어프레임 격자 */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.005, 24, 24]} />
        <meshBasicMaterial
          color="#b0d4e8"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* 데이터 포인트 */}
      {points.map((point, i) => (
        <mesh key={i} position={point.position}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color={point.color}
            emissive={point.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* 포인트 글로우 */}
      {points.map((point, i) => (
        <mesh key={`glow-${i}`} position={point.position}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={point.color} transparent opacity={0.2} />
        </mesh>
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
    </group>
  )
}

/** 두 포인트 간 곡선 연결선 */
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
      opacity: 0.4,
    })
    return new THREE.Line(geometry, material)
  }, [start, end, color])

  return <primitive ref={lineRef} object={lineObj} />
}

/** 외부 글로우 링 */
function GlobeGlow() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.02
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS + 0.08, 32, 32]} />
      <meshBasicMaterial color="#7CB9E8" transparent opacity={0.08} />
    </mesh>
  )
}

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
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 3, 5]} intensity={0.8} />
          <pointLight position={[-5, -3, -5]} intensity={0.3} color="#b0d4e8" />
          <GlobeMesh dataPoints={dataPoints} />
          <GlobeGlow />
        </Canvas>
      </ErrorBoundaryFallback>
    </div>
  )
}

/**
 * Three.js 렌더링 에러를 잡는 간단한 에러 바운더리
 * 에러 발생 시 GlobeFallback2D로 자동 전환
 */
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
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}
