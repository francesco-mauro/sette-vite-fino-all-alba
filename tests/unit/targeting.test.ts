// I test della mira: il nemico più vicino, entro la portata.
import { describe, expect, it } from "vitest";
import { nearestIndex } from "../../src/logic/targeting";

describe("il nemico più vicino", () => {
  const cat = { x: 0, y: 0 };

  it("sceglie quello più vicino, non il primo della lista", () => {
    const enemies = [{ x: 50, y: 0 }, { x: 0, y: -20 }, { x: 30, y: 30 }];
    expect(nearestIndex(cat, enemies)).toBe(1);
  });

  it("senza nemici dà -1", () => {
    expect(nearestIndex(cat, [])).toBe(-1);
  });

  it("ignora quelli oltre la portata", () => {
    expect(nearestIndex(cat, [{ x: 100, y: 0 }], 64)).toBe(-1);
    expect(nearestIndex(cat, [{ x: 100, y: 0 }, { x: 60, y: 0 }], 64)).toBe(1);
  });

  it("a parità di distanza tiene il primo", () => {
    expect(nearestIndex(cat, [{ x: 10, y: 0 }, { x: -10, y: 0 }])).toBe(0);
  });
});
