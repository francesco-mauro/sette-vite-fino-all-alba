// I test delle statistiche: dai livelli delle carte ai numeri del gatto e delle armi.
import { describe, expect, it } from "vitest";
import { CHEST, FUR_LEVELS, MEOW_LEVELS, SCRATCH_LEVELS, TAIL_LEVELS } from "../../src/data/balance";
import { computeStats, levelPicks, levelTripleChance, tripleChance, tuneWeapon } from "../../src/logic/stats";

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

  it("pancia piena dà anche una rigenerazione leggerissima, 0,2 di vita al secondo per livello", () => {
    expect(computeStats({}).regenPerSecond).toBe(0);
    expect(computeStats({ health: 5 }).regenPerSecond).toBeCloseTo(1);
  });

  it("la carta del graffio alza il suo livello oltre quello di partenza", () => {
    expect(computeStats({ scratch: 2 }).weapons.scratch).toBe(3);
    expect(computeStats({ tail: 1 }).weapons.tail).toBe(1);
  });

  it("senza carte cadenza, area e fortuna non cambiano niente", () => {
    const s = computeStats({});
    expect(s.cooldownMultiplier).toBe(1);
    expect(s.areaMultiplier).toBe(1);
    expect(s.rareWeightBonus).toBe(0);
    expect(s.tripleChanceBonus).toBe(0);
  });

  it("riflessi pronti: le armi partono più spesso, l'8% in più per livello, quindi l'attesa si accorcia", () => {
    expect(computeStats({ haste: 1 }).cooldownMultiplier).toBeCloseTo(1 / 1.08);
    expect(computeStats({ haste: 5 }).cooldownMultiplier).toBeCloseTo(1 / 1.4);
  });

  it("riflessi pronti non porta mai l'attesa sotto la metà", () => {
    for (let lv = 0; lv <= 5; lv++) expect(computeStats({ haste: lv }).cooldownMultiplier).toBeGreaterThan(0.5);
  });

  it("pelo gonfio: le armi arrivano più lontano, l'8% in più per livello", () => {
    expect(computeStats({ area: 1 }).areaMultiplier).toBeCloseTo(1.08);
    expect(computeStats({ area: 5 }).areaMultiplier).toBeCloseTo(1.4);
  });

  it("quadrifoglio: ogni livello aggiunge peso alle carte rare e 10 punti su 100 alla cassa tripla", () => {
    expect(computeStats({ luck: 1 }).rareWeightBonus).toBe(1);
    expect(computeStats({ luck: 5 }).rareWeightBonus).toBe(5);
    expect(computeStats({ luck: 2 }).tripleChanceBonus).toBeCloseTo(0.2);
  });

  // Francesco, 14 novembre 2026: la fortuna delle casse «va alzata un altro pochino». Era 10 su 100 più 8 per livello.
  it("quadrifoglio: la cassa tripla va da 15 su 100 senza a 65 su 100 al livello 5", () => {
    expect(tripleChance(0)).toBeCloseTo(0.15);
    expect(tripleChance(1)).toBeCloseTo(0.25);
    expect(tripleChance(5)).toBeCloseTo(0.65);
  });

  // Francesco, 14 novembre 2026: il quadrifoglio «funziona anche per un triplo potenziamento al salire di livello».
  it("quadrifoglio: il livello triplo è 3 su 100 per livello della carta, mai senza", () => {
    expect(levelTripleChance(0)).toBe(0);
    expect(levelTripleChance(1)).toBeCloseTo(0.03);
    expect(levelTripleChance(5)).toBeCloseTo(0.15);
  });

  it("levelPicks: tre scelte sotto la probabilità del livello triplo, una sopra o senza quadrifoglio", () => {
    expect(levelPicks(0, () => 0)).toBe(1);
    expect(levelPicks(5, () => 0.05)).toBe(3);
    expect(levelPicks(5, () => 0.15)).toBe(1);
    expect(levelPicks(1, () => 0.029)).toBe(3);
  });

  it("quadrifoglio: la cassa tripla senza carta è CHEST.tripleChance", () => {
    expect(tripleChance(0)).toBeCloseTo(CHEST.tripleChance);
  });

  it("il miagolio parte da zero e sale con la sua carta", () => {
    expect(computeStats({}).weapons.meow).toBe(0);
    expect(computeStats({ meow: 2 }).weapons.meow).toBe(2);
  });
});

describe("i numeri di un'arma dopo i potenziamenti", () => {
  it("senza carte l'arma resta com'è", () => {
    expect(tuneWeapon(SCRATCH_LEVELS[0], computeStats({}))).toEqual(SCRATCH_LEVELS[0]);
  });

  it("riflessi pronti accorcia l'attesa di tutte e quattro le armi", () => {
    const stats = computeStats({ haste: 5 });
    for (const lv of [SCRATCH_LEVELS[0], TAIL_LEVELS[0], FUR_LEVELS[0], MEOW_LEVELS[0]]) {
      expect(tuneWeapon(lv, stats).cooldownMs).toBeCloseTo(lv.cooldownMs / 1.4);
    }
  });

  it("pelo gonfio allunga la portata del graffio e il raggio di coda e miagolio", () => {
    const stats = computeStats({ area: 5 });
    expect(tuneWeapon(SCRATCH_LEVELS[0], stats).range).toBeCloseTo(SCRATCH_LEVELS[0].range * 1.4);
    expect(tuneWeapon(TAIL_LEVELS[0], stats).radius).toBeCloseTo(TAIL_LEVELS[0].radius * 1.4);
    expect(tuneWeapon(MEOW_LEVELS[4], stats).radius).toBeCloseTo(84);
  });

  it("pelo gonfio non cambia il pelo che vola, che arriva già al bordo dello schermo", () => {
    expect(tuneWeapon(FUR_LEVELS[2], computeStats({ area: 5 }))).toEqual(FUR_LEVELS[2]);
  });

  it("danno, spinta e larghezza dell'arco non cambiano, e la tabella di partenza non viene toccata", () => {
    const stats = computeStats({ haste: 5, area: 5 });
    const tail = tuneWeapon(TAIL_LEVELS[0], stats);
    const meow = tuneWeapon(MEOW_LEVELS[0], stats);
    expect(tail.damage).toBe(TAIL_LEVELS[0].damage);
    expect(tail.halfAngle).toBe(TAIL_LEVELS[0].halfAngle);
    expect(meow.push).toBe(MEOW_LEVELS[0].push);
    expect(MEOW_LEVELS[0].radius).toBe(40);
    expect(TAIL_LEVELS[0].cooldownMs).toBe(2000);
  });
});
