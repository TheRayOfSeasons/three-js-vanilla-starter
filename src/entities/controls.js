import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Entity } from "../entity";

export class Controls extends Entity {
  /**
   * @type {OrbitControls}
   */
  orbitControls = undefined;
  /**
   * @type {HTMLElement}
   */
  canvas = undefined;
  /**
   * @type {THREE.Camera}
   */
  camera = undefined;

  constructor(canvas, camera) {
    super();
    this.canvas = canvas;
    this.camera = camera;
  }

  start() {
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;
  }

  update() {
    this.orbitControls.update();
  }
}