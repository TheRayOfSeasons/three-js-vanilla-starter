import { Threenity } from 'threenity';
import { MainScene } from './scenes/main-scene';
import { setupMusicForm } from './ui/music-form';;

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

document.addEventListener('DOMContentLoaded', () => {
  setupMusicForm();
  bootstrap();
});
