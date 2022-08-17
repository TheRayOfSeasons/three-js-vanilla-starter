import * as THREE from 'three';
import { snoise } from './shaders';

const SCALE = 0.02;

/**
 * @typedef {Object} CreateElementMeshProps
 * @property {HTMLElement} source
 * @property {THREE.WebGLRenderer} renderer
 * @property {Number} scale
 */

/**
 * 
 * @param {CreateElementMeshProps} param0 
 */
export const createColorfulElementMesh = async ({ source, renderer, scale=SCALE }) => {
  const texture = new THREE.CanvasTexture(source);
  const textGeometry = new THREE.PlaneBufferGeometry(window.innerWidth * scale, window.innerHeight * scale);
  const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMix: { value: 0 },
      uSpeed: { value: 0.15 },
      uTime: { value: 0 },
      uZoom: { value: 2 },
      uLowColor: { value: new THREE.Color('#F20089') },
      uHighColor: { value: new THREE.Color('#0458FF') },
      uMousePosition: { value: new THREE.Vector2() },
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(
        renderer.domElement.width,
        renderer.domElement.height
      )}
    },
    vertexShader: `
      varying vec2 vUv;

      void main()
      {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uMix;
      uniform float uSpeed;
      uniform float uTime;
      uniform float uZoom;
      uniform vec2 uMousePosition;
      uniform vec2 uResolution;
      uniform vec3 uLowColor;
      uniform vec3 uHighColor;
      uniform sampler2D uTexture;

      varying vec2 vUv;

      ${snoise}

      void useSnoise(vec2 uv, float time)
      {
        float t = time;
        float s1 = snoise(uv + t/2.0 + snoise(uv + snoise(uv + t/4.0) / 10.0));
        float s2 = snoise(uv + s1);
        vec3 color = mix(uLowColor, uHighColor, s1);

        vec3 color1 = vec3(
          clamp(color.r, 0.0, 1.0),
          s2,
          clamp(color.b, 0.75, 1.0)
        );
        vec3 color2 = vec3(
          s2,
          clamp(color.g, 0.0, 1.0),
          clamp(color.b, 0.75, 1.0)
        );
        vec3 finalColor = mix(color1, color2, uMix);

        gl_FragColor = vec4(finalColor, 1.0);
      }

      void main()
      {
        vec4 color = texture2D(uTexture, vUv);
        if (length(color.rgb) <= 0.0) discard;

        // screen based uv
        vec2 uv = gl_FragCoord.xy / uResolution;
        uv *= uZoom;
        float time = uTime * 0.0005;
        useSnoise(uv, time);
      }
    `
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  source.style.display = 'none';

  window.addEventListener('resize', event => {
    textMaterial.uniforms.uResolution.set(
      renderer.domElement.width,
      renderer.domElement.height 
    );
  });

  return {
    object: textMesh,
    update: (time) => {
      texture.needsUpdate = true;
      textMaterial.uniforms.uTime.value = time;
    }
  };
}
