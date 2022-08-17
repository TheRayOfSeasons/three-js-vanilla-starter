/**
 *
 * @param {HTMLCanvasElement} canvas
 */
 export const bootstrapStaticCanvas = async (canvas) => {
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context.font = '10rem sans-serif';
  context.fillStyle = 'white';
  context.fillText('HELLO', 10, 200);
  context.fillText('MAJESTIC', 10, 400);
}
