// I capi: quando tocca a ognuno e quanta vita ha. Logica pura, senza Phaser.
// Chi sono e i loro numeri stanno in src/data/balance.ts (BOSSES); la carica del gabbiano è la stessa
// macchina a stati della cornacchia (dive.ts), l'urlo del gabbiano reale è in scream.ts.

// dueBoss: quale capo deve nascere adesso, come posto nella lista, oppure -1 se non tocca a nessuno.
// `times` dice quando nasce ognuno, in frazione di notte da 0 a 1, in ordine; `spawned` quanti sono già nati;
// `progress` quanta notte è passata. Uno alla volta: se la notte è saltata avanti, il secondo esce alla
// chiamata dopo. Contando quanti sono nati, e non il tempo, nessuno nasce due volte.
export function dueBoss(times: readonly number[], spawned: number, progress: number): number {
  if (spawned >= times.length) return -1;
  return progress >= times[spawned] ? spawned : -1;
}

// bossHealth: la vita di un capo in una notte da `nightMinutes`. `base` è la vita nella notte intera
// (`fullNightMinutes`): in una notte più corta le ondate corrono più in fretta, il gatto raccoglie meno
// crocchette e arriva dal capo più debole, quindi la vita cala in proporzione.
export function bossHealth(base: number, nightMinutes: number, fullNightMinutes: number): number {
  return Math.max(1, Math.round((base * nightMinutes) / fullNightMinutes));
}
