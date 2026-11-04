import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import WebSocket from "ws";

const CHROME = "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe";
const PROFILE = "C:/Users/ommhatre/AppData/Local/Temp/opencode/services-cdp";
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
    "--remote-debugging-port=9225",
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const tabs = await fetch("http://127.0.0.1:9225/json/list").then((r) =>
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
const issues = [];

ws.on("message", (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") {
    issues.push(
      `exception: ${message.params.exceptionDetails?.text ?? "unknown"}`,
    );
  }
  if (
    message.method === "Runtime.consoleAPICalled" &&
    message.params.type === "error"
  ) {
    issues.push(
      `console.error: ${message.params.args
        .map((arg) => arg.value ?? arg.description ?? "")
        .join(" ")
        .slice(0, 300)}`,
    );
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
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result?.value;
};

const setViewport = (width, height, mobile) =>
  send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });

const navigate = async () => {
  await send("Page.navigate", { url: "http://localhost:3000/" });
  await wait(5200);
};

const capture = async (name, width, height, clipY = null) => {
  const params = {
    format: "png",
    captureBeyondViewport: clipY !== null,
  };
  if (clipY !== null) {
    params.clip = { x: 0, y: clipY, width, height, scale: 1 };
  }
  const { data } = await send("Page.captureScreenshot", params);
  writeFileSync(`${OUT}/${name}`, Buffer.from(data, "base64"));
  console.log("saved", name, width, height);
};

const scrollToServices = async () => {
  const metrics = await evaluate(`(() => {
    const section = document.getElementById('services');
    const documentTop = Math.round(section.getBoundingClientRect().top + window.scrollY);
    const top = Math.max(0, documentTop - 84);
    window.scrollTo(0, top);
    return {
      top: documentTop,
      height: Math.ceil(section.getBoundingClientRect().height),
      bodyWidth: document.body.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  })()`);
  await wait(1400);
  return metrics;
};

const hideChrome = async () => {
  await evaluate(`(() => {
    const header = document.querySelector('header');
    if (header) header.style.visibility = 'hidden';
  })()`);
};

const restoreChrome = async () => {
  await evaluate(`(() => {
    const header = document.querySelector('header');
    if (header) header.style.visibility = '';
  })()`);
};

const clickService = async (index) => {
  await evaluate(`(() => {
    const buttons = [...document.querySelectorAll('#services button[aria-expanded]')];
    buttons[${index}].click();
  })()`);
  await wait(900);
};

await send("Page.enable");
await send("Runtime.enable");

// ---------------------------------------------------------------- desktop
await setViewport(1440, 1000, false);
await navigate();
const desktopMetrics = await scrollToServices();
console.log("desktop section", JSON.stringify(desktopMetrics));

const initial = await evaluate(`(() => {
  const section = document.getElementById('services');
  const rows = [...section.querySelectorAll('button[aria-expanded]')];
  const active = rows.find((row) => row.getAttribute('aria-expanded') === 'true');
  const canvas = section.querySelector('canvas');
  return {
    rows: rows.length,
    activeText: active?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 120),
    canvas: canvas ? { width: canvas.width, height: canvas.height, cssWidth: Math.round(canvas.getBoundingClientRect().width), cssHeight: Math.round(canvas.getBoundingClientRect().height) } : null,
    sectionHeight: Math.ceil(section.getBoundingClientRect().height),
    pageScrollY: Math.round(window.scrollY),
  };
})()`);
console.log("initial", JSON.stringify(initial));
await capture("services-desktop-initial.png", 1440, 1000);

await hideChrome();
await capture("services-desktop-section-01.png", 1440, desktopMetrics.height, desktopMetrics.top);
await restoreChrome();

// Select real-time systems
await clickService(2);
const selected = await evaluate(`(() => {
  const section = document.getElementById('services');
  const rows = [...section.querySelectorAll('button[aria-expanded]')];
  const active = rows.find((row) => row.getAttribute('aria-expanded') === 'true');
  const region = section.querySelector('[role="region"]');
  return {
    activeText: active?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 120),
    panelText: region?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 180),
    expandedCount: rows.filter((row) => row.getAttribute('aria-expanded') === 'true').length,
    sectionHeight: Math.ceil(section.getBoundingClientRect().height),
  };
})()`);
console.log("selected 03", JSON.stringify(selected));
await capture("services-desktop-selected-03.png", 1440, 1000);

await hideChrome();
await capture("services-desktop-section-03.png", 1440, selected.sectionHeight, desktopMetrics.top);
await restoreChrome();

