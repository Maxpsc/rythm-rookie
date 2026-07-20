// 输入：键盘/触摸统一分发
import type { Stage } from '../render/canvas'

export interface InputHandlers {
  onPress?: () => void                 // 空格 / 回车（节奏判定键）
  onKey?: (key: string) => void        // 方向键等菜单操作
  onTap?: (x: number, y: number) => void // 点击/触摸（逻辑坐标）
}

export function bindInput(stage: Stage, getHandlers: () => InputHandlers): void {
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
  stage.canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    const h = getHandlers()
    if (h.onTap) {
      const p = stage.toLogical(e.clientX, e.clientY)
      h.onTap(p.x, p.y)
    } else {
      h.onPress?.()
    }
  })
  // 阻止 iOS 双击缩放/长按弹窗
  stage.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
}
