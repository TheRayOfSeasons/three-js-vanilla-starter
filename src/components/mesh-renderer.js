import {
  Color,
  DoubleSide,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial
} from 'three';
import { MonoBehaviour } from 'threenity';
import {
  frequencySubject,
  invertWaves
} from '../store/music/subjects';

export class MeshRenderer extends MonoBehaviour {
  /**
   * @type {Mesh}
   */
  mesh = undefined;
  speed = 0.5;

  start() {
    const geometry = new PlaneBufferGeometry(5, 5, 128, 128);
    geometry.rotateX(Math.PI * 0.5);
    const material = new ShaderMaterial({
      uniforms: {
        uFrequency: { value: [] },
        uColorA: { value: new Color('#7f2a91') },
        uColorB: { value: new Color('#1af5f5') },
        uMaxElevation: { value: 1 },
        uInverted: { value: false, }
      },
      // Used string concatenation for a more optimized build.
      vertexShader: '' +
        'uniform float uMaxElevation;' +
        'uniform float[64] uFrequency;' +
        'uniform bool uInverted;' +
        '' +
        'varying float vT;' +
        '' +
        'void main()' +
        '{' +
          'vec4 currentPosition = vec4(position, 1.0);' +
          'float distance = abs(distance(vec2(0.5, 0.5), uv));' +
          'float normalizedDistance = distance / 0.5;' +
          'int index = int(normalizedDistance * 64.0);' +
          'int inverseIndex = 64 - index;' +
          'float t = uFrequency[uInverted ? inverseIndex : index] / 255.0;' +
          'float elevation = t * uMaxElevation;' +
          'currentPosition.y += smoothstep(0.0, uMaxElevation, elevation);' +
          'gl_Position = projectionMatrix * viewMatrix * modelMatrix * currentPosition;' +
          '' +
          'vT = t;' +
        '}',
      fragmentShader: '' +
        'uniform vec3 uColorA;' +
        'uniform vec3 uColorB;' +
        '' +
        'varying float vT;' +
        '' +
        'void main()' +
        '{' +
          'vec3 color = mix(uColorA, uColorB, vT);' +
          'gl_FragColor = vec4(color, 1.0);' +
        '}',
      side: DoubleSide
    });
    this.mesh = new Mesh(geometry, material);
    this.entity.add(this.mesh);

    frequencySubject.subscribe({
      next: ({ frequency }) => {
        material.uniforms.uFrequency.value = frequency;
        material.needsUpdate = true;
      }
    });
    invertWaves.subscribe({
      next: (invert) => {
        material.uniforms.uInverted.value = invert;
        material.needsUpdate = true;
      }
    })
  }
}
