import TapDJModel from '../model/tap-dj_model.js';
import TapDJView from '../view/tap-dj_view.js';

/**
 * TapDJController: Orchestrates the flow between the Model and the View.
 * Application Glue (C in MVC)
 */
export default class TapDJController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.idleTimer = null;
        this.IDLE_TIMEOUT_MS = 120000; // Auto-reset (ms) after a period of inactivity
    }

    /**
     * Initializes the controller, sets up event listeners, and initial view.
     */
    init() {
        this.view.bindTap(this.handleTap.bind(this));
        this.view.bindReset(this.handleReset.bind(this));
        window.addEventListener('mousemove', this.view.handleMouseMove.bind(this.view));
        this.updateView(); // Initial display update
        console.log("TapDJController initialized. Ready to tap!");
    }

    /**
     * Handles a user tap event (mouse click or key press).
     */
    handleTap() {
        // 1. Reset the idle timer
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(this.handleReset.bind(this), this.IDLE_TIMEOUT_MS);

        // 2. Add tap to model
        this.model.addTap(performance.now()); // High-resolution timing

        // 3. Update the view
        this.updateView();

        // 4. Provide visual feedback
        this.view.flashTap();
        this.view.flashBackground(); // Trigger background pulse
    }

    /**
     * Handles the reset event, clearing all data and view displays.
     */
    handleReset() {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;

        this.model.reset();
        this.updateView();
        console.log("BPM has been reset by controller.");
    }

    /**
     * Fetches data from the model and pushes it to the view.
     */
    updateView() {
        let bpm = this.model.getBPM();
        const durations = this.model.getDurations();

        const decimalToggle = document.getElementById('bpm-decimal-toggle');
        const decimalMode = decimalToggle.checked;

        if (!decimalMode) {
            // Integer mode
            bpm = Math.round(bpm);
        } else {
            // Show decimals
            bpm = parseFloat(bpm.toFixed(2));
        }

        // Pass both BPM and the mode flag to the view
        this.view.updateBPMDisplay(bpm, decimalMode);
        this.view.updateDurations(durations);
    }
}
