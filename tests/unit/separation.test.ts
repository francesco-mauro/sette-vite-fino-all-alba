// I test delle spinte leggere tra nemici: chi sta troppo vicino a un altro si scosta un po', e la misura del mucchio.
import { describe, expect, it } from "vitest";
import { CROWD, ENEMIES } from "../../src/data/balance";
import type { Vec } from "../../src/logic/movement";
import { createRng } from "../../src/logic/rng";
import { crowding, largestClump, separation, withPush } from "../../src/logic/separation";

// la stessa regola fatta nel modo più semplice, tutte le coppie: serve a controllare quella con la griglia
function separationByPairs(points: readonly Vec[], radius: number, strength: number): Vec[] {
  const out = points.map(() => ({ x: 0, y: 0 }));
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const d = Math.hypot(dx, dy);
      if (d >= radius) continue;
      const ux = d === 0 ? -1 : dx / d;
      const uy = d === 0 ? 0 : dy / d;
      const push = strength * (1 - d / radius);
      out[i].x += ux * push;
      out[i].y += uy * push;
      out[j].x -= ux * push;
      out[j].y -= uy * push;
    }
  }
  return out.map((v) => {
    const len = Math.hypot(v.x, v.y);
    return len > strength ? { x: (v.x / len) * strength, y: (v.y / len) * strength } : v;
  });
}

describe("le spinte leggere tra nemici", () => {
  it("due nemici vicini si spingono in direzioni opposte, uno lontano dall'altro", () => {
    const [a, b] = separation([{ x: 0, y: 0 }, { x: 6, y: 0 }], 12, 30);
    expect(a.x).toBeCloseTo(-15);
    expect(b.x).toBeCloseTo(15);
    expect(a.y).toBeCloseTo(0);
    expect(b.y).toBeCloseTo(0);
  });

  it("la spinta cresce quando sono più vicini, e si spegne alla distanza del raggio", () => {
    const near = separation([{ x: 0, y: 0 }, { x: 3, y: 0 }], 12, 30)[1].x;
    const far = separation([{ x: 0, y: 0 }, { x: 9, y: 0 }], 12, 30)[1].x;
    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(0);
    expect(separation([{ x: 0, y: 0 }, { x: 12, y: 0 }], 12, 30)[1]).toEqual({ x: 0, y: 0 });
  });

  it("vale in ogni direzione, non solo in orizzontale", () => {
    const [a, b] = separation([{ x: 10, y: 10 }, { x: 13, y: 14 }], 12, 30);
    // distanza 5: spinta 30 per (1 - 5/12) = 17,5, lungo la direzione (0,6, 0,8)
    expect(b.x).toBeCloseTo(17.5 * 0.6);
    expect(b.y).toBeCloseTo(17.5 * 0.8);
    expect(a.x).toBeCloseTo(-17.5 * 0.6);
    expect(a.y).toBeCloseTo(-17.5 * 0.8);
  });

  it("chi è solo, o lontano da tutti, non viene spinto", () => {
    expect(separation([{ x: 5, y: 5 }], 12, 30)).toEqual([{ x: 0, y: 0 }]);
    expect(separation([{ x: 0, y: 0 }, { x: 100, y: 0 }], 12, 30)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
    expect(separation([], 12, 30)).toEqual([]);
  });

  it("due nemici nello stesso punto si separano lo stesso, senza numeri impossibili", () => {
    const [a, b] = separation([{ x: 7, y: 7 }, { x: 7, y: 7 }], 12, 30);
    expect(a).toEqual({ x: -30, y: 0 });
    expect(b).toEqual({ x: 30, y: 0 });
  });

  it("in mezzo alla folla la spinta non supera mai la forza piena", () => {
    const crowd: Vec[] = [];
    for (let i = 0; i < 9; i++) crowd.push({ x: (i % 3) * 2, y: Math.floor(i / 3) * 2 });
    for (const v of separation(crowd, 12, 30)) expect(Math.hypot(v.x, v.y)).toBeLessThanOrEqual(30 + 1e-9);
  });

  it("due nemici a cavallo tra due caselle della griglia si vedono lo stesso", () => {
    const [a, b] = separation([{ x: -0.5, y: 11.9 }, { x: 0.5, y: 12.1 }], 12, 30);
    expect(a.x).toBeLessThan(0);
    expect(b.x).toBeGreaterThan(0);
  });

  it("con trecento nemici a caso dà gli stessi numeri del conto su tutte le coppie", () => {
    const rng = createRng(7);
    const points: Vec[] = [];
    for (let i = 0; i < 300; i++) points.push({ x: rng() * 200 - 100, y: rng() * 200 - 100 });
    const grid = separation(points, 12, 30);
    const pairs = separationByPairs(points, 12, 30);
    for (let i = 0; i < points.length; i++) {
      expect(grid[i].x).toBeCloseTo(pairs[i].x, 9);
      expect(grid[i].y).toBeCloseTo(pairs[i].y, 9);
    }
  });

  it("funziona anche lontano dall'origine, dove il gatto arriva dopo una notte di corsa", () => {
    const [a, b] = separation([{ x: -40_000, y: 25_000 }, { x: -39_994, y: 25_000 }], 12, 30);
    expect(a.x).toBeCloseTo(-15);
    expect(b.x).toBeCloseTo(15);
  });
});

describe("la corsa con la spinta", () => {
  it("senza spinta la corsa resta quella di prima", () => {
    expect(withPush({ x: 35, y: 0 }, { x: 0, y: 0 }, 35, 2)).toEqual({ x: 35, y: 0 });
  });

  it("una spinta di lato cambia la direzione, non la velocità", () => {
    const v = withPush({ x: 35, y: 0 }, { x: 0, y: 0.5 }, 35, 2);
    expect(v.y).toBeGreaterThan(0);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(35);
  });

  it("spinto da dietro non corre più veloce di prima", () => {
    const v = withPush({ x: 35, y: 0 }, { x: 1, y: 0 }, 35, 2);
    expect(v.x).toBeCloseTo(35);
    expect(v.y).toBeCloseTo(0);
  });

  it("spinto di fronte si ferma o torna indietro, mai oltre la sua velocità", () => {
    expect(withPush({ x: 35, y: 0 }, { x: -0.5, y: 0 }, 35, 2).x).toBeCloseTo(0);
    const back = withPush({ x: 35, y: 0 }, { x: -1, y: 0 }, 35, 2);
    expect(back.x).toBeCloseTo(-35);
  });

  it("una spinta piccola sposta poco", () => {
    // 0,05 per 35 per 2 fa 3,5 pixel al secondo di lato; poi la corsa torna lunga 35
    const v = withPush({ x: 35, y: 0 }, { x: 0, y: 0.05 }, 35, 2);
    const raw = Math.hypot(35, 3.5);
    expect(v.y).toBeCloseTo((3.5 * 35) / raw);
    expect(v.x).toBeCloseTo((35 * 35) / raw);
  });
});

describe("la misura del mucchio", () => {
  it("è la parte dei nemici che ne hanno un altro quasi addosso", () => {
    const points = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 50, y: 0 }];
    expect(crowding(points, 4)).toBeCloseTo(2 / 3);
  });

  it("è zero senza nemici, con uno solo, o con tutti distanti", () => {
    expect(crowding([], 4)).toBe(0);
    expect(crowding([{ x: 0, y: 0 }], 4)).toBe(0);
    expect(crowding([{ x: 0, y: 0 }, { x: 4, y: 0 }], 4)).toBe(0);
  });

  it("è uno quando sono tutti uno sopra l'altro", () => {
    expect(crowding([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], 4)).toBe(1);
  });
});

