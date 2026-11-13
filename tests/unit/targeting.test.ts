// I test della mira: il nemico più vicino, entro la portata, e il bersaglio preferito (il capo) quando è a tiro.
import { describe, expect, it } from "vitest";
import { nearestIndex, preferredIndex } from "../../src/logic/targeting";

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

describe("il bersaglio preferito: il graffio sceglie il capo", () => {
  const cat = { x: 0, y: 0 };

  it("con un capo a tiro sceglie il capo, anche se un altro nemico è più vicino", () => {
    const enemies = [{ x: 10, y: 0 }, { x: 60, y: 0 }, { x: 20, y: 0 }];
    expect(preferredIndex(cat, enemies, [false, true, false], 72)).toBe(1);
  });

  it("con il capo fuori portata torna al nemico più vicino", () => {
    const enemies = [{ x: 30, y: 0 }, { x: 100, y: 0 }];
    expect(preferredIndex(cat, enemies, [false, true], 72)).toBe(0);
  });

  it("con due capi a tiro sceglie il più vicino dei due", () => {
    const enemies = [{ x: 5, y: 0 }, { x: 60, y: 0 }, { x: 0, y: 40 }];
    expect(preferredIndex(cat, enemies, [false, true, true], 72)).toBe(2);
  });

  it("senza capi si comporta come il nemico più vicino", () => {
    const enemies = [{ x: 50, y: 0 }, { x: 0, y: -20 }];
    expect(preferredIndex(cat, enemies, [false, false], 72)).toBe(1);
  });

  it("senza nessuno a tiro dà -1, capo compreso", () => {
    expect(preferredIndex(cat, [{ x: 100, y: 0 }], [true], 72)).toBe(-1);
    expect(preferredIndex(cat, [], [], 72)).toBe(-1);
  });

  it("il capo esattamente sul bordo della portata vale", () => {
    expect(preferredIndex(cat, [{ x: 10, y: 0 }, { x: 72, y: 0 }], [false, true], 72)).toBe(1);
  });
});
