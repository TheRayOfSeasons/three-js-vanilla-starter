import * as THREE from 'three';

const createMaterial = () => {
  const material = new THREE.MeshPhongMaterial({
    color: '#2170c9',
    specular: '#ff5900',
    shininess: 30,
    opacity: 1,
    flatShading: true
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

const createGearPiece = (size) => {
  const geometry = new THREE.TorusBufferGeometry(25, 7.5, 6, 6);
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}


export const createGears = () => {
  const object = new THREE.Group();

  const gear1 = createGearPiece();
  object.add(gear1);
  const gear2 = createGearPiece();
  object.add(gear2);
  gear2.position.z = 30;
  const gear3 = createGearPiece();
  object.add(gear3);
  gear3.position.z = -30;

  object.lookAt(new THREE.Vector3(-40, 30, 50));

  const update = (time) => {
    gear1.rotation.z = Math.tan(-time * 0.0005);
    gear2.rotation.z = time * 0.0005;
    gear3.rotation.z = time * 0.0015;
  }
  return {
    object,
    update
  }
}
