import * as THREE from 'three';
import { Entity } from '../core/entity';

/**
 * @typedef {Object} InstanceMeta
 * @property {THREE.Vector3} target
 * @property {THREE.Vector3} origin
 */

/**
 * @typedef {Object} HeartFireworkConstructor
 * @property {string} color
 * @property {THREE.Vector3} destination
 * @property {Number} amount
 * @property {Number} delay
 */

export class HeartFirework extends Entity {
  amount = 24;
  /**
   * @type {THREE.InstancedMesh}
   */
  mesh = undefined;
  color = '#FFFFFF';
  dummy = new THREE.Object3D();
  dummyVector = new THREE.Vector3();
  /**
   * @type {InstanceMeta[]}
   */
  meta = [];
  delay = 0;
  destination = new THREE.Vector3(0, 20, 0);
  speed = 0.05;
  animate = false;

  /**
   * @param {HeartFireworkConstructor} param0
   */
  constructor({ color, destination, amount=24, delay=0 }) {
    super();
    this.color = color;
    this.amount = amount;
    this.delay = delay;
    if (destination) {
      this.destination.copy(destination);
    }
  }

  /**
   * @returns {THREE.Vector3[]}
   */
  createPoints() {
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -10, 0),
      new THREE.Vector3(15, -5, 0),
      new THREE.Vector3(15, 20, 0),
      new THREE.Vector3(0, 6, 0)
    );
    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -10, 0),
      new THREE.Vector3(-15, -5, 0),
      new THREE.Vector3(-15, 20, 0),
      new THREE.Vector3(0, 6, 0)
    );
    const amount = this.amount % 2 == 1 ? this.amount + 1 : this.amount;
    const distribution = (amount * 0.5) - 1;
    const points = [
      ...curve1.getPoints(distribution),
      ...curve2.getPoints(distribution)
    ];
    return points;
  }

  reset() {
    this.mesh.position.set(0, 0, 0);
    for (let i = 0; i < this.amount; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.position.copy(this.meta[i].origin);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  start() {
    const geometry = new THREE.SphereBufferGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: this.color
    });
    this.mesh = new THREE.InstancedMesh(geometry, material, this.amount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.add(this.mesh);

    const heartPoints = this.createPoints();
    for (let i = 0; i < this.amount; i++) {
      const target = heartPoints[i];
      const origin = new THREE.Vector3();
      this.dummy.position.set(0, 0, 0);
      this.meta.push({target, origin});
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    setInterval(() => {
      this.animate = true;
      this.reset();
    }, this.delay);
  }

  update() {
    if (!this.animate)
      return;

    this.mesh.position.lerp(this.destination, this.speed);
    if (this.mesh.position.distanceTo(this.destination) < 1) {
      for (let i = 0; i < this.amount; i++) {
        this.mesh.getMatrixAt(i, this.dummy.matrix);
        this.dummyVector.setFromMatrixPosition(this.dummy.matrix);
        this.dummyVector.lerp(this.meta[i].target, 0.01);
        this.dummy.position.copy(this.dummyVector);
        this.dummy.updateMatrix();
        this.mesh.setMatrixAt(i, this.dummy.matrix);
        this.mesh.instanceMatrix.needsUpdate = true;
      }
    }
  }
}
