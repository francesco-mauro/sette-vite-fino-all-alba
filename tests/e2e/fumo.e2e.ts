// La prova di fumo: il gioco si apre nel browser vero, la scena parte e non ci sono errori.
// Non prova il gioco: dice solo che la build da pubblicare non è rotta.
import { expect, test, type Page } from "@playwright/test";

// Tiene nota di quello che va storto mentre la pagina si apre: errori in console,
// errori di JavaScript non presi e immagini del gioco che non arrivano come immagini.
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pagina: ${err.message}`));
  // vite preview, come Cloudflare, a un file che non c'è può rispondere con la pagina del gioco:
  // per questo si controlla anche il tipo, non solo il codice di risposta.
  page.on("response", (res) => {
    const { pathname } = new URL(res.url());
    if (pathname.startsWith("/assets/") && pathname.endsWith(".png")) {
      const contentType = res.headers()["content-type"] ?? "";
      if (!res.ok() || !contentType.startsWith("image/png")) {
        errors.push(`immagine: ${pathname} risponde ${res.status()} ${contentType}`);
      }
    }
  });
  return errors;
}

const pages = [
  { name: "il gioco", path: "/" },
  { name: "la misura", path: "/?misura" },
];

for (const { name, path } of pages) {
  test(`${name} si apre senza errori`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(path);
    // Il titolo (o la scena ferma della misura) mette questo segno sul canvas: immagini caricate, scena costruita.
    await expect(page.locator("#gioco canvas")).toHaveAttribute("data-scena", "pronta");
    expect(errors).toEqual([]);
  });
}

test("dal titolo parte la partita, senza errori", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  const canvas = page.locator("#gioco canvas");
  await expect(canvas).toHaveAttribute("data-scena", "pronta");
  // il titolo accetta lo spazio dopo un attimo: si riprova finché la partita non parte
  await expect(async () => {
    await page.keyboard.press("Space");
    await expect(canvas).toHaveAttribute("data-scena", "partita", { timeout: 500 });
  }).toPass({ timeout: 5000 });
  // qualche secondo di partita: i piccioni arrivano e le armi partono
  await page.waitForTimeout(3000);
  expect(errors).toEqual([]);
});

// Francesco, 13 novembre 2026: «se premo esc sis ese dallo schermo intero e ppoi non posso rinetrare».
// In pausa F non faceva niente: lo schermo intero si rimetteva solo riprendendo la partita.
test("in pausa F rimette lo schermo intero", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  const canvas = page.locator("#gioco canvas");
  await expect(canvas).toHaveAttribute("data-scena", "pronta");
  await expect(async () => {
    await page.keyboard.press("Space");
    await expect(canvas).toHaveAttribute("data-scena", "partita", { timeout: 500 });
  }).toPass({ timeout: 5000 });
  await page.waitForTimeout(500);
  // Esc apre la pausa; la pausa accetta i tasti dopo un attimo
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
  await page.keyboard.press("f");
  await expect.poll(() => page.evaluate(() => document.fullscreenElement !== null), { timeout: 2000 }).toBe(true);
  expect(errors).toEqual([]);
});
