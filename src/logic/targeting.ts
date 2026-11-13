// La mira: quale nemico colpire, il più vicino oppure il preferito (il capo) quando è a tiro. Logica pura, senza Phaser.
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

// preferredIndex: come nearestIndex, ma se tra i punti a tiro ce n'è uno preferito (`preferred[i]` vero)
// sceglie il più vicino tra i preferiti. È la mira del graffio: il capo, quando è a tiro, prima di chi
// gli sta intorno. Senza preferiti a tiro torna al punto più vicino.
export function preferredIndex(origin: Vec, points: readonly Vec[], preferred: readonly boolean[], maxDistance = Infinity): number {
  const indexes = points.map((_, i) => i).filter((i) => preferred[i]);
  const best = nearestIndex(origin, indexes.map((i) => points[i]), maxDistance);
  return best === -1 ? nearestIndex(origin, points, maxDistance) : indexes[best];
}
