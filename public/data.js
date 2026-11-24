/* Shop recipes, machines and grinders.

   The recipes come straight off the Stumptown cards on the bar. Keep them in
   the same order as the card: dose, then extraction time, then yield. */

window.RECIPES = [
  {
    id: "hairbender",
    brand: "stumptown",
    match: ["hair bender", "hairbender"],
    name: "Hair Bender",
    roaster: "Stumptown",
    kind: "Espresso",
    oz: "1.5",
    note: "Signature blend. Sweet and syrupy when it is right; it goes sharp if the dose drifts.",
    bands: [
      { maxDays: 7,  label: "1–7 days",   dose: [19, 19],   time: [25, 28], yield: [24, 28] },
      { maxDays: 21, label: "8–21 days",  dose: [19, 20],   time: [23, 28], yield: [24, 28] },
      { maxDays: 28, label: "22–28 days", dose: [20, 20],   time: [23, 26], yield: [24, 28] }
    ]
  },
  {
    id: "trapper",
    brand: "stumptown",
    match: ["trapper creek", "trapper", "decaf"],
    name: "Trapper Creek Decaf",
    roaster: "Stumptown",
    kind: "Decaf",
    oz: "1.75",
    note: "Decaf runs faster than the regular blend, so it gets a longer shot and a bigger dose.",
    bands: [
      { maxDays: 28, label: "1–28 days", dose: [20, 20.5], time: [28, 34], yield: [28, 34] }
    ]
  }
];

