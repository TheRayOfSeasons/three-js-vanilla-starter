import { Entity } from 'threenity';
import { MeshRenderer } from '../components/mesh-renderer';
import { MusicPlayer } from '../components/music-player';

export class Cube extends Entity {
  setupComponents() {
    this.addComponent(MeshRenderer);
    this.addComponent(MusicPlayer);
  }
}
