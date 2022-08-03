import './style.css';
import GSAP from 'gsap';
import * as THREE from 'three';

const canvas = document.getElementById('app');

let hoverLevel = {
  value: 0
};

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
    uHoverLevel: { value: hoverLevel.value },
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
    uniform float uHoverLevel;
    uniform float uSpeed;
    uniform float uTime;
    uniform sampler2D uImage;
    uniform vec2 uResolution;

    float lerp(float x, float y, float t)
    {
      return (1.0 - t) * x + t * y;
    }

    // Reference: https://www.shadertoy.com/view/WtjBRc
    vec2 ripple(vec2 uv)
    {
      vec2 cp = -1.0 + 2.0 * uv;
      float cl = length(cp);
      float wave = cos(cl * uFrequency - uHoverLevel * uSpeed);
      vec2 result = uv + (cp / cl) * wave * uDistortion;
      return result;
    }

    // Reference: https://www.shadertoy.com/view/XtjyWW
    vec2 zoom(vec2 uv)
    {
      float zoom = lerp(1.0, 0.75, uHoverLevel);
      vec2 scaleCenter = vec2(0.5);
      vec2 result = (uv - scaleCenter) * zoom + scaleCenter;
      return result;
    }

    float exponentialInOut(float t)
    {
      return t == 0.0 || t == 1.0
        ? t
        : t < 0.5
          ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
          : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
    }

    void main()
    {
      vec2 uv = gl_FragCoord.xy / uResolution;

      uv = zoom(uv);
      uv = ripple(uv);

      float progress = uHoverLevel * 0.75;
      float hoverLevel = exponentialInOut(min(1., (distance(vec2(.5), uv) * progress) + progress));
      vec4 color = texture2D(uImage, uv);
      if (hoverLevel > 0.) {
        hoverLevel = 1.-abs(hoverLevel-.5)*2.;
        // pixel displace
        uv.y += color.r * hoverLevel * .05;
        color = texture2D(uImage, uv);
        // RGBshift
        color.r = texture2D(uImage, uv+(hoverLevel)*0.01).r;
        color.g = texture2D(uImage, uv-(hoverLevel)*0.01).g;
      }

      gl_FragColor = color;
    }
  `,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const hoverLevelDisplay = document.getElementById('hover-level');
canvas.addEventListener('mouseover', event => {
  GSAP.to(hoverLevel, { value: 1, duration: 1.5 });
});
canvas.addEventListener('mouseleave', event => {
  GSAP.to(hoverLevel, { value: 0, duration: 1.5 });
});

renderer.setAnimationLoop(time => {
  material.uniforms.uTime.value = time * 0.001;
  hoverLevelDisplay.innerHTML = hoverLevel.value;
  material.uniforms.uHoverLevel.value = hoverLevel.value;
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
