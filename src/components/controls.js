import { MonoBehaviour } from 'threenity';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CameraManager } from './camera-manager';

export class Controls extends MonoBehaviour {
  start() {
    const canvas = this.managers.canvasManager.canvas;
    const cameraManager = this.getComponent(CameraManager);
    const camera = cameraManager.camera;
    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
  }

  update() {
    this.controls.update();
  }
}
