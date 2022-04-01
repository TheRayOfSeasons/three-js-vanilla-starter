import './style.css';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
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

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 10;

const light = new THREE.DirectionalLight('#e7e7e7');
light.position.set(20, 100, 0);
scene.add(light);


let velocity = 10;
// mesh
const createBox = (x, y, z) => {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const rigidBody = new CANNON.Body({ mass: 1 });
  rigidBody.addShape(shape);
  world.addBody(rigidBody);
  
  rigidBody.position.x = mesh.position.x;
  rigidBody.position.y = mesh.position.y;
  rigidBody.position.z = mesh.position.z;
  
  const update = () => {
    mesh.position.x = rigidBody.position.x;
    mesh.position.y = rigidBody.position.y;
    mesh.position.z = rigidBody.position.z;
    mesh.quaternion.x = rigidBody.quaternion.x;
    mesh.quaternion.y = rigidBody.quaternion.y;
    mesh.quaternion.z = rigidBody.quaternion.z;
    mesh.quaternion.w = rigidBody.quaternion.w;
  }

  return { mesh, rigidBody, update };
}

const createPlane = () => {
  const geometry = new THREE.PlaneBufferGeometry(100, 100, 8, 8);
  const material = new THREE.MeshPhongMaterial({
    color: '#c63bbf',
    shininess: 50
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.x = -Math.PI * 0.5;
  mesh.position.y = -5;

  const shape = new CANNON.Plane();
  const rigidBody = new CANNON.Body({ mass: 0 });
  rigidBody.addShape(shape);
  rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5);
  world.addBody(rigidBody);

  rigidBody.position.x = mesh.position.x;
  rigidBody.position.y = mesh.position.y;
  rigidBody.position.z = mesh.position.z;

  const update = () => {
    mesh.position.x = rigidBody.position.x;
    mesh.position.y = rigidBody.position.y;
    mesh.position.z = rigidBody.position.z;
    mesh.quaternion.x = rigidBody.quaternion.x;
    mesh.quaternion.y = rigidBody.quaternion.y;
    mesh.quaternion.z = rigidBody.quaternion.z;
    mesh.quaternion.w = rigidBody.quaternion.w;
  }

  return { mesh, rigidBody, update };
}

const boxes = [
  createBox(0, 0, 0),
  createBox(0.5, 5, 0),
  createBox(-0.5, 10, 0.5),
];

const plane = createPlane();

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// clock
const clock = new THREE.Clock();
let delta = 0;

// render
renderer.setAnimationLoop(time => {
  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);
  controls.update();
  for (const box of boxes) {
    box.update();
  }
  plane.update();
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
