/* Reading a photo without any API key.

   The machine and the grinder both have their brand and model painted on them, so
   OCR plus the keyword matcher is enough to place the equipment. This runs on the
   server: one worker, reused between requests, and it is torn down after a spell
   of no use so a small container is not holding 60 MB of language data forever. */

"use strict";

const path = require("path");
const fs = require("fs");
const { createWorker } = require("tesseract.js");

const catalog = require("./catalog");
const match = require("./public/match");

const IDLE_MS = 5 * 60 * 1000;

let workerPromise = null;
let idleTimer = null;

// The language file is shipped in the repo so the first photo is not a download.
const LANG_PATH = path.join(__dirname, "eng.traineddata");
const langOptions = fs.existsSync(LANG_PATH)
  ? { langPath: __dirname, gzip: false }
  : {};

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, langOptions).catch((e) => {
      workerPromise = null;
      throw e;
    });
  }
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(release, IDLE_MS);
  if (idleTimer.unref) idleTimer.unref();
  return workerPromise;
}

async function release() {
  const p = workerPromise;
  workerPromise = null;
  idleTimer = null;
  if (!p) return;
  try {
    const w = await p;
    await w.terminate();
  } catch (e) {
    // Already gone; nothing to do.
  }
}

function bufferOf(part) {
  return Buffer.from(part.data, "base64");
}

/* Read each photo and combine what came off them, so a shot of the machine and a
   shot of the grinder together can fill in both. */
async function identify(parts) {
  const worker = await getWorker();

  let text = "";
  for (const part of parts) {
    try {
      const { data } = await worker.recognize(bufferOf(part));
      if (data && data.text) text += "\n" + data.text;
    } catch (e) {
      console.error("ocr photo failed", e && e.message);
    }
  }

  const found = match.identify(text, catalog);
  return {
    machine: found.machine || { id: null },
    grinder: found.grinder || { id: null },
    coffee: found.coffee || { id: null },
    text: text.trim().slice(0, 400)
  };
}

module.exports = { identify, release };
