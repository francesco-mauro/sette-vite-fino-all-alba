// I test della partita intera: l'orologio, le ondate che crescono, il punteggio, il record.
import { describe, expect, it } from "vitest";
import { formatClock } from "../../src/logic/clock";
import { loadRecord, saveRecord, type Storage } from "../../src/logic/record";
import { WAVES } from "../../src/data/balance";
import { spawnPlan } from "../../src/logic/waves";
import { computeScore } from "../../src/shared/score";

describe("l'orologio della notte", () => {
  it("scrive minuti e secondi con due cifre", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65_400)).toBe("01:05");
    expect(formatClock(15 * 60_000)).toBe("15:00");
  });
});

describe("le ondate", () => {
  it("all'inizio pochi piccioni e radi, all'alba tanti e fitti", () => {
    const start = spawnPlan(0);
    const end = spawnPlan(1);
    expect(end.intervalMs).toBeLessThan(start.intervalMs);
    expect(end.groupSize).toBeGreaterThan(start.groupSize);
  });

  it("la notte non diventa mai più facile andando avanti", () => {
    let prev = spawnPlan(0);
    for (let p = 0.05; p <= 1; p += 0.05) {
      const now = spawnPlan(p);
      expect(now.intervalMs).toBeLessThanOrEqual(prev.intervalMs);
      expect(now.groupSize).toBeGreaterThanOrEqual(prev.groupSize);
      expect(now.damageScale).toBeGreaterThanOrEqual(prev.damageScale);
      expect(now.speedScale).toBeGreaterThanOrEqual(prev.speedScale);
      prev = now;
    }
  });

  it("i piccioni partono come sempre e all'alba fanno più danno e sono più veloci", () => {
    expect(spawnPlan(0)).toMatchObject({ damageScale: 1, speedScale: 1 });
    expect(spawnPlan(1)).toMatchObject({ damageScale: WAVES.endDamageScale, speedScale: WAVES.endSpeedScale });
    expect(WAVES.endDamageScale).toBeGreaterThan(1);
    expect(WAVES.endSpeedScale).toBeGreaterThan(1);
  });

  it("oltre l'alba o prima dell'inizio resta nei limiti", () => {
    expect(spawnPlan(2)).toEqual(spawnPlan(1));
    expect(spawnPlan(-1)).toEqual(spawnPlan(0));
  });
});

describe("il punteggio", () => {
  it("conta i secondi vivi, i piccioni presi e le mance", () => {
    expect(computeScore({ survivedMs: 60_000, kills: 10, points: 100, livesLost: 0, dawn: false })).toBe(60 + 100 + 100);
  });

  it("l'alba vale un premio grosso", () => {
    const night = computeScore({ survivedMs: 900_000, kills: 0, points: 0, livesLost: 0, dawn: false });
    const dawn = computeScore({ survivedMs: 900_000, kills: 0, points: 0, livesLost: 0, dawn: true });
    expect(dawn - night).toBe(5000);
  });

  it("ogni vita persa toglie un pezzo, ma il punteggio non va sotto zero", () => {
    // 60 secondi più 10 piccioni fanno 160, meno 250 per la vita persa: si ferma a zero
    expect(computeScore({ survivedMs: 60_000, kills: 10, points: 0, livesLost: 1, dawn: false })).toBe(0);
    expect(computeScore({ survivedMs: 600_000, kills: 100, points: 0, livesLost: 2, dawn: false })).toBe(600 + 1000 - 500);
  });
});

function memoryStorage(): Storage & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

describe("il record nel browser", () => {
  it("la prima partita è sempre un record, e resta salvato", () => {
    const s = memoryStorage();
    expect(loadRecord(s)).toBe(0);
    expect(saveRecord(s, 500)).toEqual({ record: 500, isNew: true });
    expect(loadRecord(s)).toBe(500);
  });

  it("un punteggio più basso non tocca il record", () => {
    const s = memoryStorage();
    saveRecord(s, 500);
    expect(saveRecord(s, 300)).toEqual({ record: 500, isNew: false });
    expect(loadRecord(s)).toBe(500);
  });

  it("se il browser non permette di salvare, il gioco va avanti lo stesso", () => {
    const broken: Storage = {
      getItem: () => {
        throw new Error("bloccato");
      },
      setItem: () => {
        throw new Error("bloccato");
      },
    };
    expect(loadRecord(broken)).toBe(0);
    expect(saveRecord(broken, 100)).toEqual({ record: 100, isNew: true });
  });

  it("un valore rovinato nel browser vale zero", () => {
    const s = memoryStorage();
    s.data["sette-vite-record"] = "non un numero";
    expect(loadRecord(s)).toBe(0);
  });
});
