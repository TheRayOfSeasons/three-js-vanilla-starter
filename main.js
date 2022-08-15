import './style.css';
import * as THREE from 'three';
import { fragmentShader, vertexShader } from './src/shaders';

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

// mesh
const geometry = new THREE.IcosahedronBufferGeometry(10, 64);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uFrequency: { value: 2.4 },
    uAmplitude: { value: 0.4 },
    uDensity: { value: 0.8 },
    uStrength: { value: 1.8 },
    uDeepPurple: { value: 1 },
    uOpacity: { value: 0.1 },
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#0458FF') },
    uSurfaceColor: { value: new THREE.Color('#F20089') },
  },
  vertexShader,
  fragmentShader,
  transparent: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// render
renderer.setAnimationLoop(time => {
  material.uniforms.uTime.value = time * 0.0002;
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
