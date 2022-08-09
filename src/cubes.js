import * as THREE from 'three';
import anime from 'animejs';
import { createScene } from './scene';

// mesh
const createLinePlaneGeometry = (length, height) => {
  const heightOffset = height / 2;
  const lengthOffset = length / 2;

  const points = [
    new THREE.Vector3(-lengthOffset, heightOffset, 0),
    new THREE.Vector3(lengthOffset, heightOffset, 0),
    new THREE.Vector3(lengthOffset, -heightOffset, 0),
    new THREE.Vector3(-lengthOffset, -heightOffset, 0),
    new THREE.Vector3(-lengthOffset, heightOffset, 0),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

const createLinedCube = (width, length, height, count, material) => {
  const widthOffset = width / 2;

  const geometry = createLinePlaneGeometry(length, height);
  const object = new THREE.Object3D();
  const lines = [];
  for (let i = 0; i < count; i++) {
    const line = new THREE.Line(geometry, material);
    const interpolant = i / count;
    line.position.z = (width * interpolant) - widthOffset;
    object.add(line);
    lines.push(line);
  }
  return { lines, object };
}

const getPrefabricatedCube = () => {
  const material = new THREE.LineBasicMaterial({ color: '#ffffff' });
  const linedCube = createLinedCube(10, 10, 10, 20, material);
  return linedCube;
}

export const useLineCubes = () => {
  (() => {
    const linedCube = getPrefabricatedCube();
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('app-1'),
      (renderer, scene) => {
        scene.add(linedCube.object);
        let offset = 0;
        for (let i = linedCube.lines.length - 1; i >= 0; i--) {
          linedCube.lines[i].position.y = -20;
          timeline.add({
            targets: linedCube.lines[i].position,
            y: 0,
            duration: 1000
          }, offset);
          offset += 50;
        }
      },
      (time) => {
      }
    );
  })();
  
  (() => {
    const linedCube = getPrefabricatedCube();
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuad',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('app-2'),
      (renderer, scene) => {
        scene.add(linedCube.object);
        let offset = 0;
        for (let i = 0; i < linedCube.lines.length; i++) {
          timeline.add({
            targets: linedCube.lines[i].rotation,
            z: Math.PI * 0.5,
            duration: 1000
          }, offset);
          offset += 50;
        }
      },
      (time) => {
      }
    );
  })();
  
  (() => {
    const linedCube = getPrefabricatedCube();
    createScene(
      document.getElementById('app-3'),
      (renderer, scene) => {
        scene.add(linedCube.object);
      },
      (time) => {
        for (let i = 0; i < linedCube.lines.length; i++) {
          linedCube.lines[i].rotation.z = Math.sin(time * 0.001) * (i + 1) * 0.1;
        }
      }
    );
  })();
  
  (() => {
    const linedCube = getPrefabricatedCube();
    createScene(
      document.getElementById('app-4'),
      (renderer, scene) => {
        scene.add(linedCube.object);
      },
      (time) => {
        for (let i = 0; i < linedCube.lines.length; i++) {
          linedCube.lines[i].rotation.z = (time * 0.001 * (i + 1)) * 0.05;
        }
      }
    );
  })();
  
  (() => {
    const linedCube = getPrefabricatedCube();
    createScene(
      document.getElementById('app-5'),
      (renderer, scene) => {
        scene.add(linedCube.object);
      },
      (time) => {
        for (let i = 0; i < linedCube.lines.length; i++) {
          linedCube.lines[i].position.y = Math.sin((time + i * 100) * 0.0025) * 2;
        }
      }
    );
  })();
  
  (() => {
    const linedCube = getPrefabricatedCube();
    createScene(
      document.getElementById('app-6'),
      (renderer, scene) => {
        scene.add(linedCube.object);
      },
      (time) => {
        for (let i = 0; i < linedCube.lines.length; i++) {
          linedCube.lines[i].position.y = Math.sin(time * 0.001 * (i + 10)) * 0.1;
        }
      }
    );
  })();
}
