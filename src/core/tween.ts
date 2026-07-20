// 轻量缓动与补间
export const ease = {
  linear: (t: number) => t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inQuad: (t: number) => t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inCubic: (t: number) => t * t * t,
  outBack: (t: number) => {
    const c = 1.70158
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
  },
  outElastic: (t: number) => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
  },
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
}

type EaseFn = (t: number) => number

interface Tween {
  t: number
  dur: number
  delay: number
  easeFn: EaseFn
  fn: (k: number) => void
  done?: () => void
}

export class Tweens {
  private list: Tween[] = []

  add(
    dur: number,
    fn: (k: number) => void,
    opts: { ease?: EaseFn; delay?: number; done?: () => void } = {},
  ): void {
    this.list.push({
      t: 0,
      dur: Math.max(dur, 0.0001),
      delay: opts.delay ?? 0,
      easeFn: opts.ease ?? ease.outQuad,
      fn,
      done: opts.done,
    })
  }

  update(dt: number): void {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const tw = this.list[i]
      if (tw.delay > 0) {
        tw.delay -= dt
        continue
      }
      tw.t += dt
      const k = Math.min(tw.t / tw.dur, 1)
      tw.fn(tw.easeFn(k))
      if (k >= 1) {
        this.list.splice(i, 1)
        tw.done?.()
      }
    }
  }

  clear(): void {
    this.list.length = 0
  }
}
