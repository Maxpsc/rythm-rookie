// 结算页：评级 + 菜鸡指数 + 吐槽
import type { Scene } from '../core/scene'
import { Tweens, ease } from '../core/tween'
import * as sfx from '../core/sfx'
import * as flat from '../render/flat'
import { W, H } from '../render/canvas'
import { nav } from '../core/nav'
import { saveBestRank } from './select'

export interface ResultData {
  gameId: string
  title: string
  accuracy: number
  rank: string
  maxCombo: number
  perfect: number
  good: number
  miss: number
}

const SNARK: Record<string, string> = {
  S: '菜鸡？不，是节奏大师！',
  A: '有点东西，就差一点！',
  B: '还行，菜中带稳',
  C: '菜鸡本鸡，再接再厉',
}

export class ResultScene implements Scene {
  private tweens = new Tweens()
  private rankScale = 0
  private sel = 0
  private t = 0

  constructor(private data: ResultData) {}

  enter(): void {
    saveBestRank(this.data.gameId, this.data.rank)
    sfx.fanfare(this.data.rank)
    this.tweens.add(0.7, (k) => (this.rankScale = k), { ease: ease.outElastic, delay: 0.3 })
  }

  onPress(): void {
    sfx.uiConfirm()
    if (this.sel === 0) nav.startGame(this.data.gameId)
    else nav.goSelect()
  }

  /** 触摸/点击：直接点按钮 */
  onTap(x: number, y: number): void {
    const by = H - 102
    if (y < by || y > by + 56) return
    if (x >= W / 2 - 220 && x <= W / 2 - 20) {
      this.sel = 0
      this.onPress()
    } else if (x >= W / 2 + 20 && x <= W / 2 + 220) {
      this.sel = 1
      this.onPress()
    }
  }

  onKey(key: string): void {
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'KeyA' || key === 'KeyD') {
      this.sel = 1 - this.sel
      sfx.uiMove()
    } else if (key === 'Escape') {
      nav.goSelect()
    }
  }

  update(dt: number): void {
    this.t += dt
    this.tweens.update(dt)
  }

  render(ctx: CanvasRenderingContext2D): void {
    flat.popBackground(ctx, '#a8e6cf', '#8fd8bc', Math.max(0, Math.sin(this.t * 2)) * 0.3, this.t)

    flat.text(ctx, this.data.title, W / 2, 70, 40, flat.CREAM, 'center', true)

    // 评级大字
    ctx.save()
    ctx.translate(W / 2, 220)
    ctx.scale(this.rankScale, this.rankScale)
    ctx.rotate(Math.sin(this.t * 1.5) * 0.04)
    const rankColor = this.data.rank === 'S' ? '#ffd93c' : this.data.rank === 'A' ? '#ff9f43' : this.data.rank === 'B' ? '#7ee081' : '#9bb0ff'
    flat.text(ctx, this.data.rank, 0, 0, 160, rankColor, 'center', true)
    ctx.restore()

    flat.text(ctx, SNARK[this.data.rank] ?? '', W / 2, 330, 28, flat.INK)

    // 数据行
    const pct = (this.data.accuracy * 100).toFixed(1)
    const rookie = Math.round((1 - this.data.accuracy) * 100)
    flat.text(ctx, `准确率 ${pct}%　最大连击 ${this.data.maxCombo}`, W / 2, 372, 24, flat.INK)
    flat.text(
      ctx,
      `完美 ${this.data.perfect}　不错 ${this.data.good}　失误 ${this.data.miss}　菜鸡指数 ${rookie}%`,
      W / 2,
      406,
      22,
      '#5a6b5a',
    )

    // 按钮
    flat.drawButton(ctx, W / 2 - 220, H - 102, 200, 56, '再来一次', this.sel === 0, '#ffd93c')
    flat.drawButton(ctx, W / 2 + 20, H - 102, 200, 56, '回选关', this.sel === 1, '#c7d0d8')
  }
}
