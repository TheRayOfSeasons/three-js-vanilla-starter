import { GLSL3, NoBlending, RawShaderMaterial, Uniform } from 'three';

const vertexShader = `
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
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
uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform sampler2D tBlur4;
uniform sampler2D tBlur5;
uniform float uBloomFactors[NUM_MIPS];
in vec2 vUv;
out vec4 FragColor;
${dither}
void main() {
    FragColor = uBloomFactors[0] * texture(tBlur1, vUv) +
                uBloomFactors[1] * texture(tBlur2, vUv) +
                uBloomFactors[2] * texture(tBlur3, vUv) +
                uBloomFactors[3] * texture(tBlur4, vUv) +
                uBloomFactors[4] * texture(tBlur5, vUv);
    #ifdef DITHERING
        FragColor.rgb = dither(FragColor.rgb);
    #endif
}
`;

export class BloomCompositeMaterial extends RawShaderMaterial {
    constructor({
        dithering
    } = {}) {
        super({
            glslVersion: GLSL3,
            defines: {
                NUM_MIPS: 5,
                DITHERING: dithering
            },
            uniforms: {
                tBlur1: new Uniform(null),
                tBlur2: new Uniform(null),
                tBlur3: new Uniform(null),
                tBlur4: new Uniform(null),
                tBlur5: new Uniform(null),
                uBloomFactors: new Uniform(null)
            },
            vertexShader,
            fragmentShader,
            blending: NoBlending,
            depthWrite: false,
            depthTest: false
        });
    }
}
