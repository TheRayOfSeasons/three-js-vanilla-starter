import './style.css';
import * as THREE from 'three';
import GSAP from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import MeshReflectorMaterial from './src/MeshReflectorMaterial';

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

// scene
const scene = new THREE.Scene();
scene.frustumCulled = false;

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  stencil: false,
  powerPreference: 'high-performance',
  canvas
});
renderer.setSize(canvasWidth, canvasHeight);
renderer.setClearColor(0x000000, 1.0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
scene.fog = new THREE.Fog(scene.background, 1, 100);


// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 5;
camera.layers.enableAll();

class Entity {
  start() {}
  resize(width, height) {}
  update(time) {}
}

class MainMesh extends Entity {
  constructor(layer) {
    super();
    this.layer = layer;
  }
  start() {
    const geometry = new THREE.TorusBufferGeometry(1, 0.25, 32, 128);
    const material = new THREE.MeshBasicMaterial({
      // emissive: '#ffffff',
      color: '#ffffff',
      // envMap: scene.background,
      // combine: THREE.MixOperation,
      reflectivity: 1
    });
    this.mesh = new THREE.Mesh(geometry, material);
    // this.mesh.layers.set(this.layer);
    scene.add(this.mesh);
  }
  update(time) {
    // this.mesh.rotation.y = time * 0.001;
  }
}

class CompositeMaterial extends THREE.RawShaderMaterial {
  constructor() {
      super({
          glslVersion: GLSL3,
          uniforms: {
              tScene: new Uniform(null),
              tBloom: new Uniform(null),
              uBloomDistortion: new Uniform(1.45)
          },
          vertexShader: `
              in vec3 position;
              in vec2 uv;

              out vec2 vUv;

              void main() {
                  vUv = uv;

                  gl_Position = vec4(position, 1.0);
              }
          `,
          fragmentShader: `
              precision highp float;

              uniform sampler2D tScene;
              uniform sampler2D tBloom;
              uniform float uBloomDistortion;

              in vec2 vUv;

              out vec4 FragColor;

              // rgbshift
              vec4 getRGB(sampler2D image, vec2 uv, float angle, float amount) {
                  vec2 offset = vec2(cos(angle), sin(angle)) * amount;
                  vec4 r = texture(image, uv + offset);
                  vec4 g = texture(image, uv);
                  vec4 b = texture(image, uv - offset);
                  return vec4(r.r, g.g, b.b, g.a);
              }

              void main() {
                  FragColor = texture(tScene, vUv);

                  float angle = length(vUv - 0.5);
                  float amount = 0.001 * uBloomDistortion;

                  FragColor.rgb += getRGB(tBloom, vUv, angle, amount).rgb;
              }
          `,
          blending: THREE.NoBlending,
          depthWrite: false,
          depthTest: false
      });
  }
}

const textureLoader = new THREE.TextureLoader();

const roughMap = textureLoader.load('/damaged_road.jpeg');

class Ground extends Entity {
  start() {
    const geometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
    this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
    this.mesh.material = new MeshReflectorMaterial(renderer, camera, scene, this.mesh, {
      mixBlur: 1,
      mixStrength: 40,
      resolution: 2048,
      blur: [300, 100],
      minDepthThreshold: 0.4,
      maxDepthThreshold: 1.4,
      color: '#101010',
      depthScale: 1.2,
      metalness: 0.1,
      distortionMap: roughMap
    });
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.position.y = -1.5;
    this.mesh.layers.set(LAYERS.DEFAULT);
    scene.add(this.mesh);
  }
  update(time) {
    this.mesh.material.update();
  }
}

class Lights extends Entity {
  start() {
    const directionalLight = new THREE.DirectionalLight('#ffffff');
    directionalLight.intensity = 0.1;
    directionalLight.position.set(1, 0, 0);
    directionalLight.layers.set(LAYERS.DEFAULT);
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight('#606060', '#404040');
    hemisphereLight.layers.set(LAYERS.DEFAULT);
    scene.add(hemisphereLight);
  }
}



const mainMesh = new MainMesh(LAYERS.DEFAULT);
const mainMeshClone = new MainMesh(LAYERS.DEFAULT);
const mainMesh2 = new MainMesh(LAYERS.DEFAULT);
const ground = new Ground();
const lights = new Lights();


const entities = [
  mainMesh,
  mainMeshClone,
  mainMesh2,
  ground,
  lights
];

for (const entity of entities) {
  entity.start();
}

mainMesh2.mesh.position.x = 5;

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
effectComposer.addPass(bokehPass);
effectComposer.addPass(finalPass);

// render
renderer.setAnimationLoop(time => {
  controls.update();
  for (const entity of entities) {
    entity.update(time);
  }
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
  for (const entity of entities) {
    entity.resize(canvasWidth, canvasHeight);
  }
});
