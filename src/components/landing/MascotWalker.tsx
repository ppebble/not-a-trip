'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 지구본 위를 걷는 마스코트 3D 모델
 * - scene을 clone하지 않고 직접 사용하여 애니메이션 바인딩 유지
 * - 구 표면 바깥에 배치 (모델 높이 보정)
 * - 법선 방향으로 수직 정렬
 */

const MODEL_PATH = '/models/mascot-walk.glb'

interface MascotWalkerProps {
  globeRadius: number
  latitude?: number
  longitude?: number
  scale?: number
}

export function MascotWalker({
  globeRadius,
  latitude = 20,
  longitude = 0,
  scale = 0.12,
}: MascotWalkerProps) {
  const groupRef = useRef<THREE.Group>(null)
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
        action.timeScale = 1.0
      }
    }
    return () => {
      mixer.stopAllAction()
    }
  }, [actions, mixer])

  // 구 표면 위치 + 법선 방향 계산
  const { position, quaternion } = useMemo(() => {
    const phi = (90 - latitude) * (Math.PI / 180)
    const theta = (longitude + 180) * (Math.PI / 180)
    // 모델 높이 보정: 구 표면에서 충분히 바깥으로 배치
    const r = globeRadius + 0.02

    const pos = new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    )

    // 법선 방향으로 up 정렬 (모델이 구 표면에 수직으로 서도록)
    const normal = pos.clone().normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    )
    // 걷는 방향 회전 (경도 접선 방향)
    const tangentRotation = new THREE.Quaternion().setFromAxisAngle(
      normal,
      Math.PI * 0.5
    )
    q.multiply(tangentRotation)

    return { position: pos, quaternion: q }
  }, [globeRadius, latitude, longitude])

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      quaternion={quaternion}
      scale={[scale, scale, scale]}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