/* The grinder type decides the wording of every grind step. */
window.GRINDERS = [
  {
    id: "mahlkonig-e",
    brand: "mahlkonig",
    match: ["e65s", "e80", "supreme"],
    name: "Mahlkönig E65S / E80 Supreme",
    short: "Mahlkönig E series",
    cues: "Touchscreen, single spout, matte black or silver body, dose buttons across the front.",
    adjust: "Turn the grind-adjust collar under the hopper. Small turns only — a quarter turn moves it a lot.",
    step: "a quarter turn",
    program: [
      "Press and hold MENU for 3 seconds.",
      "Press the DOSE button for the dose you are changing.",
      "Press + or − until the time matches the target.",
      "Press and hold MENU for 3 seconds to record it."
    ]
  },
  {
    id: "mazzer",
    brand: "mazzer",
    match: ["super jolly"],
    name: "Mazzer Super Jolly",
    short: "Super Jolly",
    cues: "Tall hopper, thick stepped collar with a pin, doser or short spout.",
    adjust: "Pull the pin and turn the collar. Each notch is one step; note which notch you are on.",
    step: "one notch",
    program: ["These are timed by a separate timer or by hand — weigh the dose and adjust the timer to match."]
  },
  {
    id: "mazzer-v",
    brand: "mazzer",
    match: ["major v", "robur s", "kony s", "major", "robur", "kony"],
    name: "Mazzer Major V / Robur S / Kony S",
    short: "Mazzer Major V",
    cues: "Push-button display on the front, numbered ring on the adjustment disk, disk stopping pin on the side.",
    adjust: "Loosen the disk stopping pin, then turn the adjustment disk COUNTERCLOCKWISE to go finer and clockwise to go coarser. The grinder must be running while you turn it, or the burrs jam.",
    step: "one number on the ring",
    // From the Mazzer Major V / Robur S / Kony S quick start guide.
    manual: {
      source: "Mazzer Major V, Robur S, Kony S quick start guide",
      adjust: [
        "Loosen the disk stopping pin on the side.",
        "Start the grinder BEFORE you move the disk, or the burrs jam.",
        "Counterclockwise = finer. Clockwise = coarser.",
        "Stop grinding, then tighten the pin.",
        "If the pin bottoms out, pull it, adjust, and reinsert it in another hole."
      ],
      purge: "The grounds left in the chute are still the old setting, so the first shot after a change lies to you.",
      quick: {
        dose: "Hold the menu button, press the dose button, release both. Set the time with the navigation buttons, then press the menu button to save."
      },
      zero: [
        "Switch the grinder off.",
        "Close the hopper gate, lift the hopper off.",
        "Remove the disk stopping pin, loosen the two ring setscrews.",
        "Turn the ring so 0 sits where you want it, tighten the setscrews.",
        "Reassemble. From the factory, 0 is where the burrs touch."
      ],
      dose: [
        "Hold the menu button, press the dose button, release both.",
        "Set the time with the navigation buttons.",
        "Press and release the menu button to save."
      ],
      mode: "On the Major V and Kony S you can switch from Keyboard to Portafilter mode: press the menu button, then press the activation pin switch. In Portafilter mode you pick the dose first, then press the portafilter into the pin to grind.",
      flow: "The grinder ships with the Hybrid grind flow control wire fitted, which is right for almost everything. If you get clumps, swap in the Anti-Clumping wire; for static, the Anti-Dust wire. Both come in the small box with the grinder."
    }
  },
  {
    id: "eureka",
    brand: "eureka",
    match: ["mignon", "atom"],
    name: "Eureka Mignon / Atom",
    short: "Eureka",
    cues: "Small footprint, chrome or matte body, touchscreen on the Atom, dial under the hopper.",
    adjust: "Turn the dial under the hopper. There is no pin — the numbers are a reference, so mark your own zero.",
    step: "one number",
    program: [
      "Hold the dose button until the screen flashes.",
      "Use + or − to set the time.",
      "Press the dose button again to save."
    ]
  },
  {
    id: "baratza",
    brand: "baratza",
    match: ["sette", "forte", "270"],
    name: "Baratza Sette 270 / Forte",
    short: "Baratza",
    cues: "Cone burrs, narrow body, macro ring on top and a micro ring under it.",
    adjust: "Macro ring for big moves, micro ring for the fine trim. Change macro first, then micro.",
    step: "one macro notch",
    program: [
      "Hold the dose button until the display flashes.",
      "Adjust the time with the arrow buttons.",
      "Press the button again to save."
    ]
  },
  {
    id: "niche",
    brand: "niche",
    match: ["zero"],
    name: "Niche Zero",
    short: "Niche",
    cues: "Round wooden base, single dosing, dial on the front with a small pointer.",
    adjust: "Turn the front dial. The numbers are close together, so move in small increments.",
    step: "two small marks",
    program: ["Single dose grinder: weigh the beans in, then adjust the time on the dial."]
  },
  {
    id: "stepless",
    match: ["compak", "df64", "df 64"],
    name: "Stepless (Mazzer, Compak, DF64…)",
    short: "Stepless grinder",
    cues: "A collar with no pin and no click stops — it turns freely.",
    adjust: "Mark the collar with tape and a pen so you can come back to a setting. Move in very small amounts.",
    step: "a hair, about 5° on the collar",
    program: ["Weigh the dose by hand and adjust the timer separately."]
  }
];

