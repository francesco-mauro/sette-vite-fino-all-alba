import { describe, expect, it } from "vitest";
import { handleRequest } from "../../worker/index";

const BASE = "https://sette-vite.example";

describe("le rotte /api del Worker", () => {
  it("/api/ping risponde ok in JSON, senza cache", async () => {
    const response = handleRequest(new Request(`${BASE}/api/ping`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  });

  it("/api/ping accetta anche HEAD, che usa curl -I", () => {
    expect(handleRequest(new Request(`${BASE}/api/ping`, { method: "HEAD" })).status).toBe(200);
  });

  it("/api/ping rifiuta gli altri metodi con 405 e dice quali sono ammessi", () => {
    const response = handleRequest(new Request(`${BASE}/api/ping`, { method: "POST" }));
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
  });

  it("una rotta /api che non esiste risponde 404 in JSON", async () => {
    const response = handleRequest(new Request(`${BASE}/api/non-esiste`));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ errore: "rotta sconosciuta" });
  });

  it("un indirizzo fuori da /api senza file risponde 404 in testo, non in JSON", async () => {
    // Cloudflare manda al Worker anche gli indirizzi che non corrispondono a nessun file.
    const response = handleRequest(new Request(`${BASE}/non-esiste.png`));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("text/plain");
  });
});
