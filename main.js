import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createElementMesh } from './src/element-mesh';
import { createBubble } from './src/bubble';

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

  const bubble = createBubble();
  scene.add(bubble.object);

  // controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enableZoom = false;

  const textMesh = await createElementMesh({
    source: document.getElementById('clone-me'),
    appendTo: document.querySelector('.texture-canvases'),
    id: 'canvas-texture',
    scale: 0.038
  })
  scene.add(textMesh);

  // render
  renderer.setAnimationLoop(async time => {
    controls.update();
    bubble.update(time);
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
})();