// Drag the core
const core = await evaluate(`(() => {
  const section = document.getElementById('services');
  const canvas = section.querySelector('canvas');
  const r = canvas.getBoundingClientRect();
  return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.5 };
})()`);
await send("Input.dispatchMouseEvent", {
  type: "mouseMoved",
  x: core.x,
  y: core.y,
});
await send("Input.dispatchMouseEvent", {
  type: "mousePressed",
  x: core.x,
  y: core.y,
  button: "left",
  clickCount: 1,
});
for (let step = 1; step <= 6; step++) {
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: core.x + step * 22,
    y: core.y + step * 7,
    button: "left",
  });
  await wait(40);
}
await send("Input.dispatchMouseEvent", {
  type: "mouseReleased",
  x: core.x + 132,
  y: core.y + 42,
  button: "left",
  clickCount: 1,
});
await wait(900);
await capture("services-desktop-drag.png", 1440, 1000);

// Hover the performance row to preview the top plate
const perfRow = await evaluate(`(() => {
  const rows = [...document.querySelectorAll('#services button[aria-expanded]')];
  const r = rows[4].getBoundingClientRect();
  return { x: r.left + 80, y: r.top + r.height / 2 };
})()`);
await send("Input.dispatchMouseEvent", {
  type: "mouseMoved",
  x: perfRow.x,
  y: perfRow.y,
});
await wait(700);
await capture("services-desktop-hover-05.png", 1440, 1000);

// Keyboard focus on the second row
await evaluate(`(() => {
  const rows = [...document.querySelectorAll('#services button[aria-expanded]')];
  rows[1].focus();
})()`);
await wait(400);
await capture("services-desktop-focus.png", 1440, 1000);

// ---------------------------------------------------------------- mobile
await setViewport(390, 844, true);
await navigate();
const mobileMetrics = await scrollToServices();
console.log("mobile section", JSON.stringify(mobileMetrics));

const mobileInitial = await evaluate(`(() => {
  const section = document.getElementById('services');
  const rows = [...section.querySelectorAll('button[aria-expanded]')];
  const canvas = section.querySelector('canvas');
  const wide = [...document.querySelectorAll('body *')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, cls: String(el.className || '').slice(0, 90), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    })
    .filter((r) => r.width > 0 && (r.right > 391 || r.left < -1))
    .slice(0, 12);
  return {
    rows: rows.length,
    sectionHeight: Math.ceil(section.getBoundingClientRect().height),
    innerWidth: window.innerWidth,
    bodyClientWidth: document.body.clientWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    canvas: canvas ? { cssWidth: Math.round(canvas.getBoundingClientRect().width), cssHeight: Math.round(canvas.getBoundingClientRect().height) } : null,
    firstRowHeight: Math.round(rows[0].getBoundingClientRect().height),
    wide,
  };
})()`);
console.log("mobile initial", JSON.stringify(mobileInitial));

await hideChrome();
await capture("services-mobile-section-01.png", 390, mobileMetrics.height, mobileMetrics.top);
await restoreChrome();

await clickService(1);
const mobileSelected = await evaluate(`(() => {
  const section = document.getElementById('services');
  return {
    sectionHeight: Math.ceil(section.getBoundingClientRect().height),
    expanded: section.querySelectorAll('button[aria-expanded="true"]').length,
  };
})()`);
console.log("mobile selected 02", JSON.stringify(mobileSelected));
await hideChrome();
await capture("services-mobile-section-02.png", 390, mobileSelected.sectionHeight, mobileMetrics.top);
await restoreChrome();

// Next / previous controls in the core footer
await evaluate(`(() => {
  const buttons = [...document.querySelectorAll('#services button[aria-label]')];
  const next = buttons.find((b) => b.getAttribute('aria-label') === 'Next capability layer');
  next?.click();
})()`);
await wait(800);
const mobileNext = await evaluate(`(() => {
  const section = document.getElementById('services');
  const active = [...section.querySelectorAll('button[aria-expanded]')].find((row) => row.getAttribute('aria-expanded') === 'true');
  return { activeText: active?.textContent?.replace(/\\s+/g, ' ').trim().slice(0, 100) };
})()`);
console.log("mobile next", JSON.stringify(mobileNext));

// ---------------------------------------------------------------- reduced motion
await setViewport(1440, 1000, false);
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await navigate();
await scrollToServices();
const reduced = await evaluate(`(() => {
  const section = document.getElementById('services');
  const reveal = section.querySelector('.service-reveal');
  return {
    revealAnimation: reveal ? getComputedStyle(reveal).animationName : null,
    canvas: Boolean(section.querySelector('canvas')),
  };
})()`);
console.log("reduced motion", JSON.stringify(reduced));
await capture("services-desktop-reduced.png", 1440, 1000);
await send("Emulation.setEmulatedMedia", { features: [] });

console.log("issues", JSON.stringify(issues));
ws.close();
chrome.kill();
process.exit(0);
