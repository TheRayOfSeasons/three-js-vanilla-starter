import * as THREE from 'three';

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

const createIconHead = () => {
  const geometry = new THREE.CylinderBufferGeometry(2, 2, 2, 32, 2);
  geometry.rotateX(Math.PI * 0.5);
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

const createBody = () => {
  const geometry = new THREE.CylinderBufferGeometry(6, 6, 2, 32, 2, false, 0, Math.PI);
  geometry.rotateX(Math.PI * 0.5);
  geometry.rotateZ(Math.PI * 0.5);
  const material = createMaterial(THREE.DoubleSide);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

export const create3DUserIcon = () => {
  const object = new THREE.Group();

  const head = createIconHead();
  object.add(head);
  head.position.y = 4;

  const body = createBody();
  object.add(body);
  body.position.y = -5

  const update = (time) => {
    object.rotation.y = time * 0.0005;
  }

  return {
    object,
    update
  }
}
