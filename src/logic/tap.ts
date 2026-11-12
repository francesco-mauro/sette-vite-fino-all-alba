// Il tocco sulle carte: vale solo se lo stesso dito si appoggia e si alza sulla stessa carta.
// Un dito che era già sullo schermo quando le carte compaiono (il pollice sul joystick) non ha
// un "giù" registrato, quindi quando si alza non sceglie niente.

export interface TapGuard {
  down(pointerId: number, target: number): void;
  up(pointerId: number, target: number): boolean;
}

export function createTapGuard(): TapGuard {
  const pressed = new Map<number, number>();
  return {
    down(pointerId, target) {
      pressed.set(pointerId, target);
    },
    up(pointerId, target) {
      const start = pressed.get(pointerId);
      pressed.delete(pointerId);
      return start === target;
    },
  };
}
