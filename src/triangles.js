import * as THREE from 'three';
import anime from 'animejs';
import { createScene } from './scene';

const createTriangleLineGeometry = (length, height) => {
  const heightOffset = height / 2;
  const lengthOffset = length / 2;

  const points = [
    new THREE.Vector3(-lengthOffset, -heightOffset, 0),
    new THREE.Vector3(lengthOffset, heightOffset, 0),
    new THREE.Vector3(lengthOffset, -heightOffset, 0),
    new THREE.Vector3(-lengthOffset, -heightOffset, 0),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

const createLinedTriangle = (width, length, height, count, material) => {
  const widthOffset = width / 2;

  const geometry = createTriangleLineGeometry(length, height);
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

const createOffsettedLinedTriangle = (width, length, height, count, material) => {
  const widthOffset = width / 2;
  const heightOffset = height / 2;
  const lengthOffset = length / 2;

  const geometry = createTriangleLineGeometry(length, height);
  const object = new THREE.Object3D();
  const lines = [];
  for (let i = 0; i < count; i++) {
    const lineParent = new THREE.Object3D();
    const line = new THREE.Line(geometry, material);
    const interpolant = i / count;
    lineParent.add(line);
    lineParent.position.x = lengthOffset;
    lineParent.position.y = -heightOffset;
    line.position.x = -lengthOffset;
    line.position.y = heightOffset;
    line.position.z = (width * interpolant) - widthOffset;
    object.add(lineParent);
    lines.push(lineParent);
  }
  return { lines, object };
}

const getPrefabricatedTriangleSet = (offset) => {
  const material = new THREE.LineBasicMaterial({ color: '#ffffff' });
  let linedTriangle;
  if (offset) {
    linedTriangle = createOffsettedLinedTriangle(10, 10, 10, 20, material);
  }
  else {
    linedTriangle = createLinedTriangle(10, 10, 10, 20, material);
  }
  return linedTriangle;
}

export const useLineTriangles = () => {
  (() => {
    const linedTriangles = getPrefabricatedTriangleSet(false);
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('tri-1'),
      (renderer, scene) => {
        scene.add(linedTriangles.object);
        let offset = 0;
        for (let i = linedTriangles.lines.length - 1; i >= 0; i--) {
          linedTriangles.lines[i].position.y = -20;
          timeline.add({
            targets: linedTriangles.lines[i].position,
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
    const linedTriangles = getPrefabricatedTriangleSet(true);
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('tri-2'),
      (renderer, scene) => {
        scene.add(linedTriangles.object);
        let offset = 0;
        for (let i = linedTriangles.lines.length - 1; i >= 0; i--) {
          timeline.add({
            targets: linedTriangles.lines[i].rotation,
            z: -Math.PI * 0.5,
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
    const linedTriangles = getPrefabricatedTriangleSet(false);
    createScene(
      document.getElementById('tri-3'),
      (renderer, scene) => {
        scene.add(linedTriangles.object);
      },
      (time) => {
        for (let i = 0; i < linedTriangles.lines.length; i++) {
          linedTriangles.lines[i].rotation.z = Math.sin(time * 0.001) * (i + 1) * 0.1;
        }
      }
    );
  })();

  (() => {
    const linedTriangles = getPrefabricatedTriangleSet(false);
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('tri-4'),
      (renderer, scene) => {
        scene.add(linedTriangles.object);
        let offset = 0;
        for (let i = linedTriangles.lines.length - 1; i >= 0; i--) {
          timeline.add({
            targets: linedTriangles.lines[i].rotation,
            z: -Math.PI * 0.5,
            duration: 1000
          }, offset);
          offset += 50;
        }
      },
      (time) => {
      }
    );
  })();
}
