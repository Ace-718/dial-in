# Dial-In

Espresso dial-in against the shop's Stumptown recipe cards.

- **Dial** — pick the bean and its age band, enter dose / time / yield and the
  taste, and it names the one change to make next.
- **Equipment** — photograph the machine, grinder or bean bag and it works out
  which one it is (Gemini reads the photo server-side), then fills in that
  machine's exact dial-in steps.
- **Steps** — the whole routine, in order: warm up, dose, distribute, pull,
  taste, then program the grinder.
- **Recipes** — the two cards as data.

The order follows the card: dose first, then grind, then taste. One change at a
time.

## Run

    npm install
    GEMINI_API_KEY=... npm start   # photo recognition is optional

Photo recognition needs `GEMINI_API_KEY` in the server environment. Without it the
app still works and the machine and grinder can be picked by hand.

## Where the equipment steps come from

The button sequences in the Steps tab are transcribed from the manufacturer manuals,
not invented:

- **La Marzocco Linea PB** — `MAN.10.1.03`, software programming guide p.35–46
  (Barista level, coffee boiler temperature, volume doses, brew-ratio/scale mode,
  pre-infusion).
- **Mazzer Major V / Robur S / Kony S** — the official quick start guide
  (grind adjustment direction, purging after a change, ring zeroing, dose timing,
  keyboard/portafilter mode, grind flow wires).

The PDFs themselves are not in this repo — they are the manufacturers' copyrighted
documents. Download them from La Marzocco and Mazzer if you need the originals.
