// 入口：舞台、导航注入、主循环
import { Stage } from './render/canvas'
import { SceneManager } from './core/scene'
import { bindInput } from './core/input'
import { setNav } from './core/nav'
import { TitleScene } from './scenes/title'
import { SelectScene } from './scenes/select'
import { FishGame } from './games/fish'
import { GarlicGame } from './games/garlic'

const stage = new Stage('game')
const manager = new SceneManager()

setNav({
  manager,
  goTitle: () => manager.replace(new TitleScene()),
  goSelect: () => manager.replace(new SelectScene()),
  startGame: (id: string) => manager.replace(id === 'garlic' ? new GarlicGame() : new FishGame()),
})

manager.replace(new TitleScene())

bindInput(stage.canvas, () => ({
  onPress: () => manager.onPress(),
  onKey: (key) => manager.onKey(key),
}))

let last = performance.now()
function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  manager.update(dt)
  const ctx = stage.begin()
  manager.render(ctx)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
