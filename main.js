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

const front = new THREE.Object3D();
front.position.y = 1;
const frontHelper = new THREE.AxesHelper(0.5);
front.add(frontHelper);
mesh.add(front);

const back = new THREE.Object3D();
back.position.y = -1;
const backHelper = new THREE.AxesHelper(0.5);
back.add(backHelper);
mesh.add(back);

const bullets = [];
const Pressed = {
  W: false,
  A: false,
  S: false,
  D: false
}
document.addEventListener('keydown', event => {
  const key = event.key.toUpperCase();
  if (Object.keys(Pressed).includes(key)) {
    Pressed[key] = true;
  }
  if (event.code === 'Space') {
    const bulletGeom = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const bullet = new THREE.Mesh(bulletGeom, bulletMaterial);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    front.getWorldPosition(position);
    front.getWorldQuaternion(quaternion);
    bullet.position.copy(position);
    bullet.quaternion.copy(quaternion);
    scene.add(bullet);
    bullets.push(bullet);
    setTimeout(() => {
      bullet.geometry.dispose();
      bullet.material.dispose();
      scene.remove(bullet);
    }, 500);
  }
});
document.addEventListener('keyup', event => {
  const key = event.key.toUpperCase();
  if (Object.keys(Pressed).includes(key)) {
    Pressed[key] = false;
  }
});

const movementSpeed = 0.25;
const rotationSpeed = 0.025;

// render
renderer.setAnimationLoop(time => {
  for (const bullet of bullets) {
    bullet.translateY(1)
  }
  if (Pressed.W) {
    mesh.translateY(movementSpeed);
  }
  else if (Pressed.S) {
    mesh.translateY(-movementSpeed);
  }
  if (Pressed.A) {
    mesh.rotation.z += Math.PI * rotationSpeed;
  }
  else if (Pressed.D) {
    mesh.rotation.z += -Math.PI * rotationSpeed;
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
