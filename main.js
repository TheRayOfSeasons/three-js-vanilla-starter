import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

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
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
// const material = new THREE.MeshNormalMaterial();
const material = new THREE.ShaderMaterial({
  uniforms: {
    uBaseColor: { value: new THREE.Color('#000000') },
    uLineColor: { value: new THREE.Color('#0000ff') },
  },
  vertexShader: `
    varying vec2 vUv;

    void main()
    {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uLineColor;

    varying vec2 vUv;

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

    void main()
    {
      vec3 stepBorder = StepBorder(vUv, 0.1);
      float t = (stepBorder.x * stepBorder.y * stepBorder.z) / 3.0;
      vec3 color = mix(uLineColor, uBaseColor, stepBorder);
      gl_FragColor = vec4(color, 1.0);
    }
  `
})
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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

// render
renderer.setAnimationLoop(time => {
  controls.update();
  mesh.rotation.y = time * 0.001;

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
