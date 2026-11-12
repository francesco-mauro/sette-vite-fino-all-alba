// La prova finale della tappa 1b: questo test è ROTTO APPOSTA.
// Sul telefono di prova (843x375 pixel CSS, densità 2,875) l'ingrandimento giusto è 4: qui si aspetta 5.
// Va nel commit fatto saltando il controllo sul PC, per vedere che GitHub diventa rosso
// e che Cloudflare non pubblica. Il commit dopo lo toglie.
import { describe, expect, it } from "vitest";
import { integerZoom } from "../../src/logic/zoom";

describe("prova finale della tappa 1b", () => {
  it("rotto apposta: l'ingrandimento sul telefono di prova non è 5", () => {
    expect(integerZoom(843, 375, 2.875, 480, 270)).toBe(5);
  });
});
