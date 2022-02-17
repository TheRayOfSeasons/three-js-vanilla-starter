import './style.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const canvas = document.getElementById('app');

let canvasHeight = canvas.parentElement.clientHeight;
let canvasWidth = canvas.parentElement.clientWidth;

// layers
const LAYERS = {
  DEFAULT: 0,
  BLOOM: 1
}

const bloomLayer = new THREE.Layers();
bloomLayer.set(LAYERS.BLOOM);

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas
});
renderer.setSize(canvasWidth, canvasHeight);
renderer.setClearColor(0x000000, 1.0);
renderer.autoClear = true;

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 5;
camera.layers.enableAll();

// lights
const hemisphereLight = new THREE.HemisphereLight('#e7e7e7', '#111111');
hemisphereLight.layers.set(LAYERS.DEFAULT);
// scene.add(hemisphereLight);

const ambientLight = new THREE.AmbientLight('#222222');
ambientLight.layers.set(LAYERS.DEFAULT);
scene.add(ambientLight);

// meshes
const geometry = new THREE.SphereBufferGeometry(1, 32, 16);
const material = new THREE.MeshStandardMaterial({
  color: '#fafafa'
});
const yellowMaterial = new THREE.MeshBasicMaterial({
  color: '#FFD700'
});

const sphere1 = new THREE.Mesh(geometry, yellowMaterial);
scene.add(sphere1);
sphere1.layers.set(LAYERS.BLOOM);

const sphere2 = new THREE.Mesh(geometry, material);
sphere2.position.set(3, 0, 0);
scene.add(sphere2);
sphere2.layers.set(LAYERS.DEFAULT);

// lights
const pointLight = new THREE.PointLight('#FFD700');
pointLight.intensity = 0.2;
pointLight.layers.set(LAYERS.DEFAULT);
pointLight.position.x = 0;
sphere1.add(pointLight);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// postprocessing
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0, 0
);

const renderPass = new RenderPass(scene, camera);

const smaaPass = new SMAAPass(
  window.innerWidth * renderer.getPixelRatio(),
  window.innerHeight * renderer.getPixelRatio()
);
smaaPass.renderToScreen = true;

const bokehPass = new BokehPass(scene, camera, {
  focus: 10,
  aperture: 10.0 * 0.00001,
  maxblur: 0.01,
  width: window.innerWidth,
  height: window.innerHeight
});

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderPass);
bloomComposer.addPass(bloomPass);

const finalPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: `
      varying vec2 vUv;

      void main()
      {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      uniform sampler2D baseTexture;
      uniform sampler2D bloomTexture;

      varying vec2 vUv;

      void main()
      {
        gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
      }
    `,
    defines: {}
  }), "baseTexture"
);
finalPass.needsSwap = true;

const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
effectComposer.addPass(smaaPass);
effectComposer.addPass(bokehPass);
effectComposer.addPass(finalPass);

// render
const render = () => {
  try {
    renderer.clear();
    bloomComposer.render();
    effectComposer.render();
  }
  catch (error) {
    renderer.render(scene, camera);
  }
}

renderer.setAnimationLoop(time => {
  controls.update();
  render();
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
