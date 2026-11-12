// I test dei livelli: quante crocchette servono e cosa succede quando se ne raccolgono tante insieme.
import { describe, expect, it } from "vitest";
import { addXp, xpToNext } from "../../src/logic/progression";

describe("la curva dei livelli", () => {
  it("ogni livello chiede più crocchette del precedente", () => {
    for (let level = 1; level < 30; level++) {
      expect(xpToNext(level + 1)).toBeGreaterThan(xpToNext(level));
    }
  });

  it("raccogliendo meno del necessario si resta al livello e si accumula", () => {
    const r = addXp({ level: 1, xp: 0 }, xpToNext(1) - 1);
    expect(r.state).toEqual({ level: 1, xp: xpToNext(1) - 1 });
    expect(r.levelsGained).toBe(0);
  });

  it("arrivando giusti si sale e l'esperienza riparte da zero", () => {
    const r = addXp({ level: 1, xp: 0 }, xpToNext(1));
    expect(r.state).toEqual({ level: 2, xp: 0 });
    expect(r.levelsGained).toBe(1);
  });

  it("tante crocchette insieme fanno salire più livelli, e il resto avanza", () => {
    const amount = xpToNext(1) + xpToNext(2) + 1;
    const r = addXp({ level: 1, xp: 0 }, amount);
    expect(r.state).toEqual({ level: 3, xp: 1 });
    expect(r.levelsGained).toBe(2);
  });
});
