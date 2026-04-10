'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 지구본 위를 걷는 마스코트 3D 모델
 * - 적도 부근을 따라 경도 방향으로 이동
 * - 구 표면 법선 방향으로 수직 정렬 + 진행 방향으로 회전
 */

const MODEL_PATH = '/models/mascot-walk.glb'

interface MascotWalkerProps {
  globeRadius: number
  /** 마스코트 배치 위도 (기본값: 15°) */
  latitude?: number
  /** 이동 속도 (rad/frame, 기본값: 0.003) */
  walkSpeed?: number
  /** 모델 스케일 (기본값: 0.35) */
  scale?: number
}

export function MascotWalker({
  globeRadius,
  latitude = 15,
  walkSpeed = 0.003,
  scale = 0.35,
}: MascotWalkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const longitudeRef = useRef(0)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions, mixer } = useAnimations(animations, groupRef)

  // 애니메이션 재생
  useEffect(() => {
    const names = Object.keys(actions)
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset().fadeIn(0.5).play()
        action.setLoop(THREE.LoopRepeat, Infinity)
      }
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  const phi = (90 - latitude) * (Math.PI / 180)
  const surfaceR = globeRadius + 0.05

  useFrame(() => {
    if (!groupRef.current) return

    // 경도 증가 → 구체 표면을 따라 이동
    longitudeRef.current += walkSpeed
    const theta = longitudeRef.current

    // 구면 좌표 → 3D 위치
    const x = -surfaceR * Math.sin(phi) * Math.cos(theta)
    const y = surfaceR * Math.cos(phi)
    const z = surfaceR * Math.sin(phi) * Math.sin(theta)

    groupRef.current.position.set(x, y, z)

    // 법선 방향 (구 중심 → 표면)
    const normal = new THREE.Vector3(x, y, z).normalize()

    // 진행 방향 (경도 접선) — negate로 앞면 방향 보정
    const tangent = new THREE.Vector3(
      surfaceR * Math.sin(phi) * Math.sin(theta),
      0,
      surfaceR * Math.sin(phi) * Math.cos(theta)
    )
      .normalize()
      .negate()

    // lookAt 매트릭스: 진행 방향을 바라보고, 법선을 up으로
    const mat = new THREE.Matrix4()
    mat.lookAt(new THREE.Vector3(0, 0, 0), tangent, normal)
    groupRef.current.quaternion.setFromRotationMatrix(mat)
  })

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
