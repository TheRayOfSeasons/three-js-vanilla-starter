import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';

export const createLines = () => {
  const object = new THREE.Object3D();

  const loader = new SVGLoader();

  const material = new THREE.LineBasicMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  let mainShader;
  material.onBeforeCompile = shader => {
    shader.uniforms.uSpeed = { value: 0.002 };
    shader.uniforms.uFrequency = { value: 20 };
    shader.uniforms.uAmplitude = { value: 100 };
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace('void main() {', `
      uniform float uAmplitude;
      uniform float uFrequency;
      uniform float uSpeed;
      uniform float uTime;

      varying float vElevation;
      varying vec3 vPosition;

      void main() {
    `);
    shader.vertexShader = shader.vertexShader.replace('}', `
      vec3 currentPos = position;
      float time = uTime * uSpeed;
      float elevation = sin(time + currentPos.y * uFrequency) * uAmplitude;
      currentPos.z += elevation;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(currentPos, 1.0);

      vElevation = elevation;
      vPosition = currentPos;
    }`);
    mainShader = shader;
  }
  loader.load('path.svg', data => {
    const paths = data.paths;
		const group = new THREE.Group();

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];
			const shapes = SVGLoader.createShapes(path);

			for (let j = 0; j < shapes.length; j++) {
				const shape = shapes[j];
        const geometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints(2));
        const mesh = new THREE.LineLoop(geometry, material);
        group.add(mesh);
			}
		}

    const scale = 0.002;
    group.scale.set(-scale, scale, scale);
    group.position.set(-2, 2, 0);
    group.rotation.z = Math.PI;
    object.add(group);
  });

  const update = time => {
    if (mainShader) {
      mainShader.uniforms.uTime.value = time;
    }
  }

  return {
    object,
    update
  }
}
