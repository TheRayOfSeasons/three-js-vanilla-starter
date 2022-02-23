import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getComposer } from './components/postprocessing';
import { HeartFirework } from './components/heart-firework';

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
camera.position.z = 100;

const composer = getComposer(scene, camera, renderer);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const entities = [];

for (let i = 0; i < 10; i++) {
  const firework = new HeartFirework({
    color: '#e412a5',
    destination: new THREE.Vector3(0, 20, 0),
    delay: (Math.random() * 1000) + 3000
  });
  firework.position.set(
    ((Math.random() - 0.5) * 2) * 100,
    ((Math.random() - 0.5) * 2) * 10,
    ((Math.random() - 0.5) * 2) * 10,
  );
  entities.push(firework);
}

for (const entity of entities) {
  entity.start();
  scene.add(entity);
}

// render
renderer.setAnimationLoop(() => {
  controls.update();
  for (const entity of entities) {
    entity.update();
  }
  composer.render();
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
