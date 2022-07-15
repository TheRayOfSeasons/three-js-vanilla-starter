import './style.css';
import * as THREE from 'three';
import GSAP from 'gsap';
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
renderer.setClearColor(0x212121, 1.0);

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasWidth / canvasHeight
);
camera.position.z = 20;

const mouse = new THREE.Vector2();

// mesh
const settings = {
  // vertex
  uFrequency: {
    start: 0,
    end: 4
  },
  uAmplitude: {
    start: 4,
    end: 4
  },
  uDensity: {
    start: 1,
    end: 1
  },
  uStrength: {
    start: 0,
    end: 1.1
  },
  // fragment
  uDeepPurple: {  // max 1
    start: 1,
    end: 0
  },
  uOpacity: {  // max 1
    start: .1,
    end: 1.
  }
}
const geometry = new THREE.IcosahedronBufferGeometry(10, 64);
// const geometry = new THREE.BoxBufferGeometry(10, 10, 10, 64, 64, 64);
// const geometry = new THREE.PlaneBufferGeometry(10, 10, 64, 64);

// const geometry = new THREE.SphereBufferGeometry(10, 64, 64);

const material = new THREE.ShaderMaterial({
  uniforms: {
    // uFrequency: { value: 2.04 },
    // uAmplitude: { value: 2.04 },
    // uDensity: { value: 1.8 },
    // uStrength: { value: 1.8 },
    uFrequency: { value: settings.uFrequency.start },
    uAmplitude: { value: settings.uAmplitude.start },
    uDensity: { value: settings.uDensity.start },
    uStrength: { value: settings.uStrength.start },
    uDeepPurple: { value: settings.uDeepPurple.start },
    uOpacity: { value: settings.uOpacity.start },
    uTime: { value: 0 },
    uDepthColor: { value: new THREE.Color('#0e0ea8') },
    uSurfaceColor: { value: new THREE.Color('#f78e17') },
  },
  vertexShader: `
    // GLSL textureless classic 3D noise "cnoise",
    // with an RSL-style periodic variant "pnoise".
    // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
    // Version: 2011-10-11
    //
    // Many thanks to Ian McEwan of Ashima Arts for the
    // ideas for permutation and gradient selection.
    //
    // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
    // Distributed under the MIT license. See LICENSE file.
    // https://github.com/ashima/webgl-noise
    //
    vec3 mod289(vec3 x)
    {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x)
    {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x)
    {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r)
    {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    vec3 fade(vec3 t) {
      return t*t*t*(t*(t*6.0-15.0)+10.0);
    }
    
    // Classic Perlin noise, periodic variant
    float pnoise(vec3 P, vec3 rep)
    {
      vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
      vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
      Pi0 = mod289(Pi0);
      Pi1 = mod289(Pi1);
      vec3 Pf0 = fract(P); // Fractional part for interpolation
      vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = Pi0.zzzz;
      vec4 iz1 = Pi1.zzzz;
    
      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
    
      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
      vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
      vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
      vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
      vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
      vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
      vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
      vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
      vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
      vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;
      vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;
    
      float n000 = dot(g000, Pf0);
      float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
      float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
      float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
      float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
      float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
      float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
      float n111 = dot(g111, Pf1);
    
      vec3 fade_xyz = fade(Pf0);
      vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
      vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
      float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
      return 2.2 * n_xyz;
    }
    
    // https://github.com/dmnsgn/glsl-rotate
    mat3 rotation3dY(float angle) {
        float s = sin(angle);
        float c = cos(angle);
    
        return mat3(
          c, 0.0, -s,
          0.0, 1.0, 0.0,
          s, 0.0, c
        );
      }
      
    vec3 rotateY(vec3 v, float angle) {
      return rotation3dY(angle) * v;
    }
    
    //
    
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;
    uniform float uTime;
    
    varying float vDistortion;
    
    void main() {  
      float distortion = (pnoise(normal * uDensity + uTime, vec3(10.)) * uStrength);
    
      vec3 pos = position + (normal * distortion);
      float angle = sin((uv.y * uFrequency) + uTime) * uAmplitude;
      pos = rotateY(pos, angle);    
        
      vDistortion = distortion;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    uniform float uDeepPurple;
    uniform vec3 uDepthColor;
    uniform vec3 uSurfaceColor;
    
    varying float vDistortion;
    
    vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
      return a + b * cos(6.28318 * (c * t + d));
      
    }     
    
    void main() {
      float distort = vDistortion * 3.;
    
      vec3 brightness = vec3(.1, .1, .9);
      vec3 contrast = vec3(.3, .3, .3);
      vec3 oscilation = vec3(.5, .5, .9);
      vec3 phase = vec3(.9, .1, .8);
    
      vec3 color = cosPalette(distort, brightness, contrast, oscilation, phase);
      
      // vec3 mainColor = mix(uDepthColor, uSurfaceColor, vDistortion);
      // gl_FragColor = vec4(mix(color, mainColor, vDistortion), 1.0);

      // gl_FragColor = vec4(color, vDistortion);
      // gl_FragColor += vec4(min(uDeepPurple, 1.), 0., .5, min(uOpacity, 1.));
      
      // gl_FragColor = vec4(color, vDistortion);
      // gl_FragColor += vec4(uDepthColor, min(uOpacity, 1.));

      gl_FragColor = vec4(mix(uDepthColor, uSurfaceColor, vDistortion), 1.0);
      gl_FragColor += vec4(uDepthColor, min(uOpacity, 1.));
    }
  `,
  wireframe: true,
  // blending: THREE.AdditiveBlending
  // transparent: true,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);


window.addEventListener('mousemove', event => {
  mouse.x = (event.clientX / window.innerWidth).toFixed(2) * 4
  mouse.y = (event.clientY / window.innerHeight).toFixed(2) * 2

  GSAP.to(mesh.material.uniforms.uFrequency, { value: mouse.x })
  GSAP.to(mesh.material.uniforms.uAmplitude, { value: mouse.x })
  GSAP.to(mesh.material.uniforms.uDensity, { value: mouse.y })
  GSAP.to(mesh.material.uniforms.uStrength, { value: mouse.y })


  // console.log('uFrequency: ', mesh.material.uniforms.uFrequency);
  // console.log('uAmplitude: ', mesh.material.uniforms.uAmplitude);
  // console.log('uDensity: ', mesh.material.uniforms.uDensity);
  // console.log('uStrength: ', mesh.material.uniforms.uStrength);
  console.log({
    'uFrequency': mesh.material.uniforms.uFrequency,
    'uAmplitude': mesh.material.uniforms.uAmplitude,
    'uDensity': mesh.material.uniforms.uDensity,
    'uStrength': mesh.material.uniforms.uStrength,
  });
});

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  material.uniforms.uTime.value = time * 0.0002;
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
