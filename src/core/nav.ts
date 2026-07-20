// 全局导航：由 main.ts 注入，避免场景/游戏之间的循环依赖
import type { SceneManager } from './scene'

export interface Nav {
  manager: SceneManager
  goTitle(): void
  goSelect(): void
  startGame(id: string): void
}

export let nav: Nav

export function setNav(n: Nav): void {
  nav = n
}
