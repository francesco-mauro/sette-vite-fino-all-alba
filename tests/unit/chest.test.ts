// I test delle casse del tesoro: dove nascono, quando, e cosa danno (un potere, a volte tre).
import { describe, expect, it } from "vitest";
import { chestTimes, chestPoint, openChest } from "../../src/logic/chest";
import type { CardDef } from "../../src/logic/cards";
import { createRng } from "../../src/logic/rng";

const POOL: CardDef[] = [
  { id: "a", rarity: "common", maxLevel: 2 },
  { id: "b", rarity: "common", maxLevel: 1 },
  { id: "c", rarity: "rare", maxLevel: 1 },
];
const WEIGHTS = { common: 10, rare: 4 };
const FALLBACK = ["heal", "points"];

// un generatore finto che restituisce i numeri dati, in giro
function fixed(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("dove nasce una cassa", () => {
  it("sempre tra la distanza minima e la massima dal gatto", () => {
    const rng = createRng(3);
    for (let n = 0; n < 200; n++) {
      const p = chestPoint({ x: 100, y: -50 }, rng, 300, 600);
      const d = Math.hypot(p.x - 100, p.y + 50);
      expect(d).toBeGreaterThanOrEqual(300 - 1e-9);
      expect(d).toBeLessThanOrEqual(600 + 1e-9);
    }
  });
});

describe("quando nasce una cassa", () => {
  it("otto casse in ogni notte, corta o lunga, tutte prima dell'alba", () => {
    for (const minutes of [5, 10, 15]) {
      const duration = minutes * 60_000;
      const times = chestTimes(duration, 8);
      expect(times).toHaveLength(8);
      expect(Math.max(...times)).toBeLessThan(duration);
    }
  });

  it("a distanza regolare: nella notte da 5 minuti la prima a 18,75 secondi, poi ogni 37,5", () => {
    const times = chestTimes(5 * 60_000, 8);
    expect(times[0]).toBe(18_750);
    expect(times[1] - times[0]).toBe(37_500);
  });
});

describe("cosa c'è dentro", () => {
  it("di solito un potere solo", () => {
    // primo numero: il tiro del triplo (0,5 non è sotto 0,1), poi l'estrazione
    expect(openChest(POOL, {}, fixed(0.5, 0), WEIGHTS, FALLBACK, 0.1)).toHaveLength(1);
  });

  it("con il tiro sotto la probabilità, tre poteri", () => {
    expect(openChest(POOL, {}, fixed(0.05, 0), WEIGHTS, FALLBACK, 0.1)).toHaveLength(3);
  });

  it("i tre poteri contano l'uno per l'altro: una carta non va oltre il suo massimo", () => {
    // con 0 esce sempre la prima del sacchetto: a, poi a (livello 2, il massimo), poi b
    expect(openChest(POOL, {}, fixed(0.05, 0, 0, 0), WEIGHTS, FALLBACK, 0.1)).toEqual(["a", "a", "b"]);
  });

  it("con tutte le carte al massimo dà le carte di ripiego", () => {
    expect(openChest(POOL, { a: 2, b: 1, c: 1 }, fixed(0.5), WEIGHTS, FALLBACK, 0.1)).toEqual(["heal"]);
  });
});
