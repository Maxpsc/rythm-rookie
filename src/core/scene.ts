// 场景接口与管理器（带淡入淡出切换）
export interface Scene {
  enter?(): void
  exit?(): void
  update(dt: number): void
  render(ctx: CanvasRenderingContext2D): void
  onPress?(): void
  onKey?(key: string): void
}

export class SceneManager {
  private current: Scene | null = null
  private fade = 0 // >0 表示正在淡入

  replace(next: Scene): void {
    this.current?.exit?.()
    this.current = next
    next.enter?.()
    this.fade = 0.35
  }

  get scene(): Scene | null {
    return this.current
  }

  update(dt: number): void {
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt)
    this.current?.update(dt)
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.current?.render(ctx)
    if (this.fade > 0) {
      ctx.save()
      ctx.globalAlpha = this.fade / 0.35
      ctx.fillStyle = '#1b1b26'
      ctx.fillRect(0, 0, 960, 540)
      ctx.restore()
    }
  }

  onPress(): void {
    this.current?.onPress?.()
  }

  onKey(key: string): void {
    this.current?.onKey?.(key)
  }
}
