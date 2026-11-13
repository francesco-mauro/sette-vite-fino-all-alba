// Il disegno di una carta: cornice, icona, nome, livello e cosa fa. Lo usano la scelta al livello
// (LevelUpScene) e la cassa del tesoro (ChestScene), così una carta si legge uguale ovunque.
import * as Phaser from "phaser";
import { CARD_ICONS, CARDS } from "../data/cards";
import { CARD_TEXTS, TEXTS } from "../data/texts";
import { FONT } from "./font";

export { FONT };
export const CARD_W = 128;
export const CARD_H = 132;
export const COLORS = { common: 0xcfe0ff, rare: 0xffc85a, fallback: 0xa6f05a, selected: 0xffffff };

// drawCard: disegna la carta `id` centrata in (x, y), con il livello che avrà dopo averla presa,
// partendo da `levels` (i livelli prima). Restituisce la cornice e tutti i pezzi, per animarli insieme.
export function drawCard(scene: Phaser.Scene, id: string, x: number, y: number, levels: Record<string, number>) {
  const def = CARDS.find((c) => c.id === id);
  const rarity = def ? def.rarity : "fallback";
  const color = COLORS[rarity];
  // il graffio c'è dall'inizio, al livello 1: la sua prima carta lo porta al 2
  const start = id === "scratch" ? 1 : 0;
  const taken = levels[id] ?? 0;
  const level = start + taken + 1;
  const text = CARD_TEXTS[id];

  const frame = scene.add.rectangle(x, y, CARD_W, CARD_H, 0x1c2133, 1).setStrokeStyle(2, color);
  const parts: Phaser.GameObjects.GameObject[] = [frame];
  const icon = CARD_ICONS[id];
  if (icon) parts.push(scene.add.image(x, y - 36, icon.key, icon.frame));
  parts.push(scene.add.text(x, y - 12, text.name, { ...FONT, color: `#${color.toString(16).padStart(6, "0")}`, align: "center", wordWrap: { width: CARD_W - 12 } }).setOrigin(0.5, 0));
  if (def) parts.push(scene.add.text(x, y + 2, `${TEXTS.level} ${level}`, FONT).setOrigin(0.5, 0));
  parts.push(scene.add.text(x, y + 18, start + taken === 0 ? text.first : text.more, { ...FONT, color: "#cfe0ff", align: "center", wordWrap: { width: CARD_W - 16 } }).setOrigin(0.5, 0));
  if (rarity === "rare") parts.push(scene.add.text(x, y + CARD_H / 2 - 14, TEXTS.rare, { ...FONT, color: "#ffc85a" }).setOrigin(0.5, 0));
  return { frame, parts };
}
