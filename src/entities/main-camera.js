import { Entity } from 'threenity';
import { CameraManager } from '../components/camera-manager';
import { Controls } from '../components/controls';

export class MainCamera extends Entity {
  setupComponents() {
    this.addComponent(Controls);
    this.addComponent(CameraManager);
  }
}
