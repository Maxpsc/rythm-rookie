// 扁平 2D 绘制库：大色块 + 粗描边 + 高饱和撞色
import { W, H } from './canvas'

export const INK = '#2b2b3a'
export const CREAM = '#fff8e7'

export const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif'

type Ctx = CanvasRenderingContext2D

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function text(
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'center',
  outline = false,
): void {
  ctx.save()
  ctx.font = `900 ${size}px ${FONT}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  if (outline) {
    ctx.lineWidth = size / 6
    ctx.strokeStyle = INK
    ctx.strokeText(str, x, y)
  }
  ctx.fillStyle = color
  ctx.fillText(str, x, y)
  ctx.restore()
}

/** 波普风背景：底色 + 随拍脉动的圆点阵 */
export function popBackground(
  ctx: Ctx,
  base: string,
  dot: string,
  beatPulse: number, // 0..1，拍点瞬间为 1 快速衰减
  t: number,
): void {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.fillStyle = dot
  const gap = 96
  const drift = (t * 12) % gap
  for (let y = -1; y < H / gap + 2; y++) {
    for (let x = -1; x < W / gap + 2; x++) {
      const r = 7 + beatPulse * 5 + Math.sin(t * 2 + x * 0.7 + y * 1.3) * 2
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(x * gap + ((y % 2) * gap) / 2 + drift, y * gap, Math.max(r, 1), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

/** 判定反馈弹字 */
export function popText(
  ctx: Ctx,
  str: string,
  x: number,
  y: number,
  scale: number,
  color: string,
  alpha: number,
): void {
  ctx.save()
  ctx.globalAlpha = Math.min(alpha, 1)
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.font = `900 34px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = 8
  ctx.strokeStyle = INK
  ctx.strokeText(str, 0, 0)
  ctx.fillStyle = color
  ctx.fillText(str, 0, 0)
  ctx.restore()
}

/* ---------------- 咸鱼 ---------------- */

export interface FishOpts {
  squash?: number    // 1 正常，<1 压扁，>1 拉长
  angle?: number     // 整体旋转（弧度）
  flat?: boolean     // 被拍扁
  blinkT?: number    // 眩晕星星进度（0 隐藏）
}

