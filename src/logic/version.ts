// La versione del gioco: quale si sta giocando e se sul server ce n'è una più nuova. Logica pura.
// La versione la scrive Vite al momento del build (vite.config.ts): nel codice come SETTE_VITE_BUILD e accanto
// al gioco in version.json, che il telefono non tiene in copia e chiede sempre al server.

export interface Build {
  // diverso a ogni pubblicazione: commit e istante del build
  id: string;
  // il codice corto del commit
  hash: string;
  // quando è stata fatta, all'ora italiana, già scritta per il titolo
  time: string;
}

export type UpdateStatus = "aggiornato" | "nuova" | "senza rete";

// updateStatus: `latest` è l'id letto da version.json sul server, null se il server non ha risposto.
export function updateStatus(current: string, latest: string | null): UpdateStatus {
  if (latest === null) return "senza rete";
  return latest === current ? "aggiornato" : "nuova";
}

export function versionLabel(build: Build): string {
  return `versione ${build.hash} del ${build.time}`;
}
