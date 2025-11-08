/**
 * TapDJView: Manages all user interface interactions and displays data.
 * Interface Layer (V in MVC)
 */
export default class TapDJView {
    constructor(appElement) {
        this.app = appElement;
        this.currentHue = 120;
        this.bpmDisplay = document.getElementById('bpmDisplay');
        this.bpmDisplay.contentEditable = true;
        this.bpmDisplay.spellcheck = false;
        this.bpmDisplay.classList.add(
            'cursor-text','outline-none','focus:ring-2','focus:ring-secondary/50'
        );

        this.tapButton = document.getElementById('tapButton');

        // Ensure the tap button wrapper is relatively positioned for absolute popup placement
        if (this.tapButton && this.tapButton.parentElement && this.tapButton.parentElement.classList) {
            this.tapButton.parentElement.classList.add('relative');
        }

        // ---- Loading popup (videogame-style) ----
        this.loadingPopup = document.createElement('div');
        this.loadingPopup.id = 'loadingPopup';
        this.loadingPopup.className = [
            'absolute','left-1/2','-translate-x-1/2','bottom-[-3rem]',
            'bg-black/80','backdrop-blur','text-secondary','text-xs','md:text-sm',
            'px-3','py-2','rounded-xl','shadow-lg','ring-1','ring-secondary/30',
            'opacity-0','pointer-events-none','select-none','transition-all','duration-200',
            'flex','flex-col','items-center','gap-1','z-20','w-44','md:w-52','text-center'
        ].join(' ');

        const label = document.createElement('span');
        label.textContent = 'Loading…';
        label.className = 'loading-label uppercase tracking-wider';

        const percent = document.createElement('span');
        percent.textContent = '0%';
        percent.className = 'loading-percent text-secondary/80 font-mono';

        this.loadingPopup.appendChild(label);
        this.loadingPopup.appendChild(percent);

        const bar = document.createElement('div');
        bar.className = [
            'grid','grid-cols-12','gap-[2px]',
            'w-32','h-2','bg-white/5','rounded-full','overflow-hidden','ring-1','ring-white/10'
        ].join(' ');

        for (let i = 0; i < 12; i++) {
            const seg = document.createElement('span');
            seg.className = 'segment block w-full h-full rounded-[2px]';
            seg.style.background = 'rgba(255,255,255,0.10)';
            bar.appendChild(seg);
        }

        this.loadingPopup.appendChild(label);
        this.loadingPopup.appendChild(bar);

        // Attach the popup next to the tap button
        if (this.tapButton && this.tapButton.parentElement) {
            this.tapButton.parentElement.appendChild(this.loadingPopup);
        } else {
            // Fallback: append to body if structure changes
            document.body.appendChild(this.loadingPopup);
        }

        // Internal pointer to animate segments
        this._loadingTick = -1;

        // <-------------------------------------------------->
        this.resetButton = document.getElementById('resetButton');
        this.durationElements = {};
        
        // Map duration keys to their display elements
        document.querySelectorAll('[data-duration-key]').forEach(el => {
            const key = el.getAttribute('data-duration-key');
            this.durationElements[key] = el;
        });
        this.styleTapButton('secondary');
    }

