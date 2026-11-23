/**
 * TapDJModel: Handles BPM calculation, tap storage, and duration breakdowns.
 * Core Logic & Data Layer (M in MVC)
 */
export default class TapDJModel {
  constructor() {
    // Stores timestamps of all taps in milliseconds
    this.taps = [];
    // Max number of intervals to use for BPM calculation (for smoothing)
    this.MAX_INTERVALS = 10;
    // The last calculated BPM
    this.currentBPM = 0;
  }

  /**
   * Records a new tap event and updates the BPM.
   * @param {number} timestamp - The time of the tap (e.g., performance.now()).
   */
  addTap(timestamp) {
    this.taps.push(timestamp);

    // Keep only the last N taps needed to calculate MAX_INTERVALS
    const maxTaps = this.MAX_INTERVALS + 1;
    if (this.taps.length > maxTaps) {
      this.taps.shift(); // Remove the oldest tap
    }

    this.currentBPM = this.calculateBPM();
    return this.currentBPM;
  }

  /**
   * Calculates the Beats Per Minute (BPM) based on the stored tap intervals.
   * Uses a rolling median/MAD filter before averaging accepted intervals.
   * @returns {number} The calculated BPM, rounded to two decimal places.
   */
  calculateBPM() {
    if (this.taps.length < 2) {
      return 0; // Not enough taps to calculate an interval
    }

    // 1. Calculate the intervals between consecutive taps
    const intervals = [];
    for (let i = 1; i < this.taps.length; i++) {
      const interval = this.taps[i] - this.taps[i - 1];
      intervals.push(interval);
    }

    // Ignore invalid intervals rather than allowing division by zero.
    const valid = intervals.filter(value => Number.isFinite(value) && value > 0);
    if (valid.length === 0) return 0;

    const median = values => {
      const sorted = [...values].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
    };

    // A consistent run of three recent intervals indicates a deliberate
    // tempo change, not three independent tapping mistakes.
    let sample = valid;
    if (valid.length >= 6) {
      const recent = valid.slice(-3);
      const previousMedian = median(valid.slice(0, -3));
      const recentMedian = median(recent);
      const recentMAD = median(recent.map(value => Math.abs(value - recentMedian)));
      if (Math.abs(recentMedian - previousMedian) > 0.15 * previousMedian &&
          recentMAD <= 0.05 * recentMedian &&
          recent.every(value => Math.abs(value - recentMedian) <= 0.15 * recentMedian)) {
        sample = recent;
      }
    }

    // Robustly reject isolated missed beats and accidental double taps.
    // The 15% floor avoids over-filtering when MAD is nearly zero.
    const center = median(sample);
    const mad = median(sample.map(value => Math.abs(value - center)));
    const tolerance = Math.max(3 * 1.4826 * mad, 0.15 * center);
    const accepted = sample.filter(value => Math.abs(value - center) <= tolerance);
    const averageIntervalMs = accepted.reduce((sum, value) => sum + value, 0) / accepted.length;

    // 3. Convert the average interval (ms/beat) to BPM (beats/min)
    const calculatedBPM = 60000 / averageIntervalMs;

    return parseFloat(calculatedBPM.toFixed(2));
  }

  /**
   * Converts milliseconds into "S.ss s" format (seconds with two decimals).
   * @param {number} ms
   * @returns {string} e.g. "29.32 s"
   */
  formatSeconds(ms) {
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds} s`;
  }

  /**
   * Generates a dictionary of useful song duration breakdowns based on the current BPM.
   * @returns {object} A dictionary with both numeric and formatted duration keys.
   */
  getDurations() {
    if (this.currentBPM === 0) {
      return {
        beat: 0,
        bar: 0,
        '8 bars': 0,
        '16 bars': 0,
        '32 bars': 0,
        formatted: {}
      };
    }

    const msPerBeat = 60000 / this.currentBPM;
    const msPerBar = msPerBeat * 4;

    const durations = {
      beat: Math.round(msPerBeat),
      bar: Math.round(msPerBar),
      '8 bars': Math.round(msPerBar * 8),
      '16 bars': Math.round(msPerBar * 16),
      '32 bars': Math.round(msPerBar * 32),
    };

    durations.formatted = {
      '16 bars': this.formatSeconds(msPerBar * 16),
      '32 bars': this.formatSeconds(msPerBar * 32),
    };

    return durations;
  }

  /**
   * Clears all stored tap data and resets the BPM.
   */
  reset() {
    this.taps = [];
    this.currentBPM = 0;
  }

  /**
   * Manually sets the current BPM (e.g., from user input).
   * Does not alter tap history; subsequent taps will recalc as usual.
   * @param {number} bpmValue
   */
  setBPM(bpmValue) {
    if (typeof bpmValue !== 'number' || !isFinite(bpmValue) || bpmValue <= 0) return;
    this.currentBPM = bpmValue;
  }

  /**
   * Returns the current calculated BPM.
   * @returns {number}
   */
  getBPM() {
    return this.currentBPM;
  }
};