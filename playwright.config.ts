// La prova di fumo nel browser vero: Playwright apre la build (quella di `npm run build`,
// servita da `vite preview`) in Chromium e controlla che il gioco parta senza errori.
// Si lancia con `npm run test:e2e`, dopo la build. La prova è in tests/e2e/.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  // .e2e.ts e non .test.ts: così Vitest, che cerca i file .test e .spec, non la prende per sua.
  testMatch: "**/*.e2e.ts",
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    // Se la prova fallisce, Playwright salva la registrazione passo per passo in test-results/.
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Playwright accende da solo il server della build e lo spegne alla fine.
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
