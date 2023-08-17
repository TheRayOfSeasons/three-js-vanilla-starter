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
camera.position.z = 15;

const controls = new OrbitControls(camera, canvas);

// mesh
const geometry = new THREE.SphereGeometry(
  8,
  500,
  500,
);
const vertexCount = geometry.attributes.position.array.length;
const lightFactor = new Float32Array(vertexCount);
const vertexIDs = new Float32Array(vertexCount);
for (let i = 0; i < vertexCount; i++) {
  lightFactor[i] = Math.random();
  vertexIDs[i] = i % 2 === 0 ? 0 : 1;
}
geometry.setAttribute('lightFactor', new THREE.BufferAttribute(lightFactor, 1));
geometry.setAttribute('vertexID', new THREE.BufferAttribute(vertexIDs, 1));

const textureLoader = new THREE.TextureLoader();
const material = new THREE.ShaderMaterial({
  vertexColors: true,
  uniforms: {
    uAlphaMap: {
      value: textureLoader.load('/public/earth-spec.jpeg',),
    },
    uColorMap: {
      value: textureLoader.load('/public/earth-spec-color-map.png'),
    },
    uShape: {
      value: textureLoader.load('/public/circle.png'),
    },
    uTime: {
      value: 0.0,
    },
    uMinColor: {
      value: new THREE.Color('#284364'),
    },
    uMaxColor: {
      value: new THREE.Color('#2c0ea8'),
    },
    uCountryColor: {
      value: new THREE.Color('#9c68c9'),
    },
    uSize: {
      value: 0.1,
    },
    uContinentBrightness: {
      value: 4.0,
    },
    uScale: {
      value: canvas.height / 4,
    },
  },
  vertexShader: `
    attribute float lightFactor;
    attribute float vertexID;

    uniform float uScale;
    uniform float uSize;

    varying vec2 vUv;
    varying float vVertexID;
    varying float vLightFactor;

    void main() {
      vUv = uv;
      vVertexID = float(vertexID);
      vLightFactor = lightFactor;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = uSize * (uScale / length(mvPosition.xyz)) * (0.3 + sin(uv.y * 3.1415926) * 0.6);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uAlphaMap;
    uniform sampler2D uColorMap;
    uniform float uTime;
    uniform float uContinentBrightness;
    uniform sampler2D uShape;
    uniform vec3 uMinColor;
    uniform vec3 uMaxColor;
    uniform vec3 uCountryColor;

    varying vec2 vUv;
    varying float vVertexID;
    varying float vLightFactor;

    void main() {
      vec2 uv = vUv;
      vec4 v = texture2D(uAlphaMap, uv);
      vec4 c = texture2D(uColorMap, uv);

      // carve out continents based on alpha map
      if (length(v.rgb) > 1.0) discard;

      // this is responsible for the uneven pattern
      if (vVertexID == 0.0) discard;

      float mixStrength = clamp(abs(1.15 * sin(uTime * vLightFactor)), 0.1, 0.9);

      vec3 highlightColor;
      if (length(c.rgb) > 1.0)
      {
        highlightColor = uCountryColor;
      }
      else
      {
        highlightColor = mix(uMinColor, uMaxColor, mixStrength);
      }
      gl_FragColor = vec4(highlightColor, 1.0);
      vec4 shapeData = texture2D(uShape, gl_PointCoord);
      if (shapeData.a < 0.0625) discard;
      gl_FragColor = gl_FragColor * uContinentBrightness * shapeData.a;
    }
  `,
  transparent: false,
  alphaTest: true,
});

const mesh = new THREE.Points(geometry, material);
scene.add(mesh);

// render
renderer.setAnimationLoop(time => {
  mesh.rotation.y = time * 0.0001;
  controls.update();
  material.uniforms.uTime.value = time * 0.005;
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
  material.uniforms.uScale.value = canvas.height / 4;
});
