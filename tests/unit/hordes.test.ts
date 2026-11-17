// I test del passo 2 contro il blob: gli schemi delle orde (un lato, due lati opposti, alle spalle), il varco
// sempre libero e il rimescolo dei nemici rimasti dietro al gatto.
import { describe, expect, it } from "vitest";
import { HORDE, RESHUFFLE, SPAWN } from "../../src/data/balance";
import { behindSide, hordeSides, nextPattern, oppositeSide, pickReshuffle, reshufflePoint, type HordePattern } from "../../src/logic/hordes";
import type { Side } from "../../src/logic/spawn";

const PATTERNS: HordePattern[] = ["one", "opposite", "behind"];
const SIDES: Side[] = ["top", "bottom", "left", "right"];
const cat = { x: 1000, y: -500 };
const HALF_W = 240;
const HALF_H = 135;

describe("gli schemi delle orde", () => {
  it("mai lo stesso schema due volte di fila, e tutti e due gli altri possono uscire", () => {
    for (const prev of PATTERNS) {
      const a = nextPattern(prev, 0);
      const b = nextPattern(prev, 0.99);
      expect(a).not.toBe(prev);
      expect(b).not.toBe(prev);
      expect(a).not.toBe(b);
    }
  });

  it("il lato opposto", () => {
    expect(oppositeSide("left")).toBe("right");
    expect(oppositeSide("right")).toBe("left");
    expect(oppositeSide("top")).toBe("bottom");
    expect(oppositeSide("bottom")).toBe("top");
  });

  it("alle spalle è il lato opposto a dove guarda il gatto (y cresce verso il basso)", () => {
    expect(behindSide(0)).toBe("left");
    expect(behindSide(Math.PI)).toBe("right");
    expect(behindSide(Math.PI / 2)).toBe("top");
    expect(behindSide(-Math.PI / 2)).toBe("bottom");
    expect(behindSide(0.3)).toBe("left");
  });

  it("un lato solo: mai quello dell'onda prima", () => {
    for (const prev of SIDES) {
      const sides = hordeSides("one", prev, 0, 0.5);
      expect(sides).toHaveLength(1);
      expect(sides[0]).not.toBe(prev);
    }
  });

  it("due lati opposti: il primo non è quello dell'onda prima", () => {
    const sides = hordeSides("opposite", "left", 0, 0);
    expect(sides).toHaveLength(2);
    expect(sides[0]).not.toBe("left");
    expect(sides[1]).toBe(oppositeSide(sides[0]));
  });

  it("alle spalle: il lato dietro al gatto", () => {
    expect(hordeSides("behind", "left", Math.PI / 2, 0.5)).toEqual(["top"]);
  });

  it("il varco: qualunque schema lascia almeno due lati liberi", () => {
    for (const p of PATTERNS) for (const prev of SIDES) for (const r of [0, 0.3, 0.6, 0.99]) {
      const sides = hordeSides(p, prev, r * 6, r);
      expect(new Set(sides).size).toBeLessThanOrEqual(2);
    }
  });

  it("l'avviso (il fumetto, dal passo 3) arriva un secondo prima, dentro il respiro tra due onde", () => {
    expect(HORDE.warnMs).toBe(1000);
    expect(HORDE.warnMs).toBeLessThan(HORDE.cycleMs - HORDE.arriveMs);
  });
});

describe("il rimescolo", () => {
  // il gatto guarda a destra (facing 0): dietro è a sinistra
  const behindOut = { x: cat.x - 300, y: cat.y };
  const frontOut = { x: cat.x + 300, y: cat.y };
  const behindIn = { x: cat.x - 100, y: cat.y };

  it("prende solo chi è fuori dalla vista e dietro al gatto", () => {
    const picked = pickReshuffle([behindOut, frontOut, behindIn], cat, 0, HALF_W, HALF_H, 1, 60, () => 0);
    expect(picked).toEqual([0]);
  });

  it("ognuno con la sua probabilità: sopra la quota resta dov'è", () => {
    expect(pickReshuffle([behindOut], cat, 0, HALF_W, HALF_H, 0.5, 60, () => 0.6)).toEqual([]);
    expect(pickReshuffle([behindOut], cat, 0, HALF_W, HALF_H, 0.5, 60, () => 0.4)).toEqual([0]);
  });

  it("al massimo `max` alla volta", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ x: cat.x - 300 - i, y: cat.y }));
    expect(pickReshuffle(many, cat, 0, HALF_W, HALF_H, 1, 3, () => 0)).toHaveLength(3);
  });

  it("chi torna sta fuori dalla minimappa (400 pixel dal gatto per parte), dal lato dell'orda", () => {
    // la direzione di ogni lato: x verso destra, y verso il basso
    const toward: Record<Side, { x: number; y: number }> = { left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, top: { x: 0, y: -1 }, bottom: { x: 0, y: 1 } };
    for (const side of SIDES) for (const along of [0, 0.5, 1]) {
      const p = reshufflePoint(cat, side, RESHUFFLE.beyondMin, along, RESHUFFLE.spread);
      const dx = p.x - cat.x;
      const dy = p.y - cat.y;
      expect(Math.max(Math.abs(dx), Math.abs(dy))).toBeGreaterThan(400);
      // dal lato giusto: oltre 400 pixel lungo la direzione del lato
      expect(dx * toward[side].x + dy * toward[side].y).toBeGreaterThan(400);
    }
  });

  it("numeri: metà dei candidati, 60 al massimo, tra 410 e 440 pixel, 8 secondi di grazia dal richiamo", () => {
    expect(RESHUFFLE.share).toBe(0.5);
    expect(RESHUFFLE.max).toBe(60);
    expect(RESHUFFLE.beyondMin).toBe(410);
    expect(RESHUFFLE.beyondMax).toBe(440);
    expect(RESHUFFLE.graceMs).toBe(8000);
    // senza grazia il richiamo dei lontani li riporterebbe subito vicino
    expect(RESHUFFLE.beyondMin).toBeLessThan(SPAWN.recallDistance);
    expect(Math.hypot(RESHUFFLE.beyondMax, RESHUFFLE.spread / 2)).toBeGreaterThan(SPAWN.recallDistance);
  });
});
