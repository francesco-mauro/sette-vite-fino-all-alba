// La scelta tra tre carte: quali escono, come la fortuna sposta i pesi, e cosa c'è scritto sulla carta.
// Logica pura, senza Phaser.
import { CARD_TEXTS, TEXTS } from "../data/texts";
import type { Rng } from "./rng";
import { tripleChance } from "./stats";

// cardDescription: cosa dice la carta `id` al livello `level`, quello che avrà dopo averla presa. Al primo livello
// la frase della prima volta, poi quella delle volte dopo. Il quadrifoglio dice quante casse su cento sono triple
// a quel livello: la fortuna non si vede, così si sa cosa si prende.
export function cardDescription(id: string, level: number): string {
  if (id === "luck") return TEXTS.luckOdds(Math.round(tripleChance(level) * 100));
  const text = CARD_TEXTS[id];
  return level <= 1 ? text.first : text.more;
}

export type Rarity = "common" | "rare";

export interface CardDef {
  id: string;
  rarity: Rarity;
  // oltre questo livello la carta non esce più
  maxLevel: number;
}

// drawCards: fino a `count` carte diverse tra quelle non ancora al massimo, estratte a caso con un peso per rarità:
// una comune con peso 10 esce più spesso di una rara con peso 3. Ogni carta estratta esce dal sacchetto,
// così non ci sono doppioni. Se le carte buone sono meno di `count`, i posti vuoti li prendono le carte
// di ripiego (cura, punti), anche loro senza doppioni.
export function drawCards(
  pool: readonly CardDef[],
  owned: Readonly<Record<string, number>>,
  rng: Rng,
  weights: Readonly<Record<Rarity, number>>,
  fallback: readonly string[],
  count = 3,
): string[] {
  const bag = pool.filter((c) => (owned[c.id] ?? 0) < c.maxLevel);
  const picked: string[] = [];
  while (picked.length < count && bag.length > 0) {
    const total = bag.reduce((sum, c) => sum + weights[c.rarity], 0);
    let roll = rng() * total;
    let i = 0;
    while (i < bag.length - 1 && roll >= weights[bag[i].rarity]) {
      roll -= weights[bag[i].rarity];
      i++;
    }
    picked.push(bag[i].id);
    bag.splice(i, 1);
  }
  for (const id of fallback) {
    if (picked.length >= count) break;
    picked.push(id);
  }
  return picked;
}

// luckyWeights: i pesi dell'estrazione con la fortuna. `rareBonus` si aggiunge al peso delle rare, le comuni
// restano com'erano: con più fortuna le rare escono più spesso. Non tocca i pesi di partenza.
export function luckyWeights(weights: Readonly<Record<Rarity, number>>, rareBonus: number): Record<Rarity, number> {
  return { ...weights, rare: weights.rare + rareBonus };
}
