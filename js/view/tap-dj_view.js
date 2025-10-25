/**
 * TapDJView: Manages all user interface interactions and displays data.
 * Interface Layer (V in MVC)
 */
export class TapDJView {
    constructor() {
        this.bpmDisplay = document.getElementById('bpmDisplay');
        this.tapButton = document.getElementById('tapButton');
        this.resetButton = document.getElementById('resetButton');
        this.durationElements = {};

        // Map duration keys to their display elements
        document.querySelectorAll('[data-duration-key]').forEach(el => {
            const key = el.getAttribute('data-duration-key');
            this.durationElements[key] = el;
        });
    }

    /**
     * Updates the main BPM display element.
     * @param {number} bpm - The BPM value to display.
     */
    updateBPMDisplay(bpm) {
        this.bpmDisplay.textContent = bpm.toFixed(2);
    }

    /**
     * Updates the timing breakdown list.
     * @param {object} durations - Dictionary of durations (e.g., { beat: 500, bar: 2000 }).
     */
    updateDurations(durations) {
        for (const key in this.durationElements) {
            if (this.durationElements.hasOwnProperty(key)) {
                const ms = durations[key];
                this.durationElements[key].textContent = ms > 0 ? `${ms} ms` : '0 ms';
            }
        }
    }

    /**
     * Provides a quick visual feedback flash on the tap button.
     */
    flashTap() {
        this.tapButton.classList.add('flash');
        // Remove the class after the animation completes
        this.tapButton.addEventListener('animationend', () => {
            this.tapButton.classList.remove('flash');
        }, { once: true });
    }

    /**
     * Binds the tap handler function to the button click and key press (SPACE/Enter).
     * @param {function} handler - The function in the Controller to call on tap.
     */
    bindTap(handler) {
        this.tapButton.addEventListener('click', handler);

        document.addEventListener('keydown', (e) => {
            // Check for Space or Enter key
            if (e.code === 'Space' || e.key === 'Enter') {
                e.preventDefault(); // Prevent scrolling on spacebar
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
