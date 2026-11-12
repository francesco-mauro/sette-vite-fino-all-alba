// Le ondate: quanto spesso arrivano i piccioni e quanti, man mano che la notte avanza. Logica pura, senza Phaser.
// La tabella vera, minuto per minuto e con tutti i nemici, è della tappa 4: per ora una salita dritta.
import { WAVES } from "../data/balance";

// spawnPlan: `progress` è quanta notte è passata, da 0 (inizio) a 1 (alba).
// L'intervallo tra un gruppo e l'altro scende, il gruppo cresce: la notte non diventa mai più facile.
export function spawnPlan(progress: number): { intervalMs: number; groupSize: number } {
  const p = Math.min(1, Math.max(0, progress));
  return {
    intervalMs: Math.round(WAVES.startIntervalMs + (WAVES.endIntervalMs - WAVES.startIntervalMs) * p),
    groupSize: Math.floor(WAVES.startGroup + (WAVES.endGroup - WAVES.startGroup) * p),
  };
}