window.MACHINES = [
  {
    id: "linea-mini",
    brand: "la marzocco",
    match: ["linea mini", "linea"],
    name: "La Marzocco Linea Mini",
    short: "Linea Mini",
    cues: "Single group, paddle on the right, cup tray on top, small drip tray.",
    warmup: "20–30 minutes. It is a heavy boiler and the first shot is cold.",
    pressure: "9 bar, set at the factory. Do not touch it while dialing in.",
    temp: "Turn the wheel under the drip tray. One dot is about 1 °C.",
    notes: "The paddle is manual: start and stop the shot yourself and watch the scale."
  },
  {
    id: "gs3",
    brand: "la marzocco",
    match: ["gs3", "gs 3"],
    name: "La Marzocco GS3",
    short: "GS3",
    cues: "Single group, volumetric buttons plus a paddle, digital display on the front.",
    warmup: "20 minutes.",
    pressure: "9 bar.",
    temp: "Menu on the display, set brew temperature in °C.",
    notes: "Use the paddle for manual shots when dialing in; the volumetric buttons drift."
  },
  {
    id: "strada",
    brand: "la marzocco",
    match: ["strada"],
    name: "La Marzocco Strada",
    short: "Strada",
    cues: "Multi-group, paddle with pressure profiling, scales on the tray.",
    warmup: "30 minutes for a multi-group.",
    pressure: "9 bar; the profiling paddles can go lower.",
    temp: "Group display, set per group.",
    notes: "Keep the profile flat while dialing in — do not change two things at once."
  },
  {
    id: "linea-pb",
    brand: "la marzocco",
    match: ["linea pb", "pb"],
    name: "La Marzocco Linea PB",
    short: "Linea PB",
    cues: "Multi-group, flat front panel, T1/T2/T3 buttons on the left group, scale grid on the tray.",
    warmup: "About 25 minutes to working pressure. The display shows CB and SB filling as rectangles.",
    pressure: "9 bar at the group while brewing. Adjust the pump screw: clockwise raises it, counterclockwise lowers it.",
    temp: "Set per group in Barista programming. Left number is the group now, right is the target.",
    notes: "The left group is the one you program from — T1, T2 and T3 only work there.",
    // Everything below is taken from the Linea PB manual (MAN.10.1.03, v4.1).
    manual: {
      source: "Linea PB manual, software guide p.35–46",
      models: "AV (volumetric), ABR (scale), MP (paddle). The button steps below are for AV and ABR.",
      open: [
        "With the machine on, press and hold T3 on the left group for about 5 seconds.",
        "The display reads Program / Dose / Press Enter To Exit. That is the Barista level.",
        "To leave at any time, press T2 and T3 together."
      ],
      temp: [
        "In Barista programming, T1 and T2 to Coffee Boiler Settings, press T3.",
        "T3 on Coffee Boiler 1, choose ENABLED, T3.",
        "At CB1 Temperature set it with T1 and T2, then T3 to confirm.",
        "Left number is the group now, right is the target.",
        "Exit, then T2 and T3 together to leave."
      ],
      dose: [
        "Hold T3 for 5 s to open Barista programming.",
        "T3 on Group Dose Settings, then T3 on Program Volume Dose.",
        "Short dose: tap the button to start, tap again to stop. It lights when saved.",
        "Long dose: hold the button 2 s, then release to store.",
        "Group 1's doses copy to the other groups unless you set them separately."
      ],
      scale: [
        "ABR model: hold T2 for 5 s with the machine on.",
        "When the numbers stop flashing, put the EMPTY portafilter on the grid. It records itself.",
        "Hold T1 for 5 s, wait for COF, then put the FILLED portafilter on the grid.",
        "The machine now knows dry and wet weight, so it can stop on grams.",
        "Turn it on: Barista programming, Group Dose Settings, Group 1 Mode, pick MASS or BREWRATIO.",
        "PULSES = volume, MASS = grams, BREWRATIO = a set ratio of coffee in to drink out."
      ],
      preinfusion: [
        "In Barista programming, reach Pre-Inf Settings and press T3.",
        "Pick the group with T1 and T2, press T3.",
        "First value is wet seconds (valve open), second is hold seconds (valve closed).",
        "A short wet of 2–3 s with a 2 s hold softens the start of the shot."
      ],
      scaleCare: "The built-in scale reads to ±0.5 g and takes at most 1 kg. Keep the grid dry and clean, and do not lean on it — vibration from the next group throws the reading off.",
      quick: {
        scale: "It can stop the shot on grams instead of seconds. Hold T2 for 5 s with the machine on, then put the empty portafilter on the grid when the numbers stop flashing. Hold T1 for 5 s and put the filled one on. Full steps below."
      }
    }
  },
  {
    id: "appia",
    brand: "nuova simonelli",
    match: ["appia", "aurelia"],
    name: "Nuova Simonelli Appia / Aurelia",
    short: "Appia",
    cues: "Tall body, volumetric touchpad, steam wand on the right.",
    warmup: "20 minutes.",
    pressure: "9 bar.",
    temp: "Keypad on the front, temperature in the menu.",
    notes: "Volumetric dosing: program the button once the grind is right, not before."
  },
  {
    id: "black-eagle",
    brand: "victoria arduino",
    match: ["black eagle"],
    name: "Victoria Arduino Black Eagle",
    short: "Black Eagle",
    cues: "Sculpted body, gravimetric scale built into the tray, paddle group.",
    warmup: "30 minutes.",
    pressure: "9 bar, profiling paddle available.",
    temp: "Touchscreen, set per group.",
    notes: "The built-in scale means you can dial in on weight directly."
  },
  {
    id: "barista-express",
    brand: "breville",
    match: ["barista express", "bes870"],
    name: "Breville Barista Express",
    short: "Barista Express",
    cues: "Built-in grinder on the left, single group, pressure gauge in the middle.",
    warmup: "10 minutes.",
    pressure: "9 bar, gauge on the front.",
    temp: "Digital, ±1 °C.",
    notes: "The grinder steps are coarse — one step moves the flow a lot."
  },
  {
    id: "dual-boiler",
    brand: "breville",
    match: ["dual boiler", "bes920"],
    name: "Breville Dual Boiler",
    short: "Dual Boiler",
    cues: "Two gauges, digital display, no built-in grinder.",
    warmup: "15 minutes.",
    pressure: "9 bar, adjustable pre-infusion.",
    temp: "Menu, set in °C.",
    notes: "Change pre-infusion and grind one at a time."
  },
  {
    id: "gaggia",
    brand: "gaggia",
    match: ["classic"],
    name: "Gaggia Classic",
    short: "Gaggia Classic",
    cues: "Small square body, rocker switches, single boiler.",
    warmup: "15 minutes.",
    pressure: "9 bar; the OPV can be adjusted with a spring kit.",
    temp: "Thermostat — temp surf: flush, wait 20 seconds, then pull.",
    notes: "Small boiler recovers slowly; give it a minute between shots."
  },
  {
    id: "silvia",
    brand: "rancilio",
    match: ["silvia"],
    name: "Rancilio Silvia",
    short: "Silvia",
    cues: "Stainless box, two switches, single boiler, no PID.",
    warmup: "20 minutes.",
    pressure: "9 bar.",
    temp: "Thermostat — temp surf before every shot.",
    notes: "Small boiler: it will drop temperature on the second shot."
  },
  {
    id: "profitec",
    brand: "profitec",
    match: ["pro 600", "pro 700"],
    name: "Profitec Pro 600 / 700",
    short: "Profitec",
    cues: "Dual boiler, PID on the front, E61 group.",
    warmup: "20 minutes.",
    pressure: "9 bar.",
    temp: "PID on the front panel.",
    notes: "Recovers fast, so back-to-back shots hold temperature."
  },
  {
    id: "bianca",
    brand: "lelit",
    match: ["bianca"],
    name: "Lelit Bianca",
    short: "Bianca",
    cues: "Dual boiler, wooden paddle on the group, PID on the front.",
    warmup: "20 minutes.",
    pressure: "9 bar, flow control paddle.",
    temp: "PID on the front.",
    notes: "Leave the paddle fully open for a standard shot; use it to save a gushing puck."
  },
  {
    id: "decent",
    brand: "decent",
    match: ["de1", "de1pro"],
    name: "Decent DE1",
    short: "DE1",
    cues: "Tablet on top, no steam knob, small footprint.",
    warmup: "10 minutes.",
    pressure: "Programmable — set 9 bar for a standard profile.",
    temp: "Set per shot on the tablet.",
    notes: "It shows pressure and flow live, so it is the easiest machine to learn on."
  }
];
