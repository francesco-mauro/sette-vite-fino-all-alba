// Le carte della scelta tra tre: armi e potenziamenti passivi, con rarità e livello massimo, e l'icona di ogni carta.
// I testi stanno in texts.ts; qui i dati che contano per l'estrazione e il disegno da cui viene l'icona.
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

// L'icona di ogni carta: il disegno (la chiave caricata in BootScene) e il fotogramma.
// Le armi usano un fotogramma del loro effetto; i potenziamenti e gli spicci le icone provvisorie di
// art/icone_carte.py; il supplì il suo disegno da terra. Mai la crocchetta: a terra è l'esperienza, e
// sulla carta si confondeva (Francesco, 13 novembre 2026: «aveva lo stesso sprite delle crocchette»).
export const CARD_ICONS: Record<string, { key: string; frame: number }> = {
  scratch: { key: "graffio", frame: 1 },
  tail: { key: "coda", frame: 1 },
  fur: { key: "pelo", frame: 0 },
  meow: { key: "miagolio", frame: 1 },
  speed: { key: "carte", frame: 0 },
  health: { key: "carte", frame: 1 },
  damage: { key: "carte", frame: 2 },
  magnet: { key: "carte", frame: 3 },
  haste: { key: "carte", frame: 4 },
  area: { key: "carte", frame: 5 },
  luck: { key: "carte", frame: 6 },
  heal: { key: "suppli", frame: 0 },
  points: { key: "carte", frame: 7 },
};
