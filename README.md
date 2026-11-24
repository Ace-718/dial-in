# Dial-In

The two recipe cards from the bar, and the two machines behind them: a La Marzocco
Linea PB and a Mazzer Major V.

Pick the beans, set the roast date, and the app reads the days off roast and gives you
the card's window for that bag — dose, extraction time and yield. Under that is the
six-step routine as a checklist you tap through as you go. Ticks are kept per bag and
per roast date, so changing either one starts a clean sheet.

Then log the shot. If it does not match the card, the app says the single next thing to
change and why.

## No photos, no keys

There is nothing to identify and nothing to configure. The equipment is fixed, so the
app is plain HTML, CSS and JavaScript served by nginx. No server, no database, no API
key, no network calls.

## Where the steps come from

The button sequences are transcribed from the manufacturer manuals, not invented:

- **La Marzocco Linea PB** — `MAN.10.1.03`, software programming guide p.35–46
  (Barista level, coffee boiler temperature, volume doses, brew-ratio/scale mode,
  pre-infusion).
- **Mazzer Major V / Robur S / Kony S** — the official quick start guide
  (grind adjustment direction, purging after a change, ring zeroing, dose timing,
  keyboard/portafilter mode).

The PDFs are not in this repo — they are the manufacturers' copyrighted documents.

Two facts from the manuals that the app relies on:

- On the Mazzer, **counterclockwise is finer**, and the grinder must be running while
  the disk turns or the burrs jam.
- **Purge two doses after any grind change.** The grounds in the chute are still the old
  setting, so the first shot after an adjustment lies to you.

## Files

    public/index.html   the page
    public/data.js      the two cards and the two manuals
    public/dial.js      roast date to window, shot to the next instruction

`public/dial.js` is pure functions with no DOM, so it can be tested on its own:

    node -e "global.window={};require('./public/data.js');const D=require('./public/dial.js');console.log(D.windowFor(window.BEANS[0], 9).band)"
