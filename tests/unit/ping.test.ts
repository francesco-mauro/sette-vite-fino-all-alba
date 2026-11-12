import { describe, expect, it } from "vitest";
import { rispondi } from "../../worker/index";

const BASE = "https://sette-vite.example";

describe("le rotte /api del Worker", () => {
  it("/api/ping risponde ok in JSON, senza cache", async () => {
    const risposta = rispondi(new Request(`${BASE}/api/ping`));
    expect(risposta.status).toBe(200);
    expect(risposta.headers.get("content-type")).toContain("application/json");
    expect(risposta.headers.get("cache-control")).toBe("no-store");
    expect(await risposta.json()).toEqual({ ok: true });
  });

  it("/api/ping accetta anche HEAD, che usa curl -I", () => {
    expect(rispondi(new Request(`${BASE}/api/ping`, { method: "HEAD" })).status).toBe(200);
  });

  it("/api/ping rifiuta gli altri metodi con 405 e dice quali sono ammessi", () => {
    const risposta = rispondi(new Request(`${BASE}/api/ping`, { method: "POST" }));
    expect(risposta.status).toBe(405);
    expect(risposta.headers.get("allow")).toBe("GET, HEAD");
  });

  it("una rotta /api che non esiste risponde 404 in JSON", async () => {
    const risposta = rispondi(new Request(`${BASE}/api/non-esiste`));
    expect(risposta.status).toBe(404);
    expect(await risposta.json()).toEqual({ errore: "rotta sconosciuta" });
  });

  it("un indirizzo fuori da /api senza file risponde 404 in testo, non in JSON", async () => {
    // Cloudflare manda al Worker anche gli indirizzi che non corrispondono a nessun file.
    const risposta = rispondi(new Request(`${BASE}/non-esiste.png`));
    expect(risposta.status).toBe(404);
    expect(risposta.headers.get("content-type")).toContain("text/plain");
  });
});
