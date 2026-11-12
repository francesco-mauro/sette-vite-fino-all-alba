// I test della versione: cosa dire quando si controllano gli aggiornamenti.
import { describe, expect, it } from "vitest";
import { updateStatus, versionLabel } from "../../src/logic/version";

describe("il controllo degli aggiornamenti", () => {
  it("la stessa versione del server: aggiornato", () => {
    expect(updateStatus("27015bc-1700", "27015bc-1700")).toBe("aggiornato");
  });

  it("una versione diversa sul server: c'è da aggiornare", () => {
    expect(updateStatus("27015bc-1700", "7837285-1800")).toBe("nuova");
  });

  it("senza risposta dal server: non si può dire", () => {
    expect(updateStatus("27015bc-1700", null)).toBe("senza rete");
  });
});

describe("la versione nel titolo", () => {
  it("codice del commit e data di pubblicazione", () => {
    expect(versionLabel({ id: "x", hash: "27015bc", time: "12 nov, 21:55" })).toBe("versione 27015bc del 12 nov, 21:55");
  });
});
