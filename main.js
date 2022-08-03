import './style.css';
import * as THREE from 'three';

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
renderer.setPixelRatio( window.devicePixelRatio );

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 1;

const textureLoader = new THREE.TextureLoader();

const imageElement = document.getElementById('beach-img');
const imageUrl = imageElement.getAttribute('src');
const image = textureLoader.load(imageUrl);

const geometry = new THREE.PlaneBufferGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uDistortion: { value: 0.02 },
    uFrequency: { value: 12.0 },
    uSpeed: { value: 4.0 },
    uTime: { value: 0 },
    uImage: { value: image },
    uResolution: { value: new THREE.Vector2(
      renderer.domElement.width,
      renderer.domElement.height
    ) },
  },
  vertexShader: `
    void main()
    {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uDistortion;
    uniform float uFrequency;
    uniform float uSpeed;
    uniform float uTime;
    uniform sampler2D uImage;
    uniform vec2 uResolution;

    // Reference: https://www.shadertoy.com/view/WtjBRc
    vec2 ripple(vec2 uv)
    {
      vec2 cp = -1.0 + 2.0 * uv;
      float cl = length(cp);
      vec2 result = uv + (cp / cl) * cos(cl * uFrequency - uTime * uSpeed) * uDistortion;
      return result;
    }

    void main()
    {
      vec2 uv = gl_FragCoord.xy / uResolution;

      uv = ripple(uv);

      vec3 color = texture2D(uImage, uv).rgb;
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

renderer.setAnimationLoop(time => {
  material.uniforms.uTime.value = time * 0.001;
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
  material.uniforms.uResolution.value = new THREE.Vector2(
    renderer.domElement.width,
    renderer.domElement.height
  );
});
