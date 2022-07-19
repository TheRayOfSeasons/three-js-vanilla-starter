import './style.css';
import * as THREE from 'three';
import GSAP from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GridMaterial, MorphedGridMaterial } from './src/materials';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';


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
camera.position.z = 25;

class MorphedSphere {
  constructor() {
    const geometry = new THREE.IcosahedronBufferGeometry(10, 32);
    const material = GridMaterial;
    this.mouse = new THREE.Vector2();

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);

    // window.addEventListener('mousemove', event => {
    //   this.mouse.x = (event.clientX / window.innerWidth).toFixed(2) * 4
    //   this.mouse.y = (event.clientY / window.innerHeight).toFixed(2) * 2;

    //   GSAP.to(this.mesh.material.uniforms.uFrequency, { value: this.mouse.x });
    //   GSAP.to(this.mesh.material.uniforms.uAmplitude, { value: this.mouse.x });
    //   GSAP.to(this.mesh.material.uniforms.uDensity, { value: this.mouse.y });
    //   GSAP.to(this.mesh.material.uniforms.uStrength, { value: this.mouse.y });
    // });
  }
}
class Cube {
  constructor() {
    const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
    const material = GridMaterial;
    this.mouse = new THREE.Vector2();

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.x = 20;
    scene.add(this.mesh);
  }
}

class Ground {
  constructor() {
    const geometry = new THREE.PlaneBufferGeometry(1000, 1000, 1, 1);
    const material = GridMaterial;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = -15;
    this.mesh.rotation.x = -Math.PI * 0.5;
    scene.add(this.mesh);
  }
}

new MorphedSphere();
new Ground();
new Cube();

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


// postprocessing
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0, 0
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
effectComposer.addPass(bloomPass);
// effectComposer.addPass(bokehPass);
// effectComposer.addPass(finalPass);

// render
renderer.setAnimationLoop(time => {
  controls.update();
  // renderer.render(scene, camera);
  try {
    renderer.clear();
    bloomComposer.render();
    effectComposer.render();
  }
  catch (error) {
    renderer.render(scene, camera);
  }
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
