// tap-dj_view.test.js

import { jest } from '@jest/globals';
import TapDJView from '../js/view/tap-dj_view.js';

describe('TapDJView', () => {
  let app, bpmDisplay, tapButton, resetButton, durationEls, view;

  beforeEach(() => {
    // Build a minimal DOM
    document.body.innerHTML = `
      <div id="app"></div>
      <span id="bpmDisplay" data-current-bpm="0"></span>
      <button id="tapButton" class=""></button>
      <button id="resetButton"></button>
      <div data-duration-key="beat"></div>
      <div data-duration-key="bar"></div>
      <div data-duration-key="16 bars"></div>
      <div data-duration-key="32 bars"></div>
    `;

    app = document.getElementById('app');
    bpmDisplay = document.getElementById('bpmDisplay');
    tapButton = document.getElementById('tapButton');
    resetButton = document.getElementById('resetButton');
    durationEls = document.querySelectorAll('[data-duration-key]');

    view = new TapDJView(app);
  });

  // --- Constructor setup ---
  test('constructor initializes key DOM elements and styles', () => {
    expect(view.bpmDisplay).toBe(bpmDisplay);
    expect(bpmDisplay.contentEditable).toBe(true);
    expect(bpmDisplay.classList.contains('cursor-text')).toBe(true);
    expect(Object.keys(view.durationElements)).toContain('beat');
    expect(Object.keys(view.durationElements)).toContain('16 bars');
  });

  // --- updateBPMDisplay() ---
  test('updates BPM display (integer vs decimal)', () => {
    view.updateBPMDisplay(123, false);
    expect(bpmDisplay.textContent).toBe('123');

    view.updateBPMDisplay(123.456, true);
    expect(bpmDisplay.textContent).toBe('123.46');
  });

  // --- updateDurations() ---
  test('updates duration display values properly', () => {
    const durations = {
      beat: 500,
      bar: 2000,
      '16 bars': 32000,
      '32 bars': 64000,
      formatted: {
        '16 bars': '32.00 s',
        '32 bars': '64.00 s'
      }
    };

    view.updateDurations(durations);

    expect(view.durationElements['beat'].textContent).toBe('500 ms');
    expect(view.durationElements['16 bars'].textContent).toBe('32.00 s');
  });

  // --- flashTap() ---
  test('adds and removes scale class on tap button', () => {
    jest.useFakeTimers();
    view.flashTap();
    expect(tapButton.classList.contains('scale-95')).toBe(true);
    jest.advanceTimersByTime(150);
    expect(tapButton.classList.contains('scale-95')).toBe(false);
    jest.useRealTimers();
  });

  // --- flashBackground() ---
  test('adds and removes pulse-bg on app element', () => {
    const removeSpy = jest.spyOn(app.classList, 'remove');
    view.flashBackground();

    // Simulate animation end event
    const event = new Event('animationend');
    event.animationName = 'bgPulse';
    app.dispatchEvent(event);

    expect(removeSpy).toHaveBeenCalledWith('pulse-bg');
  });

  // --- handleMouseMove() ---
  test('maps mouse X to hue value and updates CSS variable', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1000 });
    const e = { clientX: 500 };
    view.handleMouseMove(e);

    expect(view.currentHue).toBe(180);
    expect(app.style.getPropertyValue('--hue')).toBe('180');
  });

  // --- bindTap() ---
  test('binds tap handler to click and keydown', () => {
    const handler = jest.fn();
    view.bindTap(handler);

    tapButton.click();
    expect(handler).toHaveBeenCalledTimes(1);

    const spaceEvent = new KeyboardEvent('keydown', { code: 'Space' });
    tapButton.dispatchEvent(spaceEvent);
    expect(handler).toHaveBeenCalledTimes(2);

    const enterEvent = new KeyboardEvent('keydown', { code: 'Enter' });
    tapButton.dispatchEvent(enterEvent);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  // --- bindReset() ---
  test('binds reset handler to reset button', () => {
    const handler = jest.fn();
    view.bindReset(handler);
    resetButton.click();
    expect(handler).toHaveBeenCalled();
  });

  // --- bindInlineBpmEdit() ---
  test('commits valid BPM on Enter and blur', () => {
    const handler = jest.fn();
    view.bindInlineBpmEdit(handler);

    bpmDisplay.textContent = '128';
    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    bpmDisplay.dispatchEvent(keyEvent);
    expect(handler).toHaveBeenCalledWith(128);

    bpmDisplay.textContent = '150';
    bpmDisplay.dispatchEvent(new FocusEvent('blur'));
    expect(handler).toHaveBeenCalledWith(150);
  });

  test('reverts invalid BPM input to previous value', () => {
    const handler = jest.fn();
    bpmDisplay.dataset.currentBpm = '120.00';
    view.bindInlineBpmEdit(handler);

    bpmDisplay.textContent = 'abc';
    bpmDisplay.dispatchEvent(new FocusEvent('blur'));

    expect(bpmDisplay.textContent).toBe('120.00');
    expect(handler).not.toHaveBeenCalled();
  });
});
