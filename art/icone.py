"""Le icone per installare il gioco sul telefono, fatte dal gatto fermo.

Prende il primo fotogramma (16x16) di public/assets/gatto.png, lo ingrandisce
di un numero intero di volte, senza sfumare i pixel, e lo mette al centro di un
quadrato del colore della fuga dei sampietrini (#1c2133, palette Lampione).

Scrive in public/icons/:
  icona-192.png, icona-512.png        icone normali
  icona-maskable-512.png              per Android, che la ritaglia a cerchio o a goccia:
                                      il gatto sta dentro il cerchio centrale (80%)
  apple-touch-icon.png (180x180)      per iPhone

Uso: python art/icone.py   (serve Pillow)
"""
from pathlib import Path

from PIL import Image

RADICE = Path(__file__).resolve().parent.parent
GATTO = RADICE / "public" / "assets" / "gatto.png"
USCITA = RADICE / "public" / "icons"
FONDO = (0x1C, 0x21, 0x33, 255)

# nome del file, lato del quadrato, ingrandimento del gatto da 16 pixel
ICONE = [
    ("icona-192.png", 192, 8),           # gatto da 128
    ("icona-512.png", 512, 20),          # gatto da 320
    ("icona-maskable-512.png", 512, 16), # gatto da 256, diagonale 362 < cerchio da 409
    ("apple-touch-icon.png", 180, 8),    # gatto da 128
]


def main() -> None:
    gatto = Image.open(GATTO).convert("RGBA").crop((0, 0, 16, 16))
    USCITA.mkdir(parents=True, exist_ok=True)
    for nome, lato, scala in ICONE:
        grande = gatto.resize((16 * scala, 16 * scala), Image.Resampling.NEAREST)
        icona = Image.new("RGBA", (lato, lato), FONDO)
        posto = (lato - grande.width) // 2
        icona.alpha_composite(grande, (posto, posto))
        icona.save(USCITA / nome, optimize=True)
        print(f"{nome}: {lato}x{lato}, gatto x{scala}")


if __name__ == "__main__":
    main()
