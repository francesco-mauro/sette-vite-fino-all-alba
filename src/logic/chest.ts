// Le casse del tesoro: compaiono sulla mappa lontano dal gatto, e chi le prende riceve un potere, a volte tre.
// Logica pura, senza Phaser: dove nasce una cassa, ogni quanto, cosa c'è dentro.
import { drawCards, type CardDef, type Rarity } from "./cards";
import type { Rng } from "./rng";

export interface Point {
  x: number;
  y: number;
}

// chestPoint: un punto a caso intorno al gatto, tra `minDistance` e `maxDistance`: fuori dallo schermo,
// da andare a cercare con la minimappa.
export function chestPoint(cat: Point, rng: Rng, minDistance: number, maxDistance: number): Point {
  const angle = rng() * Math.PI * 2;
  const distance = minDistance + rng() * (maxDistance - minDistance);
  return { x: cat.x + Math.cos(angle) * distance, y: cat.y + Math.sin(angle) * distance };
}

// chestTimes: quando nascono le casse, perché ogni notte, corta o lunga, ne abbia lo stesso numero.
// A distanza regolare, la prima a mezzo intervallo: così anche l'ultima nasce prima dell'alba.
export function chestTimes(durationMs: number, perNight: number): number[] {
  const interval = durationMs / perNight;
  return Array.from({ length: perNight }, (_, i) => (i + 0.5) * interval);
}

// openChest: cosa c'è nella cassa. Il primo tiro decide se è tripla (sotto `tripleChance`); poi ogni potere
// si estrae come una carta al livello, e conta per il successivo, così nessuna carta va oltre il suo massimo.
// Con tutte le carte al massimo escono le carte di ripiego (cura, punti).
export function openChest(
  pool: readonly CardDef[],
  owned: Readonly<Record<string, number>>,
  rng: Rng,
  weights: Readonly<Record<Rarity, number>>,
  fallback: readonly string[],
  tripleChance: number,
): string[] {
  const count = rng() < tripleChance ? 3 : 1;
  const levels: Record<string, number> = { ...owned };
  const gained: string[] = [];
  for (let i = 0; i < count; i++) {
    const [id] = drawCards(pool, levels, rng, weights, fallback, 1);
    gained.push(id);
    levels[id] = (levels[id] ?? 0) + 1;
  }
  return gained;
}
