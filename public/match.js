/* Matching printed text to a model.

   The photo reader has two ways to work: Gemini if a key is set, and this OCR
   matcher if not. A phone photo of the machine usually has the brand and the
   model painted on it, which is enough.

   Pure functions so they can be tested without a browser. */

(function (root) {
  "use strict";

  /* Fold the text down to something comparable: lower case, no accents,
     punctuation gone, single spaces. OCR is noisy, so be forgiving. */
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  /* Levenshtein, capped: OCR turns MARZOCCO into MARZ0CCO and MAZZER into
     MAZZER, and a straight substring test would miss both. */
  function distance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1);
    var cur = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (var k = 1; k <= b.length; k++) {
        cur[k] = Math.min(
          prev[k] + 1,
          cur[k - 1] + 1,
          prev[k - 1] + (a[i - 1] === b[k - 1] ? 0 : 1)
        );
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[b.length];
  }

  /* How well one keyword matches the text. 1 is exact, 0 is no match.
     Short keywords must match exactly, because "pb" or "3" appear by accident. */
  function keywordScore(word, text) {
    var w = norm(word);
    if (!w) return 0;
    if (text.indexOf(w) > -1) return 1;
    if (w.length < 4) return 0;

    // Allow a small typo budget on longer words, per token.
    var allowed = w.length >= 8 ? 2 : 1;
    var tokens = text.split(" ");
    var best = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      if (Math.abs(tok.length - w.length) > allowed) continue;
      var d = distance(w, tok);
      if (d <= allowed) best = Math.max(best, 1 - d / w.length);
    }
    // Also try the whole string, in case spaces differ.
    var dAll = distance(w, text);
    if (dAll <= allowed) best = Math.max(best, 1 - dAll / w.length);
    return best;
  }

  /* The brand and the model keywords are scored separately: the brand narrows the
     field, the model name is what actually settles it. */
  function scoreEntry(entry, text) {
    var brand = entry.brand ? keywordScore(entry.brand, text) : 0;
    var score = 0;
    var hits = [];
    var keys = entry.match || [];
    for (var i = 0; i < keys.length; i++) {
      var s = keywordScore(keys[i], text);
      if (s > 0) {
        hits.push(keys[i]);
        // Longer, more specific keywords are worth more.
        score += s * (1 + norm(keys[i]).length / 20);
      }
    }
    return { entry: entry, score: score, hits: hits, brand: brand };
  }

  /* Best candidate. Ties go to the entry with more specific hits, so
     "LA MARZOCCO LINEA MINI" picks the Mini over the GS3.

     A brand on its own ("La Marzocco") is shared by several models, so that can
     never be a confident answer: the score is capped when the only thing that
     matched is a keyword that other entries also use. */
  function best(entries, text) {
    var n = norm(text);
    if (!n) return null;

    var ranked = entries
      .map(function (e) { return scoreEntry(e, n); })
      .filter(function (r) { return r.score > 0 || r.brand > 0; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return (b.hits.join("").length) - (a.hits.join("").length);
      });
    if (!ranked.length) return null;

    var top = ranked[0];

    // Which of the winning keywords are unique to this entry?
    var specific = top.hits.filter(function (h) {
      var hn = norm(h);
      return !entries.some(function (e) {
        return e.id !== top.entry.id &&
          (e.match || []).some(function (k) { return norm(k) === hn; });
      });
    });

    // Did the model name itself show up, or only the brand?
    var confidence;
    if (!specific.length) {
      confidence = "low";
    } else if (top.score >= 1.6) {
      confidence = "high";
    } else {
      confidence = "medium";
    }

    var why = specific.length
      ? "Read \u201c" + specific[0] + "\u201d on it."
      : "Only the brand \u201c" + top.entry.brand + "\u201d was readable, and it makes more than one model.";

    return {
      id: top.entry.id,
      confidence: confidence,
      why: why,
      // A brand-only read is a guess, so the page should not trust it silently.
      guess: !specific.length
    };
  }

  function identify(text, catalog) {
    return {
      machine: best(catalog.MACHINES || [], text),
      grinder: best(catalog.GRINDERS || [], text),
      coffee: best(catalog.RECIPES || [], text)
    };
  }

  var api = { norm: norm, distance: distance, keywordScore: keywordScore, best: best, identify: identify };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Match = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
