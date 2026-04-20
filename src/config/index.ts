import { Vector3 } from "@babylonjs/core"

export const DirectionVec = {
  W: Object.freeze(Vector3.Forward()),
  A: Object.freeze(Vector3.Left()),
  S: Object.freeze(Vector3.Backward()),
  D: Object.freeze(Vector3.Right()),
  WA: Object.freeze(new Vector3(-1, 0, 1)),
  WD: Object.freeze(new Vector3(1, 0, 1)),
  SA: Object.freeze(new Vector3(-1, 0, -1)),
  SD: Object.freeze(new Vector3(1, 0, -1))
} as const

export const ZeroVector3 = Object.freeze(Vector3.Zero())

export const GRAVITY = Object.freeze(new Vector3(0, -10, 0))

/**
 * 阴影模糊半径
 * | Value | Type                      | Description      |
 * | ----- | --------------------------| ---------------- |
 * | 8     | SHARP                     | 清晰（硬一点）      |
 * | 16    | SOFT                      | 轻微柔和（推荐默认） |
 * | 24    | SOFTER                    | 比较自然           |
 * | 32    | SOFTEST                   | 很柔和（常用上限）   |
 * | 48    | CINEMATIC                 | 电影级（偏糊）      |
 * | 64    | EXTREME                   | 极度模糊（谨慎用）   |
 */
export const enum ShadowBlurKernel {
  SHARP = 8,
  SOFT = 16,
  SOFTER = 24,
  SOFTEST = 32,
  CINEMATIC = 48,
  EXTREME = 64
}

/**
 * 材质粗糙度等级
 * | Value | Type                      | Description      |
 * | ----- | --------------------------| ---------------- |
 * | 8     | VERY_ROUGH                | 非常粗糙（泥土、沙地）|
 * | 16    | ROUGH                     | 粗糙（地面推荐）    |
 * | 32    | NORMAL                    | 普通              |
 * | 64    | SMOOTH                    | 较光滑            |
 * | 128   | SHINY                     | 很亮（塑料感）      |
 * | 256   | MIRROR                    | 极强高光（接近镜面）  |
 */
export const enum SpecularPower {
  VERY_ROUGH = 8,
  ROUGH = 16,
  NORMAL = 32,
  SMOOTH = 64,
  SHINY = 128,
  MIRROR = 256
}

/**
 * 法线强度
 */
export const enum BumpLevel {
  OFF = 0,
  VERY_WEAK = 0.3,
  WEAK = 0.5,
  NORMAL = 1.0,
  STRONG = 2.0,
}

export const BULLET_VELOCITY = 200

export const TP_MOUSE_MAX_SENSIBILITY = 100 as const

export const TP_MOUSE_MIN_SENSIBILITY = 3000 as const

export const FP_MOUSE_MAX_SENSIBILITY = 500 as const

export const FP_MOUSE_MIN_SENSIBILITY = 5000 as const

export const MOVE_SPEED = 5 as const

export const PLAYER_SELF_LAYER = 0b10

export const DEFAULT_LAYER = 0b1

export const NEAR_PLANE = 0.1

export const FLASHLIGHT_INTENSITY = 3000