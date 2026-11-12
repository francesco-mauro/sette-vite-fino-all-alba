// I test del generatore con seme: stesso seme, stessi numeri.
import { describe, expect, it } from "vitest";
import { createRng } from "../../src/logic/rng";

describe("il generatore con seme", () => {
  it("con lo stesso seme dà la stessa sequenza", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("con semi diversi dà sequenze diverse", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(Array.from({ length: 5 }, () => a())).not.toEqual(Array.from({ length: 5 }, () => b()));
  });

  it("dà numeri tra 0 compreso e 1 escluso, sparsi su tutto l'intervallo", () => {
    const r = createRng(7);
    const values = Array.from({ length: 10000 }, () => r());
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    const low = values.filter((v) => v < 0.5).length;
    expect(low).toBeGreaterThan(4700);
    expect(low).toBeLessThan(5300);
  });
});
