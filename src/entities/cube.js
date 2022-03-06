import { Entity } from 'threenity';
import { MeshRenderer } from '../components/mesh-renderer';

export class Cube extends Entity {
  setupComponents() {
    this.addComponent(MeshRenderer);
  }
}
