import { chromium, devices } from 'playwright'

async function tapLogical(page, x, y) {
  const pt = await page.evaluate(([lx, ly]) => {
    const c = document.getElementById('game')
    const r = c.getBoundingClientRect()
    const scale = Math.min(c.width / 960, c.height / 540)
    const ox = (c.width - 960 * scale) / 2
    const oy = (c.height - 540 * scale) / 2
    const px = ox + lx * scale
    const py = oy + ly * scale
    return [r.left + (px * r.width) / c.width, r.top + (py * r.height) / c.height]
  }, [x, y])
  await page.touchscreen.tap(pt[0], pt[1])
}

async function main() {
  const browser = await chromium.launch()
  const errors = []

  // 1) 竖屏：应出现旋转提示
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(`portrait pageerror: ${e.message}`))
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(900)
    await page.screenshot({ path: 'shots/m1-portrait.png' })
    await ctx.close()
  }

  // 2) 横屏：触摸全流程
  {
    const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 844, height: 390 } })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(`landscape pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`)
    })
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(800)
    await tapLogical(page, 480, 270) // 解锁音频
    await page.waitForTimeout(500)
    await tapLogical(page, 480, 270) // 进选关
    await page.waitForTimeout(900)
    await page.screenshot({ path: 'shots/m2-select.png' })
    await tapLogical(page, 680, 290) // 点拍蒜卡片
    await page.waitForTimeout(3500)
    await page.screenshot({ path: 'shots/m3-garlic.png' })
    await tapLogical(page, 42, 34) // 点返回按钮
    await page.waitForTimeout(900)
    await page.screenshot({ path: 'shots/m4-back-select.png' })
    await ctx.close()
  }

  console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO ERRORS')
  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
