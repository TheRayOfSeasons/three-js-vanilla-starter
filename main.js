import './style.css';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { snoise, utils } from './src/shaders';


const canvas = document.getElementById('app');

let canvasHeight = canvas.parentElement.clientHeight;
let canvasWidth = canvas.parentElement.clientWidth;

// renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas
});
renderer.setSize(canvasWidth, canvasHeight);
// renderer.setClearColor(0x000000, 0.0);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 20;

// other scene
const otherScene = new THREE.Scene();
const otherCamera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
otherCamera.position.z = 1;
const renderTarget = new THREE.WebGLRenderTarget(canvasWidth, canvasHeight);
renderTarget.texture.mapping = THREE.EquirectangularRefractionMapping;
renderTarget.texture.encoding = THREE.sRGBEncoding;
const otherGeometry = new THREE.PlaneBufferGeometry(10, 10);
const otherMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uMix: { value: 0 },
    uSpeed: { value: 0.15 },
    uTime: { value: 0 },
    uZoom: { value: 2 },
    uLowColor: { value: new THREE.Color('#F20089') },
    uHighColor: { value: new THREE.Color('#0458FF') },
    uMousePosition: { value: new THREE.Vector2() },
    uResolution: { value: new THREE.Vector2(
      renderer.domElement.width,
      renderer.domElement.height
    ) },
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
    uniform float uMix;
    uniform float uSpeed;
    uniform float uTime;
    uniform float uZoom;
    uniform vec2 uMousePosition;
    uniform vec2 uResolution;
    uniform vec3 uLowColor;
    uniform vec3 uHighColor;

    varying vec2 vUv;

    ${snoise}

    void useSnoise(vec2 uv, float time)
    {
      float t = time;
      float s1 = snoise(uv + t/2.0 + snoise(uv + snoise(uv + t/4.0) / 10.0));
      float s2 = snoise(uv + s1);
      vec3 color = mix(uLowColor, uHighColor, s1);

      vec3 color1 = vec3(
        clamp(color.r, 0.0, 1.0),
        s2,
        clamp(color.b, 0.75, 1.0)
      );
      vec3 color2 = vec3(
        s2,
        clamp(color.g, 0.0, 1.0),
        clamp(color.b, 0.75, 1.0)
      );
      vec3 finalColor = mix(color2, color1, uMix);

      gl_FragColor = vec4(finalColor, 1.0);
    }

    void main()
    {
      vec2 uv = gl_FragCoord.xy / uResolution;
      uv *= uZoom;
      float time = uTime * 0.0005;

      uv += vec2(
        clamp(uMousePosition.x, -0.5, 0.5),
        clamp(uMousePosition.y, -0.5, 0.5)
      );
      // useFractalNoise(uv, time);
      useSnoise(uv, time);
    }
  `
});
const otherMesh = new THREE.Mesh(otherGeometry, otherMaterial);
otherScene.add(otherMesh);

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
scene.environment = renderTarget.texture;

// mesh
const geometry = new THREE.IcosahedronBufferGeometry(10, 64);
const options = {
  enableSwoopingCamera: false,
  enableRotation: true,
  transmission: 0.75,
  thickness: 1.5,
  roughness: 0.07,
  envMapIntensity: 1.5
};
const hdrEquirect = new RGBELoader().load(
  "empty_warehouse_01_2k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  }
);
const material = new THREE.MeshPhysicalMaterial({
  transmission: options.transmission,
  thickness: options.thickness,
  roughness: options.roughness,
  // envMap: hdrEquirect,
  envMap: renderTarget.texture,
  // transparent: true
});
material.onBeforeCompile = shader => {
  shader.uniforms.uFrequency = { value: 2.4 };
  shader.uniforms.uAmplitude = { value: 0.5 };
  shader.uniforms.uDensity = { value: 0.8 };
  shader.uniforms.uStrength = { value: 1.8 };
  shader.uniforms.uDeepPurple = { value: 1 };
  shader.uniforms.uOpacity = { value: 0.1 };
  shader.uniforms.uTime = { value: 0 };
  shader.uniforms.uDepthColor = { value: new THREE.Color('#0458FF') };
  shader.uniforms.uSurfaceColor = { value: new THREE.Color('#F20089') };
  shader.vertexShader = shader.vertexShader.replace('}', `
    float distortion = (pnoise(normal * uDensity + uTime, vec3(10.)) * uStrength);
    vec3 pos = position + (normal * distortion);
    float angle = sin((uv.y * uFrequency) + uTime) * uAmplitude;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }`);
  shader.vertexShader = shader.vertexShader.replace('void main() {', `
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;
    uniform float uTime;

    ${utils}

    void main() {
  `);
}
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// const directionalLight = new THREE.DirectionalLight('#ffffff');
// scene.add(directionalLight);

const otherM = new THREE.Mesh(
  geometry,
  new THREE.MeshNormalMaterial()
);
scene.add(otherM);
otherM.position.set(10, 0, -10);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  mesh.rotation.y = time * 0.001;
  otherMaterial.uniforms.uTime.value = time;

  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(otherScene, otherCamera, renderTarget);

  material.envMap = renderTarget.texture;

  // renderer.setRenderTarget(null);
  // renderer.clear();
  renderer.setRenderTarget(null);
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
  renderTarget.setSize(
    canvasWidth,
    canvasHeight
  );
});
