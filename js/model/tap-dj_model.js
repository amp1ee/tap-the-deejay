/**
 * TapDJModel: Handles BPM calculation, tap storage, and duration breakdowns.
 * Core Logic & Data Layer (M in MVC)
 */
export class TapDJModel {
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
   * Uses a rolling average of the last MAX_INTERVALS.
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

    // 2. Compute the average interval in milliseconds
    const sumOfIntervals = intervals.reduce((sum, interval) => sum + interval, 0);
    const averageIntervalMs = sumOfIntervals / intervals.length;

    // 3. Convert the average interval (ms/beat) to BPM (beats/min)
    const calculatedBPM = 60000 / averageIntervalMs;

    return parseFloat(calculatedBPM.toFixed(2));
  }

  /**
   * Generates a dictionary of useful song duration breakdowns based on the current BPM.
   * @returns {object} A dictionary with duration keys (e.g., 'beat', 'bar', '32 bars') in milliseconds.
   */
  getDurations() {
    if (this.currentBPM === 0) {
      return {
        beat: 0,
        bar: 0,
        '8 bars': 0,
        '16 bars': 0,
        '32 bars': 0,
        minute: 0
      };
    }

    // Milliseconds per beat
    const msPerBeat = 60000 / this.currentBPM;

    // Assuming 4 beats per bar (standard time signature for dance music)
    const msPerBar = msPerBeat * 4;

    return {
      // Round to the nearest millisecond for timing precision
      beat: Math.round(msPerBeat),
      bar: Math.round(msPerBar),
      '8 bars': Math.round(msPerBar * 8),
      '16 bars': Math.round(msPerBar * 16),
      '32 bars': Math.round(msPerBar * 32),
      minute: 60000 // 60,000 ms in 1 minute
    };
  }

  /**
   * Clears all stored tap data and resets the BPM.
   */
  reset() {
    this.taps = [];
    this.currentBPM = 0;
  }

  /**
   * Returns the current calculated BPM.
   * @returns {number}
   */
  getBPM() {
    return this.currentBPM;
  }
}
