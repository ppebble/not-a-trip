'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 지구본 위를 걷는 마스코트 3D 모델
 * - 경도 방향으로 일정하게 전진
 * - 랜덤 간격으로 위도를 부드럽게 변경 (좌우 약간 트는 느낌)
 * - lerp로 위도 전환하여 순간이동 방지
 */

const MODEL_PATH = '/models/mascot-walk.glb'
/** 위도 변경 간격 범위 (초) */
const DRIFT_INTERVAL_MIN = 5
const DRIFT_INTERVAL_MAX = 12
/** 위도 변동 범위 (±도) */
const LAT_DRIFT_RANGE = 5
/** 위도 lerp 속도 (0~1, 작을수록 부드러움) */
const LAT_LERP_SPEED = 0.02

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
  const currentLatRef = useRef(latitude)
  const targetLatRef = useRef(latitude)
  const nextDriftRef = useRef(randomDriftInterval())
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

    // 랜덤 위도 드리프트 타이머
    elapsedRef.current += delta
    if (elapsedRef.current >= nextDriftRef.current) {
      targetLatRef.current =
        latitude + (Math.random() - 0.5) * LAT_DRIFT_RANGE * 2
      targetLatRef.current = THREE.MathUtils.clamp(
        targetLatRef.current,
        latitude - 15,
        latitude + 15
      )
      nextDriftRef.current = randomDriftInterval()
      elapsedRef.current = 0
    }

    // 위도를 부드럽게 보간
    currentLatRef.current = THREE.MathUtils.lerp(
      currentLatRef.current,
      targetLatRef.current,
      LAT_LERP_SPEED
    )

    // 경도 전진 (항상 같은 방향)
    longitudeRef.current += walkSpeed
    const theta = longitudeRef.current
    const phi = (90 - currentLatRef.current) * (Math.PI / 180)
    const surfaceR = globeRadius + 0.05

    const x = -surfaceR * Math.sin(phi) * Math.cos(theta)
    const y = surfaceR * Math.cos(phi)
    const z = surfaceR * Math.sin(phi) * Math.sin(theta)

    groupRef.current.position.set(x, y, z)

    // 법선
    const normal = new THREE.Vector3(x, y, z).normalize()

    // 진행 방향 (경도 접선)
    const tangent = new THREE.Vector3(
      surfaceR * Math.sin(phi) * Math.sin(theta),
      0,
      surfaceR * Math.sin(phi) * Math.cos(theta)
    )
      .normalize()
      .negate()

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

function randomDriftInterval(): number {
  return (
    DRIFT_INTERVAL_MIN +
    Math.random() * (DRIFT_INTERVAL_MAX - DRIFT_INTERVAL_MIN)
  )
}

useGLTF.preload(MODEL_PATH)
