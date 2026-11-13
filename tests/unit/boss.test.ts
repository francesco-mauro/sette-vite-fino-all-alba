// I test dei capi: quando tocca a ognuno, quanta vita ha secondo la durata della notte, e le regole
// dei loro numeri in src/data/balance.ts.
import { describe, expect, it } from "vitest";
import { BOSS, BOSS_ORDER, BOSSES, CAT } from "../../src/data/balance";
import { bossHealth, dueBoss } from "../../src/logic/boss";

const TIMES = [1 / 3, 2 / 3];

describe("quando tocca a un capo", () => {
  it("prima di un terzo della notte non nasce nessuno", () => {
    expect(dueBoss(TIMES, 0, 0)).toBe(-1);
    expect(dueBoss(TIMES, 0, 0.33)).toBe(-1);
  });

  it("a un terzo della notte tocca al primo", () => {
    expect(dueBoss(TIMES, 0, 1 / 3)).toBe(0);
    expect(dueBoss(TIMES, 0, 0.5)).toBe(0);
  });

  it("una volta nato non nasce di nuovo", () => {
    expect(dueBoss(TIMES, 1, 0.5)).toBe(-1);
  });

  it("a due terzi tocca al secondo", () => {
    expect(dueBoss(TIMES, 1, 2 / 3)).toBe(1);
  });

  it("nati tutti e due non nasce più nessuno, fino all'alba", () => {
    expect(dueBoss(TIMES, 2, 1)).toBe(-1);
  });

  it("se la notte è saltata avanti nascono uno alla volta, in ordine", () => {
    expect(dueBoss(TIMES, 0, 0.9)).toBe(0);
    expect(dueBoss(TIMES, 1, 0.9)).toBe(1);
  });
});

describe("la vita di un capo", () => {
  it("nella notte intera è quella scritta nei dati", () => {
    expect(bossHealth(600, 15, 15)).toBe(600);
  });

  it("in una notte più corta cala in proporzione: il gatto ha avuto meno tempo per crescere", () => {
    expect(bossHealth(600, 5, 15)).toBe(200);
    expect(bossHealth(600, 10, 15)).toBe(400);
  });

  it("è sempre un numero intero, e almeno 1", () => {
    expect(bossHealth(100, 7, 15)).toBe(47);
    expect(bossHealth(1, 3, 15)).toBe(1);
  });
});

describe("i due capi nei dati", () => {
  it("sono il gabbiano a un terzo della notte e il gabbiano reale a due terzi", () => {
    expect(BOSS_ORDER).toEqual(["gabbiano", "gabbiano-reale"]);
    expect(BOSSES.gabbiano.at).toBeCloseTo(1 / 3);
    expect(BOSSES["gabbiano-reale"].at).toBeCloseTo(2 / 3);
  });

  it("nascono in ordine di tempo, dentro la notte", () => {
    const times = BOSS_ORDER.map((id) => BOSSES[id].at);
    expect(times).toEqual(times.toSorted((a, b) => a - b));
    for (const t of times) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThan(1);
    }
  });

  it("ognuno ha il suo attacco: la carica oppure l'urlo", () => {
    expect(BOSSES.gabbiano.dive).toBeDefined();
    expect(BOSSES["gabbiano-reale"].scream).toBeDefined();
  });

  it("sono più lenti del gatto anche all'alba, con la velocità cresciuta", () => {
    for (const id of BOSS_ORDER) expect(BOSSES[id].speed * 1.6).toBeLessThan(CAT.speed);
  });

  it("dall'urlo si può uscire: nel tempo dell'avviso il gatto fa più strada del raggio", () => {
    const scream = BOSSES["gabbiano-reale"].scream;
    expect(scream).toBeDefined();
    if (!scream) return;
    expect((CAT.speed * scream.windupMs) / 1000).toBeGreaterThan(scream.radius);
    // e l'urlo parte solo quando il gatto è dentro il raggio: altrimenti sarebbe un avviso a vuoto
    expect(scream.triggerDistance).toBeLessThanOrEqual(scream.radius);
  });

  it("la notte intera, quella su cui è scritta la vita dei capi, è di 15 minuti", () => {
    expect(BOSS.fullNightMinutes).toBe(15);
  });
});
