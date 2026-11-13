// I test dei modi di camminare: la zanzara che ondeggia, la pantegana a scatti, il piccione che si ferma a beccare.
import { describe, expect, it } from "vitest";
import { ENEMIES } from "../../src/data/balance";
import { dashStep, peckStep, startDash, startPeck, zigzag } from "../../src/logic/patterns";

const cfgZig = { periodMs: 800, swing: 1.2 };

describe("la zanzara a zig-zag", () => {
  it("corre sempre alla sua velocità, in ogni istante dell'ondeggio", () => {
    for (let t = 0; t < 1600; t += 50) {
      const v = zigzag({ x: 0, y: 0 }, { x: 100, y: 0 }, 55, t, cfgZig);
      expect(Math.hypot(v.x, v.y)).toBeCloseTo(55);
    }
  });

  it("all'inizio e a metà dell'ondeggio va dritta verso il gatto", () => {
    for (const t of [0, 400, 800]) {
      const v = zigzag({ x: 0, y: 0 }, { x: 100, y: 0 }, 55, t, cfgZig);
      expect(v.x).toBeCloseTo(55);
      expect(v.y).toBeCloseTo(0);
    }
  });

  it("a un quarto piega da una parte, a tre quarti dall'altra", () => {
    const a = zigzag({ x: 0, y: 0 }, { x: 100, y: 0 }, 55, 200, cfgZig);
    const b = zigzag({ x: 0, y: 0 }, { x: 100, y: 0 }, 55, 600, cfgZig);
    expect(a.y).toBeGreaterThan(0);
    expect(b.y).toBeLessThan(0);
    expect(a.y).toBeCloseTo(-b.y);
  });

  it("non smette mai di avvicinarsi: la parte verso il gatto resta sempre positiva", () => {
    for (let t = 0; t < 1600; t += 25) {
      const v = zigzag({ x: 10, y: 10 }, { x: 10, y: -90 }, 55, t, cfgZig);
      expect(v.y).toBeLessThan(0);
    }
  });

  it("sopra il gatto si ferma, senza numeri impossibili", () => {
    expect(zigzag({ x: 5, y: 5 }, { x: 5, y: 5 }, 55, 200, cfgZig)).toEqual({ x: 0, y: 0 });
  });
});

describe("la pantegana a scatti", () => {
  const cfgDash = { dashMs: 1500 };

  it("al primo passo punta dove è il gatto, alla sua velocità", () => {
    const step = dashStep(startDash(), { x: 0, y: 0 }, { x: 30, y: 40 }, 1000, 28, cfgDash);
    expect(step.velocity.x).toBeCloseTo(28 * 0.6);
    expect(step.velocity.y).toBeCloseTo(28 * 0.8);
    expect(step.state.until).toBe(2500);
  });

  it("durante lo scatto tiene la sua direzione, anche se il gatto si sposta", () => {
    const first = dashStep(startDash(), { x: 0, y: 0 }, { x: 100, y: 0 }, 0, 28, cfgDash);
    const later = dashStep(first.state, { x: 20, y: 0 }, { x: 20, y: 100 }, 1499, 28, cfgDash);
    expect(later.velocity.x).toBeCloseTo(28);
    expect(later.velocity.y).toBeCloseTo(0);
  });

  it("finito lo scatto ricalcola verso dove è il gatto adesso", () => {
    const first = dashStep(startDash(), { x: 0, y: 0 }, { x: 100, y: 0 }, 0, 28, cfgDash);
    const next = dashStep(first.state, { x: 40, y: 0 }, { x: 40, y: 100 }, 1500, 28, cfgDash);
    expect(next.velocity.x).toBeCloseTo(0);
    expect(next.velocity.y).toBeCloseTo(28);
    expect(next.state.until).toBe(3000);
  });

  it("con la velocità che cresce nella notte, la direzione resta e la corsa segue la velocità nuova", () => {
    const first = dashStep(startDash(), { x: 0, y: 0 }, { x: 100, y: 0 }, 0, 28, cfgDash);
    const later = dashStep(first.state, { x: 10, y: 0 }, { x: 100, y: 0 }, 500, 40, cfgDash);
    expect(later.velocity.x).toBeCloseTo(40);
  });

  it("se nasce proprio sopra il gatto resta ferma fino al prossimo scatto", () => {
    const step = dashStep(startDash(), { x: 5, y: 5 }, { x: 5, y: 5 }, 0, 28, cfgDash);
    expect(step.velocity).toEqual({ x: 0, y: 0 });
  });
});

describe("il piccione che si ferma a beccare", () => {
  const cfgPeck = { walkMs: 2000, peckMs: 400 };

  it("appena nato cammina, per un tempo che dipende da lui", () => {
    const a = peckStep(startPeck(), 1000, cfgPeck, 0);
    const b = peckStep(startPeck(), 1000, cfgPeck, 0.999);
    expect(a.moving).toBe(true);
    expect(a.state.until).toBe(1000 + 1500);
    // da tre quarti a cinque quarti della camminata di base: qui quasi 2500
    expect(b.state.until).toBeCloseTo(1000 + 2000 * (0.75 + 0.5 * 0.999));
  });

  it("finita la camminata si ferma a beccare, poi riparte", () => {
    let step = peckStep(startPeck(), 0, cfgPeck, 0.5);
    expect(step.moving).toBe(true);
    step = peckStep(step.state, 1999, cfgPeck, 0.5);
    expect(step.moving).toBe(true);
    step = peckStep(step.state, 2000, cfgPeck, 0.5);
    expect(step.moving).toBe(false);
    expect(step.state.until).toBe(2400);
    step = peckStep(step.state, 2399, cfgPeck, 0.5);
    expect(step.moving).toBe(false);
    step = peckStep(step.state, 2400, cfgPeck, 0.5);
    expect(step.moving).toBe(true);
    expect(step.state.until).toBe(4400);
  });

  it("due piccioni nati insieme non si fermano nello stesso istante", () => {
    const a = peckStep(startPeck(), 0, cfgPeck, 0.1).state.until;
    const b = peckStep(startPeck(), 0, cfgPeck, 0.7).state.until;
    expect(a).not.toBe(b);
  });
});

describe("chi cammina come", () => {
  it("la zanzara ondeggia, la pantegana va a scatti, il piccione becca, la cornacchia resta com'era", () => {
    expect(ENEMIES.zanzara.zigzag).toBeDefined();
    expect(ENEMIES.pantegana.dash).toBeDefined();
    expect(ENEMIES.piccione.peck).toBeDefined();
    const crow = ENEMIES.cornacchia;
    expect(crow.zigzag ?? crow.dash ?? crow.peck).toBeUndefined();
  });

  it("ondeggiando la zanzara va verso il gatto almeno a metà della sua velocità", () => {
    const swing = ENEMIES.zanzara.zigzag?.swing ?? 0;
    expect(Math.cos(Math.atan(swing))).toBeGreaterThanOrEqual(0.5);
  });

  it("il piccione becca per meno tempo di quanto cammina: resta un nemico che arriva", () => {
    const peck = ENEMIES.piccione.peck;
    expect(peck).toBeDefined();
    expect(peck?.peckMs ?? Infinity).toBeLessThan((peck?.walkMs ?? 0) * 0.75);
  });
});
