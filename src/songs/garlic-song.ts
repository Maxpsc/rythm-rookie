// 《拍蒜大师》谱面：BPM 120，急吼吼的放克 chiptune
import type { NoteEvent, Song } from '../core/conductor'

const BPM = 120
const SPB = 4
const LENGTH = 64 // 16 小节

/** 判定拍点：蒜头滚到刀下的瞬间 */
export const hitBeats: number[] = [
  // A 段：四分音符热身
  0, 2, 4, 6, 8, 10, 12, 14,
  // B 段：八分双点 + 四分 + 八分跑动
  16, 16.5, 18, 18.5, 20, 20.5, 22, 22.5,
  24, 25, 26, 27,
  28, 28.5, 29, 29.5, 30, 30.5, 31, 31.5,
  // C 段：切分（后半拍）
  32, 33.5, 35, 36.5, 38, 39.5, 41, 42.5, 44, 45.5, 47,
  // D 段：八分连打两小节 → 四分收尾 → 最后一刀
  48, 48.5, 49, 49.5, 50, 50.5, 51, 51.5,
  52, 52.5, 53, 53.5, 54, 54.5, 55, 55.5,
  56, 58, 60, 63,
]

function buildNotes(): NoteEvent[] {
  const notes: NoteEvent[] = []
  const n = (step: number, inst: NoteEvent['inst'], pitch?: number, len?: number, vol?: number) =>
    notes.push({ step, inst, pitch, len, vol })

  // 数拍
  n(-16, 'htick')
  n(-12, 'tick')
  n(-8, 'tick')
  n(-4, 'tick')

  // 提示铃：只在乐句开头（与前一个判定拍间隔 >1.5 拍时）响
  for (let i = 0; i < hitBeats.length; i++) {
    if (i === 0 || hitBeats[i] - hitBeats[i - 1] > 1.5) {
      n((hitBeats[i] - 1) * SPB, 'cue', undefined, undefined, 0.7)
    }
  }

  // 和弦进行：Em - C - D - Em（放克贝斯线）
  const roots = [28, 36, 38, 28]
  // 主旋律：E 小调五声两句交替
  const phrases = [
    [[0, 64], [4, 67], [8, 69], [12, 71]],
    [[0, 76], [4, 71], [8, 69], [12, 67]],
    [[0, 69], [2, 71], [8, 72], [12, 74]],
    [[0, 71], [8, 69], [12, 67]],
  ] as const

  const bars = LENGTH / 4
  for (let bar = 0; bar < bars; bar++) {
    const s = bar * 16
    const root = roots[bar % 4]
    // 鼓：更密的底鼓
    n(s + 0, 'kick')
    n(s + 8, 'kick')
    n(s + 10, 'kick', undefined, undefined, 0.6)
    n(s + 4, 'snare')
    n(s + 12, 'snare')
    for (let i = 0; i < 16; i += 2) n(s + i, 'hat', undefined, undefined, i % 4 === 0 ? 0.9 : 0.55)
    n(s + 14, 'ohat', undefined, undefined, 0.8)
    // 放克贝斯：根音 / 八度跳
    n(s + 0, 'bass', root, 0.22)
    n(s + 6, 'bass', root, 0.15, 0.8)
    n(s + 8, 'bass', root + 12, 0.15, 0.85)
    n(s + 14, 'bass', root, 0.18, 0.75)
    // 主旋律
    if (bar < bars - 1) {
      const phrase = phrases[bar % phrases.length]
      for (const [ds, pitch] of phrase) n(s + ds, 'lead', pitch, 0.18, bar % 2 === 0 ? 0.95 : 0.8)
    }
  }
  n(LENGTH * SPB, 'kick')
  n(LENGTH * SPB, 'snare', undefined, undefined, 1.2)
  n(LENGTH * SPB, 'ohat', undefined, undefined, 1.2)
  return notes
}

export const garlicSong: Song = {
  bpm: BPM,
  stepsPerBeat: SPB,
  lengthBeats: LENGTH,
  notes: buildNotes(),
}

export const countInBeats = 4
