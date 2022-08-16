import * as THREE from 'three';
import html2canvas from 'html2canvas';

const SCALE = 0.02;

/**
 * @typedef {Object} CreateElementMeshProps
 * @property {HTMLElement} source
 * @property {HTMLElement} appendTo
 * @property {String} id
 */

/**
 * 
 * @param {CreateElementMeshProps} param0 
 */
export const createElementMesh = async ({ source, appendTo, id, scale=SCALE }) => {
  const canvas = await html2canvas(source);
  appendTo.textContent = '';
  appendTo.appendChild(canvas);
  canvas.id = id;

  const textGeometry = new THREE.PlaneBufferGeometry(window.innerWidth * scale, window.innerHeight * scale);
  const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: new THREE.CanvasTexture(canvas) },
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
      uniform sampler2D uTexture;

      varying vec2 vUv;

      void main()
      {
        vec4 color = texture2D(uTexture, vUv);
        if (length(color.rgb) <= 0.0) discard;
        gl_FragColor = color;
      }
    `
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  source.style.display = 'none';
  return textMesh;
}
