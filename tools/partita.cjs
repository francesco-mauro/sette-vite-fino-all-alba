// La partita automatica: gioca da sola una notte da 5 minuti a velocità quadrupla, senza finestra,
// e scrive una riga JSON con com'è andata. Serve a misurare il bilanciamento.
// Uso: node partita.cjs <cartella del gioco> <indirizzo> <tondo|dritto|fermo> <seme> [minuti: 5, 10 o 15] [livelli di miagolio dati subito] [tetto dei nemici]
// Il tetto, se c'è, va nell'indirizzo come ?tetto=N; senza, vale quello del gioco (SPAWN.maxEnemies).
// Il gatto «tondo» gira in quadrato (WASD, mezzo secondo vero per lato), «fermo» non si muove.
// A ogni livello prende la prima carta. Legge lo stato dal canvas (dataset.stato, scritto con ?debug).
// Misure: il mucchio, la massa e l'allineamento (su cento nemici in vista, quanti vanno verso il gatto), medie e
// punto più alto dal trentesimo secondo, con almeno 10 nemici in vista. Il gioco va acceso prima (npm run dev o
// npx vite --port 5199); se non risponde, lo script lo dice ed esce con codice 1.
// Esempio: node tools/partita.cjs . http://localhost:5199 tondo 11 5 > tools/risultati/prova.json
/* oxlint-disable no-await-in-loop -- la partita va giocata un passo dopo l'altro: ogni giro aspetta lo stato
   prima di premere i tasti, quindi le attese nel ciclo sono volute */
const { createRequire } = require("node:module");
const path = require("node:path");

