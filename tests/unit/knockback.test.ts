// I test del miagolio: la spinta che allontana chi è vicino al gatto, e le regole dei suoi numeri.
import { describe, expect, it } from "vitest";
import { CARDS } from "../../src/data/cards";
import { ENEMIES, MEOW, MEOW_LEVELS } from "../../src/data/balance";
import { CARD_TEXTS } from "../../src/data/texts";
import { inReach, knockback } from "../../src/logic/knockback";

const cat = { x: 100, y: 100 };

describe("chi è dentro l'onda del miagolio", () => {
  it("dentro il raggio e sul bordo sì, un pixel oltre no", () => {
    expect(inReach(cat, { x: 120, y: 100 }, 40)).toBe(true);
    expect(inReach(cat, { x: 100, y: 140 }, 40)).toBe(true);
    expect(inReach(cat, { x: 100, y: 141 }, 40)).toBe(false);
  });

  it("conta la distanza vera, non quella lungo gli assi: a 30 e 30 si è a 42, fuori da un raggio di 40", () => {
    expect(inReach(cat, { x: 130, y: 130 }, 40)).toBe(false);
  });
});

describe("la spinta del miagolio", () => {
  it("chi è fuori dal raggio non si sposta", () => {
    expect(knockback(cat, { x: 141, y: 100 }, 40, 24, 160)).toBeNull();
  });

  it("chi è proprio sul bordo del raggio viene spinto", () => {
    expect(knockback(cat, { x: 140, y: 100 }, 40, 24, 160)).not.toBeNull();
  });

  it("la spinta va via dal gatto: chi è a destra va a destra, chi è sopra va in su", () => {
    const right = knockback(cat, { x: 120, y: 100 }, 40, 24, 160);
    expect(right?.x).toBeGreaterThan(0);
    expect(right?.y).toBeCloseTo(0);
    const up = knockback(cat, { x: 100, y: 80 }, 40, 24, 160);
    expect(up?.x).toBeCloseTo(0);
    expect(up?.y).toBeLessThan(0);
  });

  it("la velocità è quella che copre la distanza nel tempo dato: 24 pixel in 160 ms sono 150 al secondo", () => {
    const v = knockback(cat, { x: 120, y: 100 }, 40, 24, 160);
    expect(v?.x).toBeCloseTo(150);
  });

  it("in diagonale la velocità resta la stessa, divisa sui due assi", () => {
    const v = knockback(cat, { x: 110, y: 110 }, 40, 24, 160);
    expect(Math.hypot(v?.x ?? 0, v?.y ?? 0)).toBeCloseTo(150);
    expect(v?.x).toBeCloseTo(v?.y ?? 0);
  });

  it("chi sta esattamente sopra il gatto viene spinto lo stesso, a destra", () => {
    const v = knockback(cat, { x: 100, y: 100 }, 40, 24, 160);
    expect(v).toEqual({ x: 150, y: 0 });
  });

  it("con distanza zero non c'è spinta: è il caso dei capi", () => {
    expect(knockback(cat, { x: 120, y: 100 }, 40, 0, 160)).toBeNull();
  });

  it("con un tempo che non è positivo non c'è spinta, invece di una velocità infinita", () => {
    expect(knockback(cat, { x: 120, y: 100 }, 40, 24, 0)).toBeNull();
  });
});

describe("i numeri del miagolio", () => {
  it("ha cinque livelli, quanti ne dice la sua carta", () => {
    expect(MEOW_LEVELS).toHaveLength(5);
    expect(CARDS.find((c) => c.id === "meow")?.maxLevel).toBe(MEOW_LEVELS.length);
  });

  it("la carta ha il suo nome e le due descrizioni", () => {
    expect(CARD_TEXTS.meow.name).toBe("miagolio");
    expect(CARD_TEXTS.meow.first.length).toBeGreaterThan(0);
    expect(CARD_TEXTS.meow.more.length).toBeGreaterThan(0);
  });

  it("ogni livello è almeno buono quanto quello prima: torna più spesso, e danno, raggio e spinta non calano", () => {
    for (let i = 1; i < MEOW_LEVELS.length; i++) {
      const before = MEOW_LEVELS[i - 1];
      const now = MEOW_LEVELS[i];
      expect(now.cooldownMs).toBeLessThanOrEqual(before.cooldownMs);
      expect(now.damage).toBeGreaterThanOrEqual(before.damage);
      expect(now.radius).toBeGreaterThanOrEqual(before.radius);
      expect(now.push).toBeGreaterThanOrEqual(before.push);
    }
  });

  it("è una difesa, non un'arma di punta: colpisce tutti quelli intorno, quindi il danno di base non supera mai la vita di una zanzara", () => {
    for (const lv of MEOW_LEVELS) expect(lv.damage).toBeLessThanOrEqual(ENEMIES.zanzara.health);
  });

  it("all'ultimo livello il danno di base basta per una zanzara, al primo no", () => {
    expect(MEOW_LEVELS[MEOW_LEVELS.length - 1].damage).toBeGreaterThanOrEqual(ENEMIES.zanzara.health);
    expect(MEOW_LEVELS[0].damage).toBeLessThan(ENEMIES.zanzara.health);
  });

  it("la spinta è più lunga di quella provata all'inizio (24 pixel al primo livello, 42 all'ultimo)", () => {
    expect(MEOW_LEVELS[0].push).toBeGreaterThan(24);
    expect(MEOW_LEVELS[MEOW_LEVELS.length - 1].push).toBeGreaterThan(42);
  });

  it("la spinta non supera mai il raggio dell'onda: chi è spinto non finisce fuori dallo schermo", () => {
    for (const lv of MEOW_LEVELS) expect(lv.push).toBeLessThanOrEqual(lv.radius);
  });

  it("i capi prendono il danno ma non si spostano", () => {
    const lv = MEOW_LEVELS[MEOW_LEVELS.length - 1];
    expect(knockback(cat, { x: 110, y: 100 }, lv.radius, lv.push * MEOW.bossPush, MEOW.pushMs)).toBeNull();
  });

  it("la spinta dura meno di quanto ci mette il miagolio a tornare", () => {
    for (const lv of MEOW_LEVELS) expect(MEOW.pushMs).toBeLessThan(lv.cooldownMs);
  });
});
