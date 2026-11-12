// Il movimento: dalla tastiera o dal joystick a un vettore di direzione, e l'inseguimento dei nemici.
// Logica pura, senza Phaser: la scena moltiplica il vettore per la velocità.

export interface Vec {
  x: number;
  y: number;
}

export interface Arrows {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

// clampToUnit: un vettore più lungo di 1 viene accorciato a 1, uno più corto resta com'è.
// È il motivo per cui il gatto in diagonale non va più veloce: destra più su fa (1, -1),
// lungo 1,41. Accorciato a 1 diventa (0,71, -0,71), la stessa velocità di una freccia sola.
export function clampToUnit(x: number, y: number): Vec {
  const len = Math.hypot(x, y);
  if (len <= 1) return { x, y };
  return { x: x / len, y: y / len };
}

// keyboardVector: le frecce (o WASD) premute diventano una direzione. In Phaser la y cresce verso il basso.
export function keyboardVector(arrows: Arrows): Vec {
  const x = Number(arrows.right) - Number(arrows.left);
  const y = Number(arrows.down) - Number(arrows.up);
  return clampToUnit(x, y);
}

// Sotto questa frazione del raggio il dito è "fermo": un tremolio non sposta il gatto.
export const JOYSTICK_DEAD_ZONE = 0.15;

// joystickVector: il joystick che compare dove si appoggia il pollice.
// start è dove il dito ha toccato, current dov'è adesso; radius è quanto serve spingere per la velocità piena.
export function joystickVector(start: Vec, current: Vec, radius: number): Vec {
  const x = (current.x - start.x) / radius;
  const y = (current.y - start.y) / radius;
  if (Math.hypot(x, y) < JOYSTICK_DEAD_ZONE) return { x: 0, y: 0 };
  return clampToUnit(x, y);
}

// chase: la velocità di un nemico che va dritto verso il bersaglio.
export function chase(from: Vec, to: Vec, speed: number): Vec {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: 0, y: 0 };
  return { x: (dx / len) * speed, y: (dy / len) * speed };
}
