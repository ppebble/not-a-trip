'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 지구본 위를 걷는 마스코트 3D 모델
 * - 구체 표면을 따라 경도 방향으로 이동
 * - 랜덤 간격으로 방향 전환 (위도도 약간 변동)
 * - 법선 방향 수직 정렬 + 진행 방향 회전
 */

const MODEL_PATH = '/models/mascot-walk.glb'
/** 방향 전환 간격 범위 (초) */
const DIR_CHANGE_MIN = 4
const DIR_CHANGE_MAX = 10

interface MascotWalkerProps {
  globeRadius: number
  latitude?: number
  walkSpeed?: number
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
  const latitudeRef = useRef(latitude)
  const directionRef = useRef(1) // 1 또는 -1
  const nextChangeRef = useRef(randomInterval())
  const elapsedRef = useRef(0)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions, mixer } = useAnimations(animations, groupRef)

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

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // 랜덤 방향 전환 타이머
    elapsedRef.current += delta
    if (elapsedRef.current >= nextChangeRef.current) {
      directionRef.current *= -1
      // 위도도 약간 랜덤 변동 (±10°)
      latitudeRef.current = latitude + (Math.random() - 0.5) * 20
      latitudeRef.current = THREE.MathUtils.clamp(latitudeRef.current, -30, 50)
      nextChangeRef.current = randomInterval()
      elapsedRef.current = 0
    }

    // 경도 이동
    longitudeRef.current += walkSpeed * directionRef.current
    const theta = longitudeRef.current
    const phi = (90 - latitudeRef.current) * (Math.PI / 180)
    const surfaceR = globeRadius + 0.05

    const x = -surfaceR * Math.sin(phi) * Math.cos(theta)
    const y = surfaceR * Math.cos(phi)
    const z = surfaceR * Math.sin(phi) * Math.sin(theta)

    groupRef.current.position.set(x, y, z)

    // 법선
    const normal = new THREE.Vector3(x, y, z).normalize()

    // 진행 방향 (경도 접선) — direction으로 앞/뒤 전환
    const tangent = new THREE.Vector3(
      surfaceR * Math.sin(phi) * Math.sin(theta),
      0,
      surfaceR * Math.sin(phi) * Math.cos(theta)
    )
      .normalize()
      .multiplyScalar(-directionRef.current)

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

function randomInterval(): number {
  return DIR_CHANGE_MIN + Math.random() * (DIR_CHANGE_MAX - DIR_CHANGE_MIN)
}

useGLTF.preload(MODEL_PATH)
