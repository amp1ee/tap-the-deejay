import { TapDJModel } from '../model/tap-dj_model.js';
import { TapDJView } from '../view/tap-dj_view.js';

/**
 * TapDJController: Orchestrates the flow between the Model and the View.
 * Application Glue (C in MVC)
 */
export class TapDJController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.idleTimer = null;
        this.IDLE_TIMEOUT_MS = 3000; // Auto-reset after 3 seconds of inactivity
    }

    /**
     * Initializes the controller, sets up event listeners, and initial view.
     */
    init() {
        this.view.bindTap(this.handleTap.bind(this));
        this.view.bindReset(this.handleReset.bind(this));
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
        this.model.addTap(performance.now()); // Use performance.now() for high-res timing

        // 3. Update the view
        this.updateView();

        // 4. Provide visual feedback
        this.view.flashTap();
    }

    /**
     * Handles the reset event, clearing all data and view displays.
     */
    handleReset() {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;

        this.model.reset();
        this.updateView();
        console.log("App reset by controller.");
    }

    /**
     * Fetches data from the model and pushes it to the view.
     */
    updateView() {
        const bpm = this.model.getBPM();
        const durations = this.model.getDurations();

        this.view.updateBPMDisplay(bpm);
        this.view.updateDurations(durations);
    }
}
