/**
 * @author pschroen / https://ufo.ai/
 *
 * Based on {@link module:three/examples/jsm/objects/Reflector.js} by Slayvin
 */

 import {
  Group,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  Plane,
  Scene,
  Uniform,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  Color,
  GLSL3,
  Matrix3,
  NoBlending,
  RawShaderMaterial
} from 'three';
import { ReflectorBlurMaterial } from './ReflectorBlurMaterial.js';
import { getFullscreenTriangle } from './Utils3D.js';

export class Reflector extends Group {
  constructor({
      width = 512,
      height = 512,
      clipBias = 0,
      blurIterations = 8,
      blurFactor = 1
  } = {}) {
      super();

      this.clipBias = clipBias;
      this.blurIterations = blurIterations;

      this.reflectorPlane = new Plane();
      this.normal = new Vector3();
      this.reflectorWorldPosition = new Vector3();
      this.cameraWorldPosition = new Vector3();
      this.rotationMatrix = new Matrix4();
      this.lookAtPosition = new Vector3(0, 0, -1);
      this.clipPlane = new Vector4();

      this.view = new Vector3();
      this.target = new Vector3();
      this.q = new Vector4();

      this.textureMatrix = new Matrix4();
      this.virtualCamera = new PerspectiveCamera();

      // Uniform containing texture matrix
      this.textureMatrixUniform = new Uniform(this.textureMatrix);

      // Render targets
      this.renderTarget = new WebGLRenderTarget(width, height, {
          depthBuffer: false
      });

      this.renderTargetRead = this.renderTarget.clone();
      this.renderTargetWrite = this.renderTarget.clone();

      this.renderTarget.depthBuffer = true;

      // Uniform containing render target textures
      this.renderTargetUniform = new Uniform(this.blurIterations > 0 ? this.renderTargetRead.texture : this.renderTarget.texture);

      // Reflection blur material
      this.blurMaterial = new ReflectorBlurMaterial();
      this.blurMaterial.uniforms.uBluriness.value = blurFactor;
      this.blurMaterial.uniforms.uResolution.value.set(width, height);

      // Fullscreen triangle
      this.screenScene = new Scene();
      this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

      this.screenTriangle = getFullscreenTriangle();

      this.screen = new Mesh(this.screenTriangle, this.blurMaterial);
      this.screen.frustumCulled = false;
      this.screenScene.add(this.screen);
  }

  setSize(width, height) {
      this.renderTarget.setSize(width, height);
      this.renderTargetRead.setSize(width, height);
      this.renderTargetWrite.setSize(width, height);

      this.blurMaterial.uniforms.uResolution.value.set(width, height);
  }

  update(renderer, scene, camera) {
      this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld);
      this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

      this.rotationMatrix.extractRotation(this.matrixWorld);

      this.normal.set(0, 0, 1);
      this.normal.applyMatrix4(this.rotationMatrix);

      this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition);

      // Avoid rendering when reflector is facing away
      if (this.view.dot(this.normal) > 0) {
          return;
      }

      this.view.reflect(this.normal).negate();
      this.view.add(this.reflectorWorldPosition);

      this.rotationMatrix.extractRotation(camera.matrixWorld);

      this.lookAtPosition.set(0, 0, -1);
      this.lookAtPosition.applyMatrix4(this.rotationMatrix);
      this.lookAtPosition.add(this.cameraWorldPosition);

      this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition);
      this.target.reflect(this.normal).negate();
      this.target.add(this.reflectorWorldPosition);

      this.virtualCamera.position.copy(this.view);
      this.virtualCamera.up.set(0, 1, 0);
      this.virtualCamera.up.applyMatrix4(this.rotationMatrix);
      this.virtualCamera.up.reflect(this.normal);
      this.virtualCamera.lookAt(this.target);

      this.virtualCamera.far = camera.far; // Used in WebGLBackground

      this.virtualCamera.updateMatrixWorld();
      this.virtualCamera.projectionMatrix.copy(camera.projectionMatrix);

      // Update the texture matrix
      this.textureMatrix.set(
          0.5, 0.0, 0.0, 0.5,
          0.0, 0.5, 0.0, 0.5,
          0.0, 0.0, 0.5, 0.5,
          0.0, 0.0, 0.0, 1.0
      );

      this.textureMatrix.multiply(this.virtualCamera.projectionMatrix);
      this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse);
      this.textureMatrix.multiply(this.matrixWorld);

      // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
      // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition);
      this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse);

      this.clipPlane.set(this.reflectorPlane.normal.x, this.reflectorPlane.normal.y, this.reflectorPlane.normal.z, this.reflectorPlane.constant);

      const projectionMatrix = this.virtualCamera.projectionMatrix;

      this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
      this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
      this.q.z = -1;
      this.q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

      // Calculate the scaled plane vector
      this.clipPlane.multiplyScalar(2 / this.clipPlane.dot(this.q));

      // Replacing the third row of the projection matrix
      projectionMatrix.elements[2] = this.clipPlane.x;
      projectionMatrix.elements[6] = this.clipPlane.y;
      projectionMatrix.elements[10] = this.clipPlane.z + 1 - this.clipBias;
      projectionMatrix.elements[14] = this.clipPlane.w;

      // Render
      const currentRenderTarget = renderer.getRenderTarget();

      const currentXrEnabled = renderer.xr.enabled;
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

      renderer.xr.enabled = false; // Avoid camera modification
      renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

      renderer.setRenderTarget(this.renderTarget);

      // Make sure the depth buffer is writable so it can be properly cleared, see mrdoob/three.js#18897
      renderer.state.buffers.depth.setMask(true);

      if (renderer.autoClear === false) {
          renderer.clear();
      }

      renderer.render(scene, this.virtualCamera);

      // Blur reflection
      const blurIterations = this.blurIterations;

      for (let i = 0; i < blurIterations; i++) {
          if (i === 0) {
              this.blurMaterial.uniforms.tMap.value = this.renderTarget.texture;
          } else {
              this.blurMaterial.uniforms.tMap.value = this.renderTargetRead.texture;
          }

          const radius = (blurIterations - i - 1) * 0.5;
          this.blurMaterial.uniforms.uDirection.value.set(
              i % 2 === 0 ? radius : 0,
              i % 2 === 0 ? 0 : radius
          );

          renderer.setRenderTarget(this.renderTargetWrite);

          if (renderer.autoClear === false) {
              renderer.clear();
          }

          renderer.render(this.screenScene, this.screenCamera);

          // Swap render targets
          const temp = this.renderTargetRead;
          this.renderTargetRead = this.renderTargetWrite;
          this.renderTargetWrite = temp;

          this.renderTargetUniform.value = this.renderTargetRead.texture;
      }

      // Restore renderer settings
      renderer.xr.enabled = currentXrEnabled;
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

      renderer.setRenderTarget(currentRenderTarget);
  }

  destroy() {
      this.renderTargetWrite.dispose();
      this.renderTargetRead.dispose();
      this.renderTarget.dispose();
      this.blurMaterial.dispose();
      this.screenTriangle.dispose();

      for (const prop in this) {
          this[prop] = null;
      }

      return null;
  }
}

