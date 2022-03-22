import { MonoBehaviour } from 'threenity';
import { PerspectiveCamera } from 'three';
import { listener } from '../misc/audioListener';

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
    camera.position.set(
      2.3079039992366446,
      3.4263308268277446,
      2.816706622180851
    )
    camera.add(listener);
    this.camera = camera;
  }
}
