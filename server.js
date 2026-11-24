/* Dial-In server.

   Serves the page and does one job the browser cannot: look at a photo of the
   machine or grinder and work out which one it is. The Gemini key stays here,
   never in the page. */

"use strict";

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Photos arrive as data URLs, so allow a generous body.
app.use(express.json({ limit: "14mb" }));
app.use(express.static(path.join(__dirname, "public")));

const MACHINES = require("./catalog").MACHINES;
const GRINDERS = require("./catalog").GRINDERS;
const RECIPES = require("./catalog").RECIPES;

/* Photo reading has two engines. Gemini reads the shape of the machine, which is
   the good answer. If no key is configured, OCR reads the brand and model printed
   on it, which is usually enough and needs nothing but the photo. */
const OCR = require("./ocr");

// Flash is fast and cheap and reads equipment photos well. If a name is retired
// the request moves on to the next one rather than failing.
const GEMINI_MODELS = (process.env.GEMINI_MODEL || "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean)
  .concat(["gemini-2.5-flash", "gemini-flash-latest"]);

const GEMINI_URL = (model) =>
  "https://generativelanguage.googleapis.com/v1beta/models/" +
  model +
  ":generateContent";

const PROMPT = `You are helping a barista identify their espresso equipment and coffee from photos.

The barista has attached one or more photos. They may show an espresso machine, a
coffee grinder, a bag of coffee beans, or any combination of the three.

Here is the list of equipment you may choose from. Match only from this list.

ESPRESSO MACHINES:
${MACHINES.map((m) => `- ${m.id}: ${m.name} — visual cues: ${m.cues}`).join("\n")}

GRINDERS:
${GRINDERS.map((g) => `- ${g.id}: ${g.name} — visual cues: ${g.cues}`).join("\n")}

COFFEE (only if a bag of beans is visible):
${RECIPES.map((r) => `- ${r.id}: ${r.name} by ${r.roaster} (${r.kind})`).join("\n")}

For each item you can see, decide which entry it is. Use the visual cues, the
shape of the body, the group head, the hopper, the branding and the controls.
A coffee bag is identified by the roaster name and the blend name on the label.

Reply with JSON only, in exactly this shape, no prose and no code fences:

{
  "machine": { "id": "<id from the list or null>", "confidence": "high|medium|low", "why": "<one short sentence naming what you saw>" },
  "grinder": { "id": "<id from the list or null>", "confidence": "high|medium|low", "why": "<one short sentence naming what you saw>" },
  "coffee": { "id": "<id from the coffee list or null>", "confidence": "high|medium|low", "why": "<one short sentence naming what you saw>" },
  "note": "<one short sentence of anything else useful you noticed, or an empty string>"
}

If you cannot see one of them, set its id to null and confidence to "low". Never
invent an id that is not in the lists above.`;

function stripDataUrl(s) {
  if (typeof s !== "string") return null;
  const m = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(s.trim());
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

function parseJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

function knownId(list, id) {
  if (!id || typeof id !== "string") return null;
  const hit = list.find((x) => x.id === id);
  return hit ? hit.id : null;
}

app.post("/api/identify", async (req, res) => {
  const key = process.env.GEMINI_API_KEY;

  const photos = Array.isArray(req.body && req.body.photos) ? req.body.photos : [];
  const parts = photos.map(stripDataUrl).filter(Boolean).slice(0, 4);

  if (!parts.length) {
    return res.status(400).json({ error: "no-photo", message: "No photo came through. Try again." });
  }

  // No key: read the text off the photo instead of the shape of the machine.
  if (!key) {
    try {
      const found = await OCR.identify(parts);
      if (!found.machine && !found.grinder && !found.coffee) {
        return res.status(200).json({
          machine: { id: null }, grinder: { id: null }, coffee: { id: null },
          engine: "ocr",
          message: "I could not read a brand on that photo. Try getting the name plate in frame."
        });
      }
      return res.json(Object.assign({ engine: "ocr" }, found));
    } catch (e) {
      console.error("ocr failed", e && e.message);
      return res.status(502).json({
        error: "ocr-failed",
        message: "That photo was hard to read. Try again with the label in frame."
      });
    }
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT }].concat(
          parts.map((p) => ({ inline_data: { mime_type: p.mimeType, data: p.data } }))
        )
      }
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    let r = null;
    let lastStatus = 0;
    for (const model of GEMINI_MODELS) {
      r = await fetch(GEMINI_URL(model) + "?key=" + encodeURIComponent(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000)
      });
      if (r.ok) break;
      lastStatus = r.status;
      const detail = await r.text().catch(() => "");
      console.error("gemini", model, r.status, detail.slice(0, 300));
      // Only a missing model is worth retrying with another name.
      if (r.status !== 404 && r.status !== 400) break;
    }

    if (!r || !r.ok) {
      return res.status(502).json({
        error: "upstream",
        message: lastStatus === 429
          ? "The photo reader is busy. Try again in a moment."
          : "The photo reader could not answer. Try again."
      });
    }

    const data = await r.json();
    const text =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.map((p) => p.text || "").join("");

    const parsed = parseJson(text);
    if (!parsed) {
      return res.status(502).json({
        error: "unreadable",
        message: "That photo was hard to read. Try one closer to the machine."
      });
    }

    res.json({
      machine: {
        id: knownId(MACHINES, parsed.machine && parsed.machine.id),
        confidence: (parsed.machine && parsed.machine.confidence) || "low",
        why: (parsed.machine && parsed.machine.why) || ""
      },
      grinder: {
        id: knownId(GRINDERS, parsed.grinder && parsed.grinder.id),
        confidence: (parsed.grinder && parsed.grinder.confidence) || "low",
        why: (parsed.grinder && parsed.grinder.why) || ""
      },
      coffee: {
        id: knownId(RECIPES, parsed.coffee && parsed.coffee.id),
        confidence: (parsed.coffee && parsed.coffee.confidence) || "low",
        why: (parsed.coffee && parsed.coffee.why) || ""
      },
      note: parsed.note || ""
    });
  } catch (e) {
    console.error("identify failed", e && e.message);
    res.status(502).json({
      error: "failed",
      message: e && e.name === "TimeoutError"
        ? "The photo reader took too long. Try again."
        : "The photo reader could not answer. Try again."
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    photoReader: true,
    engine: process.env.GEMINI_API_KEY ? "gemini" : "ocr"
  });
});

// Anything else is the page itself.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Dial-In on http://0.0.0.0:" + PORT);
});
