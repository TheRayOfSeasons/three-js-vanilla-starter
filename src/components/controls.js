import { MonoBehaviour } from 'threenity';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraManager } from './camera-manager';

export class Controls extends MonoBehaviour {
  start() {
    const cameraManager = this.getComponent(CameraManager);
    const camera = cameraManager.camera;
    const overlay = document.querySelector('.overlay');
    this.controls = new OrbitControls(camera, overlay);
    this.controls.enableDamping = true;
  }

  update() {
    this.controls.update();
  }
}
