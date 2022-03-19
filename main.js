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
camera.position.z = 10;

// mesh
// const geometry = new THREE.PlaneBufferGeometry(10, 10, 100, 100);
const geometry = new THREE.SphereBufferGeometry(5, 32, 16);

console.log(geometry.getAttribute('uv'));
geometry.rotateX(Math.PI * 0.5);

const material = new THREE.RawShaderMaterial({
  uniforms: {
    iTime: { value: 0 }
  },
  vertexShader: `
      attribute vec3 position;
      attribute vec2 uv;

      uniform mat4 projectionMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 modelMatrix;

      varying vec2 vUv;
      varying vec3 vPosition;
  
      void main()
      {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
    precision mediump float;

    uniform float iTime;

    varying vec2 vUv;
    varying vec3 vPosition;

    // copy from https://www.shadertoy.com/view/4l2GzW
    // float r(float n)
    // {
    //   return fract(cos(n*89.42)*343.42);
    // }
    // vec2 r(vec2 n)
    // {
    //   return vec2(r(n.x*23.62-300.0+n.y*34.35),r(n.x*45.13+256.0+n.y*38.89)); 
    // }
    // float worley(vec2 n,float s)
    // {
    //     float dis = 2.0;
    //     for(int x = -1;x<=1;x++)
    //     {
    //         for(int y = -1;y<=1;y++)
    //         {
    //             vec2 p = floor(n/s)+vec2(x,y);
    //             float d = length(r(p)+vec2(x,y)-fract(n/s));
    //             if (dis>d)
    //             {
    //               dis = d;   
    //             }
    //         }
    //     }
    //     return 1.0 - dis;
      
    // }

    // // copy from https://www.shadertoy.com/view/4sc3z2

    // #define MOD3 vec3(.1031,.11369,.13787)

    // vec3 hash33(vec3 p3)
    // {
    //   p3 = fract(p3 * MOD3);
    //     p3 += dot(p3, p3.yxz+19.19);
    //     return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
    // }
    // float perlin_noise(vec3 p)
    // {
    //     vec3 pi = floor(p);
    //     vec3 pf = p - pi;
        
    //     vec3 w = pf * pf * (3.0 - 2.0 * pf);
        
    //     return 	mix(
    //             mix(
    //                   mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))), 
    //                         dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
    //                         w.x),
    //                   mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))), 
    //                         dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
    //                         w.x),
    //                   w.z),
    //             mix(
    //                     mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))), 
    //                         dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
    //                         w.x),
    //                     mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))), 
    //                         dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
    //                         w.x),
    //                   w.z),
    //           w.y);
    // }
    // void mainImage( out vec4 fragColor, in vec2 fragCoord )
    // {
    //     vec2 p = -1.0 + 2.0 * fragCoord;
    //     float dis = (1.0+perlin_noise(vec3(p, iTime*0.05)*8.0)) 
    //         * (1.0+(worley(fragCoord.xy, 32.0)+
    //         0.5*worley(2.0*fragCoord.xy,32.0) +
    //         0.25*worley(4.0*fragCoord.xy,32.0) ));
    //   vec3 color = vec3(dis/4.0);
    //   fragColor = vec4(color.x, 0.4, 0.0 ,1.0);
    // }

    void main()
    {
      // mainImage(gl_FragColor, vUv * 10.0);
      // vec3 color = vec3(smoothstep(0.0, 5.0, (vPosition.y + 5.0) / 10.0), 0.0, 0.0);
      // // vec3 color1 = vec3(1.0, 0.0, 0.0);
      // // vec3 color2 = vec3(1.0, 0.0, 1.0);
      // // vec3 mixedColor = smoothstep(color1, color2, (vPosition.y + 5.0) / 10.0);
      gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// render
renderer.setAnimationLoop(time => {
  controls.update();
  material.uniforms.iTime.value = time;
  material.needsUpdate = true;
  // mesh.rotation.y = time * 0.001;
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
