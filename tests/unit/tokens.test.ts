// I test del passo 3 contro il blob: i gettoni d'attacco, l'anello di respiro, la varietà, lo spread, il giro del
// piccione, lo scatto della pantegana sul punto dove il gatto sarà, il passaggio dritto della zanzara e il fumetto.
import { describe, expect, it } from "vitest";
import { TOKENS } from "../../src/data/balance";
import { bubblePoint } from "../../src/logic/hordes";
import { spreadAway } from "../../src/logic/separation";
import { leadTarget } from "../../src/logic/targeting";
import { arrivalAngle, assignTokens, flockGoal, keepRing, lockHeading, parseTokensParam, ringTarget, variedSpeed } from "../../src/logic/tokens";

const cfg = { max: 2, range: 60, holdMs: 1500, restMs: 1000 };
const none = (n: number) => Array.from({ length: n }, () => ({ until: 0, rest: 0 }));

describe("i gettoni d'attacco", () => {
  it("vanno ai più vicini, al massimo `max`, e solo entro `range`", () => {
    const out = assignTokens([50, 10, 30, 70], none(4), 0, cfg);
    expect(out.map((t) => t.until > 0)).toEqual([false, true, true, false]);
    expect(out[1].until).toBe(1500);
  });

  it("chi ha il gettone lo tiene finché resta vicino e non scade, e nessuno glielo ruba", () => {
    const held = [{ until: 1500, rest: 0 }, { until: 1500, rest: 0 }, { until: 0, rest: 0 }];
    const out = assignTokens([55, 40, 5], held, 1000, cfg);
    expect(out.map((t) => t.until > 0)).toEqual([true, true, false]);
  });

  it("chi si allontana o arriva alla scadenza lo lascia, riposa, e il posto va a un altro", () => {
    const held = [{ until: 1500, rest: 0 }, { until: 3000, rest: 0 }, { until: 0, rest: 0 }];
    const out = assignTokens([20, 90, 15], held, 1500, cfg);
    expect(out[0]).toEqual({ until: 0, rest: 2500 });
    expect(out[1].until).toBe(0);
    expect(out[2].until).toBe(3000);
    // chi riposa non lo riprende subito, anche se è vicino e c'è posto
    const again = assignTokens([20, 90, 15], out, 2000, cfg);
    expect(again[0].until).toBe(0);
    expect(assignTokens([20, 90, 15], out, 2500, cfg)[0].until).toBe(4000);
  });

  it("i numeri del disegno: 8 gettoni, anello di 28 pixel", () => {
    expect(TOKENS.max).toBe(8);
    expect(TOKENS.ring).toBe(28);
  });

  it("?gettoni=N per le prove, con i valori sbagliati torna il numero del gioco", () => {
    expect(parseTokensParam("?gettoni=200", 8)).toBe(200);
    expect(parseTokensParam("?debug&gettoni=3", 8)).toBe(3);
    expect(parseTokensParam("", 8)).toBe(8);
    expect(parseTokensParam("?gettoni=0", 8)).toBe(8);
    expect(parseTokensParam("?gettoni=abc", 8)).toBe(8);
    expect(parseTokensParam("?gettoni=999", 8)).toBe(8);
  });
});

describe("l'anello di respiro", () => {
  it("dentro l'anello spinge verso l'esterno, più forte vicino al gatto, lunga al massimo 1", () => {
    const near = keepRing({ x: 5, y: 0 }, { x: 0, y: 0 }, 28);
    const far = keepRing({ x: 20, y: 0 }, { x: 0, y: 0 }, 28);
    expect(near.x).toBeGreaterThan(far.x);
    expect(far.x).toBeGreaterThan(0);
    expect(near.y).toBe(0);
    expect(Math.hypot(near.x, near.y)).toBeLessThanOrEqual(1);
  });

  it("fuori dall'anello non spinge; sopra il gatto spinge comunque da una parte", () => {
    expect(keepRing({ x: 40, y: 0 }, { x: 0, y: 0 }, 28)).toEqual({ x: 0, y: 0 });
    const on = keepRing({ x: 0, y: 0 }, { x: 0, y: 0 }, 28);
    expect(Math.hypot(on.x, on.y)).toBeCloseTo(1);
  });

  it("il punto dell'anello al proprio angolo", () => {
    const p = ringTarget({ x: 100, y: 50 }, Math.PI / 2, 28);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(78);
  });
});

