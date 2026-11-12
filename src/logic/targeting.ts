// La mira: quale nemico colpire. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// nearestIndex: l'indice del punto più vicino a origin entro maxDistance, oppure -1 se non ce n'è.
// Confronta i quadrati delle distanze: stesso ordine, senza radici quadrate.
// A parità di distanza tiene il primo della lista.
export function nearestIndex(origin: Vec, points: readonly Vec[], maxDistance = Infinity): number {
  let best = -1;
  let bestSq = maxDistance * maxDistance;
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - origin.x;
    const dy = points[i].y - origin.y;
    const sq = dx * dx + dy * dy;
    if (sq < bestSq || (best === -1 && sq <= bestSq)) {
      best = i;
      bestSq = sq;
    }
  }
  return best;
}