export function drawFish(ctx: Ctx, x: number, y: number, opts: FishOpts = {}): void {
  const { squash = 1, angle = 0, flat = false, blinkT = 0 } = opts
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(2 - squash, squash) // 体积守恒的挤压拉伸

  // 尾巴
  ctx.fillStyle = '#e8963c'
  ctx.strokeStyle = INK
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(38, 0)
  ctx.lineTo(66, -18)
  ctx.lineTo(66, 18)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 身体
  ctx.fillStyle = flat ? '#d98e32' : '#f2b84b'
  ctx.beginPath()
  ctx.ellipse(0, 0, 46, 26, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // 肚皮
  ctx.fillStyle = '#ffe1a8'
  ctx.beginPath()
  ctx.ellipse(-4, 8, 30, 13, 0, 0, Math.PI * 2)
  ctx.fill()

  // 条纹
  ctx.strokeStyle = '#d98e32'
  ctx.lineWidth = 5
  for (const sx of [-12, 4, 20]) {
    ctx.beginPath()
    ctx.moveTo(sx, -20)
    ctx.quadraticCurveTo(sx - 6, 0, sx, 20)
    ctx.stroke()
  }

  if (flat) {
    // 扁鱼眼：><
    ctx.strokeStyle = INK
    ctx.lineWidth = 4
    for (const ey of [-7, 7]) {
      ctx.beginPath()
      ctx.moveTo(-34, ey - 5)
      ctx.lineTo(-26, ey)
      ctx.lineTo(-34, ey + 5)
      ctx.stroke()
    }
  } else {
    // 死鱼眼：X
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = INK
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(-28, -7, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-32, -11)
    ctx.lineTo(-24, -3)
    ctx.moveTo(-24, -11)
    ctx.lineTo(-32, -3)
    ctx.stroke()
    // 嘟嘴
    ctx.fillStyle = '#e8763c'
    ctx.beginPath()
    ctx.arc(-42, 6, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    ctx.stroke()
  }
  ctx.restore()

  // 眩晕星星
  if (blinkT > 0) {
    ctx.save()
    ctx.fillStyle = '#ffd93c'
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    for (let i = 0; i < 3; i++) {
      const a = blinkT * 4 + (i * Math.PI * 2) / 3
      const sx = x + Math.cos(a) * 46
      const sy = y - 44 + Math.sin(a) * 8
      drawStar(ctx, sx, sy, 8)
    }
    ctx.restore()
  }
}

export function drawStar(ctx: Ctx, x: number, y: number, r: number): void {
  ctx.save()
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

/* ---------------- 锅铲 ---------------- */

export function drawSpatula(ctx: Ctx, x: number, y: number, angle = 0, smashing = 0): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  // 手柄
  ctx.fillStyle = '#e8503a'
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  roundRect(ctx, 30, -8, 74, 16, 8)
  ctx.fill()
  ctx.stroke()
  // 铲面（smashing>0 时前倾）
  ctx.rotate(smashing * 0.4)
  ctx.fillStyle = '#c7d0d8'
  roundRect(ctx, -58, -26, 92, 52, 12)
  ctx.fill()
  ctx.stroke()
  // 高光
  ctx.fillStyle = '#eef3f6'
  roundRect(ctx, -48, -18, 30, 14, 7)
  ctx.fill()
  ctx.restore()
}

/* ---------------- 菜刀（拍蒜用） ---------------- */

export function drawCleaver(ctx: Ctx, x: number, y: number, chopAngle = 0, scale = 1): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(chopAngle)
  ctx.scale(scale, scale)
  // 刀身
  ctx.fillStyle = '#d8e0e8'
  ctx.strokeStyle = INK
  ctx.lineWidth = 6
  roundRect(ctx, -70, -34, 140, 68, 8)
  ctx.fill()
  ctx.stroke()
  // 刀锋高光
  ctx.fillStyle = '#f4f8fb'
  ctx.beginPath()
  ctx.moveTo(-62, 16)
  ctx.lineTo(62, 16)
  ctx.lineTo(62, 28)
  ctx.lineTo(-62, 28)
  ctx.closePath()
  ctx.fill()
  // 刀柄
  ctx.fillStyle = '#a2663a'
  roundRect(ctx, 68, -14, 44, 28, 10)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

/* ---------------- 蒜 ---------------- */

export function drawGarlic(ctx: Ctx, x: number, y: number, r = 26, smashed = 0): void {
  ctx.save()
  ctx.translate(x, y)
  if (smashed > 0) {
    // 被拍扁的蒜：一滩 + 碎块
    ctx.scale(1 + smashed * 0.6, 1 - smashed * 0.6)
    ctx.fillStyle = '#fff3d9'
    ctx.strokeStyle = INK
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.ellipse(0, 6, r * 1.3, r * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#ffe9bd'
    for (const [dx, dy] of [[-r * 0.5, -2], [r * 0.4, 0], [0, -6]]) {
      ctx.beginPath()
      ctx.arc(dx, dy + 4, r * 0.28, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  } else {
    // 完整蒜头
    ctx.fillStyle = '#fff6e3'
    ctx.strokeStyle = INK
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(0, -r * 1.25)
    ctx.quadraticCurveTo(r * 0.15, -r * 0.7, r * 0.9, -r * 0.2)
    ctx.quadraticCurveTo(r * 1.1, r * 0.7, 0, r)
    ctx.quadraticCurveTo(-r * 1.1, r * 0.7, -r * 0.9, -r * 0.2)
    ctx.quadraticCurveTo(-r * 0.15, -r * 0.7, 0, -r * 1.25)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    // 蒜瓣线
    ctx.strokeStyle = '#d9c4e8'
    ctx.lineWidth = 4
    for (const dx of [-r * 0.4, 0, r * 0.4]) {
      ctx.beginPath()
      ctx.moveTo(dx, -r * 0.55)
      ctx.quadraticCurveTo(dx * 1.3, 0, dx, r * 0.7)
      ctx.stroke()
    }
    // 根须
    ctx.strokeStyle = INK
    ctx.lineWidth = 3
    for (const dx of [-6, 0, 6]) {
      ctx.beginPath()
      ctx.moveTo(dx, r * 0.95)
      ctx.lineTo(dx * 1.4, r * 1.15)
      ctx.stroke()
    }
  }
  ctx.restore()
}

/** 蒜飞一脸的屏幕污渍 */
export function drawFaceSplat(ctx: Ctx, x: number, y: number, k: number): void {
  if (k <= 0) return
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(k, k)
  ctx.fillStyle = 'rgba(255, 243, 217, 0.92)'
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  ctx.beginPath()
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const rr = 60 + Math.sin(i * 2.7) * 22
    const px = Math.cos(a) * rr
    const py = Math.sin(a) * rr
    if (i === 0) ctx.moveTo(px, py)
    else ctx.quadraticCurveTo(Math.cos(a - 0.26) * (rr + 18), Math.sin(a - 0.26) * (rr + 18), px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffe9bd'
  for (const [dx, dy] of [[-16, -8], [14, 6], [0, -22]]) {
    ctx.beginPath()
    ctx.arc(dx, dy, 9, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/* ---------------- UI 部件 ---------------- */

export function drawButton(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  selected: boolean,
  bg = '#ffd93c',
): void {
  ctx.save()
  if (selected) {
    ctx.translate(x + w / 2, y + h / 2)
    ctx.scale(1.06, 1.06)
    ctx.translate(-w / 2, -h / 2)
    x = 0
    y = 0
  }
  ctx.fillStyle = INK
  roundRect(ctx, x + 4, y + 6, w, h, 14)
  ctx.fill()
  ctx.fillStyle = bg
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  roundRect(ctx, x, y, w, h, 14)
  ctx.fill()
  ctx.stroke()
  text(ctx, label, x + w / 2, y + h / 2 + 1, 24, INK)
  ctx.restore()
}

export function drawCombo(ctx: Ctx, combo: number, x: number, y: number, pulse: number): void {
  if (combo < 3) return
  ctx.save()
  ctx.translate(x, y)
  const s = 1 + pulse * 0.25
  ctx.scale(s, s)
  text(ctx, `${combo}`, 0, -16, 40, '#ffd93c', 'center', true)
  text(ctx, '连击', 0, 18, 20, CREAM, 'center', true)
  ctx.restore()
}

/** 提示气泡（教学文案） */
export function drawBubble(ctx: Ctx, x: number, y: number, w: number, h: number, str: string): void {
  ctx.save()
  ctx.fillStyle = CREAM
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 16)
  ctx.fill()
  ctx.stroke()
  text(ctx, str, x, y + 1, 22, INK)
  ctx.restore()
}

/** 返回按钮（游戏内左上角） */
export function drawBackButton(ctx: Ctx, x: number, y: number, r: number): void {
  ctx.save()
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(x + 2, y + 3, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = CREAM
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = INK
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(x + r * 0.4, y - r * 0.45)
  ctx.lineTo(x - r * 0.25, y)
  ctx.lineTo(x + r * 0.4, y + r * 0.45)
  ctx.moveTo(x - r * 0.25, y)
  ctx.lineTo(x + r * 0.5, y)
  ctx.stroke()
  ctx.restore()
}
