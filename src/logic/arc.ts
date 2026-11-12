// L'arco della coda a frusta: chi sta davanti al gatto, entro un raggio. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// inArc: vero se `point` è entro `radius` da `origin` e dentro l'arco largo `halfAngle` per parte
// intorno alla direzione `facing` (in radianti, 0 = destra, come in Phaser).
// La differenza tra due angoli si riporta tra -π e π: senza, a sinistra (π e -π sono la stessa direzione)
// un nemico appena sotto sembrerebbe lontanissimo dall'arco.
export function inArc(origin: Vec, facing: number, halfAngle: number, radius: number, point: Vec): boolean {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  if (dx * dx + dy * dy > radius * radius) return false;
  const angle = Math.atan2(dy, dx);
  let diff = angle - facing;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  return Math.abs(diff) <= halfAngle;
}
