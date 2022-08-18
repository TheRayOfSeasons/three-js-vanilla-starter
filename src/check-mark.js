import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const createMaterial = () => {
  const material = new THREE.MeshPhongMaterial({
    color: '#2170c9',
    specular: '#ff5900',
    shininess: 30,
    opacity: 1,
    side: THREE.DoubleSide
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
    `);
  }

  return material;
}

export const createCheckMark = () => {
  const object = new THREE.Group();

  const group = new THREE.Group();

  const loader = new GLTFLoader();

  let check;
  loader.load('check-2-rounded.glb', (object) => {
    object.scene.traverse(child => {
      if(child.isMesh) {
        child.material = createMaterial();
        group.add(child);
        check = child;
      }
    })
  });

  let border;
  loader.load('check-2-rounded-border.glb', (object) => {
    object.scene.traverse(child => {
      if(child.isMesh) {
        child.material = createMaterial();
        group.add(child);
        border = child;
      }
    })
  });

  object.add(group);
  group.rotation.y = -Math.PI * 0.5;

  object.lookAt(new THREE.Vector3(20, 25, 50));
  const update = (time) => {
    if (check) {
      check.rotation.y = time * 0.0005;
    }
    if (border) {
      border.rotation.y = -time * 0.0005;
    }
  }
  return {
    object,
    update
  }
}
