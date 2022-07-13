import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';

const canvas = document.getElementById('app');

let canvasHeight = canvas.parentElement.clientHeight;
let canvasWidth = canvas.parentElement.clientWidth;

const clock = new THREE.Clock();

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
camera.position.z = 14;

// textures
const textureLoader = new THREE.TextureLoader();
const imageLoader = new THREE.ImageLoader();
const worldAlphaMap = textureLoader.load('/earth-spec.jpeg');
const worldColorMap = textureLoader.load('/earth-spec-color-map.png');
const dotTexture = textureLoader.load('/circle.png');

const updates = [];
const mousePos = {
  r: 0,
  g: 0,
  b: 0,
  a: 0
}
async function bootstrap() {
  const image = await imageLoader.loadAsync('/earth-spec.jpeg');

  const others = document.getElementById('others');
  console.log('others: ', others);
  const getImageContext = (image) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    // console.log(image.naturalWidth);
    // const width = Math.floor(image.naturalWidth * 0.5);
    // const height =  Math.floor(image.naturalHeight * 0.5);
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    // others.appendChild(canvas);
    context.drawImage(image, 0, 0, image.width, image.height,
                             0, 0, image.width, image.height);
    // canvas.addEventListener('mousemove', event => {
    //   const values = context.getImageData(event.offsetX, event.offsetY, 1, 1).data;
    //   mousePos.r = values[0];
    //   mousePos.g = values[1];
    //   mousePos.b = values[2];
    //   mousePos.a = values[3];
    //   console.log({
    //     x: event.offsetX,
    //     y:  event.offsetY
    //   });
    //   console.log(mousePos);
    // });
    return context;
  }

  const imageContext = getImageContext(image);
  console.log(imageContext);
  
  /**
   * Returns the UV coordinate of a point in a sphere.
   * @param {THREE.Vector3} center 
   * @param {THREE.Vector3} position 
   * @returns {THREE.Vector3}
   */
  const pointToUv = (center, position) => {
    const normal = position.sub(center).normalize();
    const u = Math.atan2(normal.x, normal.z) / (2 * Math.PI) + 0.5;
    const v = normal.y * 0.5 + 0.5;
    return new THREE.Vector2(u, v);
  }
  
  const translate = (uvX, uvY, width, height) => {
    const x = THREE.MathUtils.lerp(0, width, uvX);
    const y = THREE.MathUtils.lerp(0, height, uvY);
    return {x, y};
  }

  /**
   * 
   * @param {THREE.Vector2} uv 
   * @param {CanvasRenderingContext2D} imageContext
   */
  const sampleImage = (uv, imageContext) => {
    const coordinate = translate(uv.x, uv.y, image.width, image.height);
    const pixelData = imageContext.getImageData(coordinate.x, coordinate.y, 1, 1).data;
    return {
      r: pixelData[0],
      g: pixelData[1],
      b: pixelData[2],
      a: pixelData[3],
    };
  }
  
  // const isAlpha = (r, g, b, a) => {
  //   if ([r, g, b].every(color => color === 255)) {
  //     return 
  //   }
  // }
  // const data = sampleImage(new THREE.Vector2(0.5, 0.5), imageContext);
  // console.log([data[0], data[1], data[2], data[3]]);
  
  
  // mesh
  const DOT_COUNT = 60000;
  
  // alter
  const sphereReferenceGeometry = new THREE.SphereBufferGeometry(8, 500, 500);
  const geometry = new THREE.BufferGeometry(8, 256, 256)
  const positions = [...sphereReferenceGeometry.attributes.position.array];
  const normals = [...sphereReferenceGeometry.attributes.normal.array];
  const uvs = [...sphereReferenceGeometry.attributes.uv.array];
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  
  // generate sunflower pattern
  // const geometry = new THREE.BufferGeometry();
  // let positions = [];
  // let rawVectorPositions = [];
  // const vector = new THREE.Vector3();
  // for (let i = DOT_COUNT; i > 0; i--) {
  //   const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
  //   const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
  //   vector.setFromSphericalCoords(8, phi, theta);
  //   geometry.lookAt(vector);
  //   geometry.translate(vector.x, vector.y, vector.z);
  //   positions.push(vector.x, vector.y, vector.z);
  //   rawVectorPositions.push(vector.clone());
  // }
  
  // // generate uv coordinates
  // let uvs = [];
  // geometry.computeBoundingSphere();
  // for (const rawVector of rawVectorPositions) {
  //   const uv = pointToUv(geometry.boundingSphere.center, rawVector);
  //   // const { r, g, b } = sampleImage(uv, imageContext);
  //   // if (r === 255 && g === 255 && b === 255)
  //   //   continue;
  //   // positions.push(-rawVector.x, -rawVector.y, -rawVector.z);
  //   uvs.push(uv.x, uv.y);
  // }
  // geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  // geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  // light factor
  const vertexCount = geometry.attributes.position.array.length;
  const lightFactor = new Float32Array(vertexCount);
  const vertexIDs = new Float32Array(vertexCount);
  for(let i = 0; i < vertexCount; i++) {
    lightFactor[i] = Math.random();
    vertexIDs[i] = i % 2 == 0 ? 0 : 1;
  }
  geometry.setAttribute('lightFactor', new THREE.BufferAttribute(lightFactor, 1));
  geometry.setAttribute('vertexID', new THREE.BufferAttribute(vertexIDs, 1));
  
  const material = new THREE.ShaderMaterial(({
    vertexColors: THREE.VertexColors,
    uniforms: {
      visibility: {
        value: worldAlphaMap
      },
      colorMap: {
        value: worldColorMap
      },
      uTime: {
        value: 0.0
      },
      uMinColor: {
        value: new THREE.Color('#284f64')
      },
      uMaxColor: {
        value: new THREE.Color('#0e0ea8')
      },
      uCountryColor: {
        value: new THREE.Color('#d6d6d6')
      },
      uCountryMinColor: {
        value: new THREE.Color('#5ebef1')
      },
      shift: {
        value: 0
      },
      shape: {
        value: dotTexture
      },
      size: {
        value: 0.075
      },
      uContinentBrightness: {
        value: 4.0
      },
      scale: {
        value: window.innerHeight / 2
      }
    },
    vertexShader: `
      attribute float lightFactor;
      attribute float vertexID;
  
      uniform float scale;
      uniform float size;
  
      varying vec2 vUv;
      varying vec3 vColor;
      varying vec4 vModelPosition;
      varying float vVertexID;
      varying float vLightFactor;
  
      void main() {
  
        vUv = uv;
        vColor = color;
        vModelPosition = modelMatrix * vec4(position, 1.0);
        vVertexID = float(vertexID);
        vLightFactor = lightFactor;
  
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = size * ( scale / length( mvPosition.xyz )) * (0.3 + sin(uv.y * 3.1415926) * 0.6 );
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D visibility;
      uniform sampler2D colorMap;
      uniform float shift;
      uniform float uTime;
      uniform float uContinentBrightness;
      uniform sampler2D shape;
      uniform vec3 uMinColor;
      uniform vec3 uMaxColor;
      uniform vec3 uCountryColor;
      uniform vec3 uCountryMinColor;
  
      varying vec2 vUv;
      varying vec3 vColor;
      varying vec4 vModelPosition;
      varying float vVertexID;
      varying float vLightFactor;
  
      void main() {
        vec2 uv = vUv;
        uv.x += shift;
        vec4 v = texture2D(visibility, uv);
        vec4 c = texture2D(colorMap, uv);
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
        vec4 shapeData = texture2D(shape, gl_PointCoord);
        if (shapeData.a < 0.0625) discard;
        gl_FragColor = gl_FragColor * uContinentBrightness * shapeData.a;
      }
    `,
    transparent: false,
    alphaTest: true,
    wireframe: true
  }));
  const mesh = new THREE.Points(geometry, material);
  scene.add(mesh);

  updates.push(() => {
    const elapsedTime = clock.getElapsedTime();
    mesh.rotation.y = elapsedTime * 0.1;
    material.uniforms.uTime.value = elapsedTime;
  });
}

bootstrap();

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
// controls.enableZoom = false;

// stats
const statsBars = [
  (() => {
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    stats.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
    return stats;
  })(),
  (() => {
    const stats = new Stats();
    stats.showPanel(1);
    document.body.appendChild(stats.dom);
    stats.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
    return stats;
  })(),
  (() => {
    const stats = new Stats();
    stats.showPanel(2);
    document.body.appendChild(stats.dom);
    stats.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';
    return stats;
  })(),
];
// render
renderer.setAnimationLoop(() => {
  for (const stat of statsBars) {
    stat.begin();
  }
  for (const update of updates) {
    update();
  }
  controls.update();
  renderer.render(scene, camera);
  for (const stat of statsBars) {
    stat.end();
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
