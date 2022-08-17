import anime from 'animejs';
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

const createMainOrb = (radius) => {
  const geometry = new THREE.SphereBufferGeometry(radius, 32, 16);
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

const createRing = (radius, detail) => {
  const geometry = new THREE.TorusBufferGeometry(radius, 1, 4, detail);
  geometry.rotateY(Math.PI * 0.5);
  const material = createMaterial(THREE.DoubleSide);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

export const createOrb = () => {
  const object = new THREE.Object3D();

  const orb = createMainOrb(3);
  object.add(orb);
  object.lookAt(-2, 0, 2);

  const timeline = anime.timeline({
    autoplay: false,
    easing: 'easeInOutSine',
    complete: (anim) => {
      timeline.play();
    }
  })

  const rings = [
    createRing(4, 18),
    createRing(6, 18),
    createRing(8, 18),
    createRing(10, 24),
    createRing(12, 24),
    createRing(14, 24),
    createRing(16, 32),
    createRing(18, 32),
    createRing(20, 32),
    createRing(22, 32),
    createRing(24, 32),
    createRing(26, 64),
    createRing(28, 64),
    createRing(30, 64),
    createRing(32, 64),
    createRing(34, 64),
    createRing(36, 64),
    createRing(38, 64),
  ];
  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    object.add(ring);
    timeline.add({
      targets: ring.rotation,
      z: Math.PI * 4,
      duration: 7000,
    }, 100 * i);
  }
  timeline.play();

  const scale = 1.25;
  object.scale.set(scale, scale, scale);
  const update = (time) => {
    object.rotation.y = time * 0.0005;
  }
  return {
    object,
    update
  }
}
