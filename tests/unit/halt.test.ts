// I test di chi ferma la partita: una scena sopra alla volta (scelta al livello, cassa, pausa, mappa).
import { describe, expect, it } from "vitest";
import { createHalt } from "../../src/logic/halt";

describe("una scena sopra la partita alla volta", () => {
  it("la prima che chiede ferma la partita, le altre aspettano finché non riprende", () => {
    const halt = createHalt();
    expect(halt.stop("LevelUp")).toBe(true);
    // la cassa toccata nello stesso istante: non si apre sopra la scelta, resta a terra
    expect(halt.stop("Chest")).toBe(false);
    expect(halt.by()).toBe("LevelUp");
    halt.release();
    expect(halt.by()).toBeNull();
    expect(halt.stop("Chest")).toBe(true);
  });

  it("la stessa scena non si apre due volte: la seconda scelta al livello non rimpiazza la prima", () => {
    const halt = createHalt();
    expect(halt.stop("LevelUp")).toBe(true);
    expect(halt.stop("LevelUp")).toBe(false);
  });

  it("all'inizio la partita va", () => {
    expect(createHalt().by()).toBeNull();
  });
});
