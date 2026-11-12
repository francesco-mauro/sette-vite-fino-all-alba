// La durata della notte: 5, 10 o 15 minuti, scelta nel titolo. Logica pura, il salvataggio arriva da fuori.
// L'ultima scelta resta nel browser, e ogni durata ha il suo record.
import type { Storage } from "./record";

export const NIGHTS = [5, 10, 15] as const;
export const DEFAULT_NIGHT = 15;

const NIGHT_KEY = "sette-vite-notte";

// storedNight: una durata letta dal salvataggio vale solo se è una delle tre, se no la notte intera
export function storedNight(value: string | null): number {
  const n = Number(value);
  return (NIGHTS as readonly number[]).includes(n) ? n : DEFAULT_NIGHT;
}

export function loadNight(storage: Storage): number {
  try {
    return storedNight(storage.getItem(NIGHT_KEY));
  } catch {
    return DEFAULT_NIGHT;
  }
}

export function saveNight(storage: Storage, minutes: number) {
  try {
    storage.setItem(NIGHT_KEY, String(minutes));
  } catch {
    // non si ricorda, ma la partita parte lo stesso
  }
}

// recordKey: dove sta il record di una durata. I 15 minuti tengono la chiave di prima della scelta,
// così il record di chi ha già giocato diventa il record dei 15.
export function recordKey(minutes: number): string {
  return minutes === DEFAULT_NIGHT ? "sette-vite-record" : `sette-vite-record-${minutes}`;
}
