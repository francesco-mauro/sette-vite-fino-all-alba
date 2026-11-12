"""I sampietrini con l'erba e una crepa, al posto delle foglie di platano.

Le foglie sembravano cuori (Francesco, 12 novembre 2026): questo script parte dai sampietrini di
`public/assets/casella.png` e ci aggiunge due ciuffi d'erba che escono dalle fughe e una crepa in una pietra.
L'erba non è verde lime: nel gioco il lime vuol dire «raccoglilo» (docs/ASSET.md). Usa due colori della
palette Lampione, riflesso e collo cangiante, scuri come l'erba di notte sotto la luce blu.

Uso:  python art/erba.py [--anteprima FILE]
  --anteprima FILE  scrive anche la casella ingrandita otto volte, per guardarla.
Serve Pillow.
"""
import os
import sys

from PIL import Image

ASSETS = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
GRASS_DARK = (0x3C, 0x78, 0x96)  # riflesso
GRASS = (0x57, 0xC0, 0xA8)  # collo cangiante, solo sulle punte
CRACK = (0x1C, 0x21, 0x33)  # fuga

# i ciuffi: escono dalle fughe orizzontali (righe 3 e 11) e salgono sulle pietre
TUFTS = [
    {(3, 3), (4, 3), (5, 3), (6, 3), (7, 3), (3, 2), (4, 2), (4, 1), (5, 2), (6, 2), (6, 1), (6, 0), (7, 2)},
    {(11, 11), (12, 11), (13, 11), (14, 11), (11, 10), (12, 10), (12, 9), (13, 10), (14, 10), (14, 9)},
]
TIPS = [{(4, 1), (6, 0), (6, 1)}, {(12, 9), (14, 9)}]
# la crepa: una linea storta in una pietra della terza fila
CRACK_PIXELS = {(9, 8), (9, 9), (10, 9), (10, 10)}


def main():
    tile = Image.open(os.path.join(ASSETS, "casella.png")).convert("RGBA")
    for tuft, tips in zip(TUFTS, TIPS):
        for p in tuft:
            tile.putpixel(p, (*(GRASS if p in tips else GRASS_DARK), 255))
    for p in CRACK_PIXELS:
        tile.putpixel(p, (*CRACK, 255))
    tile.save(os.path.join(ASSETS, "erba.png"))
    if "--anteprima" in sys.argv:
        out = sys.argv[sys.argv.index("--anteprima") + 1]
        tile.resize((16 * 8, 16 * 8), Image.NEAREST).save(out)
    print("erba.png: 16x16")


if __name__ == "__main__":
    main()
