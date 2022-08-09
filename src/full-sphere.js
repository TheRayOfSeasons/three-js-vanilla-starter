import * as THREE from 'three';
import anime from 'animejs';
import { createScene } from './scene';

const createLineSpheresGeometry = (radius, vertexCount) => {
  const spherical = new THREE.Spherical(radius, 0, 0);
  const points = [];
  const originPoint = new THREE.Vector3().setFromSpherical(spherical);
  for (let i = 0; i < vertexCount; i++) {
    const point = new THREE.Vector3().setFromSpherical(spherical);
    points.push(point);
    spherical.phi = (Math.PI * 2) * (i / vertexCount);
  }
  points.push(originPoint);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

const createLineSpheres = (radius, count, material) => {
  const offsetedRadius = radius * 2;
  const lines = [];
  const positions = [];
  const object = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const interpolant = i / count;
    const angle = (Math.PI * 2) * interpolant;
    const chordLength = 2 * offsetedRadius * Math.sin(angle / 2);
    const geometry = createLineSpheresGeometry(chordLength / 2, 100);
    const line = new THREE.Line(geometry, material);
    const position = Math.sqrt(Math.pow(offsetedRadius, 2) - Math.pow((chordLength / 2), 2));
    if (i > (count / 2)) {
      line.position.x = -position;
    }
    else {
      line.position.x = position;
    }
    positions.push(new THREE.Vector3().copy(line.position));
    lines.push(line);
    object.add(line);
  }
  object.rotation.y = Math.PI * 0.5;
  return { lines, object, positions };
}

const getPrefabricatedSphere = () => {
  const material = new THREE.LineBasicMaterial({ color: '#ffffff' });
  const lineSpheres = createLineSpheres(3, 26, material);
  return lineSpheres;
}

export const useLineFullSpheres = () => {
  (() => {
    const sphere = getPrefabricatedSphere();
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('sph-1'),
      (renderer, scene) => {
        scene.add(sphere.object);
        let offset = 0;
        for (let i = sphere.lines.length - 1; i >= 0; i--) {
          sphere.lines[i].position.y = -20;
          timeline.add({
            targets: sphere.lines[i].position,
            y: 0,
            duration: 1000
          }, offset);
          offset += 50;
        }
      },
      (time) => {
      }
    )
  })();

  (() => {
    const sphere = getPrefabricatedSphere();
    const timeline1 = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    const timeline2 = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('sph-2'),
      (renderer, scene) => {
        scene.add(sphere.object);
        (() => {
          let offset = 0;
          for (let i = 0; i < sphere.lines.length / 2; i++) {
            const position = sphere.lines[i].position.x;
            timeline1.add({
              targets: sphere.lines[i].position,
              x: -position,
              duration: 1000
            }, offset);
            offset += 50;
          }
        })();
        (() => {
          let offset = 0;
          for (let i = sphere.lines.length / 2; i < sphere.lines.length; i++) {
            try {
              const position = sphere.lines[i].position.x;
              timeline2.add({
                targets: sphere.lines[i].position,
                x: -position,
                duration: 1000
              }, offset);
              offset += 50;
            }
            catch(error) {}
          }
        })();
      },
      (time) => {
      }
    )
  })();

  (() => {
    const sphere = getPrefabricatedSphere();
    const timeline = new anime.timeline({
      autoplay: true,
      easing: 'easeInOutQuart',
      loop: true,
      direction: 'alternate'
    });
    createScene(
      document.getElementById('sph-3'),
      (renderer, scene) => {
        scene.add(sphere.object);
        let offset = 0;
        for (let i = 0; i < sphere.lines.length; i++) {
          const position = sphere.lines[i].position.x;
          timeline.add({
            targets: sphere.lines[i].position,
            x: -position,
            duration: 1000
          }, offset);
          offset += 50;
        }
      },
      (time) => {

      }
    )
  })();

  (() => {
    const sphere = getPrefabricatedSphere();
    createScene(
      document.getElementById('sph-4'),
      (renderer, scene) => {
        scene.add(sphere.object);
      },
      (time) => {
        for (let i = 0; i < sphere.lines.length; i++) {
          sphere.lines[i].position.y = Math.sin((time + i * 100) * 0.0025) * 2;
        }
      }
    )
  })();

  (() => {
    const sphere = getPrefabricatedSphere();
    createScene(
      document.getElementById('sph-5'),
      (renderer, scene) => {
        scene.add(sphere.object);
      },
      (time) => {
        for (let i = 0; i < sphere.lines.length; i++) {
          const originalPosition = sphere.positions[i];
          const originalX = originalPosition.x;
          sphere.lines[i].position.x = Math.sin((time + i * 200) * 0.001) + originalX;
        }
      }
    )
  })();
}
