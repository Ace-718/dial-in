/* Server-side copy of the equipment catalog, so the photo reader can only
   answer with something the page knows about. Keep in sync with public/data.js. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "public", "data.js"), "utf8");
const box = { window: {} };
vm.createContext(box);
vm.runInContext(src, box);

module.exports = { MACHINES: box.window.MACHINES, GRINDERS: box.window.GRINDERS, RECIPES: box.window.RECIPES };
