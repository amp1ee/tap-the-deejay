/**
 * TapDJView: Manages all user interface interactions and displays data.
 * Interface Layer (V in MVC)
 */
export default class TapDJView {
    constructor(appElement) {
        this.app = appElement;
        this.currentHue = 120;
        this.bpmDisplay = document.getElementById('bpmDisplay');
        this.tapButton = document.getElementById('tapButton');
        this.resetButton = document.getElementById('resetButton');
        this.durationElements = {};

        // Map duration keys to their display elements
        document.querySelectorAll('[data-duration-key]').forEach(el => {
            const key = el.getAttribute('data-duration-key');
            this.durationElements[key] = el;
        });
        this.styleTapButton('secondary');
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
                    this.durationElements[key].textContent = ms > 0 ? `${s} s` : '0 s';
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
