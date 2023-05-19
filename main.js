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
camera.position.setFromSphericalCoords(10, Math.PI * 0.25, Math.PI * 0.75);

const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();
const musicPlayer = new THREE.Audio(listener);
audioLoader.load('./assets/mitis-mercy.mp3', (buffer) => {
  musicPlayer.setBuffer(buffer);
  musicPlayer.setLoop(true);
  musicPlayer.play();
  musicPlayer.setVolume(0.5);
});
const audioAnalyser = new THREE.AudioAnalyser(musicPlayer, 512);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const geometry = new THREE.PlaneGeometry(8, 8, 128, 128);
geometry.rotateX(Math.PI * 0.5);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uFrequency: { value: [] },
    uMaxElevation: { value: 1 },
    uColorA: { value: new THREE.Color('#7f2a91') },
    uColorB: { value: new THREE.Color('#1af5f5') },
  },
  vertexShader: `
    uniform float[256] uFrequency;
    uniform float uMaxElevation;

    varying float vElevation;

    void main() {
      vec4 currentPosition = vec4(position, 1.0);
      float dist = abs(distance(vec2(0.5, 0.5), uv));
      float normalizedDistance = dist / 0.5;
      int index = int(64.0 * normalizedDistance);
      float frequency = uFrequency[index];
      float t = frequency / 255.0;
      float elevation = smoothstep(0.0, uMaxElevation, t);
      currentPosition.y += elevation;

      gl_Position = projectionMatrix * viewMatrix * modelMatrix * currentPosition;

      vElevation = elevation;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorA;
    uniform vec3 uColorB;

    varying float vElevation;

    void main() {
      vec3 color = mix(uColorA, uColorB, vElevation);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// render
renderer.setAnimationLoop(time => {
  material.uniforms.uFrequency.value = audioAnalyser.getFrequencyData();
  controls.update();
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
