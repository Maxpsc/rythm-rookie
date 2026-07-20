// 小游戏 1：咸鱼翻身 —— 锅铲拍下的瞬间翻身躲开
import { RhythmGame } from './base'
import { fishSong, hitBeats, countInBeats } from '../songs/fish-song'
import type { Verdict } from '../core/judge'
import * as sfx from '../core/sfx'
import * as flat from '../render/flat'
import { W } from '../render/canvas'
import { ease } from '../core/tween'

const FX = 330 // 鱼的位置
const FY = 398
const BOARD_Y = 428
const SPAWN_X = W + 80

interface Attack {
  hitBeat: number
  state: 'incoming' | 'dodged' | 'struck'
}

export class FishGame extends RhythmGame {
  private attacks: Attack[] = hitBeats.map((b) => ({ hitBeat: b, state: 'incoming' }))
  private fishRot = 0
  private fishHop = 0
  private flatT = 0

  constructor() {
    super(
      { id: 'fish', title: '咸鱼翻身', baseColor: '#fff3d6', dotColor: '#ffe0a8' },
      fishSong,
      hitBeats,
      countInBeats,
    )
  }

  protected handleVerdict(v: Verdict, beat: number): void {
    const fbX = FX + 30
    const fbY = FY - 110
    if (v === 'perfect' || v === 'good') {
      const atk = this.attacks.find((a) => a.hitBeat === beat)
      if (atk) atk.state = 'dodged'
      const perfect = v === 'perfect'
      this.doFlip(perfect)
      if (perfect) {
        sfx.perfect()
        this.burst(FX, FY - 50, '#ffd93c', 12)
        this.spawnFeedback('完美！', fbX, fbY, '#ffd93c', true)
      } else {
        sfx.good()
        this.spawnFeedback('不错', fbX, fbY, '#7ee081')
      }
    } else if (v === 'miss') {
      const atk = this.attacks.find((a) => a.hitBeat === beat)
      if (atk) atk.state = 'struck'
      this.flatT = 0.9
      this.shake = 16
      sfx.flatten()
      this.burst(FX, FY - 20, '#b8c4cc', 8, 180)
      this.spawnFeedback('被拍扁了…', fbX, fbY, '#ff6b6b')
    } else {
      this.spawnFeedback('扑空了？', fbX, fbY, '#9bb0ff')
      sfx.whiff()
    }
  }

  private doFlip(perfect: boolean): void {
    sfx.flip()
    const height = perfect ? 140 : 95
    this.tweens.add(
      0.5,
      (k) => {
        this.fishRot = k * Math.PI * 2
        this.fishHop = Math.sin(k * Math.PI) * height
      },
      {
        ease: ease.linear,
        done: () => {
          this.fishRot = 0
          this.fishHop = 0
        },
      },
    )
  }

  protected updateGame(dt: number): void {
    this.flatT = Math.max(0, this.flatT - dt)
  }

  protected renderGame(ctx: CanvasRenderingContext2D): void {
    // 案板
    ctx.fillStyle = '#d9a066'
    ctx.strokeStyle = flat.INK
    ctx.lineWidth = 6
    flat.roundRect(ctx, 60, BOARD_Y, W - 120, 44, 12)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#c98d54'
    flat.roundRect(ctx, 84, BOARD_Y + 10, 60, 10, 5)
    ctx.fill()

    // 锅铲
    for (const atk of this.attacks) {
      const hb = atk.hitBeat
      const b = this.beat
      if (b < hb - 2 || b > hb + 1.4) continue
      let x: number
      let y = FY - 32
      let angle = -0.12
      if (b < hb) {
        const p = (b - (hb - 2)) / 2
        x = SPAWN_X + (FX + 64 - SPAWN_X) * p
      } else {
        const k = Math.min((b - hb) / 0.5, 1)
        if (atk.state === 'dodged') {
          x = FX + 64 - k * 260
          y += k * 46
          angle -= k * 0.7
        } else {
          // struck 或未判定：压到鱼身上
          x = FX + 64 - k * 24
          y += k * 42
          angle -= k * 0.35
        }
        const r = Math.max(0, (b - hb - 0.5) / 0.7)
        x += r * 520
        y -= r * 90
      }
      flat.drawSpatula(ctx, x, y, angle)
    }

    // 鱼
    const squash = this.flatT > 0 ? 0.3 : 1 - this.beatPulse * 0.1
    flat.drawFish(ctx, FX, FY - this.fishHop, {
      squash,
      angle: this.fishRot,
      flat: this.flatT > 0,
      blinkT: this.flatT > 0 ? this.flatT : 0,
    })

    // 教学气泡
    if (this.beat < 6) {
      flat.drawBubble(ctx, W / 2, 130, 600, 56, '锅铲拍下的瞬间，按 空格 / 点击 翻身躲开！')
    }
  }
}
