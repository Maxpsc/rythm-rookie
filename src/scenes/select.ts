// 选关页：两张怪诞卡片
import type { Scene } from '../core/scene'
import { Conductor } from '../core/conductor'
import { titleSong } from '../songs/title-song'
import * as sfx from '../core/sfx'
import * as flat from '../render/flat'
import { W, H } from '../render/canvas'
import { nav } from '../core/nav'

interface Entry {
  id: string
  title: string
  sub: string
  drawIcon: (ctx: CanvasRenderingContext2D, x: number, y: number) => void
}

const ENTRIES: Entry[] = [
  {
    id: 'fish',
    title: '咸鱼翻身',
    sub: '锅铲来了，快翻！',
    drawIcon: (ctx, x, y) => flat.drawFish(ctx, x, y, { squash: 0.95, angle: -0.2 }),
  },
  {
    id: 'garlic',
    title: '拍蒜大师',
    sub: '蒜你狠，拍就完了',
    drawIcon: (ctx, x, y) => {
      flat.drawGarlic(ctx, x - 14, y + 10, 38)
      flat.drawCleaver(ctx, x + 34, y - 34, -Math.PI / 2 + 0.35, 0.55)
    },
  },
]

const RANK_ORDER = ['C', 'B', 'A', 'S']

export function bestRank(gameId: string): string | null {
  return localStorage.getItem(`rr-best-${gameId}`)
}

export function saveBestRank(gameId: string, rank: string): void {
  const cur = bestRank(gameId)
  if (!cur || RANK_ORDER.indexOf(rank) > RANK_ORDER.indexOf(cur)) {
    localStorage.setItem(`rr-best-${gameId}`, rank)
  }
}

export class SelectScene implements Scene {
  private conductor = new Conductor(titleSong, true)
  private sel = 0
  private beatPulse = 0
  private lastIntBeat = -99
  private t = 0

  enter(): void {
    this.conductor.start()
  }

  exit(): void {
    this.conductor.stop()
  }

  onPress(): void {
    sfx.uiConfirm()
    nav.startGame(ENTRIES[this.sel].id)
  }

  onKey(key: string): void {
    if (key === 'ArrowLeft' || key === 'KeyA') {
      this.sel = (this.sel + ENTRIES.length - 1) % ENTRIES.length
      sfx.uiMove()
    } else if (key === 'ArrowRight' || key === 'KeyD') {
      this.sel = (this.sel + 1) % ENTRIES.length
      sfx.uiMove()
    } else if (key === 'Escape') {
      nav.goTitle()
    }
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
    flat.popBackground(ctx, '#ffd93c', '#ffcf2e', this.beatPulse, this.t)
    flat.text(ctx, '选择你的刑场', W / 2, 80, 48, flat.CREAM, 'center', true)

    const cw = 320
    const ch = 300
    const gap = 80
    const totalW = ENTRIES.length * cw + (ENTRIES.length - 1) * gap
    const x0 = (W - totalW) / 2

    ENTRIES.forEach((e, i) => {
      const x = x0 + i * (cw + gap)
      const y = 140
      const selected = i === this.sel
      ctx.save()
      const cx = x + cw / 2
      const cy = y + ch / 2
      ctx.translate(cx, cy)
      if (selected) {
        const s = 1.04 + this.beatPulse * 0.02
        ctx.scale(s, s)
        ctx.rotate(Math.sin(this.t * 2) * 0.015)
      }
      ctx.translate(-cx, -cy)
      // 阴影 + 卡体
      ctx.fillStyle = flat.INK
      flat.roundRect(ctx, x + 6, y + 8, cw, ch, 20)
      ctx.fill()
      ctx.fillStyle = selected ? flat.CREAM : '#f2e8d5'
      ctx.strokeStyle = flat.INK
      ctx.lineWidth = 6
      flat.roundRect(ctx, x, y, cw, ch, 20)
      ctx.fill()
      ctx.stroke()
      // 图标
      e.drawIcon(ctx, cx, y + 120)
      // 文案
      flat.text(ctx, e.title, cx, y + 215, 38, flat.INK)
      flat.text(ctx, e.sub, cx, y + 256, 20, '#8a7a5c')
      // 最佳成绩角标
      const best = bestRank(e.id)
      if (best) {
        ctx.fillStyle = '#ff6b6b'
        ctx.strokeStyle = flat.INK
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.arc(x + cw - 34, y + 34, 24, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        flat.text(ctx, best, x + cw - 34, y + 35, 26, flat.CREAM)
      }
      ctx.restore()
    })

    flat.text(ctx, '← → 选择　空格 开始　Esc 回标题', W / 2, H - 50, 20, flat.INK)
  }
}
