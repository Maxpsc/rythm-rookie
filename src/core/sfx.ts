// 合成音效：命中/失误/UI/怪叫
import { audio } from './audio'
import * as seq from './sequencer'

/** 完美命中：清亮叮 */
export function perfect(): void {
  const t = audio.now()
  seq.lead(t, 96, 0.12, 0.9)
  seq.lead(t + 0.02, 103, 0.18, 0.7)
}

/** 不错命中：短促啪 */
export function good(): void {
  const t = audio.now()
  seq.snare(t, 0.7)
  seq.lead(t, 91, 0.1, 0.8)
}

/** 失误：丧气下滑 */
export function miss(): void {
  const ctx = audio.ensure()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, t)
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.35)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.18, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.45)
}

/** 空挥：呼的一声 */
export function whiff(): void {
  const ctx = audio.ensure()
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = audio.noise
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(400, t)
  lp.frequency.exponentialRampToValueAtTime(2400, t + 0.12)
  lp.frequency.exponentialRampToValueAtTime(300, t + 0.25)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.25, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
  src.connect(lp).connect(g).connect(audio.master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + 0.3)
}

/** 拍蒜：脆响 + 低音 */
export function smash(): void {
  const t = audio.now()
  seq.kick(t, 0.9)
  seq.hat(t, 1.4)
  seq.snare(t, 0.5)
}

/** 蒜飞一脸：湿哒哒 */
export function splat(): void {
  const ctx = audio.ensure()
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = audio.noise
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(3000, t)
  lp.frequency.exponentialRampToValueAtTime(200, t + 0.2)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.5, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
  src.connect(lp).connect(g).connect(audio.master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + 0.3)
  const osc = ctx.createOscillator()
  const g2 = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, t)
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.18)
  g2.gain.setValueAtTime(0, t)
  g2.gain.linearRampToValueAtTime(0.35, t + 0.01)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g2).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.25)
}

/** 咸鱼翻身：上扬口哨 */
export function flip(): void {
  const ctx = audio.ensure()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, t)
  osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.22)
}

/** 被拍扁：闷响 */
export function flatten(): void {
  const t = audio.now()
  seq.kick(t, 1.2)
  const ctx = audio.ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.15)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.2, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.22)
}

export function uiMove(): void {
  seq.lead(audio.now(), 84, 0.07, 0.7)
}

export function uiConfirm(): void {
  const t = audio.now()
  seq.lead(t, 88, 0.08, 0.8)
  seq.lead(t + 0.07, 95, 0.14, 0.8)
}

/** 结算小号角 */
export function fanfare(rank: string): void {
  const t0 = audio.now()
  const good = rank === 'S' || rank === 'A'
  const notes = good ? [72, 76, 79, 84, 88] : [72, 74, 70, 67]
  notes.forEach((m, i) => {
    seq.lead(t0 + i * 0.12, m, 0.16, 0.9)
    seq.kick(t0 + i * 0.12, 0.5)
  })
  if (good) {
    seq.lead(t0 + notes.length * 0.12, 96, 0.5, 1)
    seq.hat(t0 + notes.length * 0.12, 1, true)
  } else {
    seq.lead(t0 + notes.length * 0.12, 60, 0.6, 1)
  }
}
