import * as THREE from 'three';
import { Entity } from './entity';

export class Cube extends Entity {
  start() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    this.add(mesh);
  }

  update(time) {
    this.rotation.y = time * 0.001;
  }
}
