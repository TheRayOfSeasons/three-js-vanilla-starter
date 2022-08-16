import './style.css';
import * as THREE from 'three';
import html2canvas from 'html2canvas';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { utils } from './src/shaders';

const canvas = document.getElementById('app');

(async () => {
  let canvasHeight = canvas.parentElement.clientHeight;
  let canvasWidth = canvas.parentElement.clientWidth;
  
  // let copyCanvas;
  
  // renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas
  });
  renderer.setSize(canvasWidth, canvasHeight);
  
  // scene
  const scene = new THREE.Scene();
  
  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight
  );
  camera.position.z = 20;
  
  // material
  const material = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    transmission: 0.9,
    thickness: 0.001,
    roughness: 0.007,
  });
  let mainShader;
  material.onBeforeCompile = shader => {
    shader.uniforms.uFrequency = { value: 2.4 };
    shader.uniforms.uAmplitude = { value: 0.4 };
    shader.uniforms.uDensity = { value: 1.2 };
    shader.uniforms.uStrength = { value: 1.8 };
    shader.uniforms.uDeepPurple = { value: 1 };
    shader.uniforms.uOpacity = { value: 0.1 };
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uFresnelIntensity = { value: 3 };
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
  
      // vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);
      // vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
      vElevation = distance(position, pos);
  
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }`);
    shader.vertexShader = shader.vertexShader.replace('void main() {', `
      uniform float uFrequency;
      uniform float uAmplitude;
      uniform float uDensity;
      uniform float uStrength;
      uniform float uTime;
  
      varying float vDistortion;
      varying float vElevation;
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
      float opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
      vec4 compiledColor = vec4(finalColor, opacity);
      compiledColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));
  
      float multiplier = vElevation * 0.1;
      gl_FragColor += vec4(compiledColor.r * multiplier, compiledColor.g * multiplier, compiledColor.b * multiplier, 0.0);
      // gl_FragColor += vec4(uDepthColor.r * multiplier, uDepthColor.g * multiplier, uDepthColor.b * multiplier, 0.0);
      float centralBrightness = 0.5;
      gl_FragColor += vec4(centralBrightness * multiplier, centralBrightness * multiplier, centralBrightness * multiplier, 0.0);
  
      float t = (compiledColor.r + compiledColor.g + compiledColor.b) / 3.0;
      finalColor = mix(uDepthColor, uSurfaceColor, vDistortion);
      finalColor *= fresnelValue;
      opacity = clamp(finalColor.r + finalColor.g + finalColor.b, 0.0, 1.0);
      compiledColor = vec4(finalColor, opacity);
      compiledColor += vec4(uSurfaceColor * fresnelValue, min(uOpacity, 1.));
  
      gl_FragColor += mix(gl_FragColor, compiledColor, t);
    }`);
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
      uniform float uOpacity;
      uniform float uDeepPurple;
      uniform float uFresnelIntensity;
      uniform sampler2D uEnvMap;
      uniform vec3 uDepthColor;
      uniform vec3 uSurfaceColor;
    
      varying float vDistortion;
      varying float vElevation;
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
  
  // controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;
  
  const original = document.getElementById('clone-me');
  const textCanvas = {
    canvas: null
  }
  const copyCanvas = async () => {
    const parent = document.querySelector('.texture-canvases');
    const canvas = await html2canvas(original);
  
    parent.textContent = '';
    parent.appendChild(canvas);
    canvas.id = 'canvas-texture';

    console.log('updating canvas');
    textCanvas.canvas = canvas;
  };
  await copyCanvas();

  const textGeometry = new THREE.PlaneBufferGeometry(canvasWidth, canvasHeight);
  const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: new THREE.CanvasTexture(textCanvas.canvas) },
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
      uniform vec2 uResolution;
      uniform sampler2D uTexture;

      varying vec2 vUv;

      void main()
      {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec4 color = texture2D(uTexture, vUv);
        if (length(color.rgb) <= 0.0) discard;
        gl_FragColor = color;
      }
    `
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.z = 0;
  scene.add(textMesh);
  textMesh.scale.set(0.038, 0.038, 0.038);

  // setInterval(async () => {
  //   await copyCanvas();
  // }, 1);
  
  // render
  renderer.setAnimationLoop(async time => {
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
    // copyCanvas();
  });
})();
