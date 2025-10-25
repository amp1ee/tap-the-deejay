class TapDJController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Bind view events to controller handlers
        this._bindEvents();
    }

    _bindEvents() {
        // Tapping via click
        this.view.onTapClick(() => this._handleTap());

        // Tapping via keyboard (spacebar)
        this.view.onTapKey((event) => {
            if (event.code === 'Space') {
                this._handleTap();
                event.preventDefault(); // Prevent page scrolling
            }
        });

        // Reset button
        this.view.onReset(() => this._handleReset());
    }

    _handleTap() {
        this.model.registerTap();
        const bpm = this.model.calculateBPM();
        this.view.updateBPM(bpm);
    }

    _handleReset() {
        this.model.resetTaps();
        this.view.updateBPM(0);
    }
}

export default TapDJController;

