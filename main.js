import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { utils } from './src/shaders';

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
camera.position.z = 20;


function floorPowerOfTwo( value ) {

	return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

}

// material
const material = new THREE.MeshPhysicalMaterial({
  transmission: 1,
  thickness: 4.5,
  roughness: 0.07,
});
let mainShader;
material.onBeforeCompile = shader => {
  shader.uniforms.uFrequency = { value: 2.4 };
  shader.uniforms.uAmplitude = { value: 0.4 };
  shader.uniforms.uDensity = { value: 0.8 };
  shader.uniforms.uStrength = { value: 1.8 };
  shader.uniforms.uDeepPurple = { value: 1 };
  shader.uniforms.uOpacity = { value: 0.1 };
  shader.uniforms.uTime = { value: 0 };
  shader.uniforms.uFresnelIntensity = { value: 2 };
  shader.uniforms.uDepthColor = { value: new THREE.Color('#0458FF') };
  shader.uniforms.uSurfaceColor = { value: new THREE.Color('#F20089') };
  shader.vertexShader = shader.vertexShader.replace('}', `
    float distortion = (pnoise(normal * uDensity + uTime, vec3(10.)) * uStrength);

    vec3 pos = position + (normal * distortion);
    float angle = sin((uv.y * uFrequency) + uTime) * uAmplitude;
    // pos = rotateY(pos, angle);

    vPositionW = vec3(vec4(position, 1.0) * modelMatrix);
    vNormalW = normalize(vec3(vec4(normal, 0.0) * modelMatrix));
    vUv = uv;
    vDistortion = distortion;

    vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);
    vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }`);
  shader.vertexShader = shader.vertexShader.replace('void main() {', `
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;
    uniform float uTime;

    varying float vDistortion;
    varying vec2 vUv;

    // fresnel
    varying vec3 vPositionW;
    varying vec3 vNormalW;

    ${utils}

    void main() {
  `);
  shader.fragmentShader = shader.fragmentShader.replace('}', `
    float distort = vDistortion * 3.;

    vec3 brightness = vec3(.1, .1, .9);
    vec3 contrast = vec3(.3, .3, .3);
    vec3 oscilation = vec3(.5, .5, .9);
    vec3 phase = vec3(.9, .1, .8);

    vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);

    float fresnelValue = fresnel();

    vec3 finalColor = mix(uDepthColor, uSurfaceColor, vDistortion);
    finalColor *= fresnelValue;
    float opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
    vec4 compiledColor = vec4(finalColor, opacity);
    compiledColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));

    float t = (compiledColor.r + compiledColor.g + compiledColor.b) / 3.0;
    gl_FragColor = mix(gl_FragColor, compiledColor, t);
  }`);
  shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
    uniform float uOpacity;
    uniform float uDeepPurple;
    uniform float uFresnelIntensity;
    uniform sampler2D uEnvMap;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
  
    varying float vDistortion;
    varying vec2 vUv;
  
    varying vec3 vPositionW;
    varying vec3 vNormalW;
  
    vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
      return a + b * cos(6.28318 * (c * t + d));
    }
  
    float fresnel() {
      vec3 viewDirectionW = normalize(cameraPosition - vPositionW) * 1.0;
      float fresnelTerm = dot(viewDirectionW, vNormalW) * uFresnelIntensity;
      fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
      return fresnelTerm;
    }
  
    void main() {
  `);
  mainShader = shader;
};

// mesh
const geometry = new THREE.IcosahedronBufferGeometry(10, 64);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

(() => {
  const geometry = new THREE.SphereBufferGeometry(10, 32, 16);
  const material = new THREE.MeshNormalMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.position.set(0, 0, -25);
})()

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  if (mainShader) {
    mainShader.uniforms.uTime.value = time * 0.0002;
  }
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
