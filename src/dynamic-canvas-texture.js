import GSAP from 'gsap';

/**
 *
 * @param {HTMLCanvasElement} canvas
 */
export const bootstrapDynamicCanvas = (canvas) => {
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context.beginPath();
  context.rect(10, 475, canvas.width, 150);
  context.clip();

  const clear = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  const position = { x: 10, y: 600 };
  const gap = 200;

  const values = {
    words: [
      { value: 'WORLD', currentValue: position.y - gap},
      { value: 'EARTH', currentValue: position.y},
      { value: 'UNIVERSE', currentValue: position.y + gap},
    ]
  };

  let tweens = [];
  setInterval(() => {
    for (const tween of tweens) {
      tween.kill();
    }
    tweens = [];
    for (const word of values.words) {
      if (word.currentValue >= position.y + gap) {
        word.currentValue = position.y - (gap * 2);
      }
      tweens.push(
        GSAP.to(word, { currentValue: `+=${gap}`, duration: 0.5 }),
      );
    }
  }, 1000);

  const update = (time) => {
    clear();
    context.font = '10rem sans-serif';
    context.fillStyle = 'white';
    for (const word of values.words) {
      context.fillText(word.value, position.x, word.currentValue);
    }
  }
  return { update };
}
