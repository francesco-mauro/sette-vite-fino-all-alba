// La spinta del miagolio: chi è vicino al gatto viene allontanato. Logica pura, senza Phaser.
import type { Vec } from "./movement";

// inReach: vero se `point` è dentro l'onda, cioè entro `radius` da `origin`, bordo compreso.
export function inReach(origin: Vec, point: Vec, radius: number): boolean {
  return Math.hypot(point.x - origin.x, point.y - origin.y) <= radius;
}

// knockback: la velocità (pixel al secondo) con cui `point` viene spinto via da `origin`, tale da fargli fare
// `distance` pixel in `ms` millisecondi. null se non c'è spinta: `point` è oltre `radius`, oppure distanza o tempo
// non sono positivi (una distanza zero è il modo di dire «questo non si sposta», come per i capi).
// Chi sta esattamente sopra l'origine non ha una direzione: viene spinto a destra, invece di restare fermo.
export function knockback(origin: Vec, point: Vec, radius: number, distance: number, ms: number): Vec | null {
  if (distance <= 0 || ms <= 0) return null;
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  if (!inReach(origin, point, radius)) return null;
  const length = Math.hypot(dx, dy);
  const speed = (distance / ms) * 1000;
  if (length === 0) return { x: speed, y: 0 };
  return { x: (dx / length) * speed, y: (dy / length) * speed };
}
