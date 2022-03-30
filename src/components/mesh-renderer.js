import { RingBufferGeometry } from 'three';
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
        uAverageFrequency: { value: 0 },
        uColorA: { value: new Color('#7f2a91') },
        uColorB: { value: new Color('#1af5f5') },
        uColorC: { value: new Color('#f5f373') },
        uColorD: { value: new Color('#e680d8') },
        uMaxElevation: { value: 1 },
        uInverted: { value: false, }
      },
      // Used string concatenation for a more optimized build.
      vertexShader: '' +
        'uniform float uMaxElevation;' +
        'uniform float[64] uFrequency;' +
        '' +
        'varying float vT;' +
        'varying float vDistanceT;' +
        '' +
        'void main()' +
        '{' +
          'vec4 currentPosition = vec4(position, 1.0);' +
          'float distance = abs(distance(vec2(0.5, 0.5), uv));' +
          'float normalizedDistance = distance / 0.5;' +
          'int index = int(normalizedDistance * 64.0);' +
          'float t = uFrequency[index] / 255.0;' +
          'float elevation = t * uMaxElevation;' +
          'currentPosition.y += smoothstep(0.0, uMaxElevation, elevation);' +
          'gl_Position = projectionMatrix * viewMatrix * modelMatrix * currentPosition;' +
          '' +
          'vT = t;' +
          'vDistanceT = distance / 0.5;' +
        '}',
      fragmentShader: '' +
        'uniform float uAverageFrequency;' +
        'uniform bool uInverted;' +
        'uniform vec3 uColorA;' +
        'uniform vec3 uColorB;' +
        'uniform vec3 uColorC;' +
        'uniform vec3 uColorD;' +
        '' +
        'varying float vT;' +
        'varying float vDistanceT;' +
        '' +
        'void main()' +
        '{' +
          'vec3 color1 = uInverted ? uColorB : uColorC;' +
          'vec3 color2 = uInverted ? uColorC : uColorB;' +
          'vec3 gradientColor1 = mix(color1, color2, vDistanceT);' +
          'vec3 gradientColor2 = mix(gradientColor1, uColorD, uAverageFrequency / 255.0);' +
          'vec3 color = mix(uColorA, gradientColor2, vT);' +
          'gl_FragColor = vec4(color, 1.0);' +
        '}',
      side: DoubleSide
    });
    this.mesh = new Mesh(geometry, material);
    this.entity.add(this.mesh);

    frequencySubject.subscribe({
      next: ({ average, frequency }) => {
        material.uniforms.uAverageFrequency.value = average;
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
