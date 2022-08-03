import './style.css';
import * as THREE from 'three';
import { Cube } from './src/cube';
import { Controls } from './src/controls';
import { Particles } from './src/particles';

const canvas = document.getElementById('app');

let canvasHeight = canvas.parentElement.clientHeight;
let canvasWidth = canvas.parentElement.clientWidth;

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas
});
renderer.setSize(canvasWidth, canvasHeight);
renderer.setClearColor(0x000000, 1.0);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 12;

const entities = [
  // new Cube(),
  new Controls(camera, canvas),
  new Particles()
];
for (const entity of entities) {
  entity.start();
  scene.add(entity);
}


// render
renderer.setAnimationLoop(time => {
  for (const entity of entities) {
    entity.update(time);
  }
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
