// I test delle statistiche: dai livelli delle carte ai numeri del gatto e delle armi.
import { describe, expect, it } from "vitest";
import { computeStats } from "../../src/logic/stats";

describe("le statistiche dalle carte", () => {
  it("senza carte: il gatto di base e solo il graffio", () => {
    const s = computeStats({});
    expect(s.speedMultiplier).toBe(1);
    expect(s.damageMultiplier).toBe(1);
    expect(s.weapons.scratch).toBe(1);
    expect(s.weapons.tail).toBe(0);
    expect(s.weapons.fur).toBe(0);
  });

  it("ogni livello di velocità, danno e calamita aggiunge la sua parte", () => {
    const s = computeStats({ speed: 2, damage: 3, magnet: 1 });
    expect(s.speedMultiplier).toBeCloseTo(1.2);
    expect(s.damageMultiplier).toBeCloseTo(1.45);
    expect(s.magnetMultiplier).toBeCloseTo(1.25);
  });

  it("la vita massima cresce di 20 per livello", () => {
    expect(computeStats({ health: 2 }).maxHealthBonus).toBe(40);
  });

  it("la carta del graffio alza il suo livello oltre quello di partenza", () => {
    expect(computeStats({ scratch: 2 }).weapons.scratch).toBe(3);
    expect(computeStats({ tail: 1 }).weapons.tail).toBe(1);
  });
});
