// La minimappa: un quadrato nell'angolo con il gatto al centro. Logica pura, senza Phaser.
import type { Point } from "./chest";

// toMinimap: dove sta `point` nella minimappa, rispetto al centro, se il quadrato rappresenta `range` pixel
// di mondo per lato dal gatto e misura `half` pixel dal centro al bordo. Un punto più lontano resta sul bordo,
// nella sua direzione (inside: false): così una cassa lontana si vede lo stesso, e si sa dove andare.
export function toMinimap(cat: Point, point: Point, range: number, half: number): Point & { inside: boolean } {
  const dx = point.x - cat.x;
  const dy = point.y - cat.y;
  const far = Math.max(Math.abs(dx), Math.abs(dy)) / range;
  const scale = far > 1 ? half / (range * far) : half / range;
  // + 0 toglie lo zero negativo, che altrimenti esce per il gatto stesso
  return { x: dx * scale + 0, y: dy * scale + 0, inside: far <= 1 };
}
