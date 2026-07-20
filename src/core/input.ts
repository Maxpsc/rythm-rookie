// 输入：键盘/触摸统一分发
export interface InputHandlers {
  onPress?: () => void          // 空格 / 回车 / 点击（节奏判定键）
  onKey?: (key: string) => void // 方向键等菜单操作
}

export function bindInput(canvas: HTMLCanvasElement, getHandlers: () => InputHandlers): void {
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return
    const h = getHandlers()
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyJ' || e.code === 'KeyF') {
      e.preventDefault()
      h.onPress?.()
    } else if (e.code.startsWith('Arrow') || e.code === 'Escape') {
      e.preventDefault()
      h.onKey?.(e.code)
    } else {
      h.onKey?.(e.code)
    }
  })
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    getHandlers().onPress?.()
  })
}
