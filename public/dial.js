/* Dial-in engine.

   Follows the order printed on the Stumptown card:
     1. check the dose      2. check the grind (time and yield)   3. taste
   One change at a time, because two at once teaches you nothing.

   Pure functions, no DOM, so this can be tested on its own. */

(function (root) {
  "use strict";

  var TIME_SLACK = 1;    // seconds of grace either side of the card window
  var DOSE_SLACK = 0.25; // grams
  var YIELD_SLACK = 1;   // grams

  function inBand(v, band, slack) {
    return v >= band[0] - slack && v <= band[1] + slack;
  }

  function mid(band) {
    return Math.round(((band[0] + band[1]) / 2) * 10) / 10;
  }

  function fmt(n, d) {
    var p = Math.pow(10, d == null ? 1 : d);
    return String(Math.round(n * p) / p);
  }

  function band(b) {
    return b[0] === b[1] ? String(b[0]) : b[0] + "–" + b[1];
  }

  /* How far outside the window, as a word a barista would use. */
  function howFar(value, b, slack) {
    var d = value < b[0] ? b[0] - value : value - b[1];
    if (d <= slack) return "just";
    if (d <= slack * 4) return "clearly";
    return "well";
  }

  function check(key, label, value, target, slack, unit) {
    var ok = inBand(value, target, slack);
    return {
      key: key,
      label: label,
      value: value,
      target: target,
      ok: ok,
      far: ok ? "" : howFar(value, target, slack),
      dir: value < target[0] ? "low" : value > target[1] ? "high" : "ok",
      text: fmt(value, 1) + (unit || "") + " (target " + band(target) + ")"
    };
  }

  /* The single next action. `g` is the grinder profile from data.js. */
  function nextAction(recipe, shot, checks, g) {
    var dose = checks[0], time = checks[1], out = checks[2];
    var taste = shot.taste || [];
    var has = function (k) { return taste.indexOf(k) > -1; };
    var step = (g && g.step) || "a small step";
    var grindWord = function (dir) {
      return dir === "finer"
        ? "Grind finer — " + step + "."
        : "Grind coarser — " + step + ".";
    };

    // 1. The dose has to be right before anything else means anything.
    if (!dose.ok) {
      return {
        title: "Set the dose first",
        why: "The dose is off the card, and the grind only makes sense once the dose is right. " +
             "You are at " + fmt(dose.value, 1) + " g; the card wants " + band(dose.target) + " g.",
        do: "Weigh the basket empty, then weigh it again with the grounds in it. " +
            "Adjust the grinder's dose time until the grounds weigh " + mid(dose.target) + " g.",
        grind: null
      };
    }

    // Channeling shows up as sour and bitter at once, or a harsh dry finish.
    if (has("harsh") || (has("sour") && has("bitter"))) {
      return {
        title: "Fix the puck before the grind",
        why: "Sour and bitter at the same time, or a harsh dry finish, means the water is finding a fast path through the puck. " +
             "Changing the grind now would just hide it.",
        do: "Keep the grind. Break up clumps, level the bed, then tamp straight and firm. Pull one more shot before you touch the collar.",
        grind: null
      };
    }

    // 2. Time is the grind's job.
    if (!time.ok) {
      var dir = time.dir === "low" ? "finer" : "coarser";
      var extra = "";
      if (!out.ok) {
        extra = time.dir === "low"
          ? " The yield will come up as the shot slows, so weigh again rather than stopping by eye."
          : " The yield will drop as the shot slows, so weigh again rather than stopping by eye.";
      }
      return {
        title: "Grind " + dir,
        why: "The shot ran " + fmt(time.value, 1) + " s — " + time.far + " " +
             (time.dir === "low" ? "under" : "over") + " the card's " + band(time.target) + " s. " +
             "The grind sets the time: finer slows it, coarser speeds it up.",
        do: grindWord(dir, step) + " Then pull one shot and time it." + extra,
        grind: dir
      };
    }

    // 3. Time is right, so the yield is the thing left to trim.
    if (!out.ok) {
      return {
        title: out.dir === "low" ? "Pull a little more" : "Pull a little less",
        why: "The time is on the card at " + fmt(time.value, 1) + " s, so the grind is right. " +
             "The weight is " + out.far + " " + (out.dir === "low" ? "light" : "heavy") +
             " at " + fmt(out.value, 1) + " g against " + band(out.target) + " g.",
        do: out.dir === "low"
          ? "Keep the grind. Let the shot run to " + mid(out.target) + " g, or raise the dose time by half a gram."
          : "Keep the grind. Stop the shot at " + mid(out.target) + " g — the last few grams are what turn it bitter.",
        grind: null
      };
    }

    // 4. Numbers are on the card, so the taste leads.
    if (has("sour")) {
      return {
        title: "Numbers are right, taste is sharp",
        why: "Everything is on the card but it still tastes sour, so it wants a touch more extraction.",
        do: grindWord("finer", step) + " Keep the dose where it is and taste again.",
        grind: "finer"
      };
    }
    if (has("bitter")) {
      return {
        title: "Numbers are right, taste is bitter",
        why: "Everything is on the card but the finish is bitter, so it is extracting a little too much.",
        do: grindWord("coarser", step) + " Keep the dose where it is and taste again.",
        grind: "coarser"
      };
    }
    if (has("watery")) {
      return {
        title: "Numbers are right, taste is thin",
        why: "On the card but weak usually means the dose is small for the basket, not that the grind is wrong.",
        do: "Add 0.5 g to the dose and pull the same weight out. Do not touch the grind.",
        grind: null
      };
    }

    return {
      title: "Dialed in",
      why: "Dose, time, yield and taste all sit on the card. This is the shot to repeat.",
      do: "Log it and change nothing. Only touch the grind when the beans age into the next window.",
      grind: null
    };
  }

  /* Main entry. recipe = band object, shot = {dose, time, yield, taste}, g = grinder profile. */
  function diagnose(recipe, shot, g) {
    var checks = [
      check("dose", "Dose", +shot.dose, recipe.dose, DOSE_SLACK, " g"),
      check("time", "Time", +shot.time, recipe.time, TIME_SLACK, " s"),
      check("yield", "Yield", +shot.yield, recipe.yield, YIELD_SLACK, " g")
    ];
    var allOk = checks.every(function (c) { return c.ok; });
    var taste = shot.taste || [];
    var clean = allOk && (taste.length === 0 || (taste.length === 1 && taste[0] === "balanced"));
    var action = nextAction(recipe, shot, checks, g);

    return {
      checks: checks,
      action: action,
      tone: clean ? "good" : action.grind ? "grind" : "fix",
      dialed: clean,
      // progress: how many of the three checks are on the card
      progress: checks.filter(function (c) { return c.ok; }).length
    };
  }

  /* The full walk-through for a machine and grinder, so the app can teach the
     whole routine rather than just answer one question. */
  function walkthrough(recipe, machine, g) {
    var steps = [
      { n: 1, title: "Warm the machine", body: machine ? machine.warmup : "Let it come up to temperature before the first shot." },
      { n: 2, title: "Weigh the dose", body: "Basket empty on the scale, tare it, then dose. The card wants " + band(recipe.dose) + " g in." },
      { n: 3, title: "Distribute and tamp", body: "Break up clumps, level the bed, tamp straight and firm. An uneven bed ruins the reading." },
      { n: 4, title: "Pull and weigh", body: "Time the shot and weigh the cup. The card wants " + band(recipe.time) + " s and " + band(recipe.yield) + " g out." },
      { n: 5, title: "Taste, then change one thing", body: "Sour means finer, bitter means coarser. Change the grind only, then pull again." }
    ];

    // The Mazzer manual is blunt about this one: grounds left in the chute are the
    // old setting, so a shot pulled straight after a change lies to you.
    var purge = g && g.manual && g.manual.purge;
    if (purge) {
      steps.splice(4, 0, { n: 5, title: "Purge two doses", body: purge });
    }

    // Grinder dose programming: the one-liner if the manual has one, else the list.
    var quickDose = g && g.manual && g.manual.quick && g.manual.quick.dose;
    var program = quickDose || (g && g.program && g.program.join(" "));
    if (program) {
      steps.push({ n: steps.length + 1, title: "Set the grinder dose time", body: program });
    }

    // A machine that can stop a shot on weight beats timing it by hand.
    var quickScale = machine && machine.manual && machine.manual.quick && machine.manual.quick.scale;
    if (quickScale) {
      steps.push({ n: steps.length + 1, title: "Let the machine weigh it (optional)", body: quickScale });
    }

    return steps.map(function (s, i) {
      return { n: i + 1, title: s.title, body: s.body };
    });
  }

  var api = { diagnose: diagnose, walkthrough: walkthrough, band: band, mid: mid, fmt: fmt };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Dial = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
