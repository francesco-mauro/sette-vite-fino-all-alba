"""La cassa del tesoro provvisoria, disegnata qui con forme semplici.

Nelle tavole la cassa non c'è: finché non arriva, questo script la disegna 16×16 con i colori della
palette Lampione e il contorno d'inchiostro di 1 pixel, come le icone delle carte (art/icone_carte.py).
Due fotogrammi, come ogni oggetto a terra (docs/ASSET.md): 0 ferma, 1 luccica.

Uso:  python art/cassa.py [--anteprima FILE]
  --anteprima FILE  scrive anche i due fotogrammi ingranditi otto volte, per guardarli.
Serve Pillow.
"""
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from icone_carte import ASSETS, SIZE, Icon, INK, ORANGE_DARK, ORANGE, WHITE, rect  # noqa: E402

GOLD = (0xFF, 0xC8, 0x5A)
GOLD_DARK = (0xC8, 0x8A, 0x2A)


def chest(shine):
    i = Icon()
    # il coperchio bombato e la cassa, legno arancione scuro, con le fasce d'oro e la serratura
    i.fill(rect(3, 4, 12, 4) | rect(2, 5, 13, 7), ORANGE)
    i.fill(rect(2, 8, 13, 13), ORANGE_DARK)
    i.fill(rect(2, 8, 13, 8), GOLD_DARK)
    i.fill(rect(4, 4, 4, 13) | rect(11, 4, 11, 13), GOLD)
    i.fill(rect(7, 7, 8, 10), GOLD)
    i.fill({(7, 9), (8, 9)}, INK)
    if shine:
        # il luccichio: una stellina bianca in alto a destra e un punto sul coperchio
        i.mark({(14, 1), (13, 2), (14, 2), (15, 2), (14, 3)}, WHITE)
        i.fill({(6, 5)}, WHITE)
    return i.image()


def main():
    frames = [chest(False), chest(True)]
    strip = Image.new("RGBA", (SIZE * len(frames), SIZE), (0, 0, 0, 0))
    for n, frame in enumerate(frames):
        strip.paste(frame, (n * SIZE, 0))
    strip.save(os.path.join(ASSETS, "cassa.png"))
    if "--anteprima" in sys.argv:
        out = sys.argv[sys.argv.index("--anteprima") + 1]
        back = Image.new("RGBA", strip.size, (0x1C, 0x21, 0x33, 255))
        back.alpha_composite(strip)
        back.resize((strip.width * 8, SIZE * 8), Image.NEAREST).save(out)
    print(f"cassa.png: {len(frames)} fotogrammi")


if __name__ == "__main__":
    main()
