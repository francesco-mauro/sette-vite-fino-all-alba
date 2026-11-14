// Le scritte e le icone fisse sullo schermo con i bordi su pixel interi. Logica pura.
// Il gioco arrotonda ogni disegno al pixel (roundPixels): un bordo che cade a mezzo pixel, come il cuore largo 9
// con l'origine al centro (bordo a 12,5), a volte va a 12 e a volte a 13 mentre la telecamera segue il gatto, e
// trema. Misurato il 14 novembre 2026: 4 foto su 32 con i cuori spostati di un pixel. Francesco, 13 novembre:
// «Quando mi muovo le scritte dei boss e i cuori tremano un po'».

// alignedPosition: la posizione più vicina a pos per cui il bordo (pos - origin * size) è un pixel intero.
export function alignedPosition(pos: number, size: number, origin: number): number {
  return Math.round(pos - origin * size) + origin * size;
}
