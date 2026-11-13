// I test delle nascite: i nemici nascono appena fuori dallo schermo, mai dentro, un'onda da un lato solo, e chi
// resta troppo lontano dal gatto viene riportato vicino.
import { describe, expect, it } from "vitest";
import { ENEMIES, HORDE, SPAWN } from "../../src/data/balance";
import { WAVE_TABLE } from "../../src/data/waves";
import { groupRadius } from "../../src/logic/flock";
import { nextSide, sidePoint, spawnPoint, tooFar, type Side } from "../../src/logic/spawn";

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

describe("l'onda che arriva da un lato solo", () => {
  const SIDES: Side[] = ["top", "bottom", "left", "right"];

  it("ogni lato ha i suoi punti, sempre fuori dalla vista, lungo tutto il lato", () => {
    // per ogni lato, la coordinata che resta ferma lungo il lato e dove deve stare
    const edge: Record<Side, { of: (p: { x: number; y: number }) => number; at: number }> = {
      top: { of: (p) => p.y, at: center.y - HALF_H - MARGIN / 2 },
      bottom: { of: (p) => p.y, at: center.y + HALF_H + MARGIN / 2 },
      left: { of: (p) => p.x, at: center.x - HALF_W - MARGIN / 2 },
      right: { of: (p) => p.x, at: center.x + HALF_W + MARGIN / 2 },
    };
    for (const side of SIDES) {
      for (const along of [0, 0.3, 0.99]) {
        const p = sidePoint(center, HALF_W, HALF_H, MARGIN, side, along);
        expect(outsideView(p)).toBe(true);
        expect(edge[side].of(p)).toBe(edge[side].at);
      }
    }
  });

  it("l'onda dopo arriva da un altro lato, mai dallo stesso", () => {
    for (const prev of SIDES) {
      const next = new Set<Side>();
      for (let r = 0; r < 1; r += 0.05) next.add(nextSide(prev, r));
      expect(next.has(prev)).toBe(false);
      expect(next.size).toBe(3);
    }
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
    // Il punto più lontano: l'angolo della cornice, spostato in fuori del raggio del gruppo più numeroso della
    // tabella (con i gruppi delle orde, HORDE.sizeScale, e lo spazio più largo), più il raggio del gruppo intorno.
    const biggest = HORDE.sizeScale * Math.max(...WAVE_TABLE.flatMap((row) => Object.values(row).map((group) => group.size)));
    const spacing = Math.max(...Object.values(ENEMIES).map((e) => e.group?.spacing ?? 0));
    const r = groupRadius(biggest, spacing);
    const w = HALF_W + SPAWN.margin / 2;
    const h = HALF_H + SPAWN.margin / 2;
    // spostato in fuori in verticale (onda dall'alto o dal basso) o in orizzontale (da sinistra o da destra)
    const farthest = Math.max(Math.hypot(w + r, h + 2 * r), Math.hypot(w + 2 * r, h + r));
    expect(SPAWN.recallDistance).toBeGreaterThan(farthest);
  });
});
