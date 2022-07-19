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
camera.position.set(
   -1.550989197206717,
   3.962605827080429,
   -1.8985681396337881
);
camera.rotation.set(
  -2.0176017523042376,
  -0.33932963677445815,
  -2.5344191031539363,
);
class Cubes {
  parameters = {
    count: {
      length: 22,
      width: 17
    },
    gap: 0,
    offset: -2
  }

  constructor() {
    // mesh
    const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 0.1);

    const material = new THREE.MeshBasicMaterial();

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uBaseColor = { value: new THREE.Color('#000000') };
      shader.uniforms.uBorderThickness = { value: 0.01 };
      shader.vertexShader = `
        varying vec2 vUv;

        ${shader.vertexShader.replace('}', `
          vUv = uv;
        }`)}
      `;
      shader.fragmentShader = shader.fragmentShader.replace('}', `
        vec3 stepBorder = StepBorder(vUv, uBorderThickness);
        float t = (stepBorder.x * stepBorder.y * stepBorder.z) / 3.0;
        vec3 color = mix(gl_FragColor.rgb, uBaseColor, stepBorder);
        gl_FragColor = vec4(color, gl_FragColor.a);
      }`)
      shader.fragmentShader = `
        uniform float uBorderThickness;
        uniform vec3 uBaseColor;

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

    const count = this.count;

    this.mesh = new THREE.InstancedMesh(geometry, material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.dummy = new THREE.Object3D();
    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.rotation = new THREE.Euler();
    this.destination = new THREE.Vector3();
    this.delays = [];
    this.originalPositions = [];
    let i = 0;

    const length = this.parameters.count.length;
    const width = this.parameters.count.width;
    const gap = this.parameters.gap;
    for (let x = 0; x < length; x++) {
      for (let y = 0; y < width; y++) {
        const originalPosition = new THREE.Vector3(
          x - ((length + (length * gap)) / 2),
          0,
          y - ((width + (width * gap)) / 2),
        );
        this.dummy.position.copy(originalPosition);
        this.originalPositions.push(originalPosition);
        this.dummy.updateMatrix();
        const index = i++;
        this.mesh.setMatrixAt(index, this.dummy.matrix);
        this.mesh.setColorAt(index, new THREE.Color('#0000ff'));
        this.delays.push(Math.random() * 2);
      }
    }
    scene.add(this.mesh);
  }

  get count() {
    return this.parameters.count.length * this.parameters.count.width;
  }

  update(time) {
    const count = this.count;
    const width = this.parameters.count.width;
    const gap = this.parameters.gap;
    for (let i = 0; i < count; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.position.setFromMatrixPosition(this.dummy.matrix);
      this.rotation.setFromRotationMatrix(this.dummy.matrix);
      const threshold = ((width + (width * gap)) / 2);
      if (this.position.z >= threshold) {
        this.position.y = 0;
        this.position.z = -threshold;
        this.rotation.set(0, 0, 0);
        // this.dummy.matrix.makeRotationFromEuler(this.rotation);
      }
      else {
        const distance = threshold - this.position.z;
        this.position.z = THREE.MathUtils.lerp(this.position.z, threshold, Math.atan2(0.02, distance));
      }
      if (this.position.z >= this.parameters.offset + (this.delays[i] - 0.5)) {
        // this.rotation.set(
        //   this.rotation.x,
        //   THREE.MathUtils.lerp(this.rotation.y, Math.PI * 0.5, 0.05),
        //   this.rotation.z,
        // );
        this.dummy.matrix.makeRotationFromEuler(this.rotation);
        this.position.y = THREE.MathUtils.lerp(this.position.y, 2.0, 0.01);
        this.quaternion.setFromEuler(this.rotation);
      }
      this.dummy.matrix.setPosition(this.position);
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.instanceMatrix.needsUpdate = true;
    }
  }
}

const entities = [
  (() => {
    const cube = new Cubes();
    return cube;
  })(),
];

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true;


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

document.addEventListener('click', event => {
  console.log(camera.position);
  console.log(camera.rotation);
});

// render
renderer.setAnimationLoop(time => {
  controls.update();
  for (const entity of entities) {
    entity.update(time);
  }
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
