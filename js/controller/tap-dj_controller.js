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

        // --- Loading popup timer ---
        this._loadingTimeout = null;

        // --- Idle / reset timing ---
        this._idleMs =
            (this.model && (this.model.tapTimeoutMs || this.model.TAP_TIMEOUT_MS)) ||
            2000;
        this.IDLE_TIMEOUT_MS = this._idleMs || 3000;   // safe default
        this.POPUP_TIMEOUT_MS = 1500;                  // hide popup sooner
    }

    init() {
        // bind UI
        this.view.bindTap(this.handleTap.bind(this));
        this.view.bindReset(this.handleReset.bind(this));
        window.addEventListener('mousemove', this.view.handleMouseMove.bind(this.view));
        this.view.bindInlineBpmEdit(this.handleManualBpm.bind(this));
        this.updateView();
        console.log('TapDJController initialized. Ready to tap!');
    }

    handleManualBpm(bpmValue) {
        this.model.setBPM(bpmValue);
        this.updateView();
    }

    handleTap() {
        // restart idle-reset timer
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.handleReset(), this.IDLE_TIMEOUT_MS);

        // register tap + update visuals
        this.model.addTap(performance.now());
        this.updateView();
        this.view.flashTap();
        this.view.flashBackground();

        // --- videogame-style popup control ---
        this.view.showLoading();
        this.view.bumpLoading();

        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = setTimeout(
            () => this.view.hideLoading(),
            this.POPUP_TIMEOUT_MS
        );
    }

    handleReset() {
        clearTimeout(this.idleTimer);
        this.idleTimer = null;

        this.model.reset();
        this.view.hideLoading();
        this.updateView();
        console.log('BPM has been reset by controller.');
    }

    updateView() {
        let bpm = this.model.getBPM();
        const durations = this.model.getDurations();

        const decimalToggle = document.getElementById('bpm-decimal-toggle');
        const decimalMode = decimalToggle.checked;

        bpm = decimalMode ? parseFloat(bpm.toFixed(2)) : Math.round(bpm);

        this.view.updateBPMDisplay(bpm, decimalMode);
        this.view.updateDurations(durations);
    }
}