// 程序化合成乐器：全部用 WebAudio 原生节点现做现销
import { audio } from './audio'

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function env(gain: GainNode, t: number, peak: number, decay: number): void {
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(peak, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, t + decay)
}

export function kick(t: number, vol = 1): void {
  const ctx = audio.ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12)
  env(g, t, 0.9 * vol, 0.22)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.25)
}

export function snare(t: number, vol = 1): void {
  const ctx = audio.ensure()
  const src = ctx.createBufferSource()
  src.buffer = audio.noise
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800
  bp.Q.value = 0.8
  const g = ctx.createGain()
  env(g, t, 0.5 * vol, 0.13)
  src.connect(bp).connect(g).connect(audio.master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + 0.15)
  const osc = ctx.createOscillator()
  const g2 = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = 190
  env(g2, t, 0.3 * vol, 0.08)
  osc.connect(g2).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.1)
}

export function hat(t: number, vol = 1, open = false): void {
  const ctx = audio.ensure()
  const src = ctx.createBufferSource()
  src.buffer = audio.noise
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 7500
  const g = ctx.createGain()
  env(g, t, 0.25 * vol, open ? 0.18 : 0.04)
  src.connect(hp).connect(g).connect(audio.master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + (open ? 0.2 : 0.06))
}

export function bass(t: number, midi: number, len = 0.25, vol = 1): void {
  const ctx = audio.ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 700
  osc.type = 'triangle'
  osc.frequency.value = midiToFreq(midi)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.45 * vol, t + 0.01)
  g.gain.setValueAtTime(0.45 * vol, t + len * 0.7)
  g.gain.exponentialRampToValueAtTime(0.001, t + len)
  osc.connect(lp).connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + len + 0.05)
}

export function lead(t: number, midi: number, len = 0.2, vol = 1): void {
  const ctx = audio.ensure()
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.16 * vol, t + 0.01)
  g.gain.setValueAtTime(0.16 * vol, t + len * 0.75)
  g.gain.exponentialRampToValueAtTime(0.001, t + len)
  for (const detune of [-6, 6]) {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = midiToFreq(midi)
    osc.detune.value = detune
    osc.connect(g)
    osc.start(t)
    osc.stop(t + len + 0.05)
  }
  g.connect(audio.master)
}

/** 提示音：打击板/牛铃感，用于节奏提示拍 */
export function cueBell(t: number, vol = 1): void {
  const ctx = audio.ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(820, t)
  osc.frequency.exponentialRampToValueAtTime(560, t + 0.08)
  env(g, t, 0.3 * vol, 0.12)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.15)
}

/** 数拍嘀声，高音为每小节第一拍 */
export function tick(t: number, high = false, vol = 1): void {
  const ctx = audio.ensure()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = high ? 1560 : 1040
  env(g, t, 0.4 * vol, 0.06)
  osc.connect(g).connect(audio.master)
  osc.start(t)
  osc.stop(t + 0.08)
}
