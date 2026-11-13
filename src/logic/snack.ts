// Il supplì a terra: quando un nemico eliminato ne lascia uno, e quando il gatto lo mangia. Logica pura, senza Phaser.
import type { Health } from "./health";

// dropsSnack: un nemico eliminato lascia un supplì se il dado (`roll`, tra 0 e 1) esce sotto `chance` e
// dall'ultimo supplì caduto (`lastDropAt`, in millisecondi di gioco) sono passati almeno `minGapMs`.
// La pausa tiene ferma la cura quando i nemici diventano tanti: senza, a fine notte ne pioverebbero.
// Per il primo della notte `lastDropAt` è -Infinity: non aspetta niente.
export function dropsSnack(roll: number, chance: number, now: number, lastDropAt: number, minGapMs: number): boolean {
  return now - lastDropAt >= minGapMs && roll < chance;
}

// isHungry: il gatto mangia il supplì solo se gli mancano almeno `minMissing` punti di vita.
// A vita piena, o per un graffietto, il supplì resta a terra: è lì per dopo e non si spreca.
export function isHungry(health: Health, minMissing: number): boolean {
  return health.max - health.current >= minMissing;
}
