// Synthesised sound with WebAudio: no audio files, everything is oscillators and
// filtered noise made at run time. Silent until the player's first gesture.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.master = null;
  }

  ensure() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.context.destination);
    } catch {
      this.context = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    gain.gain.setValueAtTime(vol || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  noise(dur, vol, filterFreq) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    const len = Math.floor(this.context.sampleRate * dur);
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.context.createBufferSource();
    src.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 1200;
    const gain = this.context.createGain();
    gain.gain.value = vol || 0.25;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(now);
  }

  step(sneaking) {
    this.tone(sneaking ? 140 : 190, 0.05, 'triangle', sneaking ? 0.03 : 0.06);
  }

  pickup() {
    this.tone(660, 0.12, 'sine', 0.22);
    setTimeout(() => this.tone(990, 0.18, 'sine', 0.22), 90);
  }

  crack() {
    this.noise(0.18, 0.3, 5200);
    this.tone(1900, 0.1, 'square', 0.05, 900);
  }

  marble() {
    this.tone(1200, 0.08, 'square', 0.08, 700);
    setTimeout(() => this.tone(900, 0.06, 'square', 0.06), 120);
  }

  emp() {
    this.tone(1800, 0.35, 'sawtooth', 0.16, 120);
    this.noise(0.3, 0.2, 2600);
  }

  smoke() {
    this.noise(0.7, 0.3, 700);
  }

  spotted() {
    this.tone(520, 0.16, 'square', 0.14, 780);
  }

  alarm() {
    this.tone(740, 0.22, 'sawtooth', 0.18, 740);
    setTimeout(() => this.tone(520, 0.22, 'sawtooth', 0.18, 520), 230);
    setTimeout(() => this.tone(740, 0.22, 'sawtooth', 0.18, 740), 460);
  }

  caught() {
    this.tone(330, 0.4, 'sawtooth', 0.2, 110);
  }

  levelClear() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, 'sine', 0.2), i * 110));
  }

  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.28, 'sine', 0.2), i * 130));
  }
}
