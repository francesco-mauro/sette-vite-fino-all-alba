// Il carattere di tutte le scritte: Silkscreen a 8 pixel, bianco. Ogni scena parte da qui e cambia solo
// colore, misura o sfondo.
//
// resolution 8: il browser disegna le scritte sfumate ai bordi, anche Silkscreen, che è fatto a pixel.
// Nella scena da 480x270 quei bordi grigi, ingranditi 3 o 4 volte, sembravano grana (Francesco, dal PC,
// 12 novembre 2026). Così ogni scritta è disegnata 8 volte più grande e, con pixelArt, la scheda video la
// rimpicciolisce prendendo il punto al centro di ogni pixel: il pixel è tutto lettera o tutto sfondo, e le
// lettere tengono la loro forma.
export const FONT = { fontFamily: "Silkscreen", fontSize: "8px", color: "#ffffff", resolution: 8 };
