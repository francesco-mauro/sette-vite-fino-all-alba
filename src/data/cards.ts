// Le carte della scelta tra tre: armi e potenziamenti passivi, con rarità e livello massimo.
// I testi stanno in texts.ts; qui solo i dati che contano per l'estrazione.
import type { CardDef } from "../logic/cards";

export const CARDS: CardDef[] = [
  { id: "scratch", rarity: "common", maxLevel: 5 },
  { id: "tail", rarity: "common", maxLevel: 5 },
  { id: "fur", rarity: "rare", maxLevel: 5 },
  { id: "meow", rarity: "common", maxLevel: 5 },
  { id: "speed", rarity: "common", maxLevel: 5 },
  { id: "health", rarity: "common", maxLevel: 5 },
  { id: "damage", rarity: "rare", maxLevel: 5 },
  { id: "magnet", rarity: "common", maxLevel: 5 },
  { id: "haste", rarity: "rare", maxLevel: 5 },
  { id: "area", rarity: "common", maxLevel: 5 },
  { id: "luck", rarity: "common", maxLevel: 5 },
];

// Le carte di ripiego, quando tutte le altre sono al massimo o ne restano meno di tre.
export const FALLBACK_CARDS = ["heal", "points"];
