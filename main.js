import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
const geometry = new THREE.BufferGeometry();
const count = 10000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const radius = 10;
const branches = 3;
const spin = 1;
const spread = 5;

const color1 = new THREE.Color('#ADD8E6');
const color2 = new THREE.Color('#101820');

for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  const x = i3;
  const y = i3 + 1;
  const z = i3 + 2;

  const localRadius = Math.random() * radius;
  const branch = i % 3;
  const branchAngle = branch / branches * Math.PI * 2;
  const spinAngle = spin * localRadius;

  const randomX = Math.pow(Math.random(), spread) * (Math.random() > 0.5 ? -1 : 1);
  const randomY = Math.pow(Math.random(), spread) * (Math.random() > 0.5 ? -1 : 1);
  const randomZ = Math.pow(Math.random(), spread) * (Math.random() > 0.5 ? -1 : 1);

  positions[x] = Math.cos(branchAngle + spinAngle) * localRadius + randomX;
  positions[y] = randomY;
  positions[z] = Math.sin(branchAngle + spinAngle) * localRadius + randomZ;

  const color = color1.clone();
  color.lerp(color2, localRadius / radius);
  colors[x] = color.r;
  colors[y] = color.g;
  colors[z] = color.b;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: true,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
});
const mesh = new THREE.Points(geometry, material);
mesh.rotation.x = Math.PI * 0.25;
scene.add(mesh);

const controls = new OrbitControls(camera, canvas);

// render
renderer.setAnimationLoop(time => {
  controls.update();
  mesh.rotation.y = time * 0.0001;
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
