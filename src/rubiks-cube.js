import anime from 'animejs';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

const createCubePiece = (size) => {
  const geometry = new RoundedBoxGeometry(size, size, size, 6, 0.75);
  const material = new THREE.MeshPhongMaterial({
    color: '#2170c9',
    specular: '#ff5900',
    shininess: 30,
    opacity: 1,
  });

  material.onBeforeCompile = shader => {
    shader.uniforms.uLowColor = { value: new THREE.Color('#0458FF') };
    shader.uniforms.uHighColor = { value: new THREE.Color('#7209B7') };

    shader.vertexShader = shader.vertexShader.replace('void main() {', `
      varying vec3 vPositionW;
      varying vec3 vNormalW;

      void main() {
        vPositionW = vec3( vec4( position, 1.0 ) * modelMatrix);
        vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
    `);
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
      uniform vec3 uLowColor;
      uniform vec3 uHighColor;

      varying vec3 vPositionW;
      varying vec3 vNormalW;

      void main() {
    `);
    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
      vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
      float fresnelTerm = dot(viewDirectionW, vNormalW);
      fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);

      vec4 diffuseColor = vec4( mix(uLowColor, uHighColor, fresnelTerm), opacity );
      // vec4 diffuseColor = vec4( diffuse, opacity );
    `);
  }

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export const createRubiksCube = () => {
  const object = new THREE.Group();

  const gap = 2;
  const size = 15;
  const cubes = [];
  for (let i = -0.5; i <= 0.5; i++) {
    for (let j = -0.5; j <= 0.5; j++) {
      for (let k = -0.5; k <= 0.5; k++) {
        const mesh = createCubePiece(size);
        const x = (i * size);
        const y = (j * size);
        const z = (k * size);
        mesh.name = `x: ${x} | y: ${y} | z: ${z}`;
        cubes.push(mesh);
        object.add(mesh);
        mesh.position.set(x, y, z);
      }
    }
  }

  const range = gap;

  const xLowAxle = new THREE.Group();
  xLowAxle.position.set(-range, 0, 0);
  object.add(xLowAxle);

  const xHighAxle = new THREE.Group();
  xHighAxle.position.set(range, 0, 0);
  object.add(xHighAxle);

  const yLowAxle = new THREE.Group();
  yLowAxle.position.set(0, -range, 0);
  object.add(yLowAxle);

  const yHighAxle = new THREE.Group();
  yHighAxle.position.set(0, range, 0);
  object.add(yHighAxle);

  const zLowAxle = new THREE.Group();
  zLowAxle.position.set(0, 0, -range);
  object.add(zLowAxle);

  const zHighAxle = new THREE.Group();
  zHighAxle.position.set(0, 0, range);
  object.add(zHighAxle);

  const worldPosition = new THREE.Vector3();

  const duration = 500;
  const easing = 'easeOutCubic';
  const targetRotation = Math.PI * 0.5;
  const min = -6.5;
  const max = 6.5;
  const moveLowX = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.x < min;
    });
    for (const piece of targets) {
      xLowAxle.attach(piece);
    }
    anime({
      targets: xLowAxle.rotation,
      x: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveHighX = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.x > max;
    });
    for (const piece of targets) {
      xHighAxle.attach(piece);
    }
    anime({
      targets: xHighAxle.rotation,
      x: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveLowY = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.y < min;
    });
    for (const piece of targets) {
      yLowAxle.attach(piece);
    }
    anime({
      targets: yLowAxle.rotation,
      y: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveHighY = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.y > max;
    });
    for (const piece of targets) {
      yHighAxle.attach(piece);
    }
    anime({
      targets: yHighAxle.rotation,
      y: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveLowZ = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.z < min;
    });
    for (const piece of targets) {
      zLowAxle.attach(piece);
    }
    anime({
      targets: zLowAxle.rotation,
      z: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveHighZ = () => {
    const targets = cubes.filter(cube => {
      cube.getWorldPosition(worldPosition);
      return cube.position.z > max;
    });
    for (const piece of targets) {
      zHighAxle.attach(piece);
    }
    anime({
      targets: zHighAxle.rotation,
      z: `+=${targetRotation}`,
      easing,
      duration,
      complete: (anim) => {
        moveRandom();
      }
    });
  }

  const moveFunctions = [
    moveLowX,
    // moveMidX,
    moveHighX,
    moveLowY,
    // moveMidY,
    moveHighY,
    moveLowZ,
    // moveMidZ,
    moveHighZ,
  ];

  const moveRandom = () => {
    for (const cube of cubes) {
      object.attach(cube);
    }
    const move = moveFunctions[Math.floor(Math.random()*moveFunctions.length)];
    move();
  }

  moveRandom();

  object.lookAt(new THREE.Vector3(40, -30, 50));
  const update = (time) => {
    object.rotation.y = time * 0.0005;
  }
  return {
    object,
    update
  };
}
