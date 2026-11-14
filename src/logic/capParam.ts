// Il parametro ?tetto dell'indirizzo: quanti nemici vivi insieme al massimo. Logica pura, senza Phaser e senza browser.
// Serve alle prove: la misura con 500 nemici a 60 fotogrammi e le partite automatiche con un tetto diverso, senza
// cambiare il numero del gioco (disegno contro il blob, 14 novembre 2026).

// Il tetto più alto che si può chiedere dall'indirizzo.
export const CAP_MAX = 1000;

// parseCapParam: legge ?tetto dalla parte dell'indirizzo dopo il punto di domanda. Senza il parametro, o con un
// valore che non è un intero tra 1 e CAP_MAX, vale `fallback`, il tetto del gioco.
export function parseCapParam(search: string, fallback: number): number {
  const value = new URLSearchParams(search).get("tetto");
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const cap = Number(value);
  return cap >= 1 && cap <= CAP_MAX ? cap : fallback;
}
