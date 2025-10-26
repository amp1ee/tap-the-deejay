import TapDJModel 		from './model/tap-dj_model.js';
import TapDJView 		from './view/tap-dj_view.js';
import TapDJController  from './controller/tap-dj_controller.js';

// Application Entry Point
window.onload = function() {
	// Get the container element for the view
    const bodyElement = document.getElementById('app');

    // Instantiate the Model, View, and Controller
    const tapModel = new TapDJModel();

    const tapView = new TapDJView(bodyElement); 
    const tapController = new TapDJController(tapModel, tapView);

    // Initialize the application
    tapController.init();
};