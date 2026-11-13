// I test delle ondate: la tabella minuto per minuto (chi arriva, in quanti, ogni quanto) e l'orologio
// che fa nascere ogni tipo di nemico al suo momento.
import { describe, expect, it } from "vitest";
import { ENEMIES, WAVES, type EnemyId } from "../../src/data/balance";
import { WAVE_TABLE } from "../../src/data/waves";
import { dueSpawns, spawnPlan, waveRow, type WaveRow } from "../../src/logic/waves";

const KINDS = Object.keys(ENEMIES) as EnemyId[];

// quanti nemici di quel tipo nascono al secondo in una riga: 0 se in quella riga non c'è
function perSecond(row: WaveRow, kind: EnemyId): number {
  const w = row[kind];
  return w ? w.size / (w.everyMs / 1000) : 0;
}

// il primo minuto (contando da zero) in cui quel tipo compare nella tabella
function firstMinute(kind: EnemyId): number {
  return WAVE_TABLE.findIndex((row) => row[kind] !== undefined);
}

describe("la tabella delle ondate", () => {
  it("ha una riga per ogni minuto della notte da quindici", () => {
    expect(WAVE_TABLE).toHaveLength(15);
  });

  it("il primo minuto ci sono solo i piccioni", () => {
    expect(Object.keys(WAVE_TABLE[0])).toEqual(["piccione"]);
  });

  it("entro l'ultimo minuto sono arrivati tutti e quattro i nemici", () => {
    expect(new Set(Object.keys(WAVE_TABLE[14]))).toEqual(new Set(KINDS));
  });

  it("i nemici arrivano uno alla volta: zanzara, poi pantegana, poi cornacchia", () => {
    expect(firstMinute("piccione")).toBe(0);
    expect(firstMinute("zanzara")).toBeGreaterThan(firstMinute("piccione"));
    expect(firstMinute("pantegana")).toBeGreaterThan(firstMinute("zanzara"));
    expect(firstMinute("cornacchia")).toBeGreaterThan(firstMinute("pantegana"));
  });

  it("la notte non diventa mai più facile: ogni tipo, una volta arrivato, non cala più", () => {
    for (const kind of KINDS) {
      for (let i = 1; i < WAVE_TABLE.length; i++) {
        expect(perSecond(WAVE_TABLE[i], kind), `${kind}, minuto ${i + 1}`).toBeGreaterThanOrEqual(perSecond(WAVE_TABLE[i - 1], kind));
      }
    }
  });

  it("ogni gruppo ha almeno un nemico e un intervallo vero", () => {
    for (const row of WAVE_TABLE) {
      for (const kind of Object.keys(row) as EnemyId[]) {
        expect(row[kind]!.size).toBeGreaterThanOrEqual(1);
        expect(row[kind]!.everyMs).toBeGreaterThanOrEqual(200);
      }
    }
  });
});

describe("la riga della tabella secondo quanta notte è passata", () => {
  it("all'inizio la prima riga, all'alba l'ultima", () => {
    expect(waveRow(0, WAVE_TABLE)).toBe(WAVE_TABLE[0]);
    expect(waveRow(1, WAVE_TABLE)).toBe(WAVE_TABLE[14]);
  });

  it("a metà notte la riga di mezzo", () => {
    // 7 minuti e mezzo su 15: l'ottavo minuto, cioè la riga 7
    expect(waveRow(0.5, WAVE_TABLE)).toBe(WAVE_TABLE[7]);
  });

  it("prima dell'inizio e oltre l'alba resta nella tabella", () => {
    expect(waveRow(-1, WAVE_TABLE)).toBe(WAVE_TABLE[0]);
    expect(waveRow(2, WAVE_TABLE)).toBe(WAVE_TABLE[14]);
  });

  it("la notte da 5 minuti passa dalle stesse righe, tre volte più in fretta", () => {
    // il terzo minuto della notte da 15 e il secondo 50 della notte da 5 sono lo stesso punto della notte
    const long = waveRow((2 * 60_000 + 30_000) / (15 * 60_000), WAVE_TABLE);
    const short = waveRow(50_000 / (5 * 60_000), WAVE_TABLE);
    expect(short).toBe(long);
  });
});