const vertexShader = `
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 uMapTransform;
uniform mat4 uMatrix;
out vec2 vUv;
out vec4 vCoord;
void main() {
    vUv = (uMapTransform * vec3(uv, 1.0)).xy;
    vCoord = uMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const blendOverlay = `
float blendOverlay(float x, float y) {
    return (x < 0.5) ? (2.0 * x * y) : (1.0 - 2.0 * (1.0 - x) * (1.0 - y));
}
vec4 blendOverlay(vec4 x, vec4 y, float opacity) {
    vec4 z = vec4(blendOverlay(x.r, y.r), blendOverlay(x.g, y.g), blendOverlay(x.b, y.b), blendOverlay(x.a, y.a));
    return z * opacity + x * (1.0 - opacity);
}
`;

const random = `
float random(vec2 co) {
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}
`;

const dither = `
${random}
vec3 dither(vec3 color) {
    // Calculate grid position
    float grid_position = random(gl_FragCoord.xy);
    // Shift the individual colors differently, thus making it even harder to see the dithering pattern
    vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);
    // Modify shift acording to grid position
    dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);
    // Shift the color by dither_shift
    return color + dither_shift_RGB;
}
`;

const fragmentShader = `
precision highp float;
uniform sampler2D tMap;
uniform sampler2D tReflect;
uniform vec3 uColor;
#ifdef USE_FOG
    uniform vec3 uFogColor;
    uniform float uFogNear;
    uniform float uFogFar;
#endif
in vec2 vUv;
in vec4 vCoord;
out vec4 FragColor;
${blendOverlay}
${dither}
void main() {
    vec4 base = texture(tMap, vUv);
    vec4 blend = textureProj(tReflect, vCoord);
    FragColor = base * blend;
    base = FragColor;
    blend = vec4(uColor, 1.0);
    FragColor = blendOverlay(base, blend, 1.0);
    #ifdef USE_FOG
        float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);
        FragColor.rgb = mix(FragColor.rgb, uFogColor, fogFactor);
    #endif
    #ifdef DITHERING
        FragColor.rgb = dither(FragColor.rgb);
    #endif
    FragColor.a = 1.0;
}
`;;

export class ReflectorMaterial extends RawShaderMaterial {
    constructor({
        color = new Color(0x7f7f7f),
        map = null,
        fog = null,
        dithering = false
    } = {}) {
        const parameters = {
            glslVersion: GLSL3,
            defines: {
            },
            uniforms: {
                tMap: new Uniform(null),
                tReflect: new Uniform(null),
                uMapTransform: new Uniform(new Matrix3()),
                uMatrix: new Uniform(new Matrix4()),
                uColor: new Uniform(color instanceof Color ? color : new Color(color))
            },
            vertexShader,
            fragmentShader,
            blending: NoBlending
        };

        if (map) {
            map.updateMatrix();

            parameters.uniforms = Object.assign(parameters.uniforms, {
                tMap: new Uniform(map),
                uMapTransform: new Uniform(map.matrix)
            });
        }

        if (fog) {
            parameters.defines = Object.assign(parameters.defines, {
                USE_FOG: ''
            });

            parameters.uniforms = Object.assign(parameters.uniforms, {
                uFogColor: new Uniform(fog.color),
                uFogNear: new Uniform(fog.near),
                uFogFar: new Uniform(fog.far)
            });
        }

        if (dithering) {
            parameters.defines = Object.assign(parameters.defines, {
                DITHERING: ''
            });
        }

        super(parameters);
    }
}