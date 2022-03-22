import { Subject } from 'rxjs';

export const musicUploadInitialState = {
  sound: undefined
};
export const musicUpload = new Subject();
musicUpload.next(musicUploadInitialState);

export const frequencyInitialState = {
  average: 0,
  frequency: []
};
export const frequencySubject = new Subject();
frequencySubject.next(frequencyInitialState);

export const playToggle = new Subject();

export const musicIsPlaying = new Subject();

export const musicIsLoading = new Subject();

export const invertWaves = new Subject();
