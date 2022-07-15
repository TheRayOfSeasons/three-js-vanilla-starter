import './style.css';
import * as THREE from 'three';
import GSAP from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GridMaterial, MorphedGridMaterial } from './src/materials';


const canvas = document.getElementById('app');

let canvasHeight = canvas.parentElement.clientHeight;
let canvasWidth = canvas.parentElement.clientWidth;

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas
});
renderer.setSize(canvasWidth, canvasHeight);
renderer.setClearColor(0x212121, 1.0);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 25;

class MorphedSphere {
  constructor() {
    const geometry = new THREE.IcosahedronBufferGeometry(10, 32);
    const material = MorphedGridMaterial;
    this.mouse = new THREE.Vector2();

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);

    window.addEventListener('mousemove', event => {
      this.mouse.x = (event.clientX / window.innerWidth).toFixed(2) * 4
      this.mouse.y = (event.clientY / window.innerHeight).toFixed(2) * 2;

      GSAP.to(this.mesh.material.uniforms.uFrequency, { value: this.mouse.x });
      GSAP.to(this.mesh.material.uniforms.uAmplitude, { value: this.mouse.x });
      GSAP.to(this.mesh.material.uniforms.uDensity, { value: this.mouse.y });
      GSAP.to(this.mesh.material.uniforms.uStrength, { value: this.mouse.y });
    });
  }
}

class Ground {
  constructor() {
    const geometry = new THREE.PlaneBufferGeometry(1000, 1000, 1, 1);
    const material = GridMaterial;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = -15;
    this.mesh.rotation.x = -Math.PI * 0.5;
    scene.add(this.mesh);
  }
}

new MorphedSphere();
new Ground();

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  renderer.render(scene, camera);
});

// handle responsiveness
window.addEventListener('resize', event => {
  canvasHeight = canvas.parentElement.clientHeight;
  canvasWidth = canvas.parentElement.clientWidth;
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    canvasWidth,
    canvasHeight
  );
});
