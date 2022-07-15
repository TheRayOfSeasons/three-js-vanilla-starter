import * as THREE from 'three';
import { shaderUtils } from './shaderUtils';

const morpher = {
  uniforms: `
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uDensity;
    uniform float uStrength;
    uniform float uTime;
  `,
  main: `
    float distortion = (pnoise(normal * uDensity + uTime, vec3(10.)) * uStrength);
    
    vec3 pos = position + (normal * distortion);
    float angle = sin((uv.y * uFrequency) + uTime) * uAmplitude;
    pos = rotateY(pos, angle);    
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  `
};

const gridShaderSnippets = {
  out: `
    out vec3 vWorldPosition;
    out vec3 vNorm;
    out vec3 vScale;
    out vec3 vColor;
  `,
  main: `
    vec4 mvPosition = vec4( position, 1.0 );
    #ifdef USE_INSTANCING
      mvPosition = instanceMatrix * mvPosition;
    #endif

    vec4 worldPosition = (modelMatrix * mvPosition);
    
    mat4 cm = modelMatrix;
    float scaleX = sqrt(cm[0][0]*cm[0][0] + cm[0][1]*cm[0][1] + cm[0][2]*cm[0][2]);
    float scaleY = sqrt(cm[1][0]*cm[1][0] + cm[1][1]*cm[1][1] + cm[1][2]*cm[1][2]);
    float scaleZ = sqrt(cm[2][0]*cm[2][0] + cm[2][1]*cm[2][1] + cm[2][2]*cm[2][2]);
    vScale = vec3(scaleX, scaleY, scaleZ);

    vWorldPosition = (mvPosition).xyz;
    vNorm = normal;
    #ifdef USE_COLOR
      vColor = color.rgb;
    #endif

    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
  `,
  position: `
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
  `,
  fragmentShader: `
    layout(location = 0) out vec4 pc_FragColor;
    in vec3 vWorldPosition;
    in vec3 vNorm;
    in vec3 vColor;
    in vec3 vScale;

    uniform float uSize1;
    uniform vec3 uColor;
    uniform vec3 uLineColor;
    #include <common>

    float grid_tri_mapping(float size) {

      float scale = 1.0;
      vec3 coord = vWorldPosition / scale * vScale;

      vec3 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(min(grid.x, grid.y), grid.z);

      return  min(line, 1.0);

      return 1.0 - min(line, 1.0);

    }

    void main() {
        float d = 1.0 - min(distance(cameraPosition.xz, vWorldPosition.xz) / 200., 1.0);
        float g1 = grid_tri_mapping(uSize1);

        vec3 col = uColor.rgb;
        vec3 diffuse = uLineColor;

        pc_FragColor = vec4(mix(diffuse, col, g1 * pow(d, 3.0)), 1.);

        pc_FragColor.rgb = mix(pc_FragColor.rgb, vec3(0.), saturate(vNorm.g) * .05);
        pc_FragColor.a = 1.;
    }
  `
}


const gridUniforms = {
  uSize1: { value: 10 },
  uColor: { value: new THREE.Color('#000000') },
  uLineColor: { value: new THREE.Color('#ffffff') },
};

const morphUniforms = {
  uFrequency: { value: 2.04 },
  uAmplitude: { value: 1.8 },
  uDensity: { value: 2.04 },
  uStrength: { value: 1.8 },
  uTime: { value: 0 }
};

export const GridMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    THREE.UniformsLib.fog,
    gridUniforms,
  ]),
  vertexShader: `
    #include <common>

    ${gridShaderSnippets.out}

    void main() {
      ${gridShaderSnippets.main}
      ${gridShaderSnippets.position}
    }
  `,
  fragmentShader: gridShaderSnippets.fragmentShader,
  transparent: false,
  lights: true,
  extensions: {
    derivatives: true
  },
  glslVersion: THREE.GLSL3,
});

export const MorphedGridMaterial = new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    THREE.UniformsLib.fog,
    gridUniforms,
    morphUniforms
  ]),
  vertexShader: `
    #include <common>

    ${gridShaderSnippets.out}
    ${morpher.uniforms}

    ${shaderUtils}

    void main() {
      ${gridShaderSnippets.main}
      ${morpher.main}
    }
  `,
  fragmentShader: gridShaderSnippets.fragmentShader,
  transparent: false,
  lights: true,
  extensions: {
    derivatives: true
  },
  glslVersion: THREE.GLSL3,
});
