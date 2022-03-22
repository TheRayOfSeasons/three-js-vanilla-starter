import { musicUpload, musicUploadInitialState } from './subjects';

export const setMusic = (sound) => {
  musicUpload.next({
    sound
  });
}

export const unsetMusic = () => {
  musicUpload.next(musicUploadInitialState);
}
