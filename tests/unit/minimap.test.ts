// I test della minimappa: dove finisce un punto del mondo dentro il quadrato.
import { describe, expect, it } from "vitest";
import { toMinimap } from "../../src/logic/minimap";

describe("la minimappa", () => {
  it("il gatto sta al centro", () => {
    expect(toMinimap({ x: 50, y: 50 }, { x: 50, y: 50 }, 400, 20)).toEqual({ x: 0, y: 0, inside: true });
  });

  it("un punto dentro la portata si rimpicciolisce in proporzione", () => {
    expect(toMinimap({ x: 0, y: 0 }, { x: 200, y: -100 }, 400, 20)).toEqual({ x: 10, y: -5, inside: true });
  });

  it("un punto fuori portata resta sul bordo, nella sua direzione", () => {
    const p = toMinimap({ x: 0, y: 0 }, { x: 1600, y: 400 }, 400, 20);
    expect(p.inside).toBe(false);
    expect(p.x).toBeCloseTo(20);
    expect(p.y).toBeCloseTo(5);
  });
});
