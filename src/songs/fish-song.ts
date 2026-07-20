// 《咸鱼翻身》谱面：BPM 100，慵懒又贱兮兮的 chiptune
import type { NoteEvent, Song } from '../core/conductor'

const BPM = 100
const SPB = 4 // 十六分音符网格
const LENGTH = 56 // 14 小节

/** 判定拍点：锅铲落下的瞬间（按键翻身躲避） */
export const hitBeats: number[] = [
  // A 段：教学，大喘气
  0, 4, 8, 12, 14,
  // B 段：两拍一个
  16, 18, 20, 22, 24, 26, 28, 30,
  // C 段：每拍连击 + 换气
  32, 33, 34, 35, 38, 39, 40, 41, 44, 45, 46, 47,
  // D 段：切分尾杀
  48, 49.5, 51, 52.5, 54,
]

function buildNotes(): NoteEvent[] {
  const notes: NoteEvent[] = []
  const n = (step: number, inst: NoteEvent['inst'], pitch?: number, len?: number, vol?: number) =>
    notes.push({ step, inst, pitch, len, vol })

  // 数拍 4 拍（负步数）
  n(-16, 'htick')
  n(-12, 'tick')
  n(-8, 'tick')
  n(-4, 'tick')

  // 提示铃：判定拍前 1 拍
  for (const b of hitBeats) n((b - 1) * SPB, 'cue', undefined, undefined, 0.7)

  // 和弦进行：C - G - Am - F（每小节一根音）
  const roots = [36, 31, 33, 29]
  // 主旋律乐句（每小节 4 个音，C 大调五声）
  const phrases = [
    [[0, 72], [4, 74], [8, 76], [12, 79]],
    [[0, 81], [4, 79], [8, 76], [12, 74]],
    [[0, 76], [2, 76], [8, 79], [12, 81]],
    [[0, 74], [8, 72], [12, 67]],
  ] as const

  const bars = LENGTH / 4
  for (let bar = 0; bar < bars; bar++) {
    const s = bar * 16
    const root = roots[bar % 4]
    // 鼓
    n(s + 0, 'kick')
    n(s + 8, 'kick', undefined, undefined, 0.8)
    n(s + 4, 'snare')
    n(s + 12, 'snare', undefined, undefined, 0.9)
    for (let i = 0; i < 16; i += 2) n(s + i, 'hat', undefined, undefined, i % 4 === 0 ? 1 : 0.6)
    if (bar % 2 === 1) n(s + 14, 'ohat', undefined, undefined, 0.8)
    // 贝斯：1、3 拍 + 末尾五度挑音
    n(s + 0, 'bass', root, 0.35)
    n(s + 8, 'bass', root, 0.35, 0.9)
    n(s + 14, 'bass', root + 7, 0.15, 0.7)
    // 主旋律（最后一小节留白收尾）
    if (bar < bars - 1) {
      const phrase = phrases[bar % phrases.length]
      for (const [ds, pitch] of phrase) n(s + ds, 'lead', pitch, 0.22, bar % 2 === 0 ? 1 : 0.85)
    }
  }
  // 结尾镲片 + 重音
  n(LENGTH * SPB, 'kick')
  n(LENGTH * SPB, 'ohat', undefined, undefined, 1.2)
  return notes
}

export const fishSong: Song = {
  bpm: BPM,
  stepsPerBeat: SPB,
  lengthBeats: LENGTH,
  notes: buildNotes(),
}

export const countInBeats = 4
