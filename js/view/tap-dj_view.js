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
        if (this.tapButton?.parentElement) {
            this.tapButton.parentElement.classList?.add('relative');
        }

        // --- ① Create the loading popup dynamically ---
        this.loadingPopup = document.createElement('div');
        this.loadingPopup.id = 'loadingPopup';
        this.loadingPopup.className = [
            'absolute','left-1/2','-translate-x-1/2','bottom-[-3rem]',
            'bg-black/80','backdrop-blur','text-secondary','text-xs','md:text-sm',
            'px-3','py-2','rounded-xl','shadow-lg','ring-1','ring-secondary/30',
            'flex','items-center','gap-2',
            'opacity-0','pointer-events-none','transition-opacity','duration-300'
        ].join(' ');

        // --- ② Label + LED bar ---
        this.loadingPopup.innerHTML = `
          <span class="font-semibold tracking-wide">Computing&nbsp;BPM</span>
          <div class="flex items-center gap-1">
            <div class="grid grid-cols-8 gap-[2px] w-28 md:w-32 h-[6px] md:h-[7px] rounded">
              ${Array.from({ length: 8 })
                .map(() => '<div class="segment bg-white/10 rounded-[1px]"></div>')
                .join('')}
            </div>
          </div>
        `;
        this.tapButton?.parentElement?.appendChild(this.loadingPopup);

        // --- ③ Internal state ---
        this._loadingTick = 0;

        this.resetButton = document.getElementById('resetButton');
        this.durationElements = {};
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

    // --- popup controls ---
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
        if (!segments?.length) return;
        this._loadingTick = (this._loadingTick + 1) % segments.length;
        segments.forEach((el, i) => {
            if (i === this._loadingTick) {
                el.style.filter = 'brightness(1.8)';
                el.style.background =
                    'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(255,255,255,0.7))';
                el.style.boxShadow = '0 0 6px rgba(16,185,129,0.8)';
            } else {
                el.style.filter = 'brightness(1)';
                el.style.background = 'rgba(255,255,255,0.10)';
                el.style.boxShadow = 'none';
            }
        });
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
