import { TransformNode, Vector3, type Nullable } from "@babylonjs/core"

export const getYawFromXZ = ({ x, z }: { x: number, z: number }) => {
  return Math.atan2(x, z)
}

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      func(...args)
    }
  }
}

export const rotateAroundY = (vec3: Vector3, theta: number) => {
  const cos = Math.cos(theta)
  const sin = Math.sin(theta)
  return new Vector3(
    vec3.x * cos + vec3.z * sin,
    vec3.y,
    -vec3.x * sin + vec3.z * cos
  )
}


export const getPhysicsBodyFromNode = (node: Nullable<TransformNode>) => {
  while (node) {
    if (node.physicsBody) return node.physicsBody
    node = node.parent as typeof node
  }
  return null
}

export const floatEquals = (num1: number, num2: number) => {
  return Math.abs(num1 - num2) < Number.EPSILON
}

