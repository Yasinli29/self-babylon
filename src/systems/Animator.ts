import type { AnimationGroup } from "@babylonjs/core";

interface IOption {
  autoPlay?: boolean;
}

class Animator<T extends string> {
  animMap = {} as Record<T, AnimationGroup>
  current: AnimationGroup | null = null

  constructor(animGroup: AnimationGroup[], options: IOption = {}) {
    const { autoPlay = false } = options

    for (const anim of animGroup) {
      this.animMap[anim.name as T] = anim
    }

    if (animGroup.length) {
      autoPlay ? this.play(animGroup[0].name as T) : animGroup[0].stop()
    }
  }

  play(name: T, loop: boolean = true) {
    const next = this.animMap[name as T]
    if (next === this.current) return
    next.start(loop)
    this.current?.stop()
    this.current = next
  }

  stop() {
    this.current?.stop()
    this.current = null
  }

  setSpeedRatio(speedRatio: number) {
    if (this.current && this.current.speedRatio !== speedRatio) {
      this.current.speedRatio = speedRatio
    }
  }
}

export default Animator