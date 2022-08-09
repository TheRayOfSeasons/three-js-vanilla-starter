import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {(renderer: THREE.WebGLRenderer, scene: THREE.Scene) => void} init 
 * @param {(time) => void} update 
 */
export const createScene = (canvas, init, update) => {
  let canvasHeight = canvas.parentElement.clientHeight;
  let canvasWidth = canvas.parentElement.clientWidth;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1.0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    1,
    canvasWidth / canvasHeight
  );
  camera.position.set(
    -582.0666770557131,
    494.6339311082349,
    573.7808692269268
  );
  camera.rotation.set(
    -0.7114543773791868,
    -0.6551424540034685,
    -0.48362699103653123,
  );

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enableDamping = true;

  init(renderer, scene);

  renderer.setAnimationLoop(time => {
    controls.update();
    update(time);
    renderer.render(scene, camera);
  });

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
}
