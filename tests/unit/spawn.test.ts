// I test delle nascite: i nemici nascono appena fuori dallo schermo, mai dentro, e chi resta troppo
// lontano dal gatto viene riportato vicino.
import { describe, expect, it } from "vitest";
import { SPAWN } from "../../src/data/balance";
import { WAVE_TABLE } from "../../src/data/waves";
import { groupOffset, spawnPoint, tooFar } from "../../src/logic/spawn";

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

describe("il posto di ognuno nel gruppo", () => {
  it("il primo nasce nel punto del gruppo, gli altri accanto, tre per fila", () => {
    expect(groupOffset(0)).toEqual({ x: 0, y: 0 });
    expect(groupOffset(2).y).toBe(0);
    expect(groupOffset(2).x).toBeGreaterThan(groupOffset(1).x);
    // il quarto apre la seconda fila, sotto il primo
    expect(groupOffset(3).x).toBe(0);
    expect(groupOffset(3).y).toBeGreaterThan(0);
  });
});

describe("un nemico rimasto troppo lontano", () => {
  const cat = { x: 1000, y: -500 };

  it("vicino o proprio sul limite resta dov'è", () => {
    expect(tooFar({ x: 1100, y: -500 }, cat, 400)).toBe(false);
    expect(tooFar({ x: 1400, y: -500 }, cat, 400)).toBe(false);
  });

  it("oltre il limite va riportato vicino, da qualunque parte sia", () => {
    expect(tooFar({ x: 1401, y: -500 }, cat, 400)).toBe(true);
    expect(tooFar({ x: 1000, y: -901 }, cat, 400)).toBe(true);
    // in diagonale conta la distanza vera: 300 e 300 fanno 424
    expect(tooFar({ x: 700, y: -200 }, cat, 400)).toBe(true);
  });

  it("il limite del gioco è oltre il punto più lontano in cui un nemico può nascere", () => {
    // altrimenti un nemico appena nato, o appena riportato vicino, verrebbe spostato di nuovo a ogni fotogramma.
    // Il punto più lontano: l'angolo della cornice, più il posto dell'ultimo del gruppo più numeroso della tabella.
    const biggest = Math.max(...WAVE_TABLE.flatMap((row) => Object.values(row).map((group) => group.size)));
    let farthest = 0;
    for (let i = 0; i < biggest; i++) {
      const o = groupOffset(i);
      farthest = Math.max(farthest, Math.hypot(HALF_W + SPAWN.margin / 2 + o.x, HALF_H + SPAWN.margin / 2 + o.y));
    }
    expect(SPAWN.recallDistance).toBeGreaterThan(farthest);
  });
});
