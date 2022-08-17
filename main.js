import './style.css';
import * as THREE from 'three';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createElementMesh } from './src/element-mesh';
import { createBubble } from './src/bubble';
import { bootstrapDynamicCanvas } from './src/dynamic-canvas-texture';
import { bootstrapStaticCanvas } from './src/static-canvas-texture';
import { createColorfulElementMesh } from './src/colorful-element-mesh';

const threeCanvas = document.getElementById('app');
const dynamicCanvas = document.getElementById('dynamic-canvas');
const staticCanvas = document.getElementById('static-canvas');

async function bootstrap() {
  let canvasHeight = threeCanvas.parentElement.clientHeight;
  let canvasWidth = threeCanvas.parentElement.clientWidth;

  // renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: threeCanvas
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

  const bubble = createBubble();
  scene.add(bubble.object);

  // controls
  const controls = new OrbitControls(camera, threeCanvas);
  controls.enableDamping = true;
  controls.enableZoom = false;

  const dynamicTextMesh = await createColorfulElementMesh({
    source: dynamicCanvas,
    scale: 0.038,
    renderer
  })
  scene.add(dynamicTextMesh.object);

  const staticTextMesh = await createElementMesh({
    source: staticCanvas,
    scale: 0.038
  })
  scene.add(staticTextMesh.object);

  // stats
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  bootstrapStaticCanvas(staticCanvas);
  const dynamicCanvasScene = bootstrapDynamicCanvas(dynamicCanvas);

  // render
  renderer.setAnimationLoop(async time => {
    stats.begin();
    controls.update();
    bubble.update(time);
    dynamicTextMesh.update(time);
    dynamicCanvasScene.update(time);
    renderer.render(scene, camera);
    stats.end();
  });

  // handle responsiveness
  window.addEventListener('resize', event => {
    canvasHeight = threeCanvas.parentElement.clientHeight;
    canvasWidth = threeCanvas.parentElement.clientWidth;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      canvasWidth,
      canvasHeight
    );
  });
}

bootstrap();
