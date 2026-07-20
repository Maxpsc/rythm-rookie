// 节拍指挥：以 AudioContext.currentTime 为唯一时钟，lookahead 调度音符
import { audio } from './audio'
import * as seq from './sequencer'

export type InstName =
  | 'kick' | 'snare' | 'hat' | 'ohat' | 'bass' | 'lead' | 'cue' | 'tick' | 'htick'

export interface NoteEvent {
  step: number        // 以 stepsPerBeat 细分的步序号，可为负（数拍段）
  inst: InstName
  pitch?: number      // midi 音高（bass/lead）
  len?: number        // 秒
  vol?: number
}

export interface Song {
  bpm: number
  stepsPerBeat: number  // 4 = 十六分音符网格
  lengthBeats: number   // 正片长度（不含数拍）
  notes: NoteEvent[]
}

function playNote(n: NoteEvent, t: number): void {
  const v = n.vol ?? 1
  switch (n.inst) {
    case 'kick': seq.kick(t, v); break
    case 'snare': seq.snare(t, v); break
    case 'hat': seq.hat(t, v); break
    case 'ohat': seq.hat(t, v, true); break
    case 'bass': seq.bass(t, n.pitch ?? 36, n.len ?? 0.25, v); break
    case 'lead': seq.lead(t, n.pitch ?? 72, n.len ?? 0.2, v); break
    case 'cue': seq.cueBell(t, v); break
    case 'tick': seq.tick(t, false, v); break
    case 'htick': seq.tick(t, true, v); break
  }
}

export class Conductor {
  playing = false
  private startTime = 0
  private nextIdx = 0
  private loopCount = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private notes: NoteEvent[]

  constructor(private song: Song, private loop = false) {
    this.notes = [...song.notes].sort((a, b) => a.step - b.step)
  }

  get bpm(): number { return this.song.bpm }
  get spb(): number { return 60 / this.song.bpm }
  get lengthBeats(): number { return this.song.lengthBeats }

  /** countInBeats：正片第 0 拍之前的数拍拍数（谱面负步数段） */
  start(countInBeats = 0): void {
    audio.ensure()
    this.startTime = audio.now() + 0.1 + countInBeats * this.spb
    this.playing = true
    this.timer = setInterval(() => this.pump(), 25)
    this.pump()
  }

  private pump(): void {
    const ahead = audio.now() + 0.15
    for (;;) {
      const note = this.notes[this.nextIdx]
      if (!note) {
        if (this.loop) {
          this.nextIdx = 0
          this.loopCount++
          continue
        }
        return
      }
      const beatAbs = note.step / this.song.stepsPerBeat + this.loopCount * this.song.lengthBeats
      const t = this.startTime + beatAbs * this.spb
      if (t > ahead) return
      if (t >= audio.now() - 0.02) playNote(note, Math.max(t, audio.now()))
      this.nextIdx++
    }
  }

  /** 当前拍位置（浮点，可为负：数拍段） */
  get beat(): number {
    if (!this.playing) return -Infinity
    return (audio.now() - this.startTime) / this.spb
  }

  beatToTime(b: number): number {
    return this.startTime + b * this.spb
  }

  get finished(): boolean {
    return this.playing && this.beat > this.song.lengthBeats + 1
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
    this.playing = false
  }
}
