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

    vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {
      float d = length(pos - uv) - rad;
      float t = clamp(d, 0.0, 1.0);
      return vec4(color, 1.0 - t);
    }

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
      vec3 finalColor = mix(color1, color2, uMix);

      gl_FragColor = vec4(finalColor, 1.0);
    }

    vec3 rgb(float r, float g, float b)
    {
      return vec3(r / 255.0, g / 255.0, b / 255.0);
    }

    void noisePass()
    {
      vec2 uv = gl_FragCoord.xy / uResolution;
      vec2 center = uv * 0.5;
      float radius = 0.25 * uv.y;
      uv *= uZoom;
      float time = uTime * 0.0005;

      uv += vec2(
        clamp(uMousePosition.x, -0.5, 0.5),
        clamp(uMousePosition.y, -0.5, 0.5)
      );
      useSnoise(uv, time);
    }

    void circlePass()
    {
      // // Blend the two
      // gl_FragColor = mix(layer1, layer2, layer2.a);
      vec2 uv = gl_FragCoord.xy;
      vec2 center = uResolution.xy * 0.5;
      float radius = 0.25 * uResolution.y;

        // Background layer
      vec4 layer1 = vec4(rgb(210.0, 222.0, 228.0), 1.0);
      
      // Circle
      vec3 red = rgb(225.0, 95.0, 60.0);
      vec4 layer2 = circle(uv, center, radius, red);
      
      // Blend the two
      gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.0, 0.0, 0.5), layer2.a);
    }

    void main()
    {
      noisePass();
      // circlePass();
    }
  `
});
const otherMesh = new THREE.Mesh(otherGeometry, otherMaterial);
otherScene.add(otherMesh);

const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
scene.environment = renderTarget.texture;
// scene.background = renderTarget.texture;

// mesh
const geometry = new THREE.IcosahedronBufferGeometry(10, 64);
const options = {
  enableSwoopingCamera: false,
  enableRotation: true,
  transmission: 1,
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
  // envMap: renderTarget.texture,
  opacity: 4,
  transparent: true,
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

    vPositionW = vec3(vec4(position, 1.0) * modelMatrix);
		vNormalW = normalize(vec3(vec4(normal, 0.0) * modelMatrix));
    vUv = uv;
    vDistortion = distortion;

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
    varying vec3 vPositionW;
    varying vec3 vNormalW;

    ${utils}

    void main() {
  `);

  // console.log(shader.fragmentShader);
  // shader.fragmentShader = shader.fragmentShader.replace('}', `
  //   float distort = vDistortion * 3.;

  //   vec3 brightness = vec3(.1, .1, .9);
  //   vec3 contrast = vec3(.3, .3, .3);
  //   vec3 oscilation = vec3(.5, .5, .9);
  //   vec3 phase = vec3(.9, .1, .8);

  //   vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);

  //   float fresnelValue = fresnel();

  //   vec3 finalColor = mix(uDepthColor, uSurfaceColor, vDistortion);
  //   finalColor *= fresnelValue;
  //   float opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
  //   gl_FragColor += vec4(finalColor, opacity);
  //   // gl_FragColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));
  // }`);
  // shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
  //   uniform float uOpacity;
  //   uniform float uDeepPurple;
  //   uniform vec3 uDepthColor;
  //   uniform vec3 uSurfaceColor;

  //   varying float vDistortion;
  //   varying vec2 vUv;

  //   varying vec3 vPositionW;
  //   varying vec3 vNormalW;

  //   vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  //     return a + b * cos(6.28318 * (c * t + d));
  //   }

  //   float fresnel() {
  //     vec3 viewDirectionW = normalize(cameraPosition - vPositionW) * 1.0;
  //     float intensity = 1.5;
  //     float fresnelTerm = dot(viewDirectionW, vNormalW) * intensity;
  //     fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
  //     return fresnelTerm;
  //   }

  //   void main() {
  // `);
}
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// const directionalLight = new THREE.DirectionalLight('#ffffff');
// directionalLight.position.set(2, 2, 2);
// scene.add(directionalLight);

const otherM = new THREE.Mesh(
  geometry,
  new THREE.MeshNormalMaterial()
);
scene.add(otherM);
otherM.position.set(10, 0, -30);

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

  // material.envMap = renderTarget.texture;

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
