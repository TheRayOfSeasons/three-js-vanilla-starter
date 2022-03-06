import {
  BoxBufferGeometry,
  Mesh,
  MeshNormalMaterial
} from 'three';
import { MonoBehaviour, Time } from 'threenity';

export class MeshRenderer extends MonoBehaviour {
  /**
   * @type {Mesh}
   */
  mesh = undefined;
  speed = 0.5;

  start() {
    const geometry = new BoxBufferGeometry(1, 1, 1);
    const material = new MeshNormalMaterial();
    this.mesh = new Mesh(geometry, material);
    this.entity.add(this.mesh);
  }

  update() {
    this.mesh.rotation.y += Time.deltaTime * this.speed;
  }
}
