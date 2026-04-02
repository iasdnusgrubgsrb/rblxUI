// ==UserScript==
// @name         RSniperUI — Floating Panel Library
// @namespace    https://raw.githubusercontent.com/YOUR_USERNAME/rsniper-ui/main/rsniper-ui-lib.js
// @version      1.0.0
// @description  Lightweight, modern floating UI panel builder for Roblox userscripts
// @author       You
// @grant        none
// ==/UserScript==

/**
 * RSniperUI
 * A zero-dependency, injectable floating panel library for userscripts.
 *
 * Usage:
 *   const panel = new RSniperUI({ title: "My Tool" });
 *   const inp   = panel.addInput({ placeholder: "Enter username" });
 *   const btn   = panel.addButton({ label: "Go", variant: "primary" });
 *   const txt   = panel.addStatus();
 *   const img   = panel.addAvatar();
 *   btn.onClick(() => console.log(inp.value()));
 *   panel.mount();
 */

(function (global) {
  "use strict";

  // ─── Inject Styles (once) ───────────────────────────────────────────────────
  const STYLE_ID = "__rsniper_ui_styles__";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

      :root {
        --rs-bg:           #0d0f14;
        --rs-surface:      #13161e;
        --rs-surface-2:    #1a1e28;
        --rs-border:       rgba(255,255,255,0.07);
        --rs-border-focus: rgba(99,179,237,0.5);
        --rs-accent:       #63b3ed;
        --rs-accent-dark:  #2b6cb0;
        --rs-success:      #68d391;
        --rs-success-dark: #276749;
        --rs-danger:       #fc8181;
        --rs-text:         #e2e8f0;
        --rs-text-muted:   #718096;
        --rs-text-dim:     #4a5568;
        --rs-radius:       10px;
        --rs-radius-lg:    14px;
        --rs-shadow:       0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4);
        --rs-glow:         0 0 20px rgba(99,179,237,0.15);
      }

      /* ── Panel ──────────────────────────────────────── */
      .rs-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.94);
        width: 320px;
        background: var(--rs-bg);
        border: 1px solid var(--rs-border);
        border-radius: var(--rs-radius-lg);
        box-shadow: var(--rs-shadow);
        font-family: 'Syne', sans-serif;
        color: var(--rs-text);
        z-index: 2147483647;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.22s cubic-bezier(.4,0,.2,1),
                    transform 0.22s cubic-bezier(.4,0,.2,1);
        user-select: none;
      }
      .rs-panel.rs-visible {
        opacity: 1;
        pointer-events: all;
        transform: translate(-50%, -50%) scale(1);
      }

      /* ── Drag handle / header ───────────────────────── */
      .rs-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        background: var(--rs-surface);
        border-bottom: 1px solid var(--rs-border);
        cursor: grab;
        gap: 10px;
      }
      .rs-header:active { cursor: grabbing; }

      .rs-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .rs-dot-group {
        display: flex;
        gap: 5px;
        flex-shrink: 0;
      }
      .rs-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        opacity: 0.7;
      }
      .rs-dot-r { background: #fc8181; }
      .rs-dot-y { background: #f6e05e; }
      .rs-dot-g { background: #68d391; }

      .rs-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--rs-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .rs-close {
        background: none;
        border: none;
        color: var(--rs-text-dim);
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        flex-shrink: 0;
        transition: color 0.15s, background 0.15s;
        line-height: 1;
      }
      .rs-close:hover {
        color: var(--rs-danger);
        background: rgba(252,129,129,0.1);
      }
      .rs-close svg { width: 14px; height: 14px; }

      /* ── Body ───────────────────────────────────────── */
      .rs-body {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* ── Input ──────────────────────────────────────── */
      .rs-input-wrap {
        position: relative;
      }
      .rs-input {
        width: 100%;
        box-sizing: border-box;
        background: var(--rs-surface-2);
        border: 1px solid var(--rs-border);
        border-radius: var(--rs-radius);
        color: var(--rs-text);
        font-family: 'DM Mono', monospace;
        font-size: 13px;
        padding: 9px 12px;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .rs-input::placeholder { color: var(--rs-text-dim); }
      .rs-input:focus {
        border-color: var(--rs-border-focus);
        box-shadow: 0 0 0 3px rgba(99,179,237,0.1);
      }
      .rs-input:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      /* ── Button ─────────────────────────────────────── */
      .rs-btn {
        width: 100%;
        box-sizing: border-box;
        border: none;
        border-radius: var(--rs-radius);
        font-family: 'Syne', sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 10px 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        transition: filter 0.15s, transform 0.1s, opacity 0.15s;
        position: relative;
        overflow: hidden;
      }
      .rs-btn::after {
        content: '';
        position: absolute;
        inset: 0;
        background: white;
        opacity: 0;
        transition: opacity 0.15s;
      }
      .rs-btn:hover::after  { opacity: 0.06; }
      .rs-btn:active { transform: scale(0.98); }
      .rs-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
      .rs-btn:disabled::after { display: none; }

      .rs-btn-primary {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #fff;
        box-shadow: 0 4px 12px rgba(59,130,246,0.3);
      }
      .rs-btn-primary:not(:disabled):hover {
        filter: brightness(1.12);
        box-shadow: 0 6px 16px rgba(59,130,246,0.4);
      }

      .rs-btn-success {
        background: linear-gradient(135deg, #22c55e, #15803d);
        color: #fff;
        box-shadow: 0 4px 12px rgba(34,197,94,0.3);
      }
      .rs-btn-success:not(:disabled):hover {
        filter: brightness(1.1);
        box-shadow: 0 6px 16px rgba(34,197,94,0.4);
      }

      .rs-btn-ghost {
        background: var(--rs-surface-2);
        color: var(--rs-text-muted);
        border: 1px solid var(--rs-border);
      }
      .rs-btn-ghost:not(:disabled):hover {
        color: var(--rs-text);
        border-color: rgba(255,255,255,0.15);
      }

      /* ── Status text ────────────────────────────────── */
      .rs-status {
        font-family: 'DM Mono', monospace;
        font-size: 11.5px;
        color: var(--rs-text-muted);
        background: var(--rs-surface-2);
        border: 1px solid var(--rs-border);
        border-radius: var(--rs-radius);
        padding: 9px 12px;
        min-height: 38px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-all;
        transition: color 0.2s;
      }
      .rs-status.rs-status-found {
        color: var(--rs-success);
        border-color: rgba(104,211,145,0.25);
        background: rgba(104,211,145,0.05);
      }
      .rs-status.rs-status-error {
        color: var(--rs-danger);
        border-color: rgba(252,129,129,0.25);
        background: rgba(252,129,129,0.05);
      }

      /* ── Spinner ────────────────────────────────────── */
      .rs-spinner {
        display: inline-block;
        width: 10px;
        height: 10px;
        border: 2px solid rgba(99,179,237,0.2);
        border-top-color: var(--rs-accent);
        border-radius: 50%;
        animation: rs-spin 0.65s linear infinite;
        flex-shrink: 0;
      }
      @keyframes rs-spin { to { transform: rotate(360deg); } }

      /* ── Avatar ─────────────────────────────────────── */
      .rs-avatar-wrap {
        display: flex;
        justify-content: center;
        padding: 2px 0 4px;
      }
      .rs-avatar {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        object-fit: cover;
        border: 2px solid var(--rs-border);
        background: var(--rs-surface-2);
        transition: opacity 0.2s, transform 0.2s;
        display: block;
      }
      .rs-avatar.rs-hidden { display: none; }

      /* ── Divider ─────────────────────────────────────── */
      .rs-divider {
        height: 1px;
        background: var(--rs-border);
        margin: 2px 0;
      }

      /* ── Hidden utility ─────────────────────────────── */
      .rs-hidden { display: none !important; }

      /* ── Tooltip badge ──────────────────────────────── */
      .rs-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 99px;
        border: 1px solid var(--rs-border);
        color: var(--rs-text-dim);
        background: var(--rs-surface-2);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        align-self: flex-start;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── Drag Logic ─────────────────────────────────────────────────────────────
  function makeDraggable(panel, handle) {
    let ox = 0, oy = 0, mx = 0, my = 0;
    let dragging = false;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest(".rs-close")) return;
      dragging = true;
      // Switch from transform-based centering to explicit coords
      const rect = panel.getBoundingClientRect();
      panel.style.left = rect.left + "px";
      panel.style.top = rect.top + "px";
      panel.style.transform = "none";
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      panel.style.left = e.clientX - ox + "px";
      panel.style.top  = e.clientY - oy + "px";
    });

    document.addEventListener("mouseup", () => { dragging = false; });
  }

  // ─── RSniperUI Class ─────────────────────────────────────────────────────────
  class RSniperUI {
    constructor({ title = "Tool" } = {}) {
      this._title  = title;
      this._panel  = null;
      this._body   = null;
      this._mounted = false;
    }

    // Build DOM
    mount() {
      if (this._mounted) return;
      this._mounted = true;

      // Panel
      const panel = document.createElement("div");
      panel.className = "rs-panel";

      // Header
      const header = document.createElement("div");
      header.className = "rs-header";

      const left = document.createElement("div");
      left.className = "rs-header-left";

      const dots = document.createElement("div");
      dots.className = "rs-dot-group";
      ["rs-dot-r","rs-dot-y","rs-dot-g"].forEach(c => {
        const d = document.createElement("span");
        d.className = "rs-dot " + c;
        dots.appendChild(d);
      });

      const titleEl = document.createElement("span");
      titleEl.className = "rs-title";
      titleEl.textContent = this._title;

      left.appendChild(dots);
      left.appendChild(titleEl);

      const closeBtn = document.createElement("button");
      closeBtn.className = "rs-close";
      closeBtn.setAttribute("aria-label", "Close");
      closeBtn.innerHTML = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>`;
      closeBtn.onclick = () => this.hide();

      header.appendChild(left);
      header.appendChild(closeBtn);

      // Body
      const body = document.createElement("div");
      body.className = "rs-body";

      panel.appendChild(header);
      panel.appendChild(body);
      document.body.appendChild(panel);

      this._panel = panel;
      this._body  = body;

      makeDraggable(panel, header);

      // Show on next frame (for CSS transition)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => panel.classList.add("rs-visible"));
      });
    }

    show() {
      if (!this._mounted) this.mount();
      this._panel.classList.add("rs-visible");
    }

    hide() {
      this._panel && this._panel.classList.remove("rs-visible");
    }

    destroy() {
      this._panel && this._panel.remove();
      this._panel  = null;
      this._body   = null;
      this._mounted = false;
    }

    // ── Widgets ───────────────────────────────────────────────────────────────

    /** Text input. Returns { value(), disable(), enable(), focus() } */
    addInput({ placeholder = "", value = "" } = {}) {
      const wrap = document.createElement("div");
      wrap.className = "rs-input-wrap";

      const el = document.createElement("input");
      el.className = "rs-input";
      el.type = "text";
      el.placeholder = placeholder;
      el.value = value;

      // Allow Enter key to submit (fire a custom event)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") el.dispatchEvent(new CustomEvent("rs-enter", { bubbles: true }));
      });

      wrap.appendChild(el);
      this._body.appendChild(wrap);

      return {
        value: ()      => el.value.trim(),
        setValue: (v)  => { el.value = v; },
        disable: ()    => { el.disabled = true; },
        enable: ()     => { el.disabled = false; },
        focus: ()      => el.focus(),
        onEnter: (fn)  => el.addEventListener("rs-enter", fn),
        _el: el,
      };
    }

    /**
     * Button.
     * variant: "primary" | "success" | "ghost"
     * Returns { onClick(fn), disable(), enable(), setLabel(str), setLoading(bool) }
     */
    addButton({ label = "Button", variant = "primary", hidden = false } = {}) {
      const el = document.createElement("button");
      el.className = `rs-btn rs-btn-${variant}`;
      if (hidden) el.classList.add("rs-hidden");

      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;

      const spinner = document.createElement("span");
      spinner.className = "rs-spinner rs-hidden";

      el.appendChild(spinner);
      el.appendChild(labelSpan);
      this._body.appendChild(el);

      let _clickHandlers = [];

      el.addEventListener("click", () => {
        if (!el.disabled) _clickHandlers.forEach(fn => fn());
      });

      return {
        onClick: (fn) => { _clickHandlers.push(fn); },
        clearHandlers: () => { _clickHandlers = []; },
        disable: ()   => { el.disabled = true; },
        enable: ()    => { el.disabled = false; },
        show: ()      => el.classList.remove("rs-hidden"),
        hide: ()      => el.classList.add("rs-hidden"),
        setLabel: (s) => { labelSpan.textContent = s; },
        setLoading: (on) => {
          if (on) {
            spinner.classList.remove("rs-hidden");
            el.disabled = true;
          } else {
            spinner.classList.add("rs-hidden");
            el.disabled = false;
          }
        },
        _el: el,
      };
    }

    /**
     * Status / log line.
     * Returns { set(text, state?), clear() }
     * state: "idle" | "found" | "error"
     */
    addStatus({ text = "Awaiting input…" } = {}) {
      const el = document.createElement("div");
      el.className = "rs-status";
      el.textContent = text;
      this._body.appendChild(el);

      return {
        set: (msg, state = "idle") => {
          el.textContent = msg;
          el.classList.remove("rs-status-found", "rs-status-error");
          if (state === "found")  el.classList.add("rs-status-found");
          if (state === "error")  el.classList.add("rs-status-error");
        },
        clear: () => { el.textContent = ""; },
        _el: el,
      };
    }

    /**
     * Avatar / headshot image.
     * Returns { setSrc(url), show(), hide() }
     */
    addAvatar() {
      const wrap = document.createElement("div");
      wrap.className = "rs-avatar-wrap rs-hidden";

      const img = document.createElement("img");
      img.className = "rs-avatar";
      img.alt = "avatar";

      wrap.appendChild(img);
      this._body.appendChild(wrap);

      return {
        setSrc: (url) => {
          img.src = url;
          img.onload = () => wrap.classList.remove("rs-hidden");
        },
        show: () => wrap.classList.remove("rs-hidden"),
        hide: () => wrap.classList.add("rs-hidden"),
        _el: wrap,
      };
    }

    /** Thin horizontal rule */
    addDivider() {
      const el = document.createElement("div");
      el.className = "rs-divider";
      this._body.appendChild(el);
    }

    /** Small pill badge (e.g. version label, game ID) */
    addBadge({ text = "" } = {}) {
      const el = document.createElement("span");
      el.className = "rs-badge";
      el.textContent = text;
      this._body.appendChild(el);
      return {
        set: (t) => { el.textContent = t; },
        show: () => el.classList.remove("rs-hidden"),
        hide: () => el.classList.add("rs-hidden"),
        _el: el,
      };
    }
  }

  // ── Expose globally ────────────────────────────────────────────────────────
  global.RSniperUI = RSniperUI;

})(typeof unsafeWindow !== "undefined" ? unsafeWindow : window);
