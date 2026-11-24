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
