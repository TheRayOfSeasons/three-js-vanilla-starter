import { AudioAnalyser, Audio, AudioLoader } from 'three';
import { MonoBehaviour } from 'threenity';
import { listener } from '../misc/audioListener';
import {
  frequencySubject,
  musicIsLoading,
  musicIsPlaying,
  musicUpload,
  playToggle
} from '../store/music/subjects';

export class MusicPlayer extends MonoBehaviour {
  music = undefined;
  fftSize = 512;
  /**
   * @type {Audio}
   */
  musicPlayer = null;
  loader = new AudioLoader();
  volume = 0.5;
  /**
   * @type {AudioAnalyser}
   */
  analyser = null;

  play() {
    musicIsLoading.next(true);
    if (this.musicPlayer.source) {
      this.musicPlayer.stop();
    }
    this.loader.load(this.music, (buffer) => {
      this.musicPlayer.setBuffer(buffer);
      this.musicPlayer.setLoop(true);
      this.musicPlayer.play();
      this.musicPlayer.setVolume(this.volume);
      musicIsPlaying.next(true);
      musicIsLoading.next(false);
    });
  }

  start() {
    this.musicPlayer = new Audio(listener);
    this.analyser = new AudioAnalyser(this.musicPlayer, this.fftSize);
    musicUpload.subscribe({
      next: ({ sound }) => {
        if (sound === this.music) {
          return;
        }
        this.music = sound;
        if (this.music) {
          this.play();
        }
      }
    });
    playToggle.subscribe({
      next: () => {
        if (!this.music) {
          return;
        }
        if (this.musicPlayer.isPlaying) {
          this.musicPlayer.pause();
          musicIsPlaying.next(false);
        }
        else {
          this.musicPlayer.play();
          musicIsPlaying.next(true);
        }
      }
    });
  }

  update() {
    frequencySubject.next({
      average: this.analyser.getAverageFrequency(),
      frequency: this.analyser.getFrequencyData()
    });
  }
}
