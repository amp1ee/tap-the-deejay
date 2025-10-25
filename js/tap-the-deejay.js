import TapDJModel 		from './model/tap-dj_model.js';
import TapDJView 		from './view/tap-dj_view.js';
import TapDJController  from './controller/tap-dj_controller.js';

const model = new TapDJModel();
const view = new TapDJView(document.getElementById('app'));
const controller = new TapDJController(model, view);

view.bindTap(() => controller.handleTap());
view.bindReset(() => controller.handleReset());

view.updateBPM(model.getBPM());