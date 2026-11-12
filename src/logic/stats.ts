// Le statistiche: dai livelli delle carte scelte ai numeri che usa la partita. Logica pura, senza Phaser.
import { PASSIVES } from "../data/balance";

export interface Stats {
  speedMultiplier: number;
  damageMultiplier: number;
  magnetMultiplier: number;
  maxHealthBonus: number;
  // il livello di ogni arma: 0 vuol dire che il gatto non ce l'ha ancora
  weapons: { scratch: number; tail: number; fur: number };
}

// computeStats: `levels` dice a che livello è ogni carta presa (per id). Il graffio c'è dall'inizio, al livello 1:
// la sua carta lo alza oltre. Coda a frusta e pelo che vola partono da 0.
export function computeStats(levels: Readonly<Record<string, number>>): Stats {
  const lv = (id: string) => levels[id] ?? 0;
  return {
    speedMultiplier: 1 + PASSIVES.speedPerLevel * lv("speed"),
    damageMultiplier: 1 + PASSIVES.damagePerLevel * lv("damage"),
    magnetMultiplier: 1 + PASSIVES.magnetPerLevel * lv("magnet"),
    maxHealthBonus: PASSIVES.healthPerLevel * lv("health"),
    weapons: { scratch: 1 + lv("scratch"), tail: lv("tail"), fur: lv("fur") },
  };
}