describe("chi nasce adesso", () => {
  const row: WaveRow = { piccione: { size: 3, everyMs: 2000 }, zanzara: { size: 4, everyMs: 7000 } };

  it("all'inizio nasce subito un gruppo di ogni tipo della riga", () => {
    const { spawns } = dueSpawns(row, {}, 0);
    expect(spawns).toEqual([{ kind: "piccione", size: 3 }, { kind: "zanzara", size: 4 }]);
  });

  it("poi ognuno aspetta il suo intervallo", () => {
    const first = dueSpawns(row, {}, 0);
    expect(first.nextAt).toEqual({ piccione: 2000, zanzara: 7000 });
    expect(dueSpawns(row, first.nextAt, 1999).spawns).toEqual([]);
    const second = dueSpawns(row, first.nextAt, 2000);
    expect(second.spawns).toEqual([{ kind: "piccione", size: 3 }]);
    expect(second.nextAt).toEqual({ piccione: 4000, zanzara: 7000 });
  });

  it("un tipo che entra a notte iniziata nasce al primo controllo, senza aspettare", () => {
    const before = dueSpawns({ piccione: { size: 3, everyMs: 2000 } }, {}, 0);
    const { spawns } = dueSpawns(row, before.nextAt, 60_500);
    expect(spawns).toContainEqual({ kind: "zanzara", size: 4 });
  });

  it("non tocca gli orologi che riceve", () => {
    const nextAt = { piccione: 0 };
    dueSpawns(row, nextAt, 0);
    expect(nextAt).toEqual({ piccione: 0 });
  });
});

describe("i nemici crescono con la notte", () => {
  it("partono come sempre e all'alba fanno più danno e sono più veloci", () => {
    expect(spawnPlan(0)).toMatchObject({ damageScale: 1, speedScale: 1 });
    expect(spawnPlan(1)).toMatchObject({ damageScale: WAVES.endDamageScale, speedScale: WAVES.endSpeedScale });
    expect(WAVES.endDamageScale).toBeGreaterThan(1);
    expect(WAVES.endSpeedScale).toBeGreaterThan(1);
  });

  it("danno e velocità non scendono mai andando avanti", () => {
    let prev = spawnPlan(0);
    for (let p = 0.05; p <= 1; p += 0.05) {
      const now = spawnPlan(p);
      expect(now.damageScale).toBeGreaterThanOrEqual(prev.damageScale);
      expect(now.speedScale).toBeGreaterThanOrEqual(prev.speedScale);
      prev = now;
    }
  });

  it("oltre l'alba o prima dell'inizio resta nei limiti", () => {
    expect(spawnPlan(2)).toEqual(spawnPlan(1));
    expect(spawnPlan(-1)).toEqual(spawnPlan(0));
  });

  it("porta con sé la riga della tabella di quel momento", () => {
    expect(spawnPlan(0).row).toBe(WAVE_TABLE[0]);
    expect(spawnPlan(1).row).toBe(WAVE_TABLE[14]);
  });
});

describe("i quattro nemici", () => {
  it("la zanzara è la più veloce e la più fragile", () => {
    for (const kind of KINDS.filter((k) => k !== "zanzara")) {
      expect(ENEMIES.zanzara.speed).toBeGreaterThan(ENEMIES[kind].speed);
      expect(ENEMIES.zanzara.health).toBeLessThan(ENEMIES[kind].health);
    }
  });

  it("la pantegana è la più resistente", () => {
    for (const kind of KINDS.filter((k) => k !== "pantegana")) {
      expect(ENEMIES.pantegana.health).toBeGreaterThan(ENEMIES[kind].health);
    }
  });

  it("solo la cornacchia scende in picchiata", () => {
    expect(ENEMIES.cornacchia.dive).toBeDefined();
    for (const kind of KINDS.filter((k) => k !== "cornacchia")) expect(ENEMIES[kind].dive).toBeUndefined();
  });

  it("solo la zanzara lascia la crocchetta ogni tanto: gli altri sempre", () => {
    expect(ENEMIES.zanzara.kibbleChance).toBeGreaterThan(0);
    expect(ENEMIES.zanzara.kibbleChance).toBeLessThan(1);
    for (const kind of KINDS.filter((k) => k !== "zanzara")) expect(ENEMIES[kind].kibbleChance).toBe(1);
  });

  it("il primo graffio basta ancora per un piccione", () => {
    // se la vita del piccione supera il primo graffio le uccisioni si dimezzano (misura del 12 novembre 2026)
    expect(ENEMIES.piccione.health).toBeLessThanOrEqual(10);
  });
});
