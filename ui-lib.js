// ==UserScript==
// @name         FloatUI — General Purpose Panel Library
// @namespace    https://raw.githubusercontent.com/YOUR_USERNAME/float-ui/main/float-ui.js
// @version      1.0.0
// @description  Simple, general-purpose floating panel builder for userscripts
// @author       You
// @grant        none
// ==/UserScript==

/**
 * FloatUI — dead-simple floating panel builder.
 *
 * const panel = new FloatUI("My Tool");
 * const inp = panel.input("Enter username...");
 * const btn = panel.button("Search", "blue");
 * const txt = panel.text("Ready.");
 * const img = panel.image();
 * btn.on("click", () => console.log(inp.val()));
 * panel.open();
 */

(function (global) {
  "use strict";

  // ── Inject base styles once ──────────────────────────────────────────────────
  if (!document.getElementById("__floatui_styles__")) {
    const s = document.createElement("style");
    s.id = "__floatui_styles__";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Mono&display=swap');

      .fui-panel {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        background: #0e1117;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.7);
        font-family: 'Syne', sans-serif;
        color: #e2e8f0;
        z-index: 2147483647;
        overflow: hidden;
      }

      .fui-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 14px;
        background: #161b26;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        cursor: grab;
      }
      .fui-header:active { cursor: grabbing; }
      .fui-title { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }

      .fui-close {
        background: none; border: none; color: #4a5568;
        cursor: pointer; font-size: 16px; line-height: 1;
        padding: 0 2px; transition: color .15s;
      }
      .fui-close:hover { color: #fc8181; }

      .fui-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }

      .fui-input {
        width: 100%; box-sizing: border-box;
        background: #1a1f2e; border: 1px solid rgba(255,255,255,0.08);
        border-radius: 8px; color: #e2e8f0;
        font-family: 'DM Mono', monospace; font-size: 12px;
        padding: 8px 10px; outline: none; transition: border-color .15s;
      }
      .fui-input::placeholder { color: #4a5568; }
      .fui-input:focus { border-color: rgba(99,179,237,.5); }

      .fui-btn {
        width: 100%; box-sizing: border-box;
        border: none; border-radius: 8px;
        font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
        letter-spacing: .05em; padding: 9px;
        cursor: pointer; transition: filter .15s, transform .1s;
      }
      .fui-btn:hover:not(:disabled)  { filter: brightness(1.15); }
      .fui-btn:active:not(:disabled) { transform: scale(.98); }
      .fui-btn:disabled { opacity: .4; cursor: not-allowed; }
      .fui-btn-blue    { background: linear-gradient(135deg,#3b82f6,#1d4ed8); color:#fff; }
      .fui-btn-green   { background: linear-gradient(135deg,#22c55e,#15803d); color:#fff; }
      .fui-btn-red     { background: linear-gradient(135deg,#ef4444,#991b1b); color:#fff; }
      .fui-btn-gray    { background: #1a1f2e; color:#94a3b8; border:1px solid rgba(255,255,255,.08); }

      .fui-text {
        font-family: 'DM Mono', monospace; font-size: 11px;
        color: #718096; background: #1a1f2e;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 8px; padding: 8px 10px;
        line-height: 1.6; white-space: pre-wrap; word-break: break-all;
      }

      .fui-img {
        display: block; border-radius: 8px;
        border: 1px solid rgba(255,255,255,.08);
        max-width: 100%; margin: 0 auto;
      }

      .fui-sep { height: 1px; background: rgba(255,255,255,.07); }

      .fui-hidden { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  // ── Drag ────────────────────────────────────────────────────────────────────
  function addDrag(panel, handle) {
    let dx = 0, dy = 0, dragging = false;
    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".fui-close")) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      panel.style.transform = "none";
      panel.style.left = r.left + "px";
      panel.style.top  = r.top  + "px";
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      panel.style.left = (e.clientX - dx) + "px";
      panel.style.top  = (e.clientY - dy) + "px";
    });
    document.addEventListener("mouseup", () => { dragging = false; });
  }

  // ── FloatUI ─────────────────────────────────────────────────────────────────
  class FloatUI {
    constructor(title = "Tool") {
      // Panel
      this._el = document.createElement("div");
      this._el.className = "fui-panel";

      // Header
      const header = document.createElement("div");
      header.className = "fui-header";
      const titleEl = document.createElement("span");
      titleEl.className = "fui-title";
      titleEl.textContent = title;
      const closeEl = document.createElement("button");
      closeEl.className = "fui-close";
      closeEl.textContent = "✕";
      closeEl.onclick = () => this.close();
      header.append(titleEl, closeEl);

      // Body
      this._body = document.createElement("div");
      this._body.className = "fui-body";

      this._el.append(header, this._body);
      addDrag(this._el, header);
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    open() {
      if (!this._el.isConnected) document.body.appendChild(this._el);
      this._el.classList.remove("fui-hidden");
      return this;
    }
    close()   { this._el.classList.add("fui-hidden"); return this; }
    destroy() { this._el.remove(); return this; }

    // ── Widgets ────────────────────────────────────────────────────────────────

    /** <input type="text"> — returns { val(), set(v), on(event, fn), el } */
    input(placeholder = "") {
      const el = document.createElement("input");
      el.className = "fui-input";
      el.type = "text";
      el.placeholder = placeholder;
      this._body.appendChild(el);
      return {
        val:  ()       => el.value.trim(),
        set:  (v)      => { el.value = v; },
        on:   (ev, fn) => { el.addEventListener(ev, fn); return this; },
        el,
      };
    }

    /**
     * <button> — color: "blue" | "green" | "red" | "gray"
     * Returns { on(event, fn), enabled(bool), label(str), hidden(bool), el }
     */
    button(label = "Button", color = "blue") {
      const el = document.createElement("button");
      el.className = `fui-btn fui-btn-${color}`;
      el.textContent = label;
      this._body.appendChild(el);
      return {
        on:      (ev, fn) => { el.addEventListener(ev, fn); return this; },
        enabled: (v)      => { el.disabled = !v; return this; },
        label:   (v)      => { el.textContent = v; return this; },
        hidden:  (v)      => { el.classList.toggle("fui-hidden", v); return this; },
        el,
      };
    }

    /** Text/status display — returns { set(str), el } */
    text(content = "") {
      const el = document.createElement("div");
      el.className = "fui-text";
      el.textContent = content;
      this._body.appendChild(el);
      return {
        set:    (v) => { el.textContent = v; return this; },
        hidden: (v) => { el.classList.toggle("fui-hidden", v); return this; },
        el,
      };
    }

    /** <img> — returns { src(url), hidden(bool), el } */
    image(src = "") {
      const el = document.createElement("img");
      el.className = "fui-img" + (src ? "" : " fui-hidden");
      if (src) el.src = src;
      this._body.appendChild(el);
      return {
        src:    (url) => { el.src = url; el.classList.remove("fui-hidden"); return this; },
        hidden: (v)   => { el.classList.toggle("fui-hidden", v); return this; },
        el,
      };
    }

    /** Horizontal rule separator */
    sep() {
      const el = document.createElement("div");
      el.className = "fui-sep";
      this._body.appendChild(el);
      return this;
    }

    /** Append any raw HTMLElement directly */
    append(el) {
      this._body.appendChild(el);
      return this;
    }
  }

  global.FloatUI = FloatUI;

})(typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
