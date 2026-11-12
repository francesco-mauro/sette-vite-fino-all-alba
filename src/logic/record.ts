// Il record personale, salvato nel browser. Logica pura: il salvataggio si passa da fuori,
// così i test usano un finto salvataggio e il gioco usa localStorage.

// La parte di localStorage che serve: leggere e scrivere un testo.
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const KEY = "sette-vite-record";

// loadRecord: il record salvato, o 0 se non c'è, se è rovinato o se il browser non permette di leggerlo
// (finestra privata, dati bloccati). Il gioco non deve mai fermarsi per un salvataggio.
export function loadRecord(storage: Storage): number {
  try {
    const value = Number(storage.getItem(KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

// saveRecord: salva il punteggio se batte il record. Dice qual è il record adesso e se è nuovo.
export function saveRecord(storage: Storage, score: number): { record: number; isNew: boolean } {
  const previous = loadRecord(storage);
  if (score <= previous) return { record: previous, isNew: false };
  try {
    storage.setItem(KEY, String(score));
  } catch {
    // non si salva, ma per questa partita il record nuovo vale lo stesso
  }
  return { record: score, isNew: true };
}
