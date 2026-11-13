// I test dei gruppi che restano gruppi: lo stormo di piccioni, lo sciame di zanzare, la fila di pantegane.
import { describe, expect, it } from "vitest";
import { centroid, flockSlot, followSlot, groupPushes, groupRadius, swarmSlot, trailTarget } from "../../src/logic/flock";

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

// il verso in cui gira la zanzara `i` nello sciame: il segno del prodotto vettoriale tra il posto adesso e quello
// un attimo dopo
function turn(i: number): number {
  const a = swarmSlot(i, 0, 22, 1600);
  const b = swarmSlot(i, 50, 22, 1600);
  return Math.sign(a.x * b.y - a.y * b.x);
}

describe("il centro del gruppo", () => {
  it("è la media dei punti", () => {
    expect(centroid([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 30 }])).toEqual({ x: 10, y: 10 });
  });
});

describe("lo stormo di piccioni", () => {
  it("i piccioni stanno intorno al centro senza finire uno sopra l'altro: almeno lo spazio tra due vicini", () => {
    const slots = Array.from({ length: 20 }, (_, i) => flockSlot(i, 16));
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) expect(dist(slots[i], slots[j])).toBeGreaterThanOrEqual(16 * 0.99);
    }
  });

  it("resta raccolto: venti piccioni stanno in un cerchio di raggio tre volte lo spazio", () => {
    for (let i = 0; i < 20; i++) expect(dist(flockSlot(i, 16), { x: 0, y: 0 })).toBeLessThanOrEqual(16 * 3);
  });

  it("il raggio del gruppo è quello del posto più lontano dal centro", () => {
    for (const n of [1, 5, 20]) {
      const far = Math.max(...Array.from({ length: n }, (_, i) => dist(flockSlot(i, 16), { x: 0, y: 0 })));
      expect(groupRadius(n, 16)).toBeCloseTo(far);
    }
  });
});

describe("lo sciame di zanzare", () => {
  it("ogni zanzara gira intorno al centro, tra metà raggio e il raggio", () => {
    for (let i = 0; i < 20; i++) {
      for (let t = 0; t < 3000; t += 250) {
        const d = dist(swarmSlot(i, t, 22, 1600), { x: 0, y: 0 });
        expect(d).toBeGreaterThanOrEqual(11 - 1e-9);
        expect(d).toBeLessThanOrEqual(22 + 1e-9);
      }
    }
  });

  it("si muove nel tempo e dopo un giro torna al suo posto", () => {
    const a = swarmSlot(3, 0, 22, 1600);
    expect(dist(a, swarmSlot(3, 800, 22, 1600))).toBeGreaterThan(5);
    expect(dist(a, swarmSlot(3, 1600, 22, 1600))).toBeCloseTo(0);
  });

  it("non girano tutte nello stesso verso", () => {
    expect(new Set([0, 1, 2, 3].map(turn)).size).toBe(2);
  });
});

describe("la fila di pantegane", () => {
  it("ognuna punta un posto dietro a quella davanti, alla distanza della fila", () => {
    expect(trailTarget({ x: 100, y: 0 }, { x: 50, y: 0 }, 16)).toEqual({ x: 84, y: 0 });
    const t = trailTarget({ x: 0, y: 0 }, { x: 30, y: 40 }, 10);
    expect(t.x).toBeCloseTo(6);
    expect(t.y).toBeCloseTo(8);
  });

  it("sopra quella davanti, resta lì: non c'è un dietro", () => {
    expect(trailTarget({ x: 5, y: 5 }, { x: 5, y: 5 }, 16)).toEqual({ x: 5, y: 5 });
  });
});

describe("i gruppi si scostano tra loro", () => {
  it("due gruppi lontani non si spingono", () => {
    const p = groupPushes([{ x: 0, y: 0 }, { x: 100, y: 0 }], [30, 30], 12);
    expect(p).toEqual([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  });

  it("due gruppi troppo vicini si spingono in versi opposti, di più quanto più sono vicini", () => {
    const near = groupPushes([{ x: 0, y: 0 }, { x: 40, y: 0 }], [30, 30], 12);
    expect(near[0].x).toBeLessThan(0);
    expect(near[1].x).toBeGreaterThan(0);
    expect(near[0].x).toBeCloseTo(-near[1].x);
    const nearer = groupPushes([{ x: 0, y: 0 }, { x: 20, y: 0 }], [30, 30], 12);
    expect(Math.abs(nearer[0].x)).toBeGreaterThan(Math.abs(near[0].x));
  });

  it("un gruppo grande spinge da più lontano", () => {
    expect(groupPushes([{ x: 0, y: 0 }, { x: 80, y: 0 }], [30, 30], 12)[0].x).toBe(0);
    expect(groupPushes([{ x: 0, y: 0 }, { x: 80, y: 0 }], [60, 30], 12)[0].x).toBeLessThan(0);
  });

  it("la spinta è lunga al massimo 1, anche in mezzo a tanti gruppi, e due gruppi nello stesso punto si separano", () => {
    const centers = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
    for (const v of groupPushes(centers, centers.map(() => 30), 12)) expect(Math.hypot(v.x, v.y)).toBeLessThanOrEqual(1 + 1e-9);
    const same = groupPushes([{ x: 5, y: 5 }, { x: 5, y: 5 }], [30, 30], 12);
    expect(same[0].x).not.toBe(same[1].x);
  });
});

describe("seguire il proprio posto nel gruppo", () => {
  it("al suo posto va con il gruppo", () => {
    expect(followSlot({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 30, y: 0 }, 60, 3)).toEqual({ x: 30, y: 0 });
  });

  it("indietro rincorre il posto, ma mai oltre la velocità massima", () => {
    const v = followSlot({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 30, y: 0 }, 60, 3);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(60);
    expect(v.x).toBeGreaterThan(0);
  });

  it("con il gruppo fermo a beccare, chi è già al suo posto sta fermo", () => {
    expect(followSlot({ x: 7, y: 7 }, { x: 7, y: 7 }, { x: 0, y: 0 }, 60, 3)).toEqual({ x: 0, y: 0 });
  });

  it("vicino al posto si avvicina piano, senza scavalcarlo", () => {
    const v = followSlot({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 0 }, 60, 3);
    expect(v.x).toBeCloseTo(12);
  });
});
