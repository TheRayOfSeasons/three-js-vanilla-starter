import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';

const createMaterial = (side=THREE.FrontSide) => {
  const material = new THREE.MeshPhongMaterial({
    color: '#2170c9',
    specular: '#ff5900',
    emissive: '#1a121c',
    shininess: 30,
    opacity: 1,
    side
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

const createBox = () => {
  const geometry = new RoundedBoxGeometry(15, 15, 5, 6, 0.75);
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

const createTorus = () => {
  const geometry = new THREE.TorusBufferGeometry(5, 1, 16, 100);
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export const createLock = () => {
  const object = new THREE.Group();

  const box = createBox();
  object.add(box);

  const torus = createTorus();
  object.add(torus);
  torus.position.y = 7.5;
  torus.scale.y = 1.25;

  object.lookAt(new THREE.Vector3(40, -30, 50));

  const update = (time) => {
    object.rotation.y = time * 0.0005;
  }
  return {
    object,
    update
  }
}
