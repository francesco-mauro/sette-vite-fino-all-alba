// I test delle nascite: i nemici nascono appena fuori dallo schermo, mai dentro.
import { describe, expect, it } from "vitest";
import { spawnPoint } from "../../src/logic/spawn";

const center = { x: 1000, y: -500 };
const HALF_W = 240;
const HALF_H = 135;
const MARGIN = 16;

function outsideView(p: { x: number; y: number }): boolean {
  return Math.abs(p.x - center.x) > HALF_W || Math.abs(p.y - center.y) > HALF_H;
}

describe("dove nasce un nemico", () => {
  it("con mille numeri casuali diversi nasce sempre fuori dalla vista, e non troppo lontano", () => {
    for (let i = 0; i < 1000; i++) {
      const values = [i / 1000, (i * 7919) % 1000 / 1000];
      let k = 0;
      const p = spawnPoint(center, HALF_W, HALF_H, MARGIN, () => values[k++ % 2]);
      expect(outsideView(p)).toBe(true);
      expect(Math.abs(p.x - center.x)).toBeLessThanOrEqual(HALF_W + MARGIN);
      expect(Math.abs(p.y - center.y)).toBeLessThanOrEqual(HALF_H + MARGIN);
    }
  });

  it("con gli stessi numeri casuali nasce nello stesso punto", () => {
    const a = spawnPoint(center, HALF_W, HALF_H, MARGIN, () => 0.25);
    const b = spawnPoint(center, HALF_W, HALF_H, MARGIN, () => 0.25);
    expect(a).toEqual(b);
  });
});
