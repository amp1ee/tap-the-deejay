import TapDJModel from './models/tap-dj_model.js';
import TapDJView from './views/tap-dj_view.js';
import TapDJController from './controllers/tap-dj_controller.js';

const model = new TapDJModel();
const view = new TapDJView(document.getElementById('app'));
const controller = new TapDJController(model, view);

view.onTap(() => controller.handleTap());
view.onReset(() => controller.handleReset());

view.updateBPM(model.getBPM());

