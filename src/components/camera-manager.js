import { MonoBehaviour } from 'threenity';
import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class CameraManager extends MonoBehaviour {
  /**
   * @type {PerspectiveCamera}
   */
  camera = undefined;

  awake() {
    const canvas = this.managers.canvasManager.canvas;
    const canvasHeight = canvas.parentElement.clientHeight;
    const canvasWidth = canvas.parentElement.clientWidth;
    const camera = new PerspectiveCamera(
        75,
        canvasWidth / canvasHeight,
    );
    this.entity.add(camera);
    this.setAsMainCamera(camera);
    camera.position.z = 5;
    this.camera = camera;
  }
}
