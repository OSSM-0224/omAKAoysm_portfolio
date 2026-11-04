import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import WebSocket from "ws";

const CHROME = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/ommhatre/AppData/Local/Temp/opencode/hero-cdp2";
const OUT = "C:/Users/ommhatre/AppData/Local/Temp/opencode";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${PROFILE}`,
    "--remote-debugging-port=9224",
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const tabs = await fetch("http://127.0.0.1:9224/json/list").then((r) =>
        r.json(),
      );
      const page = tabs.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      /* not ready */
    }
    await wait(250);
  }
  throw new Error("Chrome debugger did not start");
}

const page = await target();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.once("open", resolve);
  ws.once("error", reject);
});

let id = 0;
const pending = new Map();
ws.on("message", (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

const send = (method, params = {}) => {
  const callId = ++id;
  return new Promise((resolve, reject) => {
    pending.set(callId, { resolve, reject });
    ws.send(JSON.stringify({ id: callId, method, params }));
  });
};

const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await wait(5000);
await evaluate("window.scrollTo(0, 0)");
await wait(300);

const before = await evaluate(`(() => {
  const button = document.querySelector('button[aria-pressed]');
  const img = button.querySelector('img');
  const canvas = button.querySelector('canvas');
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  return { img: r(img), canvas: r(canvas) };
})()`);
console.log("before", JSON.stringify(before));

const portraitRect = await evaluate(`(() => {
  const button = document.querySelector('button[aria-pressed]');
  const r = button.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 };
})()`);
await send("Input.dispatchMouseEvent", {
  type: "mouseMoved",
  x: portraitRect.x,
  y: portraitRect.y,
});
await wait(300);
await send("Input.dispatchMouseEvent", {
  type: "mousePressed",
  x: portraitRect.x,
  y: portraitRect.y,
  button: "left",
  clickCount: 1,
});
await send("Input.dispatchMouseEvent", {
  type: "mouseReleased",
  x: portraitRect.x,
  y: portraitRect.y,
  button: "left",
  clickCount: 1,
});
await wait(1200);

const after = await evaluate(`(() => {
  const button = document.querySelector('button[aria-pressed]');
  const img = button.querySelector('img');
  const canvas = button.querySelector('canvas');
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  return { pressed: button.getAttribute('aria-pressed'), img: r(img), canvas: r(canvas) };
})()`);
console.log("after", JSON.stringify(after));

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  clip: { x: 0, y: 0, width: 1440, height: 1000, scale: 1 },
});
writeFileSync(`${OUT}/hero-ascii-aligned.png`, Buffer.from(data, "base64"));
console.log("saved hero-ascii-aligned.png");

// Mobile ASCII
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Page.navigate", { url: "http://localhost:3000/" });
await wait(4800);
const mobileHeight = await evaluate(`(() => {
  const button = document.querySelector('button[aria-pressed]');
  button.scrollIntoView({ block: 'center' });
  button.click();
  return Math.ceil(document.getElementById('hero').getBoundingClientRect().height);
})()`);
await wait(1200);
const mobileShot = await send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
  clip: { x: 0, y: 0, width: 390, height: mobileHeight, scale: 1 },
});
writeFileSync(
  `${OUT}/hero-mobile-ascii.png`,
  Buffer.from(mobileShot.data, "base64"),
);
console.log("saved hero-mobile-ascii.png", mobileHeight);

ws.close();
chrome.kill();
process.exit(0);
