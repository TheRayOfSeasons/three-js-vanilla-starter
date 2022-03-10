import * as THREE from 'three';
import { BufferAttribute } from 'three';
import { Entity } from '../entity';

export class Galaxy extends Entity {
  /**
   * @type {THREE.Points}
   */
  mesh = undefined;
  count = 10000;
  radius = 10;
  spin = 1;
  spread = 5;
  upwardsSpread = 3;
  branches = 3;
  inwardsColor = new THREE.Color('#ADD8E6');
  outwardsColor = new THREE.Color('#101820');
  rotationSpeed = 0.0001;

  start() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const x = i3;
      const y = i3 + 1;
      const z = i3 + 2;

      const radius = Math.random() * this.radius;
      const spinAngle = radius * this.spin;
      const branchAngle = (i % this.branches) / this.branches * Math.PI * 2;
      const upwardsAngle = (i % this.upwardsSpread) / this.upwardsSpread * Math.PI * 2;

      const randomX = Math.pow(Math.random(), this.spread) * (Math.random() < 0.5 ? -1 : 1);
      const randomY = Math.pow(Math.random(), this.spread) * (Math.random() < 0.5 ? -1 : 1);
      const randomZ = Math.pow(Math.random(), this.spread) * (Math.random() < 0.5 ? -1 : 1);

      positions[x] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[y] = Math.sin(upwardsAngle + spinAngle) * radius + randomY;
      positions[z] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const r = x;
      const g = y;
      const b = z;
      const color = this.inwardsColor.clone();
      color.lerp(this.outwardsColor, radius / this.radius)
      colors[r] = color.r;
      colors[g] = color.g;
      colors[b] = color.b;
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    this.points = new THREE.Points(geometry, material);
    this.add(this.points)
  }

  update(time) {
    this.rotation.y = time * this.rotationSpeed;
  }
}
