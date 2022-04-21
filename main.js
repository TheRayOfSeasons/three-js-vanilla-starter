import './style.css';
import * as THREE from 'three';


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
camera.position.z = 10;

// mesh
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const InputHold = {
  W: false,
  A: false,
  S: false,
  D: false
};
document.addEventListener('keydown', event => {
  const key = event.key.toUpperCase();
  if (Object.keys(InputHold).includes(key)) {
    InputHold[key] = true;
  }
});
document.addEventListener('keyup', event => {
  const key = event.key.toUpperCase();
  if (Object.keys(InputHold).includes(key)) {
    InputHold[key] = false;
  }
});

const speed = 0.25;

// render
renderer.setAnimationLoop(time => {
  if (InputHold.W) {
    mesh.translateY(speed);
  }
  else if (InputHold.S) {
    mesh.translateY(-speed);
  }
  if (InputHold.A) {
    mesh.translateX(-speed);
  }
  else if (InputHold.D) {
    mesh.translateX(speed);
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
