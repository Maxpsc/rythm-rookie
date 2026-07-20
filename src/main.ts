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

bindInput(stage, () => ({
  onPress: () => manager.onPress(),
  onKey: (key) => manager.onKey(key),
  onTap: (x, y) => manager.onTap(x, y),
}))

let last = performance.now()
function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  manager.update(dt)
  const ctx = stage.begin()
  manager.render(ctx)
  // 竖屏提示（手机横过来玩）
  if (window.innerHeight > window.innerWidth) {
    ctx.save()
    ctx.fillStyle = 'rgba(27,27,38,0.82)'
    ctx.fillRect(0, 0, 960, 540)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff8e7'
    ctx.font = '900 40px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    ctx.fillText('竖屏太挤啦', 480, 230)
    ctx.font = '900 26px "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    ctx.fillText('把手机横过来，菜鸡才有舞台', 480, 290)
    ctx.restore()
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
