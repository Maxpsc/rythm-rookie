// 小游戏基类：数拍进入、事件表驱动、判定接线、HUD、结算
import { Conductor, type Song } from '../core/conductor'
import { Judge, type Verdict } from '../core/judge'
import type { Scene } from '../core/scene'
import { Tweens, ease } from '../core/tween'
import { nav } from '../core/nav'
import * as flat from '../render/flat'
import { W, H } from '../render/canvas'
import { ResultScene } from '../scenes/result'

export interface GameMeta {
  id: string
  title: string
  baseColor: string
  dotColor: string
}

interface Feedback {
  str: string
  x: number
  y: number
  t: number
  color: string
  big: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  t: number
  life: number
  color: string
  size: number
  rot: number
  vr: number
}

export abstract class RhythmGame implements Scene {
  protected conductor: Conductor
  protected judge: Judge
  protected tweens = new Tweens()
  protected time = 0
  protected beatPulse = 0
  protected shake = 0

  private feedbacks: Feedback[] = []
  private particles: Particle[] = []
  private lastIntBeat = -99
  private finishT = 0

  constructor(
    protected meta: GameMeta,
    song: Song,
    hitBeats: number[],
    private countIn: number,
  ) {
    this.conductor = new Conductor(song)
    this.judge = new Judge(hitBeats, this.conductor)
    this.judge.onVerdict = (v, beat) => this.handleVerdict(v, beat)
  }

  enter(): void {
    this.conductor.start(this.countIn)
  }

  exit(): void {
    this.conductor.stop()
  }

  onPress(): void {
    if (this.finishT > 0) return
    this.judge.press()
  }

  /** 触摸/点击：左上角返回按钮优先，其余算一次判定按键 */
  onTap(x: number, y: number): void {
    const dx = x - RhythmGame.BACK_X
    const dy = y - RhythmGame.BACK_Y
    if (dx * dx + dy * dy <= 30 * 30) {
      nav.goSelect()
      return
    }
    this.onPress()
  }

  protected static readonly BACK_X = 42
  protected static readonly BACK_Y = 34

  onKey(key: string): void {
    if (key === 'Escape') nav.goSelect()
  }

  get beat(): number {
    return this.conductor.beat
  }

  get spb(): number {
    return this.conductor.spb
  }

  update(dt: number): void {
    this.time += dt
    this.tweens.update(dt)
    this.judge.update()

    const ib = Math.floor(this.conductor.beat)
    if (ib !== this.lastIntBeat) {
      this.lastIntBeat = ib
      this.beatPulse = 1
    }
    this.beatPulse = Math.max(0, this.beatPulse - dt * 3.2)
    this.shake = Math.max(0, this.shake - dt * 40)

    for (let i = this.feedbacks.length - 1; i >= 0; i--) {
      this.feedbacks[i].t += dt
      if (this.feedbacks[i].t > 0.9) this.feedbacks.splice(i, 1)
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.t += dt
      p.vy += p.g * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt
      if (p.t > p.life) this.particles.splice(i, 1)
    }

    this.updateGame(dt)

    if (this.finishT === 0 && this.conductor.finished) {
      this.finishT = 1.2
    } else if (this.finishT > 0) {
      this.finishT -= dt
      if (this.finishT <= 0) this.toResult()
    }
  }

  private toResult(): void {
    nav.manager.replace(
      new ResultScene({
        gameId: this.meta.id,
        title: this.meta.title,
        accuracy: this.judge.accuracy,
        rank: this.judge.rank,
        maxCombo: this.judge.maxCombo,
        perfect: this.judge.perfect,
        good: this.judge.good,
        miss: this.judge.missCount,
      }),
    )
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    if (this.shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake)
    }
    flat.popBackground(ctx, this.meta.baseColor, this.meta.dotColor, this.beatPulse, this.time)
    this.renderGame(ctx)
    this.renderParticles(ctx)
    this.renderHUD(ctx)
    for (const f of this.feedbacks) {
      const k = Math.min(f.t / 0.15, 1)
      const scale = f.big ? ease.outBack(k) * 1.25 : ease.outBack(k) * 0.9
      const alpha = f.t > 0.6 ? 1 - (f.t - 0.6) / 0.3 : 1
      flat.popText(ctx, f.str, f.x, f.y - f.t * 30, scale, f.color, alpha)
    }
    ctx.restore()
    this.renderCountdown(ctx)
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = 1 - p.t / p.life
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx.restore()
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    // 返回按钮
    flat.drawBackButton(ctx, RhythmGame.BACK_X, RhythmGame.BACK_Y, 22)
    // 进度条
    const progress = Math.max(0, Math.min(this.conductor.beat / this.conductor.lengthBeats, 1))
    ctx.save()
    flat.roundRect(ctx, 78, 26, 160, 14, 7)
    ctx.fillStyle = 'rgba(43,43,58,0.25)'
    ctx.fill()
    flat.roundRect(ctx, 78, 26, 160 * progress, 14, 7)
    ctx.fillStyle = flat.INK
    ctx.fill()
    flat.text(ctx, this.meta.title, 78, 60, 20, flat.INK, 'left')
    ctx.restore()
    // 连击
    flat.drawCombo(ctx, this.judge.combo, W - 90, 90, this.beatPulse)
  }

  private renderCountdown(ctx: CanvasRenderingContext2D): void {
    const b = this.conductor.beat
    if (b < 0) {
      const n = Math.ceil(-b)
      const frac = -b - Math.floor(-b)
      const scale = 1 + frac * 0.4
      ctx.save()
      ctx.translate(W / 2, H / 2 - 60)
      ctx.scale(scale, scale)
      flat.text(ctx, String(n), 0, 0, 96, '#ffd93c', 'center', true)
      ctx.restore()
      flat.text(ctx, '预备——跟着拍子来！', W / 2, H / 2 + 30, 26, flat.INK)
    } else if (b < 1) {
      const k = b
      ctx.save()
      ctx.globalAlpha = 1 - k
      ctx.translate(W / 2, H / 2 - 60)
      ctx.scale(1 + k * 0.6, 1 + k * 0.6)
      flat.text(ctx, '开始！', 0, 0, 80, '#ff6b6b', 'center', true)
      ctx.restore()
    }
  }

  protected spawnFeedback(str: string, x: number, y: number, color: string, big = false): void {
    this.feedbacks.push({ str, x, y, t: 0, color, big })
  }

  protected burst(x: number, y: number, color: string, n: number, speed = 260): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = speed * (0.4 + Math.random() * 0.8)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 120,
        g: 700,
        t: 0,
        life: 0.5 + Math.random() * 0.4,
        color,
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 12,
      })
    }
  }

  protected abstract updateGame(dt: number): void
  protected abstract renderGame(ctx: CanvasRenderingContext2D): void
  protected abstract handleVerdict(v: Verdict, beat: number): void
}
