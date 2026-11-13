// I test del supplì a terra: quando un nemico eliminato ne lascia uno, quando il gatto lo mangia, e le regole dei suoi numeri.
import { describe, expect, it } from "vitest";
import { FALLBACK, KIBBLE, SNACK } from "../../src/data/balance";
import { createHealth, heal } from "../../src/logic/health";
import { dropsSnack, isHungry } from "../../src/logic/snack";

describe("quando un nemico eliminato lascia un supplì", () => {
  it("cade se il dado esce sotto la probabilità e la pausa è passata", () => {
    expect(dropsSnack(0.01, 0.02, 60_000, 20_000, 30_000)).toBe(true);
  });

  it("non cade se il dado esce sopra, o esattamente sulla probabilità", () => {
    expect(dropsSnack(0.5, 0.02, 60_000, 20_000, 30_000)).toBe(false);
    expect(dropsSnack(0.02, 0.02, 60_000, 20_000, 30_000)).toBe(false);
  });

  it("non cade se dall'ultimo è passato troppo poco, anche con il dado buono", () => {
    expect(dropsSnack(0, 0.02, 49_999, 20_000, 30_000)).toBe(false);
  });

  it("esattamente alla fine della pausa può cadere di nuovo", () => {
    expect(dropsSnack(0, 0.02, 50_000, 20_000, 30_000)).toBe(true);
  });

  it("il primo della notte non aspetta nessuna pausa", () => {
    expect(dropsSnack(0, 0.02, 0, -Infinity, 30_000)).toBe(true);
  });

  it("con probabilità zero non cade mai", () => {
    expect(dropsSnack(0, 0, 60_000, -Infinity, 30_000)).toBe(false);
  });
});

describe("quando il gatto mangia il supplì", () => {
  it("a vita piena no: resta a terra, per dopo", () => {
    expect(isHungry(createHealth(100), 10)).toBe(false);
  });

  it("per un graffietto no: manca meno della soglia", () => {
    expect(isHungry({ ...createHealth(100), current: 91 }, 10)).toBe(false);
  });

  it("quando manca proprio la soglia, o di più, sì", () => {
    expect(isHungry({ ...createHealth(100), current: 90 }, 10)).toBe(true);
    expect(isHungry({ ...createHealth(100), current: 5 }, 10)).toBe(true);
  });

  it("conta quanto manca alla vita massima di adesso, anche con pancia piena", () => {
    expect(isHungry({ ...createHealth(140), current: 131 }, 10)).toBe(false);
    expect(isHungry({ ...createHealth(140), current: 100 }, 10)).toBe(true);
  });

  it("la cura non supera mai la vita massima", () => {
    expect(heal({ ...createHealth(100), current: 85 }, SNACK.heal).current).toBe(100);
  });
});

describe("i numeri del supplì", () => {
  it("cura quanto il supplì delle carte: uno è uno, a terra o in mano", () => {
    expect(SNACK.heal).toBe(FALLBACK.healAmount);
  });

  it("la probabilità è una probabilità, e non è zero", () => {
    expect(SNACK.chance).toBeGreaterThan(0);
    expect(SNACK.chance).toBeLessThan(1);
  });

  it("la soglia è più bassa della cura: mangiarlo vale sempre almeno un terzo di quello che dà", () => {
    expect(SNACK.minMissing).toBeGreaterThanOrEqual(SNACK.heal / 3);
    expect(SNACK.minMissing).toBeLessThan(SNACK.heal);
  });

  it("in una notte da 5 minuti, anche con il dado sempre buono, ne cadono al più undici", () => {
    expect(Math.floor((5 * 60_000) / SNACK.minGapMs) + 1).toBeLessThanOrEqual(11);
  });

  it("a terra ce ne stanno pochi insieme, molti meno delle crocchette", () => {
    expect(SNACK.maxOnGround).toBeGreaterThanOrEqual(1);
    expect(SNACK.maxOnGround).toBeLessThan(KIBBLE.maxOnGround);
  });
});
