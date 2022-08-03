import * as THREE from 'three';
import { Entity } from './entity';

export class Particles extends Entity {
  parameters = {
    count: 8000,
    initialSpread: {
      x: 10,
      y: 10,
      z: 10
    }
  }

  constructor(parameters) {
    super();
    if (parameters) {
      this.parameters = parameters;
    }
  }

  start() {
    const geometry = new THREE.BufferGeometry();

    const positions = [];
    for (let i = 0; i < this.parameters.count; i++) {
      const i3 = i * 3;
      const x = i3;
      const y = i3 + 1;
      const z = i3 + 2;

      positions[x] = (Math.random() - 0.5) * this.parameters.initialSpread.x;
      positions[y] = (Math.random() - 0.5) * this.parameters.initialSpread.y;
      positions[z] = (Math.random() - 0.5) * this.parameters.initialSpread.z;
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: '#0033ff',
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    // this.material = new THREE.ShaderMaterial({
    //   uniforms: {
    //     uTime: { value: 0 },
    //     uPointOfMass: { value: new THREE.Vector3(0, 0, 0 ) },
    //     uIsActive: { value: 1 },
    //     uIsRunning: { value: 0 },
    //     uColor: { value: new THREE.Color('#0033ff') }
    //   },
    //   vertexShader: `
    //     #define EPSILON 0.001
    //     const float DRAG_COEF = log(0.998) * 176.0; // log(0.70303228048)

    //     struct Particle
    //     {
    //         vec3 Position;
    //         vec3 Velocity;
    //     };

    //     uniform float uTime;
    //     uniform vec3 pointOfMass;
    //     uniform float isActive;
    //     uniform float isRunning;

    //     varying vec4 vColor;

    //     void main()
    //     {
    //         vec3 toMass = pointOfMass - position;

    //         /// Implementation of Newton's law of gravity
    //         float G = 1.0; // gravitational constant 
    //         float m1_m2 = 176.0; // mass of both objects multiplied
    //         float rSquared = max(dot(toMass, toMass), EPSILON * EPSILON); // distance between objects squared
    //         float force = G * ((m1_m2) / rSquared);
            
    //         // acceleration = toMass * force. Technically toMass would have to be normalized but feels better without
    //         vec3 acceleration = toMass * force * isRunning * isActive;

    //         vec3 velocity;
    //         vec3 currentPosition = position;

    //         velocity *= mix(1.0, exp(DRAG_COEF * uTime), isRunning); // https://stackoverflow.com/questions/61812575/which-formula-to-use-for-drag-simulation-each-frame
    //         currentPosition += (uTime * velocity + 0.5 * acceleration * uTime * uTime) * isRunning; // Euler integration
    //         velocity += acceleration * uTime;

    //         float red = 0.0045 * dot(velocity, velocity);
    //         float green = clamp(0.08 * max(velocity.x, max(velocity.y, velocity.z)), 0.2, 0.5);
    //         float blue = 0.7 - red;

    //         vColor = vec4(red, green, blue, 0.25);
    //         gl_PointSize = 2.0;
    //         gl_Position = projectionMatrix * modelViewMatrix * vec4(currentPosition, 1.0);
    //         // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //     }
    //   `,
    //   fragmentShader: `
    //     uniform vec3 uColor;

    //     varying vec4 vColor;
        
    //     void main()
    //     {
    //         gl_FragColor = vec4(uColor, 1.0);
    //     }
    //   `,
    //   blending: THREE.AdditiveBlending
    // });

    const points = new THREE.Points(geometry, this.material);
    this.add(points);
  }

  update(time) {
    // this.material.uniforms.uPointOfMass.value.x = Math.sin(time) * 10.;
    // console.log(this.material.uniforms.uPointOfMass.value.x);
    // this.material.uniforms.uTime.value = time * 0.001;
  }
}
