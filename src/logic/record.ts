// Il record personale, salvato nel browser. Logica pura: il salvataggio si passa da fuori,
// così i test usano un finto salvataggio e il gioco usa localStorage. Ogni durata della notte ha il suo record
// (src/logic/night.ts): senza minuti vale quello dei 15.
import { DEFAULT_NIGHT, recordKey } from "./night";

// La parte di localStorage che serve: leggere e scrivere un testo.
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// loadRecord: il record salvato, o 0 se non c'è, se è rovinato o se il browser non permette di leggerlo
// (finestra privata, dati bloccati). Il gioco non deve mai fermarsi per un salvataggio.
export function loadRecord(storage: Storage, minutes: number = DEFAULT_NIGHT): number {
  try {
    const value = Number(storage.getItem(recordKey(minutes)));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

// saveRecord: salva il punteggio se batte il record. Dice qual è il record adesso e se è nuovo.
export function saveRecord(storage: Storage, score: number, minutes: number = DEFAULT_NIGHT): { record: number; isNew: boolean } {
  const previous = loadRecord(storage, minutes);
  if (score <= previous) return { record: previous, isNew: false };
  try {
    storage.setItem(recordKey(minutes), String(score));
  } catch {
    // non si salva, ma per questa partita il record nuovo vale lo stesso
  }
  return { record: score, isNew: true };
}
