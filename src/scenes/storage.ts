// Il salvataggio del browser per il record. localStorage può mancare o lanciare un errore
// (finestra privata, dati bloccati): in quel caso un salvataggio finto, che dimentica tutto.
import type { Storage } from "../logic/record";

export function browserStorage(): Storage {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    // il browser non lascia nemmeno guardare localStorage
  }
  return { getItem: () => null, setItem: () => undefined };
}
