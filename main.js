import './style.css';
import Stats from 'stats-js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { create3DUserIcon } from './src/user-icon-3d';


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
camera.position.z = 20;

const icon3d1 = create3DUserIcon();
scene.add(icon3d1.object);

const icon3d2 = create3DUserIcon();
scene.add(icon3d2.object);
icon3d2.object.position.set(-10, 5, -10);

const icon3d3 = create3DUserIcon();
scene.add(icon3d3.object);
icon3d3.object.position.set(10, 5, -10);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const lightGroup = new THREE.Group();
scene.add(lightGroup);

const light1 = new THREE.PointLight('#ffffff', 1, 0);
light1.position.set(0, 200, 200);
lightGroup.add(light1);

const light2 = new THREE.PointLight('#ffffff', 0.1, 0);
light2.position.set(-100, 200, 100);
lightGroup.add(light2);

const light3 = new THREE.PointLight('#ffffff', 1, 0);
light3.position.set(-100, -200, -100);
lightGroup.add(light3);

const light4 = new THREE.PointLight('#2472ca', 3, 0);
light4.position.set(0, 200, 0);
lightGroup.add(light4);

const light5 = new THREE.PointLight('#2472ca', 3, 0);
light4.position.set(0, 0, 200);
scene.add(light5);

const directionalLight = new THREE.DirectionalLight('#fffff');
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight('#000000');
lightGroup.add(ambientLight);

lightGroup.lookAt(new THREE.Vector3(40, -30, 0));

// render
renderer.setAnimationLoop(time => {
  stats.begin();
  controls.update();
  icon3d1.update(time);
  icon3d2.update(time);
  icon3d3.update(time);
  renderer.render(scene, camera);
  stats.end();
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
