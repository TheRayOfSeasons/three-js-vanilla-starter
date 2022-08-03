import './style.css';
import GSAP from 'gsap';
import * as THREE from 'three';

const applyEffect = (canvas, mainImgId) => {
  let hoverLevel = {
    value: 0
  };

  let canvasHeight = canvas.parentElement.clientHeight;
  let canvasWidth = canvas.parentElement.clientWidth;

  // renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.setClearColor(0x000000, 1.0);
  renderer.setPixelRatio( window.devicePixelRatio );

  // scene
  const scene = new THREE.Scene();

  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight
  );
  camera.position.z = 1;

  const textureLoader = new THREE.TextureLoader();

  const imageElement = document.getElementById(mainImgId);
  const imageUrl = imageElement.getAttribute('src');
  const image = textureLoader.load(imageUrl);

  const geometry = new THREE.PlaneBufferGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uImage: { value: image },
      uHoverLevel: { value: hoverLevel.value },
      uZoomLevel: { value: 0.25 },
      uResolution: { value: new THREE.Vector2(
        renderer.domElement.width,
        renderer.domElement.height
      ) },
    },
    vertexShader: `
      void main()
      {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uHoverLevel;
      uniform float uZoomLevel;
      uniform sampler2D uImage;
      uniform vec2 uResolution;

      float exponentialInOut(float t)
      {
        return t == 0.0 || t == 1.0
          ? t
          : t < 0.5
            ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
            : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
      }

      void main()
      {
        vec2 uv = gl_FragCoord.xy / uResolution;

        float zoomLevel = uZoomLevel;
        float progress = uHoverLevel * 0.75;
        float hoverLevel = exponentialInOut(min(1., (distance(vec2(.5), uv) * progress) + progress));

        uv *= 1. - zoomLevel * hoverLevel;
        uv += zoomLevel / 2. * hoverLevel;
        uv = clamp(uv, 0., 1.);

        vec4 color = texture2D(uImage, uv);
        if (hoverLevel > 0.) {
          hoverLevel = 1.-abs(hoverLevel-.5)*2.;
          // pixel displace
          uv.y += color.r * hoverLevel * .05;
          color = texture2D(uImage, uv);
          // RGBshift
          color.r = texture2D(uImage, uv+(hoverLevel)*0.01).r;
          color.g = texture2D(uImage, uv-(hoverLevel)*0.01).g;
        }

        gl_FragColor = color;
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  canvas.addEventListener('mouseover', event => {
    GSAP.to(hoverLevel, { value: 1, duration: 1.5 });
  });
  canvas.addEventListener('mouseleave', event => {
    GSAP.to(hoverLevel, { value: 0, duration: 1.5 });
  });

  renderer.setAnimationLoop(time => {
    material.uniforms.uHoverLevel.value = hoverLevel.value;
    renderer.render(scene, camera);
  });

  // handle responsiveness
  window.addEventListener('resize', event => {
    canvasHeight = canvas.parentElement.clientHeight;
    canvasWidth = canvas.parentElement.clientWidth;
    camera.aspect = canvasWidth / canvasHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      canvasWidth,
      canvasHeight
    );
    material.uniforms.uResolution.value = new THREE.Vector2(
      renderer.domElement.width,
      renderer.domElement.height
    );
  });
}

applyEffect(document.getElementById('app-1'), 'img-1');
applyEffect(document.getElementById('app-2'), 'img-2');
