import nocturne from '../../assets/nocturne.mp3';
import moonlightSonata from '../../assets/moonlight-sonata.mp3';
import mercy from '../../assets/mitis-mercy.mp3';
import shattered from '../../assets/mitis-shattered.mp3';
import whatIsLove from '../../assets/twice-what-is-love.mp3';
import toMyYouth from '../../assets/bol4-to-my-youth.mp3';
import breathe from '../../assets/lauv-breathe.mp3'
import { setMusic } from '../store/music/actions'
import {
  invertWaves,
  musicIsLoading,
  musicIsPlaying,
  playToggle
} from '../store/music/subjects';

const musicMap = {
  'nocturne': {
    sound: nocturne
  },
  'moonlight-sonata': {
    sound: moonlightSonata
  },
  'mitis-mercy': {
    sound: mercy
  },
  'mitis-shattered': {
    sound: shattered
  },
  'what-is-love': {
    sound: whatIsLove
  },
  'to-my-youth': {
    sound: toMyYouth
  },
  'breathe': {
    sound: breathe
  },
}

export const setupMusicForm = () => {
  const button = document.getElementById('play');
  const select = document.getElementById('music-selector');
  const changeMusic = () => {
    const { sound } = musicMap[select.value];
    setMusic(sound);
  };
  select.addEventListener('change', event => {
    changeMusic();
    select.blur();
  });
  button.addEventListener('click', event => {
    playToggle.next();
    changeMusic();
  });
  document.addEventListener('keyup', event => {
    if (event.code === 'Space') {
      playToggle.next();
      changeMusic();
    }
  });

  const playIcon = button.querySelector('.play-icon');
  const pauseIcon = button.querySelector('.pause-icon');
  musicIsPlaying.subscribe({
    next: (isPlaying) => {
      if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'unset';
      }
      else {
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'unset';
      }
    }
  });
  musicIsLoading.subscribe({
    next: (isLoading) => {
      button.disabled = isLoading;
    }
  });

  const invert = document.getElementById('invert');
  invert.addEventListener('click', event => {
    if (invert.checked) {
      invertWaves.next(true);
    }
    else {
      invertWaves.next(false);
    }
  })
}
