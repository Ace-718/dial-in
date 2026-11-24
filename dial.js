/* Roast date to the card's window, and the shot to a single instruction.

   Follows the order printed on the shop card:
     check the dose, check the grind by time and yield, taste, change one thing.

   Pure functions, no DOM, so they can be tested on their own. */

(function (root) {
  "use strict";

  var DAY = 24 * 60 * 60 * 1000;
  var DOSE_SLACK = 0.25;  // grams
  var TIME_SLACK = 1;     // seconds
  var YIELD_SLACK = 1;     // grams

  function band(b) {
    return b[0] === b[1] ? String(b[0]) : b[0] + "–" + b[1];
  }

  function mid(b) {
    return Math.round(((b[0] + b[1]) / 2) * 10) / 10;
  }

  function fmt(n, d) {
    var p = Math.pow(10, d == null ? 1 : d);
    return String(Math.round(n * p) / p);
  }

  /* Whole days between the roast date and today, counted by calendar day so a bag
     roasted yesterday is "1 day" whatever the time of day it is now. */
  function daysSince(roastDate, today) {
    if (!roastDate) return null;
    var a = new Date(roastDate + "T00:00:00");
    var b = today ? new Date(today + "T00:00:00") : new Date();
    b.setHours(0, 0, 0, 0);
    if (isNaN(a.getTime())) return null;
    var d = Math.floor((b - a) / DAY);
    return d < 0 ? 0 : d;
  }

  /* The window the card gives for that many days off roast. Bands are listed in
     order, so the first one the day count fits into wins. */
  function windowFor(bean, days) {
    if (days == null) return null;
    for (var i = 0; i < bean.bands.length; i++) {
      if (days <= bean.bands[i].maxDays) {
        return { band: bean.bands[i], index: i, days: days };
      }
    }
    // Older than every band: the last one still applies, flagged as past its prime.
    var last = bean.bands[bean.bands.length - 1];
    return { band: last, index: bean.bands.length - 1, days: days, stale: true };
  }

  function inBand(v, b, slack) {
    return v >= b[0] - slack && v <= b[1] + slack;
  }

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

  /* The single next thing to do. `shot` is { dose, time, yield, taste[] }. */
  function nextAction(b, shot) {
    var dose = check("dose", "Dose", +shot.dose, b.dose, DOSE_SLACK, " g");
    var time = check("time", "Time", +shot.time, b.time, TIME_SLACK, " s");
    var out  = check("yield", "Yield", +shot.yield, b.yield, YIELD_SLACK, " g");
    var taste = shot.taste || [];
    var has = function (k) { return taste.indexOf(k) > -1; };

    // The dose has to be right before anything else means anything.
    if (!dose.ok) {
      return {
        title: "Fix the dose first",
        why: "You are at " + fmt(dose.value, 1) + " g; the card wants " + band(b.dose) + " g. " +
             "The grind only means something once the dose is right.",
        do: "Weigh the basket empty, then again with grounds in it. Change the Mazzer dose time until it lands at " + mid(b.dose) + " g.",
        grind: null
      };
    }

    // Sour and bitter together is the puck, not the grind.
    if (has("harsh") || (has("sour") && has("bitter"))) {
      return {
        title: "Fix the puck, not the grind",
        why: "Sour and bitter at once, or a harsh dry finish, means the water is finding a fast path through the puck.",
        do: "Keep the grind. Break up clumps, level the bed, tamp straight and firm. Pull one more before touching the collar.",
        grind: null
      };
    }

    // Time is the grind's job.
    if (!time.ok) {
      var dir = time.dir === "low" ? "finer" : "coarser";
      return {
        title: dir === "finer" ? "Grind finer" : "Grind coarser",
        why: "The shot ran " + fmt(time.value, 1) + " s — " + time.far + " " +
             (time.dir === "low" ? "under" : "over") + " the card's " + band(b.time) + " s. " +
             "Finer slows the shot, coarser speeds it up.",
        do: "Loosen the pin, turn the disk counterclockwise a little, tighten the pin. Purge two doses, then pull one shot and time it.",
        grind: dir
      };
    }

    // Time is on the card, so the yield is what is left to trim.
    if (!out.ok) {
      return {
        title: out.dir === "low" ? "Pull a little more" : "Stop a little sooner",
        why: "The time is on the card at " + fmt(time.value, 1) + " s, so the grind is right. " +
             "The weight is " + out.far + " " + (out.dir === "low" ? "light" : "heavy") +
             " at " + fmt(out.value, 1) + " g against " + band(b.yield) + " g.",
        do: out.dir === "low"
          ? "Keep the grind. Let it run to " + mid(b.yield) + " g."
          : "Keep the grind. Stop it at " + mid(b.yield) + " g — the last grams are what turn it bitter.",
        grind: null
      };
    }

    if (has("sour")) {
      return {
        title: "Numbers right, still sour",
        why: "Everything is on the card but it tastes sour, so it wants a touch more extraction.",
        do: "Grind one small step finer, purge two doses, and taste again.",
        grind: "finer"
      };
    }
    if (has("bitter")) {
      return {
        title: "Numbers right, still bitter",
        why: "Everything is on the card but the finish is bitter, so it is extracting too much.",
        do: "Grind one small step coarser, purge two doses, and taste again.",
        grind: "coarser"
      };
    }
    if (has("watery")) {
      return {
        title: "Numbers right, tastes thin",
        why: "On the card but weak usually means the dose is small for the basket.",
        do: "Add 0.5 g to the dose and pull the same weight out. Leave the grind alone.",
        grind: null
      };
    }

    return {
      title: "Dialed in",
      why: "Dose, time, yield and taste all sit on the card. This is the shot to repeat.",
      do: "Change nothing. Only touch the grind when the beans age into the next window.",
      grind: null
    };
  }

  /* The numbered routine. Each step carries the one-line `body` for scanning and a
     `how` with the exact button sequence, folded away underneath. */
  function steps(b, machine, grinder) {
    return [
      {
        n: 1,
        title: "Warm the machine",
        body: machine.warmup,
        how: null
      },
      {
        n: 2,
        title: "Check your dose",
        body: "Basket empty on the scale, tare it, then dose. The card wants " + band(b.dose) + " g in.",
        how: "Grinder dose time is set on the Mazzer: hold the menu button, press the dose button you want, release both, set the time with the navigation buttons, then press the menu button to save."
      },
      {
        n: 3,
        title: "Distribute and tamp",
        body: "Break up clumps, level the bed, tamp straight and firm. An uneven bed ruins the reading.",
        how: null
      },
      {
        n: 4,
        title: "Purge two doses",
        body: "The grounds left in the chute are still the old setting, so the first shot after a change lies to you.",
        how: "Always purge after moving the grind disk. Skipping this is the most common reason a change seems to do nothing."
      },
      {
        n: 5,
        title: "Pull, weigh, time",
        body: "Start the timer and the shot together. The card wants " + band(b.time) + " s and " + band(b.yield) + " g out.",
        how: machine.manual ? "On an ABR Linea PB you can stop the shot on grams instead of seconds: hold T2 for 5 s, empty portafilter on the grid, hold T1 for 5 s, filled portafilter on the grid, then set the group to MASS." : null
      },
      {
        n: 6,
        title: "Taste it",
        body: "Sour means finer. Bitter means coarser. Change one thing only, then pull again.",
        how: "Loosen the pin, start the grinder, turn the disk counterclockwise for finer or clockwise for coarser, tighten the pin, then purge two doses."
      }
    ];
  }

  var api = {
    daysSince: daysSince,
    windowFor: windowFor,
    band: band,
    mid: mid,
    fmt: fmt,
    check: check,
    nextAction: nextAction,
    steps: steps
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Dial = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
