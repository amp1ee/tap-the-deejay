export default class TapDJView {
  constructor(rootElement) {
    // Create or select the main container for the app UI
    this.root = rootElement || document.getElementById('app');
    this.root.classList.add('tap-dj-view');

    // --- Create UI elements ---
    this.title = document.createElement('h1');
    this.title.textContent = 'TapTheDJ 🪩';

    this.bpmDisplay = document.createElement('div');
    this.bpmDisplay.className = 'bpm-display';
    this.bpmDisplay.textContent = '-- BPM';

    this.tapButton = document.createElement('button');
    this.tapButton.className = 'tap-button';
    this.tapButton.textContent = 'TAP';

    this.infoPanel = document.createElement('div');
    this.infoPanel.className = 'info-panel';
    this.infoPanel.innerHTML = `
      <p>Press SPACE or click to tap the beat</p>
      <p class="tap-count">Taps: 0</p>
    `;

    this.root.append(
      this.title,
      this.bpmDisplay,
      this.tapButton,
      this.infoPanel
    );

    this.onTap = null;
    this.onReset = null;

    this.tapButton.addEventListener('click', () => {
      if (this.onTap) this.onTap();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.onTap) this.onTap();
      }
    });
  }

  updateBPM(bpm) {
    this.bpmDisplay.textContent = bpm ? `${bpm.toFixed(1)} BPM` : '-- BPM';
  }

  updateTapCount(count) {
    const counter = this.infoPanel.querySelector('.tap-count');
    counter.textContent = `Taps: ${count}`;
  }

  resetDisplay() {
    this.updateBPM(null);
    this.updateTapCount(0);
  }
}

