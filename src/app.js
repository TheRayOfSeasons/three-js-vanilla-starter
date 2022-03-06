import { Threenity } from 'threenity';
import { MainScene } from './scenes/main-scene';

function bootstrap() {
  const canvas = document.getElementById('app');
  const app = new Threenity({
    canvas,
  });
  app.registerScenes([
    MainScene
  ]);
  app.start();
}

bootstrap();
