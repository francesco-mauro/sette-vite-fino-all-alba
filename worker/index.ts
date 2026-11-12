// Il Worker: il codice che gira sul server di Cloudflare, per le rotte /api.
// Pagina, codice del gioco e immagini li serve Cloudflare dai file statici senza passare di qui.
// Arrivano qui solo /api/* (in wrangler.jsonc `run_worker_first`) e gli indirizzi senza un file.
// Per ora c'è /api/ping, per sapere che il server è vivo. Alla tappa 6 arrivano punteggi e classifica.

const PING_METHODS = "GET, HEAD";

export function handleRequest(request: Request): Response {
  const { pathname } = new URL(request.url);

  // Un indirizzo fuori da /api che non corrisponde a nessun file: un 404 semplice, come prima del Worker.
  if (!pathname.startsWith("/api/")) {
    return new Response("Non trovato", { status: 404 });
  }

  if (pathname === "/api/ping") {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return Response.json(
        { errore: "metodo non ammesso" },
        { status: 405, headers: { Allow: PING_METHODS } },
      );
    }
    // no-store: la risposta non va tenuta in nessuna cache, ogni ping deve arrivare davvero al server.
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }

  return Response.json({ errore: "rotta sconosciuta" }, { status: 404 });
}

// La forma che Cloudflare si aspetta: un oggetto con il metodo fetch, chiamato a ogni request.
export default { fetch: handleRequest };
