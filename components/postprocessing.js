import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

export const getComposer = (scene, camera, renderer) => {
  const composer = new EffectComposer(renderer);
  
  const renderPass = new RenderPass(scene, camera);
  const unrealBloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1,
    0,
    0
  );
  const smaaPass = new SMAAPass();
  
  composer.addPass(renderPass);
  composer.addPass(unrealBloomPass);
  composer.addPass(smaaPass);

  return composer;
}

