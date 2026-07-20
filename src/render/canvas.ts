// 舞台：960×540 逻辑分辨率，等比缩放居中，DPR 适配
export const W = 960
export const H = 540

export class Stage {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  private scale = 1
  private ox = 0
  private oy = 0

  constructor(id: string) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    window.addEventListener('resize', () => this.resize())
    this.resize()
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.round(window.innerWidth * dpr)
    this.canvas.height = Math.round(window.innerHeight * dpr)
    this.scale = Math.min(this.canvas.width / W, this.canvas.height / H)
    this.ox = (this.canvas.width - W * this.scale) / 2
    this.oy = (this.canvas.height - H * this.scale) / 2
  }

  /** 客户端坐标 → 逻辑坐标 */
  toLogical(cx: number, cy: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    const px = ((cx - rect.left) / rect.width) * this.canvas.width
    const py = ((cy - rect.top) / rect.height) * this.canvas.height
    return { x: (px - this.ox) / this.scale, y: (py - this.oy) / this.scale }
  }

  /** 每帧开始：清屏并设置逻辑坐标变换 */
  begin(): CanvasRenderingContext2D {
    const { ctx } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#1b1b26'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(this.scale, 0, 0, this.scale, this.ox, this.oy)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    return ctx
  }
}