describe("la misura della massa unica", () => {
  it("conta il gruppo più grande di nemici legati a catena, anche se i due capi della catena sono lontani", () => {
    // una fila di cinque a 15 pixel l'uno dall'altro è una massa sola; i due più in là sono un'altra
    const row = [0, 15, 30, 45, 60].map((x) => ({ x, y: 0 }));
    const apart = [{ x: 200, y: 0 }, { x: 210, y: 0 }];
    expect(largestClump([...row, ...apart], 20)).toBe(5);
  });

  it("è zero senza nemici e uno con un nemico solo o con tutti lontani", () => {
    expect(largestClump([], 20)).toBe(0);
    expect(largestClump([{ x: 0, y: 0 }], 20)).toBe(1);
    expect(largestClump([{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 40, y: 0 }], 20)).toBe(1);
  });

  it("due gruppi che si toccano diventano uno", () => {
    const a = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
    const b = [{ x: 50, y: 0 }, { x: 60, y: 0 }];
    expect(largestClump([...a, ...b], 20)).toBe(2);
    // a 20 pixel esatti non si toccano: servono due nemici in mezzo, a 15, 13 e 12 pixel
    expect(largestClump([...a, ...b, { x: 30, y: 0 }], 20)).toBe(2);
    expect(largestClump([...a, ...b, { x: 25, y: 0 }, { x: 38, y: 0 }], 20)).toBe(6);
  });
});

describe("i numeri delle spinte", () => {
  it("uno sopra l'altro la spinta batte la corsa, altrimenti sul gatto si impilano lo stesso", () => {
    // la scena moltiplica la spinta (al massimo 1) per la velocità di chi la riceve e per CROWD.push
    expect(CROWD.push).toBeGreaterThan(1);
  });

  it("resta leggera: al massimo tre volte la corsa, e a metà raggio non più di una volta e mezza", () => {
    expect(CROWD.push).toBeLessThanOrEqual(3);
    expect(CROWD.push * 0.5).toBeLessThanOrEqual(1.5);
  });

  it("il raggio copre almeno la scatola del nemico più largo, e la misura del mucchio guarda più vicino", () => {
    const widest = Math.max(...Object.values(ENEMIES).map((e) => e.body.width));
    expect(CROWD.radius).toBeGreaterThanOrEqual(widest);
    expect(CROWD.radius).toBeLessThanOrEqual(24);
    expect(CROWD.overlapDistance).toBeGreaterThan(0);
    expect(CROWD.overlapDistance).toBeLessThan(CROWD.radius);
  });
});
