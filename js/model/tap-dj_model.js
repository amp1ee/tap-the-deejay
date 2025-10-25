export default class TapDJModel {
  constructor() {
    this.reset();
  }

  reset() {
    this.tapTimes = [];
    this.bpm = 0;
    this.averageInterval = 0;
  }

  addTap() {
    const now = performance.now(); // high-res timer
    this.tapTimes.push(now);

    // Keep only the last few taps to maintain stability (e.g., last 8)
    if (this.tapTimes.length > 8) {
      this.tapTimes.shift();
    }

    this.calculateBPM();
  }

  calculateBPM() {
    if (this.tapTimes.length < 2) {
      this.bpm = 0;
      this.averageInterval = 0;
      return;
    }

    // Calculate intervals between consecutive taps
    const intervals = [];
    for (let i = 1; i < this.tapTimes.length; i++) {
      intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
    }

    // Average interval
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    this.averageInterval = avg;

    // BPM = 60 / seconds per beat
    this.bpm = 60000 / avg;
  }

  getBPM() {
    return this.bpm.toFixed(2);
  }

  getTapCount() {
    return this.tapTimes.length;
  }

  isReady() {
    return this.tapTimes.length >= 2;
  }
}

