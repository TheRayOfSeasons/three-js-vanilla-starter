import * as THREE from 'three';

// Reference: https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_drawrange.html
export const createLines = () => {
  const object = new THREE.Object3D();

  const parameters = {
    radius: 800,
    minDistance: 400,
    limitConnections: false,
    maxConnections: 1,
    particleCount: 35,
    maxParticleCount: 100,
    showHelper: false
  };

  const radiusHalf = parameters.radius / 2;
  const segments = parameters.maxParticleCount * parameters.maxParticleCount;
  const positions = new Float32Array(segments * 3);
  const colors = new Float32Array(segments * 3);
  const colorMix = new Float32Array(segments * 3);

  const material = new THREE.LineBasicMaterial({
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  material.onBeforeCompile = shader => {
    shader.uniforms.uLowColor = { value: new THREE.Color('#0458FF') };
    shader.uniforms.uHighColor = { value: new THREE.Color('#7209B7') };
    shader.uniforms.uRadius = { value: parameters.radius };
    shader.uniforms.uGradientDirection = { value: new THREE.Vector2(1, -1) };
    shader.vertexShader = shader.vertexShader.replace('void main() {', `
      attribute float colorMix;

      uniform float uRadius;
      uniform vec2 uGradientDirection;

      varying float vColorMix;
      varying float vDistance;

      void main() {
    `);
    shader.vertexShader = shader.vertexShader.replace('}', `
      float halfRadius = uRadius * 0.5;
      vec2 gradient = vec2(halfRadius * uGradientDirection.x, halfRadius * uGradientDirection.y);
      vColorMix = colorMix;
      vDistance = distance(vec2(position.xy), gradient) / uRadius;
    }`);
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `
      uniform float uRadius;
      uniform vec3 uLowColor;
      uniform vec3 uHighColor;

      varying float vColorMix;
      varying float vDistance;

      void main() {
    `);
    shader.fragmentShader = shader.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
      vec3 color = mix(uLowColor, uHighColor, vDistance);
      vec4 diffuseColor = vec4(color, vColorMix * vDistance);
    `);
  }

  const geometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(segments * 3);

  const particlesData = [];
  for (let i = 0; i < parameters.maxParticleCount; i++) {
    const x = Math.random() * parameters.radius - parameters.radius / 2;
    const y = Math.random() * parameters.radius - parameters.radius / 2;
    const z = Math.random() * parameters.radius - parameters.radius / 2;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particlesData.push({
      velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
      numConnections: 0
    });
  }

  if (parameters.showHelper) {
    const helper = new THREE.BoxHelper( new THREE.Mesh(new THREE.BoxGeometry(parameters.radius, parameters.radius, 0)));
    helper.material.color.setHex(0x101010);
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    object.add(helper);
  }

  geometry.setDrawRange(0, parameters.particleCount);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('colorMix', new THREE.BufferAttribute(colorMix, 1).setUsage(THREE.DynamicDrawUsage));
  geometry.computeBoundingSphere();
  geometry.setDrawRange(0, 0);

  const linesMesh = new THREE.LineSegments(geometry, material);
  object.add(linesMesh);

  const update = time => {
    let vertexpos = 0;
    let colorpos = 0;
    let colorMixPos = 0;
    let numConnected = 0;

    for (let i = 0; i < parameters.particleCount; i++) {
      particlesData[i].numConnections = 0;
    }

    for (let i = 0; i < parameters.particleCount; i++) {
      const particleData = particlesData[ i ];

      particlePositions[i * 3] += particleData.velocity.x;
      particlePositions[i * 3 + 1] += particleData.velocity.y;
      particlePositions[i * 3 + 2] += particleData.velocity.z;

      if (particlePositions[i * 3 + 1] < - radiusHalf || particlePositions[i * 3 + 1] > radiusHalf)
        particleData.velocity.y = - particleData.velocity.y;

      if (particlePositions[i * 3] < - radiusHalf || particlePositions[i * 3] > radiusHalf)
        particleData.velocity.x = - particleData.velocity.x;

      if (particlePositions[i * 3 + 2] < - radiusHalf || particlePositions[i * 3 + 2] > radiusHalf)
        particleData.velocity.z = - particleData.velocity.z;

      for ( let j = i + 1; j < parameters.particleCount; j ++ ) {

        const particleDataB = particlesData[ j ];
        if (parameters.limitConnections && particleDataB.numConnections >= parameters.maxConnections)
          continue;

        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if ( distance < parameters.minDistance ) {
          particleData.numConnections++;
          particleDataB.numConnections++;

          const alpha = 1.0 - distance / parameters.minDistance;

          positions[vertexpos++] = particlePositions[i * 3];
          positions[vertexpos++] = particlePositions[i * 3 + 1];
          positions[vertexpos++] = 0;

          positions[vertexpos++] = particlePositions[j * 3];
          positions[vertexpos++] = particlePositions[j * 3 + 1];
          positions[vertexpos++] = 0;

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          colorMix[colorMixPos++] = alpha;
          colorMix[colorMixPos++] = alpha;
          numConnected++;
        }
      }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;
    linesMesh.geometry.attributes.colorMix.needsUpdate = true;
  }

  return {
    object,
    update
  }
}
