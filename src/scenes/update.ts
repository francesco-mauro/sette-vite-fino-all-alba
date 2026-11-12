// Il controllo degli aggiornamenti dal titolo: chiede al server l'ultima versione e, se serve, la installa.
// Codice del browser, senza Phaser; la decisione su cosa dire sta in src/logic/version.ts.

// latestBuildId: l'id di version.json sul server, mai dalla copia del telefono; null senza risposta.
export async function latestBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: unknown };
    return typeof data.id === "string" ? data.id : null;
  } catch {
    return null;
  }
}

// applyUpdate: chiede al service worker la versione nuova, aspetta che prenda il posto della vecchia
// (al massimo 8 secondi) e riapre il gioco. Se l'aveva già scaricata in silenzio, basta riaprire.
export async function applyUpdate(): Promise<void> {
  const reg = await navigator.serviceWorker?.getRegistration();
  if (reg) {
    try {
      await reg.update();
    } catch {
      // senza rete a metà: si riapre lo stesso, con quello che c'è
    }
    if (reg.installing || reg.waiting) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
        setTimeout(resolve, 8000);
      });
    }
  }
  location.reload();
}
