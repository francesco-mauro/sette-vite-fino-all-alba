// La prova di fumo: il gioco si apre nel browser vero, la scena parte e non ci sono errori.
// Non prova il gioco: dice solo che la build da pubblicare non è rotta.
import { expect, test, type Page } from "@playwright/test";

// Tiene nota di quello che va storto mentre la pagina si apre: errori in console,
// errori di JavaScript non presi e immagini del gioco che non arrivano come immagini.
function sentinella(page: Page): string[] {
  const errori: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errori.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errori.push(`pagina: ${err.message}`));
  // vite preview, come Cloudflare, a un file che non c'è può rispondere con la pagina del gioco:
  // per questo si controlla anche il tipo, non solo il codice di risposta.
  page.on("response", (res) => {
    const { pathname } = new URL(res.url());
    if (pathname.startsWith("/assets/") && pathname.endsWith(".png")) {
      const tipo = res.headers()["content-type"] ?? "";
      if (!res.ok() || !tipo.startsWith("image/png")) {
        errori.push(`immagine: ${pathname} risponde ${res.status()} ${tipo}`);
      }
    }
  });
  return errori;
}

const pagine = [
  { nome: "il gioco", indirizzo: "/" },
  { nome: "la misura", indirizzo: "/?misura" },
];

for (const { nome, indirizzo } of pagine) {
  test(`${nome} si apre senza errori`, async ({ page }) => {
    const errori = sentinella(page);
    await page.goto(indirizzo);
    // GameScene mette questo segno sul canvas alla fine di create(): immagini caricate, scena costruita.
    await expect(page.locator("#gioco canvas")).toHaveAttribute("data-scena", "pronta");
    expect(errori).toEqual([]);
  });
}
