// WebAudio 全局单例：AudioContext 懒加载（需用户手势解锁）
class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private noiseBuf: AudioBuffer | null = null

  /** 必须在用户手势（点击/按键）中调用一次 */
  ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 0.8
      this.masterGain.connect(this.ctx.destination)
      const len = this.ctx.sampleRate * 1
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const data = this.noiseBuf.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  get ready(): boolean {
    return this.ctx !== null
  }

  /** 音频时钟（秒）。未初始化时回退到 performance 时钟 */
  now(): number {
    return this.ctx ? this.ctx.currentTime : performance.now() / 1000
  }

  /** 扬声器输出延迟（秒）。玩家听到的拍点比音频时钟晚这么多，判定时要补回来 */
  latency(): number {
    if (!this.ctx) return 0
    const ctx = this.ctx as AudioContext & { outputLatency?: number }
    return ctx.outputLatency ?? 0
  }

  get master(): GainNode {
    return this.masterGain!
  }

  get noise(): AudioBuffer {
    return this.noiseBuf!
  }
}

export const audio = new AudioEngine()
