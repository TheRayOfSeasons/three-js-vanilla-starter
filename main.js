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
camera.position.z = 3;

// mesh
const geometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);
geometry.rotateX(Math.PI * 0.5);
// const material = new THREE.RawShaderMaterial({
//   vertexShader: `
//     attribute vec3 position;

//     uniform mat4 projectionMatrix;
//     uniform mat4 viewMatrix;
//     uniform mat4 modelMatrix;

//     void main()
//     {
//       gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
//     }
//   `,
//   fragmentShader: `
//     precision mediump float;

//     void main()
//     {
//       gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//     }
//   `
// });
const material = new THREE.RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  vertexShader: `
    attribute vec3 position;

    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;

    uniform float uTime;

    varying vec4 vNewPosition;

    void main()
    {
      vec4 newPosition = vec4(position, 1.0);
      newPosition.y = sin((uTime * 0.001) + newPosition.x);
      vNewPosition = newPosition;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * newPosition;
    }
  `,
  fragmentShader: `
    precision mediump float;

    varying vec4 vNewPosition;

    float invert(float value)
    {
      return 1.0 - value;
    }

    void main()
    {
      gl_FragColor = vec4(0.2, vNewPosition.y, 5.0, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  material.uniforms.uTime.value = time;
  material.needsUpdate = true;
  // mesh.rotation.y = time * 0.001;
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
