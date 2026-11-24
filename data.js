/* The shop's two recipe cards, and the two machines on the bar.

   The bean cards give dose, extraction time and yield per days-off-roast band.
   The Linea PB and Mazzer steps come from their manuals. Nothing here is guessed. */

window.BEANS = [
  {
    id: "hairbender",
    name: "Hair Bender",
    roaster: "Stumptown",
    kind: "Espresso",
    bands: [
      { maxDays: 7,  label: "1–7 days",   dose: [19, 19],  time: [25, 28], yield: [24, 28], oz: "1.5" },
      { maxDays: 21, label: "8–21 days",  dose: [19, 20], time: [23, 28], yield: [24, 28], oz: "1.5" },
      { maxDays: 28, label: "22–28 days", dose: [20, 20], time: [23, 26], yield: [24, 28], oz: "1.5" }
    ]
  },
  {
    id: "trapper",
    name: "Trapper Creek Decaf",
    roaster: "Stumptown",
    kind: "Decaf",
    bands: [
      { maxDays: 28, label: "1–28 days", dose: [20, 20.5], time: [28, 34], yield: [28, 34], oz: "1.75" }
    ]
  }
];

/* The machines are fixed, so there is nothing to identify. */
window.MACHINE = {
  name: "La Marzocco Linea PB",
  short: "Linea PB",
  warmup: "25 minutes to working pressure. The CB and SB rectangles on the display fill as the boilers heat.",
  manual: {
    source: "Linea PB manual, software guide p.35–46",
    sections: [
      { title: "Open programming", body: [
        "With the machine on, press and hold T3 on the left group for about 5 seconds.",
        "The display reads Program / Dose / Press Enter To Exit. That is the Barista level.",
        "To leave at any time, press T2 and T3 together."
      ]},
      { title: "Set brew temperature", body: [
        "In Barista programming, T1 and T2 to Coffee Boiler Settings, press T3.",
        "T3 on Coffee Boiler 1, choose ENABLED, T3.",
        "At CB1 Temperature set it with T1 and T2, then T3 to confirm.",
        "Exit, then T2 and T3 together to leave."
      ]},
      { title: "Weigh shots on the machine", body: [
        "ABR model: hold T2 for 5 s with the machine on.",
        "When the numbers stop flashing, put the EMPTY portafilter on the grid. It records itself.",
        "Hold T1 for 5 s, wait for COF, then put the FILLED portafilter on the grid.",
        "Turn it on: Group Dose Settings, Group 1 Mode, pick MASS or BREWRATIO.",
        "PULSES = volume, MASS = grams, BREWRATIO = a set ratio of coffee in to drink out."
      ]},
      { title: "Set pre-infusion", body: [
        "In Barista programming, reach Pre-Inf Settings and press T3.",
        "Pick the group with T1 and T2, press T3.",
        "First value is wet seconds (valve open), second is hold seconds (valve closed).",
        "A short wet of 2–3 s with a 2 s hold softens the start of the shot."
      ]}
    ]
  }
};

window.GRINDER = {
  name: "Mazzer Major V",
  short: "Mazzer",
  manual: {
    source: "Mazzer Major V, Robur S, Kony S quick start guide",
    sections: [
      { title: "Change the grind", body: [
        "Loosen the disk stopping pin on the side.",
        "Start the grinder BEFORE you move the disk, or the burrs jam.",
        "Counterclockwise = finer. Clockwise = coarser.",
        "Stop grinding, then tighten the pin.",
        "If the pin bottoms out, pull it, adjust, and reinsert it in another hole."
      ]},
      { title: "Purge after a change", body: [
        "Purge at least two doses after any grind change.",
        "The grounds left in the chute are still the old setting, so the first shot after a change lies to you."
      ]},
      { title: "Set the dose time", body: [
        "Press and hold the menu button.",
        "Press the dose button you want to change, then release both.",
        "Set the time with the navigation buttons.",
        "Press and release the menu button to save."
      ]},
      { title: "Set the zero point", body: [
        "Switch the grinder off, close the hopper gate, lift the hopper off.",
        "Remove the disk stopping pin, loosen the two ring setscrews.",
        "Turn the ring so 0 sits where you want it, tighten the setscrews.",
        "Reassemble. From the factory, 0 is where the burrs touch."
      ]},
      { title: "Keyboard or portafilter mode", body: [
        "Major V and Kony S only: press the menu button, then the activation pin switch.",
        "In Portafilter mode you pick the dose first, then press the portafilter into the pin to grind."
      ]}
    ]
  }
};
