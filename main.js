import './style.css';
import * as THREE from 'three';
import GSAP from 'gsap';
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
renderer.setClearColor(0x212121, 1.0);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 3;


class Entity {
  start() {}
  update(time) {}
}

const textureLoader = new THREE.TextureLoader();

class Shape1 extends Entity {
  async start() {
    const geometry = new THREE.TorusBufferGeometry(1, 0.25, 32, 128);
    const texture = textureLoader.load('/spectrumone.png', (texture) => {
      texture.minFilter = THREE.NearestFilter
    });
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uSpeed: { value: 0.001 },
      },
      vertexShader: `
        uniform float uTime;

        varying vec2 vUv;

        void main()
        {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform sampler2D uTexture;

        varying vec2 vUv;

        void main()
        {
          float time = uTime * uSpeed;
          vec2 uv = vUv;
          vec2 repeat = vec2(6.0, 10.0);
          uv = fract(uv * repeat + vec2(0.0, time));
          vec4 color = texture2D(uTexture, uv);
          // vec3 emptyColor = vec3(0.);
          // vec3 mixedColor = mix(emptyColor, vec3(color.xyz), color.w);
          // gl_FragColor = vec4(mixedColor, 1.0);
          gl_FragColor = color;
        }
      `,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }
  update(time) {
    if (this.mesh) {
      this.mesh.material.uniforms.uTime.value = time;
      this.mesh.rotation.z = time * 0.00025;
    }
  }
}

const entities = [
  new Shape1(),
];
for (const entity of entities) {
  entity.start();
}

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  for (const entity of entities) {
    entity.update(time);
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
