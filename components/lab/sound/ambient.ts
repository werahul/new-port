/**
 * The site's ambient score, generated live with the Web Audio API — no audio
 * file to download, nothing to license, and it never loops audibly.
 *
 *   pads   — slow chords in D major (D · Bm · G · A), two softly detuned
 *            oscillators per note, swelling in and out over several seconds
 *   chimes — now and then a high pentatonic note, like a wind chime
 *   room   — a generated reverb, so everything sits in one soft space
 *
 * The visitor's journey shapes it a little: the pad's filter opens as they
 * travel (`setMood`), and a chime marks each new section (`chime`).
 *
 * Browsers only allow audio after a user gesture, so `start()` must be called
 * from a click or key handler — and it is never called any other way.
 */

type Ctx = AudioContext

const CHORDS = [
  [50, 57, 62, 66, 69], // D  — D3 A3 D4 F#4 A4
  [47, 54, 62, 66, 69], // Bm — B2 F#3 D4 F#4 A4
  [43, 50, 59, 62, 66], // G  — G2 D3 B3 D4 F#4
  [45, 52, 57, 61, 64], // A  — A2 E3 A3 C#4 E4
]
const PENTATONIC = [74, 76, 78, 81, 83, 86, 88] // D5 E5 F#5 A5 B5 D6 E6

const CHORD_SECONDS = 9
const VOLUME = 0.16

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

function impulse(ctx: Ctx, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

class Ambient {
  private ctx: Ctx | null = null
  private master: GainNode | null = null
  private padFilter: BiquadFilterNode | null = null
  private bus: GainNode | null = null
  private chordTimer = 0
  private chimeTimer = 0
  private chord = 0
  private playing = false
  private lastChime = 0

  get isPlaying() {
    return this.playing
  }

  /** Call from a user gesture. Safe to call repeatedly. */
  start() {
    const AC: typeof AudioContext | undefined =
      typeof window === 'undefined'
        ? undefined
        : window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    if (!this.ctx) this.build(new AC())
    const ctx = this.ctx as Ctx
    void ctx.resume()
    if (this.playing) return
    this.playing = true
    const now = ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setValueAtTime(this.master!.gain.value, now)
    this.master!.gain.linearRampToValueAtTime(VOLUME, now + 4)
    this.playChord()
    this.chordTimer = window.setInterval(() => this.playChord(), CHORD_SECONDS * 1000)
    this.scheduleChime()
  }

  stop() {
    if (!this.ctx || !this.playing) return
    this.playing = false
    window.clearInterval(this.chordTimer)
    window.clearTimeout(this.chimeTimer)
    const ctx = this.ctx
    const now = ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setValueAtTime(this.master!.gain.value, now)
    this.master!.gain.linearRampToValueAtTime(0, now + 1.2)
    window.setTimeout(() => {
      if (!this.playing) void ctx.suspend()
    }, 1400)
  }

  /** Tab hidden: hold everything; visible again: carry on. */
  pause(hidden: boolean) {
    if (!this.ctx || !this.playing) return
    void (hidden ? this.ctx.suspend() : this.ctx.resume())
  }

  /** 0 … 1 through the journey: the pad brightens a little as it goes. */
  setMood(t: number) {
    if (!this.ctx || !this.padFilter) return
    const f = 700 + Math.max(0, Math.min(1, t)) * 900
    this.padFilter.frequency.setTargetAtTime(f, this.ctx.currentTime, 1.5)
  }

  /** A single soft chime — a new section has arrived. */
  chime() {
    if (!this.ctx || !this.playing) return
    const now = this.ctx.currentTime
    if (now - this.lastChime < 1.2) return
    this.lastChime = now
    const notes = CHORDS[this.chord % CHORDS.length]
    // a chime that belongs to the chord underneath it
    this.pluck(notes[notes.length - 1] + 12, 0.05)
  }

  private build(ctx: Ctx) {
    this.ctx = ctx
    const master = ctx.createGain()
    master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    master.connect(comp).connect(ctx.destination)

    const reverb = ctx.createConvolver()
    reverb.buffer = impulse(ctx, 4.5, 2.6)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    reverb.connect(wet).connect(master)

    const dry = ctx.createGain()
    dry.gain.value = 0.6
    dry.connect(master)

    // everything musical goes through `bus`, which feeds the room and the dry path
    const bus = ctx.createGain()
    bus.connect(dry)
    bus.connect(reverb)

    const padFilter = ctx.createBiquadFilter()
    padFilter.type = 'lowpass'
    padFilter.frequency.value = 700
    padFilter.Q.value = 0.4
    padFilter.connect(bus)

    this.master = master
    this.bus = bus
    this.padFilter = padFilter

    document.addEventListener('visibilitychange', () => this.pause(document.visibilityState === 'hidden'))
  }

  private playChord() {
    const ctx = this.ctx
    if (!ctx || !this.padFilter) return
    const notes = CHORDS[this.chord % CHORDS.length]
    this.chord++
    const now = ctx.currentTime
    const attack = 3.5
    const hold = CHORD_SECONDS - 1
    const release = 5
    notes.forEach((midi, i) => {
      const g = ctx.createGain()
      const level = (i === 0 ? 0.11 : 0.075) / notes.length
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(level, now + attack)
      g.gain.setValueAtTime(level, now + hold)
      g.gain.linearRampToValueAtTime(0, now + hold + release)
      g.connect(this.padFilter!)
      for (const [type, cents] of [
        ['sine', -5],
        ['triangle', 6],
      ] as const) {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.value = hz(midi)
        o.detune.value = cents
        o.connect(g)
        o.start(now)
        o.stop(now + hold + release + 0.1)
      }
    })
  }

  private pluck(midi: number, level: number) {
    const ctx = this.ctx
    if (!ctx || !this.bus) return
    const now = ctx.currentTime
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(level, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2)
    g.connect(this.bus)
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = hz(midi)
    // a faint octave above gives it a bell's shimmer
    const o2 = ctx.createOscillator()
    o2.type = 'sine'
    o2.frequency.value = hz(midi + 12)
    const g2 = ctx.createGain()
    g2.gain.value = 0.25
    o.connect(g)
    o2.connect(g2).connect(g)
    o.start(now)
    o2.start(now)
    o.stop(now + 3.3)
    o2.stop(now + 3.3)
  }

  private scheduleChime() {
    const wait = 3500 + Math.random() * 5500
    this.chimeTimer = window.setTimeout(() => {
      if (!this.playing) return
      this.pluck(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)], 0.028 + Math.random() * 0.02)
      this.scheduleChime()
    }, wait)
  }
}

/** One score per tab. */
export const ambient = new Ambient()
