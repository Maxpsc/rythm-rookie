// 菜单循环 BGM：BPM 92，慵懒小调
import type { NoteEvent, Song } from '../core/conductor'

function buildNotes(): NoteEvent[] {
  const notes: NoteEvent[] = []
  const n = (step: number, inst: NoteEvent['inst'], pitch?: number, len?: number, vol?: number) =>
    notes.push({ step, inst, pitch, len, vol })
  for (let bar = 0; bar < 2; bar++) {
    const s = bar * 16
    n(s + 0, 'kick', undefined, undefined, 0.8)
    n(s + 8, 'kick', undefined, undefined, 0.7)
    n(s + 4, 'snare', undefined, undefined, 0.6)
    n(s + 12, 'snare', undefined, undefined, 0.6)
    for (let i = 0; i < 16; i += 4) n(s + i, 'hat', undefined, undefined, 0.5)
    n(s + 0, 'bass', bar === 0 ? 36 : 33, 0.4, 0.8)
    n(s + 8, 'bass', bar === 0 ? 36 : 33, 0.3, 0.7)
  }
  const melody = [[0, 72], [4, 76], [8, 79], [12, 76], [16, 81], [20, 79], [24, 76], [28, 74]] as const
  for (const [s, p] of melody) n(s, 'lead', p, 0.3, 0.6)
  return notes
}

export const titleSong: Song = {
  bpm: 92,
  stepsPerBeat: 4,
  lengthBeats: 8,
  notes: buildNotes(),
}
