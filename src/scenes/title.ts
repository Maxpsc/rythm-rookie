// 标题页：logo 随拍摇摆，首次交互解锁音频
import type { Scene } from '../core/scene'
import { Conductor } from '../core/conductor'
import { titleSong } from '../songs/title-song'
import { audio } from '../core/audio'
import * as sfx from '../core/sfx'
import * as flat from '../render/flat'
import { W, H } from '../render/canvas'
import { nav } from '../core/nav'

export class TitleScene implements Scene {
  private conductor = new Conductor(titleSong, true)
  private unlocked = false
  private beatPulse = 0
  private lastIntBeat = -99
  private t = 0

  onPress(): void {
    if (!this.unlocked) {
      audio.ensure()
      this.conductor.start()
      this.unlocked = true
      sfx.uiConfirm()
      return
    }
    sfx.uiConfirm()
    nav.goSelect()
  }

  exit(): void {
    this.conductor.stop()
  }

  update(dt: number): void {
    this.t += dt
    const ib = Math.floor(this.conductor.beat)
    if (ib !== this.lastIntBeat) {
      this.lastIntBeat = ib
      this.beatPulse = 1
    }
    this.beatPulse = Math.max(0, this.beatPulse - dt * 3)
  }

  render(ctx: CanvasRenderingContext2D): void {
    flat.popBackground(ctx, '#ff6b6b', '#ff8585', this.beatPulse, this.t)

    // 咸鱼吉祥物随拍弹跳
    const hop = this.unlocked ? Math.abs(Math.sin(this.conductor.beat * Math.PI)) * 26 : 0
    flat.drawFish(ctx, W / 2 + 240, 210 - hop, { squash: 1 - this.beatPulse * 0.08, angle: -0.15 })

    // 主标题
    ctx.save()
    ctx.translate(W / 2 - 40, 220)
    ctx.rotate(Math.sin(this.t * 1.2) * 0.03)
    const s = 1 + this.beatPulse * 0.05
    ctx.scale(s, s)
    flat.text(ctx, '节奏菜鸡', 0, 0, 110, flat.CREAM, 'center', true)
    ctx.restore()
    flat.text(ctx, 'RYTHM ROOKIE', W / 2 - 40, 300, 26, '#ffd93c', 'center', true)
    flat.text(ctx, '—— 献给每一个踩不准拍子的人 ——', W / 2 - 40, 344, 20, flat.CREAM)

    // 提示
    const blink = Math.sin(this.t * 4) > -0.4
    if (blink) {
      flat.text(
        ctx,
        this.unlocked ? '按 空格 / 点击 开始' : '点击任意处 打开声音',
        W / 2,
        H - 80,
        26,
        flat.CREAM,
        'center',
        true,
      )
    }
    flat.text(ctx, 'ALL BUILD WITH K3 ｜ 致敬节奏天国（RYTHM HEAVEN）', W / 2, H - 28, 16, flat.CREAM)
  }
}
