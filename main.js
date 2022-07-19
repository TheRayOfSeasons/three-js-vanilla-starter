import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

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


class Cube {
  constructor() {
    this.parentCube = new THREE.Object3D();

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipMapLinearFilter
    });
    this.cubeCamera = new THREE.CubeCamera(0.1, 100000, cubeRenderTarget);
    this.parentCube.add(this.cubeCamera);

    // mesh
    const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 10);

    const material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      envMap: cubeRenderTarget.texture,
      roughness: 0,
      metalness: 1
    });

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uGlowColor = { value: new THREE.Color('#0000ff') };
      shader.vertexShader = `
        varying vec2 vUv;

        ${shader.vertexShader.replace('}', `
          vUv = uv;
        }`)}
      `;
      shader.fragmentShader = shader.fragmentShader.replace('}', `
        vec3 stepBorder = StepBorder(vUv, 0.1);
        float t = (stepBorder.x * stepBorder.y * stepBorder.z) / 3.0;
        vec3 color = mix(uGlowColor, gl_FragColor.rgb, stepBorder);
        gl_FragColor = vec4(color, gl_FragColor.a);
      }`)
      shader.fragmentShader = `
        uniform vec3 uGlowColor;

        varying vec2 vUv;

        ${shader.fragmentShader
          .replace('void main() {', `
            //creates a sharp border using step()
            vec3 StepBorder(in vec2 _uv, in float _width)
            {
              vec2 bl = step(vec2(_width),_uv); // bottom-left
              vec2 tr = step(vec2(_width),1.0-_uv);   // top-right
                //botom left && top right
                vec3 pct = vec3(bl.x * bl.y * tr.x * tr.y);
                return pct;
            }

            //creates a soft border using smoothstep()
            vec3 SmoothBorder(in vec2 _uv, in float _start, in float _end)
            {
              vec2 bl = smoothstep(vec2(_start), vec2(_end), _uv);// bottom-left
              vec2 tr = smoothstep(vec2(_start),vec2(_end),1.0-_uv);// top-right
                //botom left && top right
              vec3 pct = vec3(bl.x * bl.y * tr.x * tr.y);
                return pct;
            }

            void main() {
          `)
        }
      `;
    }
    this.mesh = new THREE.Mesh(geometry, material);
    this.parentCube.add(this.mesh);
    scene.add(this.parentCube);
  }
  update(time) {
    this.cubeCamera.update(renderer, scene);
  }
}

const entities = [
  (() => {
    const cube = new Cube();
    return cube;
  })(),
  (() => {
    const cube = new Cube();
    cube.parentCube.position.set(-1, -1, 0);
    return cube;
  })(),
];

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


// postprocessing
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0, 0
);

const renderPass = new RenderPass(scene, camera);

const smaaPass = new SMAAPass(
  window.innerWidth * renderer.getPixelRatio(),
  window.innerHeight * renderer.getPixelRatio()
);
smaaPass.renderToScreen = true;

const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
effectComposer.addPass(smaaPass);
effectComposer.addPass(bloomPass);


const sphereParent = new THREE.Object3D;
const sphereGeom = new THREE.SphereBufferGeometry(0.1, 64, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({
  color: '#ffffff',
  emissive: '#ffffff'
});
const sphere = new THREE.Mesh(sphereGeom, sphereMaterial);
sphereParent.add(sphere);
sphere.position.x = 2;
scene.add(sphereParent);

// render
renderer.setAnimationLoop(time => {
  controls.update();
  for (const entity of entities) {
    entity.update(time);
  }
  sphereParent.rotation.y = time * 0.001;
  try {
    renderer.clear();
    effectComposer.render();
  } catch(error) {
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
