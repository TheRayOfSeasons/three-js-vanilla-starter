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

// geometry
const geometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);
geometry.rotateX(Math.PI * 0.5);

// shaders
const material = new THREE.RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    attribute vec3 position;

    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;

    uniform float uTime;

    varying float vNewPosition;

    void main()
    {
      vec4 newPosition = vec4(position, 1.0);
      newPosition.y = sin((-uTime * 0.001) + newPosition.x);
      vNewPosition = newPosition.y;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * newPosition;
    }
  `,
  fragmentShader: `
    precision mediump float;

    varying float vNewPosition;

    void main()
    {
      gl_FragColor = vec4(0.8, vNewPosition, 0.0, 1.0);
    }
  `,
  side: THREE.DoubleSide
});

// mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// sounds
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.PositionalAudio(listener);
sound.position.set(0, 0, 0);

const audioLoader = new THREE.AudioLoader();

audioLoader.load('sound.mp3', (buffer) => {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.25);
  sound.setRefDistance(5);
  sound.play();
});

mesh.add(sound);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  material.uniforms.uTime.value = time;
  material.needsUpdate = true;
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
