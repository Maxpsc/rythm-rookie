import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })

  await page.goto('http://localhost:5173')
  await page.waitForTimeout(600)
  await page.mouse.click(640, 360) // 解锁
  await page.waitForTimeout(400)
  await page.keyboard.press('Space') // 选关
  await page.waitForTimeout(900)
  await page.screenshot({ path: 'shots/10-select2.png' })

  await page.keyboard.press('ArrowRight') // 选拍蒜
  await page.keyboard.press('Space')
  // 数拍 4 拍 @120bpm = 2s；A 段判定拍 0,2,4,6,8,10,12,14（每 1s）
  await page.waitForTimeout(2150)
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Space')
    await page.waitForTimeout(1000)
    if (i === 3) await page.screenshot({ path: 'shots/11-garlic-smash.png' })
  }
  await page.screenshot({ path: 'shots/12-garlic-late.png' })
  console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO ERRORS')
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
