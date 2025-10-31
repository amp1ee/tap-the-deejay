// tap-dj_model.test.js

import TapDJModel from '../js/model/tap-dj_model.js';

describe('TapDJModel', () => {
  let model;

  beforeEach(() => {
    model = new TapDJModel();
  });

  // --- addTap() and calculateBPM() ---
  test('returns 0 BPM when fewer than 2 taps are present', () => {
    model.addTap(0);
    expect(model.getBPM()).toBe(0);
  });

  test('calculates BPM correctly from two taps', () => {
    // 600 ms between taps → 100 BPM
    model.addTap(0);
    model.addTap(600);
    expect(model.getBPM()).toBeCloseTo(100.00, 2);
  });

  test('averages multiple intervals for smoother BPM', () => {
    // Taps at 0, 600, 1200, 1800 → all 600 ms apart → still 100 BPM
    [0, 600, 1200, 1800].forEach(t => model.addTap(t));
    expect(model.getBPM()).toBeCloseTo(100.00, 2);
  });

  test('keeps only the last MAX_INTERVALS taps', () => {
    const totalTaps = model.MAX_INTERVALS + 5;
    for (let i = 0; i < totalTaps; i++) model.addTap(i * 500);
    expect(model.taps.length).toBe(model.MAX_INTERVALS + 1);
  });

  // --- formatSeconds() ---
  test('formats milliseconds to seconds with 2 decimals', () => {
    expect(model.formatSeconds(1530)).toBe('1.53 s');
  });

  // --- getDurations() ---
  test('returns zero durations if BPM is 0', () => {
    const d = model.getDurations();
    expect(d.beat).toBe(0);
    expect(d.bar).toBe(0);
    expect(d.formatted).toEqual({});
  });

  test('calculates correct durations when BPM is set', () => {
    model.setBPM(120);
    const d = model.getDurations();
    expect(d.beat).toBe(500); // ms per beat
    expect(d.bar).toBe(2000); // 4 beats
    expect(d['16 bars']).toBe(32000);
    expect(d.formatted['16 bars']).toBe('32.00 s');
  });

  // --- reset() ---
  test('resets tap data and BPM', () => {
    model.addTap(0);
    model.addTap(600);
    model.reset();
    expect(model.taps.length).toBe(0);
    expect(model.getBPM()).toBe(0);
  });

  // --- setBPM() validation ---
  test('ignores invalid manual BPM values', () => {
    model.setBPM('abc');
    expect(model.getBPM()).toBe(0);
    model.setBPM(-20);
    expect(model.getBPM()).toBe(0);
  });

  test('sets valid BPM manually', () => {
    model.setBPM(128.5);
    expect(model.getBPM()).toBe(128.5);
  });
});