import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes';

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
camera.position.z = 3;

// marching cubes

const resolution = 28;
const effect = new MarchingCubes(
  resolution,
  new THREE.MeshNormalMaterial(),
  true,
  true,
  10000
);
effect.position.set(0, 0, 0);
effect.scale.set(2, 2, 2);
// effect.enableUvs = false;
// effect.enableColors = false;
scene.add(effect);


const effectController = {

  material: 'shiny',

  speed: 1.0,
  numBlobs: 5,
  resolution: 28,
  isolation: 80,

  floor: true,
  wallx: false,
  wallz: false,

  dummy: function () {}

};

const randomClamped = (min, max) => {
  let value = 0;
  do {
    value = Math.random();
  } while (value < min || value > max);
  return value;
}

const xPositions = [];
const zPositions = [];
for (let i = 0; i < effectController.numBlobs; i++) {
  xPositions.push(randomClamped(0.2, 0.8));
  zPositions.push(randomClamped(0.2, 0.8));
}

function updateCubes( object, time, numblobs, floor, wallx, wallz ) {

  object.reset();

  const subtract = 12;
  const strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

  for ( let i = 0; i < numblobs; i ++ ) {

    // const ballx = Math.sin( i + 1.26 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
    // const bally = Math.abs( Math.cos( i + 1.12 * time * Math.cos( 1.22 + 0.1424 * i ) ) ) * 0.77; // dip into the floor
    // const ballz = Math.cos( i + 1.32 * time * 0.1 * Math.sin( ( 0.92 + 0.53 * i ) ) ) * 0.27 + 0.5;

    const ballx = xPositions[i];
    const bally = Math.abs(Math.sin(i + time)) * 0.75;
    const ballz = zPositions[i];
    object.addBall( ballx, bally, ballz, strength, subtract );
  }

  // object.addPlaneY( 2, 20 );
  if ( floor ) object.addPlaneY( 2, 12 );
  if ( wallz ) object.addPlaneZ( 2, 12 );
  if ( wallx ) object.addPlaneX( 2, 12 );

  // object.update();

}
effect.addPlaneY(20, 100);

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

class MouseEffect {
  mousePosition = new THREE.Vector2();
  /**
   * @type {HTMLElement}
   */
  element = null;

  constructor(element) {
    this.element = element;
    window.addEventListener('mousemove', event => {
      this.mousePosition.x = event.pageX - (this.element.clientWidth * 0.5);
      this.mousePosition.y = event.pageY - (this.element.clientHeight * 0.5);
      this.element.style.transform = `translate(${this.mousePosition.x}px, ${this.mousePosition.y}px)`;
    });
  }

  update() {
  }
}

const mouseEffect = new MouseEffect(document.getElementById('mouse-follower'));

// render
renderer.setAnimationLoop(time => {
  controls.update();
  renderer.render(scene, camera);

  updateCubes(
    effect,
    time * 0.001,
    effectController.numBlobs,
    effectController.floor,
    effectController.wallx,
    effectController.wallz
  );
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