describe("la varietà", () => {
  it("velocità entro ±10%, angolo d'arrivo tra 0 e un giro", () => {
    expect(variedSpeed(100, 0, 0.1)).toBeCloseTo(90);
    expect(variedSpeed(100, 1, 0.1)).toBeCloseTo(110);
    expect(variedSpeed(100, 0.5, 0.1)).toBeCloseTo(100);
    for (const j of [0, 0.3, 0.99]) {
      const a = arrivalAngle(j);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(Math.PI * 2);
    }
    // due nemici nati uno dopo l'altro non hanno lo stesso angolo
    expect(arrivalAngle(0.1)).not.toBeCloseTo(arrivalAngle(0.2));
  });
});

describe("lo spread", () => {
  it("chi ha almeno 3 vicini stretti si stacca dalla parte opposta, gli altri no", () => {
    const points = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: 5, y: 5 }, { x: 100, y: 100 }];
    const out = spreadAway(points, 12, 3);
    // il primo ha tre vicini, tutti verso destra e in basso: va a sinistra e in alto
    expect(out[0].x).toBeLessThan(0);
    expect(out[0].y).toBeLessThan(0);
    expect(Math.hypot(out[0].x, out[0].y)).toBeCloseTo(1);
    expect(out[4]).toEqual({ x: 0, y: 0 });
    const pair = spreadAway([{ x: 0, y: 0 }, { x: 5, y: 0 }], 12, 3);
    expect(pair[0]).toEqual({ x: 0, y: 0 });
  });
});

describe("i ruoli", () => {
  it("la pantegana punta dove il gatto sarà fra un secondo", () => {
    expect(leadTarget({ x: 10, y: 20 }, { x: 80, y: 0 }, 1000)).toEqual({ x: 90, y: 20 });
    expect(leadTarget({ x: 10, y: 20 }, { x: 0, y: 0 }, 1000)).toEqual({ x: 10, y: 20 });
  });

  it("lo stormo vicino a un gatto lento va sull'anello al suo angolo; se il gatto scappa lo insegue", () => {
    const ring = { near: 90, radius: 48, slowFactor: 1.5 };
    const slow = flockGoal({ x: 60, y: 0 }, { x: 0, y: 0 }, 20, 35, 0, ring);
    expect(slow.x).toBeCloseTo(48);
    expect(slow.y).toBeCloseTo(0);
    expect(flockGoal({ x: 60, y: 0 }, { x: 0, y: 0 }, 80, 35, 0, ring)).toEqual({ x: 0, y: 0 });
    expect(flockGoal({ x: 200, y: 0 }, { x: 0, y: 0 }, 0, 35, 0, ring)).toEqual({ x: 0, y: 0 });
  });

  it("lo sciame prende la direzione del gatto quando entra in vista, poi non si gira più", () => {
    expect(lockHeading(null, { x: 0, y: 0 }, { x: 10, y: 0 }, false)).toBeNull();
    const h = lockHeading(null, { x: 0, y: 0 }, { x: 10, y: 0 }, true);
    expect(h).toBeCloseTo(0);
    expect(lockHeading(h, { x: 0, y: 0 }, { x: 0, y: 10 }, true)).toBe(h);
  });
});

describe("il fumetto", () => {
  it("al centro del lato, dentro lo schermo di raggio più margine", () => {
    expect(bubblePoint("left", 480, 270, 12, 4)).toEqual({ x: 16, y: 135 });
    expect(bubblePoint("right", 480, 270, 12, 4)).toEqual({ x: 464, y: 135 });
    expect(bubblePoint("top", 480, 270, 12, 4)).toEqual({ x: 240, y: 16 });
    expect(bubblePoint("bottom", 480, 270, 12, 4)).toEqual({ x: 240, y: 254 });
  });
});
