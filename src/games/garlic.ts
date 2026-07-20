// 小游戏 2：拍蒜大师 —— 蒜头滚到刀下的瞬间拍扁它
import { RhythmGame } from './base'
import { garlicSong, hitBeats, countInBeats } from '../songs/garlic-song'
import type { Verdict } from '../core/judge'
import * as sfx from '../core/sfx'
import * as flat from '../render/flat'
import { W } from '../render/canvas'
import { ease } from '../core/tween'

const KNIFE_X = 420
const BELT_Y = 400
const SPAWN_X = W + 60
const PX_PER_BEAT = (SPAWN_X - KNIFE_X) / 2

interface Clove {
  hitBeat: number
  smashed: number
  sad: boolean
}

export class GarlicGame extends RhythmGame {
  private cloves: Clove[] = hitBeats.map((b) => ({ hitBeat: b, smashed: 0, sad: false }))
  private chopT = 0
  private splatK = 0
  private missStreak = 0

  constructor() {
    super(
      { id: 'garlic', title: '拍蒜大师', baseColor: '#ffd6e0', dotColor: '#ffc0d4' },
      garlicSong,
      hitBeats,
      countInBeats,
    )
  }

  override onPress(): void {
    this.chopT = 1
    super.onPress()
  }

  protected handleVerdict(v: Verdict, beat: number): void {
    const fbX = KNIFE_X + 10
    const fbY = 190
    if (v === 'perfect' || v === 'good') {
      const clove = this.cloves.find((c) => c.hitBeat === beat)
      if (clove) {
        this.tweens.add(0.1, (k) => {
          clove.smashed = k
        })
      }
      const perfect = v === 'perfect'
      sfx.smash()
      if (perfect) sfx.perfect()
      this.shake = perfect ? 9 : 5
      this.burst(KNIFE_X, BELT_Y - 24, '#fff3d9', perfect ? 14 : 8, 300)
      this.burst(KNIFE_X, BELT_Y - 24, '#d9c4e8', 5, 220)
      this.spawnFeedback(perfect ? '完美！' : '不错', fbX, fbY, perfect ? '#ffd93c' : '#7ee081', perfect)
    } else if (v === 'miss') {
      const clove = this.cloves.find((c) => c.hitBeat === beat)
      if (clove) clove.sad = true
      this.missStreak++
      sfx.miss()
      if (this.missStreak % 3 === 0) {
        // 蒜你狠！一坨蒜飞你脸上
        sfx.splat()
        this.tweens.add(1.5, (k) => {
          this.splatK = k < 0.15 ? ease.outBack(k / 0.15) : k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1
        })
        this.spawnFeedback('蒜你狠！', W / 2, 330, '#ff6b6b', true)
      } else {
        this.spawnFeedback('蒜跑了…', fbX, fbY, '#ff6b6b')
      }
    } else {
      this.spawnFeedback('拍了个空', fbX, fbY, '#9bb0ff')
      sfx.whiff()
    }
  }

  protected updateGame(dt: number): void {
    this.chopT = Math.max(0, this.chopT - dt / 0.22)
  }

  protected renderGame(ctx: CanvasRenderingContext2D): void {
    // 传送带
    ctx.fillStyle = '#8fa3b8'
    ctx.strokeStyle = flat.INK
    ctx.lineWidth = 6
    flat.roundRect(ctx, -20, BELT_Y, W + 40, 64, 16)
    ctx.fill()
    ctx.stroke()
    // 带面条纹（随节拍滚动）
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, BELT_Y + 4, W, 56)
    ctx.clip()
    ctx.strokeStyle = '#7188a0'
    ctx.lineWidth = 5
    const off = (this.beat * PX_PER_BEAT) % 48
    for (let x = -48; x < W + 48; x += 48) {
      ctx.beginPath()
      ctx.moveTo(x + off, BELT_Y + 8)
      ctx.lineTo(x + off - 14, BELT_Y + 56)
      ctx.stroke()
    }
    ctx.restore()
    // 滚轮
    ctx.fillStyle = '#5c7186'
    for (const x of [60, W - 60]) {
      ctx.beginPath()
      ctx.arc(x, BELT_Y + 64, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // 蒜头
    for (const clove of this.cloves) {
      const hb = clove.hitBeat
      const b = this.beat
      if (b < hb - 2 || b > hb + 1.6) continue
      let x: number
      if (b <= hb) {
        const p = (b - (hb - 2)) / 2
        x = SPAWN_X + (KNIFE_X - SPAWN_X) * p
      } else if (clove.smashed > 0) {
        x = KNIFE_X
        if (b > hb + 0.9) continue
      } else {
        x = KNIFE_X - (b - hb) * PX_PER_BEAT
      }
      if (x < -80) continue
      const bob = clove.sad ? 0 : Math.abs(Math.sin(b * Math.PI)) * 6
      flat.drawGarlic(ctx, x, BELT_Y - 18 - bob, 24, clove.smashed)
    }

    // 菜刀（下压再抬起）
    const swing = this.chopT > 0.5 ? (1 - this.chopT) * 2 : this.chopT * 2
    flat.drawCleaver(ctx, KNIFE_X, 306 + swing * 48, -Math.PI / 2 + swing * 0.22, 0.78)

    // 砧板标记（判定位置提示）
    ctx.save()
    ctx.globalAlpha = 0.35 + this.beatPulse * 0.3
    ctx.strokeStyle = flat.INK
    ctx.lineWidth = 4
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.arc(KNIFE_X, BELT_Y - 18, 34 + this.beatPulse * 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // 蒜你狠糊脸
    flat.drawFaceSplat(ctx, W / 2, 220, this.splatK)

    // 教学气泡
    if (this.beat < 6) {
      flat.drawBubble(ctx, W / 2, 130, 600, 56, '蒜头滚到刀下时，按 空格 / 点击 拍扁它！')
    }
  }
}
