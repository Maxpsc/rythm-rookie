// 冒烟测试：加载页面 → 解锁音频 → 标题 → 选关 → 咸鱼 → 拍蒜，截图并收集报错
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const shots = 'shots'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })

  await page.goto(BASE)
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${shots}/1-title-locked.png` })

  // 解锁音频
  await page.mouse.click(640, 360)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${shots}/2-title.png` })

  // 进入选关
  await page.keyboard.press('Space')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${shots}/3-select.png` })

  // 进入咸鱼翻身
  await page.keyboard.press('Space')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${shots}/4-fish-countin.png` })
  await page.waitForTimeout(3500)
  await page.screenshot({ path: `${shots}/5-fish-play.png` })
  // 模拟按几下
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Space')
    await page.waitForTimeout(600)
  }
  await page.screenshot({ path: `${shots}/6-fish-pressing.png` })
  // 等歌曲结束（56 拍 * 0.6s ≈ 34s + 余量）
  await page.waitForTimeout(34000)
  await page.screenshot({ path: `${shots}/7-fish-result.png` })

  // 回选关 → 拍蒜大师
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  await page.waitForTimeout(800)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  await page.waitForTimeout(4000)
  await page.screenshot({ path: `${shots}/8-garlic-play.png` })
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)
  }
  await page.screenshot({ path: `${shots}/9-garlic-pressing.png` })

  console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO ERRORS')
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
