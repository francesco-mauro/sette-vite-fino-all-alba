// I test della scelta tra tre carte: niente doppioni, niente carte al massimo, la carta di ripiego,
// lo stesso seme che dà le stesse carte, le rare più difficili da trovare.
import { describe, expect, it } from "vitest";
import { drawCards, type CardDef } from "../../src/logic/cards";
import { createRng } from "../../src/logic/rng";

const POOL: CardDef[] = [
  { id: "a", rarity: "common", maxLevel: 5 },
  { id: "b", rarity: "common", maxLevel: 5 },
  { id: "c", rarity: "common", maxLevel: 5 },
  { id: "d", rarity: "rare", maxLevel: 5 },
  { id: "e", rarity: "rare", maxLevel: 1 },
];
const FALLBACK = ["cura", "punti"];
const WEIGHTS = { common: 10, rare: 3 };

// dieci scelte di fila con un seme: la "partita" delle carte
function run(seed: number) {
  const rng = createRng(seed);
  return Array.from({ length: 10 }, () => drawCards(POOL, {}, rng, WEIGHTS, FALLBACK));
}

describe("le tre carte", () => {
  it("sono sempre tre e sempre diverse tra loro", () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const cards = drawCards(POOL, {}, rng, WEIGHTS, FALLBACK);
      expect(cards).toHaveLength(3);
      expect(new Set(cards).size).toBe(3);
    }
  });

  it("una carta già al livello massimo non esce più", () => {
    const rng = createRng(2);
    for (let i = 0; i < 200; i++) {
      expect(drawCards(POOL, { e: 1 }, rng, WEIGHTS, FALLBACK)).not.toContain("e");
    }
  });

  it("se restano meno di tre carte, i posti vuoti li prende la carta di ripiego", () => {
    const owned = { a: 5, b: 5, c: 5, d: 5 };
    const cards = drawCards(POOL, owned, createRng(3), WEIGHTS, FALLBACK);
    expect(cards).toContain("e");
    expect(cards).toContain("cura");
    expect(cards).toContain("punti");
  });

  it("con tutto al massimo escono solo carte di ripiego, senza doppioni", () => {
    const owned = { a: 5, b: 5, c: 5, d: 5, e: 1 };
    const cards = drawCards(POOL, owned, createRng(4), WEIGHTS, FALLBACK);
    expect(cards).toEqual(expect.arrayContaining(FALLBACK));
    expect(cards).toHaveLength(2);
  });

  it("con lo stesso seme escono le stesse carte, partita dopo partita", () => {
    expect(run(123)).toEqual(run(123));
    expect(run(123)).not.toEqual(run(124));
  });

  it("le rare escono meno delle comuni", () => {
    const rng = createRng(5);
    let rare = 0;
    let common = 0;
    for (let i = 0; i < 2000; i++) {
      for (const id of drawCards(POOL, {}, rng, WEIGHTS, FALLBACK)) {
        if (id === "d" || id === "e") rare++;
        else common++;
      }
    }
    expect(rare).toBeLessThan(common / 2);
    expect(rare).toBeGreaterThan(0);
  });
});
