'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 지구본 위를 걷는 마스코트 3D 모델
 * globe.md 설계서: 구체의 특정 위도에 고정, 지구본 자전에 따라 걷는 연출
 * 제자리 걷기(inplace) 애니메이션 사용
 */

const MODEL_PATH = '/models/mascot-walk.glb'

interface MascotWalkerProps {
  globeRadius: number
  /** 마스코트 배치 위도 (도 단위, 기본값: 20° — 적도 약간 위) */
  latitude?: number
  /** 마스코트 배치 경도 (도 단위, 기본값: 0°) */
  longitude?: number
  /** 모델 스케일 (기본값: 0.15) */
  scale?: number
}

export function MascotWalker({
  globeRadius,
  latitude = 20,
  longitude = 0,
  scale = 0.15,
}: MascotWalkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions } = useAnimations(animations, groupRef)

  // 첫 번째 애니메이션 자동 재생
  useEffect(() => {
    const actionNames = Object.keys(actions)
    if (actionNames.length > 0 && actions[actionNames[0]]) {
      const action = actions[actionNames[0]]!
      action.reset().fadeIn(0.3).play()
      action.setLoop(THREE.LoopRepeat, Infinity)
    }
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut(0.3))
    }
  }, [actions])

  // 구 표면 위치 계산 (위도/경도 → 3D 좌표)
  const phi = (90 - latitude) * (Math.PI / 180)
  const theta = (longitude + 180) * (Math.PI / 180)
  const surfaceRadius = globeRadius + 0.01 // 구 표면 바로 위

  const position: [number, number, number] = [
    -surfaceRadius * Math.sin(phi) * Math.cos(theta),
    surfaceRadius * Math.cos(phi),
    surfaceRadius * Math.sin(phi) * Math.sin(theta),
  ]

  // 마스코트가 구 표면에 수직으로 서도록 회전
  useFrame(() => {
    if (groupRef.current) {
      const pos = new THREE.Vector3(...position)
      const normal = pos.clone().normalize()
      // 법선 방향으로 up 벡터 정렬
      const up = new THREE.Vector3(0, 1, 0)
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal)
      groupRef.current.quaternion.copy(quaternion)
      // 걷는 방향으로 약간 회전 (경도 방향)
      groupRef.current.rotateOnAxis(normal, Math.PI * 0.5)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <primitive object={scene.clone()} />
    </group>
  )
}

// GLTF 프리로드
useGLTF.preload(MODEL_PATH)