    /**
     * Binds manual BPM entry when user edits the BPM display directly.
     * @param {function(number)} handler - Controller handler that receives the new BPM.
     */
    bindInlineBpmEdit(handler) {
        if (!this.bpmDisplay) return;

        const commit = () => {
            const text = this.bpmDisplay.textContent.trim();
            const bpmValue = parseFloat(text);
            const prev = parseFloat(this.bpmDisplay.dataset.currentBpm || '0');

            if (isNaN(bpmValue) || bpmValue <= 0) {
                // Revert to last valid BPM if invalid
                this.bpmDisplay.textContent = isNaN(prev) ? '0' : prev.toFixed(2);
                return;
            }

            handler(bpmValue);
            this.bpmDisplay.dataset.currentBpm = bpmValue.toFixed(2);
        };

        this.bpmDisplay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commit();
                this.bpmDisplay.blur();
            }
        });

        this.bpmDisplay.addEventListener('blur', commit);
    }

    showLoading() {
        if (!this.loadingPopup) return;
        this.loadingPopup.style.opacity = '1';
        this.loadingPopup.style.pointerEvents = 'auto';
    }

    hideLoading() {
        if (!this.loadingPopup) return;
        this.loadingPopup.style.opacity = '0';
        this.loadingPopup.style.pointerEvents = 'none';
    }

    bumpLoading() {
        const segments = this.loadingPopup?.querySelectorAll('.segment');
        if (!segments || !segments.length) return;
        this._loadingTick = (this._loadingTick + 1) % segments.length;
        segments.forEach((el, i) => {
            if (i === this._loadingTick) {
                el.style.filter = 'brightness(1.8)';
                el.style.background = 'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(255,255,255,0.7))';
                el.style.boxShadow = '0 0 6px rgba(16,185,129,0.8)';
            } else {
                el.style.filter = 'brightness(1)';
                el.style.background = 'rgba(255,255,255,0.10)';
                el.style.boxShadow = 'none';
            }
        });
    }

    // BPM/music related phrases to rotate between
    _loadingPhrases = [
      'Tuning decks…',
      'Spinning vinyl…',
      'Syncing groove…',
      'Locking tempo…',
      'Firing LFOs…',
      'Calibrating BPM…',
      'Boosting bassline…',
      'Cueing next bar…',
      'Vibing nicely…',
      'Aligning downbeat…',
      'Almost there, babe…',
      'Dropping the beat…',
      'Awww yeahhh…'
    ];

    _loadingProgress = 0; // percentage
    _loadingPhraseIndex = 0;

    updateLoadingText() {
      const label = this.loadingPopup?.querySelector('.loading-label');
      const percent = this.loadingPopup?.querySelector('.loading-percent');
      if (!label || !percent) return;

        // Use the current tick from bumpLoading(), don’t increment again
        const currentTick = this._loadingTick >= 0 ? this._loadingTick : 0;
        this._loadingProgress = ((currentTick + 1) / 12) * 100;

        this._loadingPhraseIndex = (this._loadingPhraseIndex + 1) % this._loadingPhrases.length;

        label.textContent = this._loadingPhrases[this._loadingPhraseIndex];
        percent.textContent = `${Math.floor(this._loadingProgress)}%`;
    }

    styleTapButton(colorName) {
        this.tapButton.classList.remove('bg-primary', 'hover:bg-emerald-600', 'bg-secondary', 'hover:bg-emerald-400');
        if (colorName === 'secondary') {
            this.tapButton.classList.add('bg-secondary', 'hover:bg-emerald-400');
        } else {
            this.tapButton.classList.add('bg-primary', 'hover:bg-emerald-200');
        }
    }

    /**
     * Updates the main BPM display element.
     * @param {number} bpm - The BPM value to display.
     * @param {boolean} isDecimal - True to show decimals in BPM values.
     */
    updateBPMDisplay(bpm, isDecimal) {
        this.bpmDisplay.textContent = !isDecimal
            ? bpm.toString()
            : bpm.toFixed(2);
    }

    /**
     * Updates the timing breakdown list.
     * @param {object} durations - Dictionary of durations (e.g., { beat: 500, bar: 2000 }).
     */
    updateDurations(durations) {
        for (const key in this.durationElements) {
            if (this.durationElements.hasOwnProperty(key)) {
                const ms = durations[key];
                const s = durations.formatted[key];
                if (key == '16 bars' || key == '32 bars')
                    this.durationElements[key].textContent = ms > 0 ? `${s}` : '0 s';
                else 
                    this.durationElements[key].textContent = ms > 0 ? `${ms} ms` : '0 ms';
            }
        }
    }

    /**
     * Provides a quick visual feedback flash on the tap button.
     * Tailwind scale effect.
     */
    flashTap() {
        this.tapButton.classList.add('scale-95'); // Tailwind scale down
        setTimeout(() => this.tapButton.classList.remove('scale-95'), 150);
    }

    /**
     * Provides visual feedback by pulsing the background.
     */
    flashBackground() {
        if (!this.app) return;

        // Set the dynamic hue on the #app container
        this.app.style.setProperty('--hue', this.currentHue);

        this.app.classList.add('pulse-bg');
        this.app.addEventListener('animationend', (e) => {
            if (e.animationName === 'bgPulse') {
                this.app.classList.remove('pulse-bg');
            }
        }, { once: true });
    }

    /**
     * Handles the mouse movement to dynamically change the global HUE CSS variable.
     * Maps mouse X position (0 to window.innerWidth) to a Hue value (0 to 360).
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseMove(e) {
        if (!this.app) return;
        
        const x = e.clientX;
        const width = window.innerWidth;
        const hue = Math.floor((x / width) * 360);
        this.currentHue = hue;
        
        // Update the CSS variable on the #app container for the smooth static glow change
        this.app.style.setProperty('--hue', hue);
    }

    /**
     * Binds the tap handler function to the button click and key press (SPACE/Enter).
     * @param {function} handler - The function in the Controller to call on tap.
     */
    bindTap(handler) {
        // Mouse click
        this.tapButton.addEventListener('click', handler);

        // Keyboard: Space or Enter
        this.tapButton.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault(); // Prevent scrolling or form submission
                handler();
            }
        });
    }

    /**
     * Binds the reset handler function to the reset button click.
     * @param {function} handler - The function in the Controller to call on reset.
     */
    bindReset(handler) {
        this.resetButton.addEventListener('click', handler);
    }
}
