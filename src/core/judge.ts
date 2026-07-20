// 判定器：把按键时间戳和判定拍点对齐
import { audio } from './audio'
import { Conductor } from './conductor'

export type Verdict = 'perfect' | 'good' | 'miss' | 'whiff'

export interface HitPoint {
  beat: number
  judged: boolean
}

export class Judge {
  /** 判定窗口（秒）：完美 ±80ms，不错 ±150ms。按听到的拍子按键即可（已扣输出延迟） */
  perfectWin = 0.08
  goodWin = 0.15

  perfect = 0
  good = 0
  missCount = 0
  combo = 0
  maxCombo = 0

  onVerdict?: (v: Verdict, beat: number) => void

  private hits: HitPoint[]

  constructor(beats: number[], private conductor: Conductor) {
    this.hits = [...beats].sort((a, b) => a - b).map((beat) => ({ beat, judged: false }))
  }

  get total(): number {
    return this.hits.length
  }

  /** 一次按键（时间戳扣除扬声器输出延迟，对齐"听到的拍子"） */
  press(): void {
    const t = audio.now() - audio.latency()
    let best: HitPoint | null = null
    let bestDt = Infinity
    for (const h of this.hits) {
      if (h.judged) continue
      const dt = t - this.conductor.beatToTime(h.beat)
      if (dt < -this.goodWin) break // 后面的更远
      if (Math.abs(dt) <= this.goodWin && Math.abs(dt) < Math.abs(bestDt)) {
        best = h
        bestDt = dt
      }
    }
    if (!best) {
      this.onVerdict?.('whiff', NaN)
      return
    }
    best.judged = true
    const v: Verdict = Math.abs(bestDt) <= this.perfectWin ? 'perfect' : 'good'
    if (v === 'perfect') this.perfect++
    else this.good++
    this.combo++
    this.maxCombo = Math.max(this.maxCombo, this.combo)
    this.onVerdict?.(v, best.beat)
  }

  /** 每帧调用：把已经漏掉的拍点判为 miss（与 press 用同一补偿时钟） */
  update(): void {
    const t = audio.now() - audio.latency()
    for (const h of this.hits) {
      if (h.judged) continue
      const dt = t - this.conductor.beatToTime(h.beat)
      if (dt > this.goodWin) {
        h.judged = true
        this.missCount++
        this.combo = 0
        this.onVerdict?.('miss', h.beat)
      } else if (dt < -1) {
        break
      }
    }
  }

  get done(): boolean {
    return this.hits.every((h) => h.judged)
  }

  /** 最终准确率：perfect=1, good=0.6, miss=0 */
  get accuracy(): number {
    if (this.total === 0) return 1
    return (this.perfect + this.good * 0.6) / this.total
  }

  get rank(): string {
    const a = this.accuracy
    if (a >= 0.95) return 'S'
    if (a >= 0.85) return 'A'
    if (a >= 0.7) return 'B'
    return 'C'
  }
}
