// tap-dj_controller.test.js

import { jest } from '@jest/globals';
import TapDJController from '../js/controller/tap-dj_controller.js';

describe('TapDJController', () => {
  let controller, mockModel, mockView;

  beforeEach(() => {
    jest.useFakeTimers();

    mockModel = {
      addTap: jest.fn(),
      getBPM: jest.fn(() => 120),
      getDurations: jest.fn(() => ({ beat: 500 })),
      reset: jest.fn(),
      setBPM: jest.fn()
    };

    mockView = {
      bindTap: jest.fn(),
      bindReset: jest.fn(),
      bindInlineBpmEdit: jest.fn(),
      handleMouseMove: jest.fn(),
      updateBPMDisplay: jest.fn(),
      updateDurations: jest.fn(),
      flashTap: jest.fn(),
      flashBackground: jest.fn()
    };

    controller = new TapDJController(mockModel, mockView);

    // Create fake checkbox element for decimal mode toggle
    document.body.innerHTML = `<input type="checkbox" id="bpm-decimal-toggle" />`;

    // Silence console logs from controller
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // --- init() ---
  test('initializes by binding view and updating display', () => {
    controller.updateView = jest.fn();
    controller.init();

    expect(mockView.bindTap).toHaveBeenCalled();
    expect(mockView.bindReset).toHaveBeenCalled();
    expect(mockView.bindInlineBpmEdit).toHaveBeenCalled();
    expect(controller.updateView).toHaveBeenCalled();
  });

  // --- handleManualBpm() ---
  test('sets BPM manually and updates the view', () => {
    controller.updateView = jest.fn();
    controller.handleManualBpm(128);
    expect(mockModel.setBPM).toHaveBeenCalledWith(128);
    expect(controller.updateView).toHaveBeenCalled();
  });

  // --- handleTap() ---
  test('handles tap: adds tap, updates view, flashes UI', () => {
    controller.updateView = jest.fn();

    controller.handleTap();

    expect(mockModel.addTap).toHaveBeenCalled();
    expect(controller.updateView).toHaveBeenCalled();
    expect(mockView.flashTap).toHaveBeenCalled();
    expect(mockView.flashBackground).toHaveBeenCalled();
  });

  // --- handleReset() ---
  test('resets model and clears timers', () => {
    const spyClear = jest.spyOn(global, 'clearTimeout');
    controller.updateView = jest.fn();

    controller.handleReset();

    expect(spyClear).toHaveBeenCalled();
    expect(mockModel.reset).toHaveBeenCalled();
    expect(controller.updateView).toHaveBeenCalled();
  });

  // --- updateView() integer mode ---
  test('updates view with integer BPM when toggle unchecked', () => {
    document.getElementById('bpm-decimal-toggle').checked = false;
    controller.updateView();

    expect(mockView.updateBPMDisplay).toHaveBeenCalledWith(120, false);
    expect(mockView.updateDurations).toHaveBeenCalledWith({ beat: 500 });
  });

  // --- updateView() decimal mode ---
  test('updates view with decimal BPM when toggle checked', () => {
    const toggle = document.getElementById('bpm-decimal-toggle');
    toggle.checked = true;
    mockModel.getBPM.mockReturnValue(123.456);

    controller.updateView();

    expect(mockView.updateBPMDisplay).toHaveBeenCalledWith(123.46, true);
    expect(mockView.updateDurations).toHaveBeenCalledWith({ beat: 500 });
  });
});