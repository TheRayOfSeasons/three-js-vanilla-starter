import { EntityScene } from 'threenity';
import { Cube } from '../entities/cube';
import { MainCamera } from '../entities/main-camera';

export class MainScene extends EntityScene {
  setupEntities() {
    return [
      this.addEntity(Cube),
      this.addEntity(MainCamera)
    ]
  }
}
