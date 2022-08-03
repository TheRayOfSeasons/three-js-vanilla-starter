import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Entity } from './entity';

export class Controls extends Entity {
  constructor(camera, canvas) {
    super();
    this.camera = camera;
    this.canvas = canvas;
  }

  start() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  update(time) {
    this.controls.update();
  }
}
