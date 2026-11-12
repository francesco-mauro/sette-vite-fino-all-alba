// I test della durata della notte: 5, 10 o 15 minuti, la scelta ricordata e un record per ogni durata.
import { describe, expect, it } from "vitest";
import { NIGHTS, loadNight, recordKey, saveNight, storedNight } from "../../src/logic/night";
import { loadRecord, saveRecord, type Storage } from "../../src/logic/record";

function memoryStorage(): Storage & { data: Record<string, string> } {
  const data: Record<string, string> = {};
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

const broken: Storage = {
  getItem: () => {
    throw new Error("bloccato");
  },
  setItem: () => {
    throw new Error("bloccato");
  },
};

describe("le durate della notte", () => {
  it("sono 5, 10 e 15 minuti", () => {
    expect(NIGHTS).toEqual([5, 10, 15]);
  });

  it("una durata salvata vale solo se è una delle tre, se no 15", () => {
    expect(storedNight("10")).toBe(10);
    expect(storedNight("5")).toBe(5);
    expect(storedNight(null)).toBe(15);
    expect(storedNight("7")).toBe(15);
    expect(storedNight("non un numero")).toBe(15);
  });

  it("l'ultima scelta resta salvata", () => {
    const s = memoryStorage();
    expect(loadNight(s)).toBe(15);
    saveNight(s, 5);
    expect(loadNight(s)).toBe(5);
  });

  it("senza salvataggio il gioco va avanti con 15", () => {
    expect(loadNight(broken)).toBe(15);
    expect(() => saveNight(broken, 10)).not.toThrow();
  });
});

describe("un record per ogni durata", () => {
  it("il record dei 15 minuti è quello di prima: chi aveva già un record lo ritrova", () => {
    expect(recordKey(15)).toBe("sette-vite-record");
    const s = memoryStorage();
    s.data["sette-vite-record"] = "5500";
    expect(loadRecord(s, 15)).toBe(5500);
  });

  it("le altre durate hanno un record loro, che non tocca gli altri", () => {
    expect(recordKey(5)).toBe("sette-vite-record-5");
    const s = memoryStorage();
    saveRecord(s, 9000, 15);
    expect(saveRecord(s, 2000, 5)).toEqual({ record: 2000, isNew: true });
    expect(loadRecord(s, 15)).toBe(9000);
    expect(loadRecord(s, 10)).toBe(0);
  });
});
