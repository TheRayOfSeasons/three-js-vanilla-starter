import * as THREE from 'three';
import { BufferAttribute } from 'three';
import { Entity } from '../entity';

export class Stars extends Entity {
  /**
   * @type {THREE.Points}
   */
  points = undefined;
  count = 1000;
  rotationSpeed = 0.0001;

  start() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const x = i3;
      const y = i3 + 1;
      const z = i3 + 2;

      positions[x] = (Math.random() - 0.5) * 50;
      positions[y] = (Math.random() - 0.5) * 50;
      positions[z] = (Math.random() - 0.5) * 50;
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      color: '#FFFFFF',
    });
    this.points = new THREE.Points(geometry, material);
    this.add(this.points)
  }

  update(time) {
    this.rotation.y = time * this.rotationSpeed;
  }
}