const [, , root, url, mode = "tondo", seed = "11", minutes = "5", meow = "0", cap = ""] = process.argv;
// il tasto della durata nel titolo: 1 per 5 minuti, 2 per 10, 3 per 15
const nightKey = { 5: "1", 10: "2", 15: "3" }[minutes] ?? "1";
const nightMs = Number(minutes) * 60_000;
const { chromium } = createRequire(path.join(path.resolve(root), "package.json"))("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  // se il gioco non risponde: un messaggio chiaro e codice 1, invece di una traccia o di un'attesa senza fine
  const giveUp = async () => {
    console.error(`il gioco non risponde a ${url}: è acceso il server?`);
    await browser.close();
    process.exit(1);
  };
  try {
    await page.goto(`${url}/?debug&seme=${seed}${cap ? `&tetto=${cap}` : ""}`);
  } catch {
    await giveUp();
  }
  const scena = () => page.evaluate(() => document.querySelector("#gioco canvas")?.dataset.scena);
  const stato = () => page.evaluate(() => JSON.parse(document.querySelector("#gioco canvas")?.dataset.stato ?? "null"));
  // aspetta che la scena arrivi a `name`, al massimo 30 secondi
  const waitScene = async (name) => {
    const until = Date.now() + 30_000;
    while ((await scena()) !== name) {
      if (Date.now() > until) await giveUp();
      await page.waitForTimeout(100);
    }
  };
  await waitScene("pronta");
  await page.waitForTimeout(600);
  await page.keyboard.press(nightKey);
  await waitScene("partita");
  // il pulsante «veloce» del pannello di debug: a destra, il terzo
  const box = await page.locator("#gioco canvas").boundingBox();
  const z = box.width / 480;
  // il pulsante «+ miagolio», il quinto: un livello a ogni tocco
  for (let i = 0; i < Number(meow); i++) await page.mouse.click(box.x + 455 * z, box.y + 145 * z);
  await page.mouse.click(box.x + 455 * z, box.y + 113 * z);

  const keys = ["d", "s", "a", "w"];
  let held = null;
  let side = 0;
  let lastTurn = Date.now();
  let last = null;
  let maxAlive = 0;
  let viewSum = 0;
  let viewCount = 0;
  let viewMax = 0;
  let minFps = 999;
  // il mucchio: su cento nemici, quanti ne hanno un altro quasi addosso (dal trentesimo secondo, quando sono tanti)
  let pileSum = 0;
  let pileCount = 0;
  let pileMax = 0;
  // la massa: su cento nemici in vista, quanti nella massa più grande (dal trentesimo secondo, con almeno 10 in vista)
  let clumpSum = 0;
  let clumpCount = 0;
  let clumpMax = 0;
  // l'allineamento: su cento nemici in vista, quanti vanno verso il gatto (stesse condizioni della massa)
  let alignSum = 0;
  let alignCount = 0;
  let alignMax = 0;
  const lost = [];
  const levelAt = {};
  const started = Date.now();
  while (Date.now() - started < nightMs / 4 + 125_000) {
    if ((await scena()) === "fine") break;
    const s = await stato();
    if (s) {
      if (last && s.vite < last.vite) lost.push(Math.round(s.ms / 1000));
      maxAlive = Math.max(maxAlive, s.vivi);
      if (s.inVista !== undefined) { viewSum += s.inVista; viewCount++; viewMax = Math.max(viewMax, s.inVista); }
      if (s.ms > 5000) minFps = Math.min(minFps, s.fps);
      if (s.mucchio !== undefined && s.ms > 30_000) { pileSum += s.mucchio; pileCount++; pileMax = Math.max(pileMax, s.mucchio); }
      if (s.massa !== undefined && s.ms > 30_000 && s.inVista >= 10) { clumpSum += s.massa; clumpCount++; clumpMax = Math.max(clumpMax, s.massa); }
      if (s.allineamento !== undefined && s.ms > 30_000 && s.inVista >= 10) { alignSum += s.allineamento; alignCount++; alignMax = Math.max(alignMax, s.allineamento); }
      const minute = Math.floor(s.ms / 60_000) + 1;
      levelAt[minute] = s.livello;
      last = s;
    }
    // «dritto»: scappa sempre verso destra, il caso in cui i nemici restano indietro
    // Il tasto si ripreme ogni mezzo secondo: dopo la scelta di una carta il gioco non lo vede più premuto
    // (una tastiera vera ripete da sola il tasto tenuto giù, questa no).
    if (mode === "dritto" && Date.now() - lastTurn >= 500) {
      if (held) await page.keyboard.up(held);
      held = "d";
      await page.keyboard.down(held);
      lastTurn = Date.now();
    }
    if (mode === "tondo" && Date.now() - lastTurn >= 500) {
      if (held) await page.keyboard.up(held);
      held = keys[side++ % 4];
      await page.keyboard.down(held);
      lastTurn = Date.now();
    }
    await page.keyboard.press("1");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(120);
  }
  if (held) await page.keyboard.up(held);
  const end = (await stato()) ?? last;
  console.log(JSON.stringify({
    modo: mode, seme: Number(seed), tetto: cap ? Number(cap) : null, finita: (await scena()) === "fine", secondiDiNotte: Math.round(end.ms / 1000),
    minuti: Number(minutes), alba: end.ms >= nightMs - 1000 && end.vite > 0, vitePerse: 7 - end.vite, quando: lost, livello: end.livello,
    livelloPerMinuto: levelAt, presi: end.presi, viviMax: maxAlive, inVistaMedia: viewCount ? Math.round(viewSum / viewCount) : null, inVistaMax: viewMax, richiami: end.richiami, rimescolati: end.rimescolati, spinti: end.spinti, carte: end.carte, miagolioSubito: Number(meow), capi: end.capi, suppli: end.suppli, vitaAllaFine: end.vita, mucchioMedio: pileCount ? Math.round(pileSum / pileCount) : null, mucchioMax: pileMax, massaMedia: clumpCount ? Math.round(clumpSum / clumpCount) : null, massaMax: clumpMax, allineamentoMedio: alignCount ? Math.round(alignSum / alignCount) : null, allineamentoMax: alignMax, fpsMin: minFps, secondiVeri: Math.round((Date.now() - started) / 1000), errori: errors,
  }));
  await browser.close();
})();
