import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

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
camera.position.z = 30;


// line
const createHeartPoints = (amount) => {
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
  const distribution = (amount * 0.5) - 1;
  const points = [
    ...curve1.getPoints(distribution),
    ...curve2.getPoints(distribution)
  ];
  console.log(points.length);
  return points;
}

// Create the final object to add to the scene
const count = 24;

const heartPoints = createHeartPoints(count);

const meta = []

// mesh
const geometry = new THREE.SphereBufferGeometry(1, 32, 16);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.InstancedMesh(geometry, material, count);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  const target = heartPoints[i];
  const origin = new THREE.Vector3();
  dummy.position.set(0, 0, 0);
  meta.push({target, origin});
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}

const group = new THREE.Group();
group.add(mesh);
scene.add(group);

group.position.y = -10;


// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const destination = new THREE.Vector3(0, 10, 0);

const position = new THREE.Vector3();

let animate = false;

setTimeout(() => {
  animate = true;
  setInterval(() => {
    group.position.set(0, -10, 0);
    for (let i = 0; i < count; i++) {
      mesh.getMatrixAt(i, dummy.matrix);
      dummy.position.copy(meta[i].origin);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, 3000);
}, 500)


// render

const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
const unrealBloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  0,
  0
);
const smaaPass = new SMAAPass();

composer.addPass(renderPass);
composer.addPass(unrealBloomPass);
composer.addPass(smaaPass);

renderer.setAnimationLoop(time => {
  controls.update();
  if (animate) {
    group.position.lerp(destination, 0.05);

    if (group.position.distanceTo(destination) < 1) {
      for (let i = 0; i < count; i++) {
        mesh.getMatrixAt(i, dummy.matrix);
        position.setFromMatrixPosition(dummy.matrix);
        position.lerp(meta[i].target, 0.01);
        dummy.position.copy(position);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.instanceMatrix.needsUpdate = true;
      }
    } 
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
