/* ==========================================================================
   Eco Farm Tech — dashboard behaviour
   Vanilla JS: hash routing, SVG charts, demo interactions.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const nf = new Intl.NumberFormat("en-IN");

  /* ------------------------------------------------------------------ toast */
  let toastTimer;
  const toastEl = $("#toast");
  const toastText = $("#toastText");
  function toast(message) {
    if (!toastEl) return;
    toastText.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ----------------------------------------------------------- live clock -- */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const clockDate = $("#clockDate");
  const clockTime = $("#clockTime");
  const lastUpdated = $("#lastUpdated");
  const PEAK = { hours: 12, minutes: 15 };
  const motionQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  let chartRange = "today";

  function formatNow(d) {
    const h = d.getHours();
    return {
      date: `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      time: `${h % 12 || 12}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} ${h < 12 ? "AM" : "PM"}`,
      short: `${h % 12 || 12}:${pad2(d.getMinutes())} ${h < 12 ? "AM" : "PM"}`
    };
  }

  function peakNote(now) {
    const peak = new Date(now);
    peak.setHours(PEAK.hours, PEAK.minutes, 0, 0);
    return now >= peak ? "Peak 8.5 kW at 12:15 PM" : "Expected peak 8.5 kW around 12:15 PM";
  }

  function updateFootnote() {
    const el = $("#chartFootnote");
    if (!el) return;
    if (chartRange === "today") {
      el.textContent = peakNote(new Date());
    } else {
      const cfg = (window.EFT_DATA || {})[chartRange];
      el.textContent = cfg && cfg.footnote ? cfg.footnote : "";
    }
  }

  function tickClock() {
    const now = new Date();
    const stamp = formatNow(now);
    if (clockDate) clockDate.textContent = stamp.date;
    if (clockTime) clockTime.textContent = stamp.time;
    if (lastUpdated) lastUpdated.textContent = `${stamp.date} · ${stamp.short}`;
    updateFootnote();
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* -------------------------------------------------------- motion helpers -- */
  function replay(el, cls) {
    if (!el || motionQuery.matches) return;
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.classList.add(cls);
  }

  const NUMBER_RE = /^([^0-9]*)([0-9][0-9,]*(?:\.[0-9]+)?)([^0-9]*)$/;
  function tweenText(el, next) {
    if (!el) return;
    if (el.textContent === next) return;
    const targetMatch = String(next).match(NUMBER_RE);
    const startMatch = String(el.textContent).match(NUMBER_RE);
    if (!targetMatch || !startMatch) { el.textContent = next; return; }

    const prefix = targetMatch[1];
    const rawTarget = targetMatch[2];
    const suffix = targetMatch[3];
    const target = parseFloat(rawTarget.replace(/,/g, ""));
    const from = parseFloat(startMatch[2].replace(/,/g, "")) || 0;
    const decimals = (rawTarget.split(".")[1] || "").length;

    if (motionQuery.matches || !isFinite(target) || Math.abs(target - from) < 1e-6) {
      el.textContent = next;
      return;
    }

    const started = performance.now();
    const duration = 280;
    if (el._tween) cancelAnimationFrame(el._tween);

    const step = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      el.textContent = prefix + value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (progress < 1) el._tween = requestAnimationFrame(step);
      else el.textContent = next;
    };
    el._tween = requestAnimationFrame(step);
  }

  /* ------------------------------------------------------- shared data ----- */
  const DATA = window.EFT_DATA || { today: { labels: [], values: [] } };
  const PAGES = window.EFT_PAGES || {};

  /* ---------------------------------------------------------------- charts */
  const NS = "http://www.w3.org/2000/svg";

  function smoothPath(pts) {
    if (!pts.length) return "";
    if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
    let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const t = 0.2;
      const c1x = p1.x + (p2.x - p0.x) * t;
      const c1y = p1.y + (p2.y - p0.y) * t;
      const c2x = p2.x - (p3.x - p1.x) * t;
      const c2y = p2.y - (p3.y - p1.y) * t;
      d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return d;
  }

  let gradientSeq = 0;

  function drawArea(container, cfg) {
    if (!container) return;
    const W = 720, H = 300;
    const pad = { l: 44, r: 16, t: 16, b: 34 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;
    const values = cfg.values;
    const n = values.length;
    const max = cfg.yMax || Math.ceil(Math.max.apply(null, values) / 10) * 10 || 10;
    const step = n > 1 ? plotW / (n - 1) : 0;
    const x = (i) => pad.l + i * step;
    const y = (v) => pad.t + plotH * (1 - v / max);
    const pts = values.map((v, i) => ({ x: x(i), y: y(v) }));
    const line = smoothPath(pts);
    const area = `${line} L${pts[pts.length - 1].x.toFixed(2)},${(pad.t + plotH).toFixed(2)} L${pts[0].x.toFixed(2)},${(pad.t + plotH).toFixed(2)} Z`;
    const gid = "grad" + (++gradientSeq);

    const ticks = 5;
    let grid = "";
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i;
      const yy = y(v);
      grid += `<line class="chart-grid-line" x1="${pad.l}" y1="${yy.toFixed(2)}" x2="${W - pad.r}" y2="${yy.toFixed(2)}"/>`;
      grid += `<text class="chart-axis-text" x="${pad.l - 10}" y="${(yy + 3.5).toFixed(2)}" text-anchor="end">${Math.round(v)}</text>`;
    }

    const labelEvery = n > 9 ? 2 : 1;
    let xLabels = "";
    cfg.labels.forEach((lab, i) => {
      if (i % labelEvery !== 0 && i !== n - 1) return;
      xLabels += `<text class="chart-axis-text" x="${x(i).toFixed(2)}" y="${H - 10}" text-anchor="middle">${lab}</text>`;
    });

    const unit = cfg.unit || "kW";
    let hit = "";
    values.forEach((v, i) => {
      const hx = Math.max(0, x(i) - step / 2);
      hit += `<rect class="hit" x="${hx.toFixed(2)}" y="${pad.t}" width="${Math.max(step, 8).toFixed(2)}" height="${plotH}" fill="transparent" style="cursor:crosshair" data-i="${i}"/>`;
    });

    const peak = cfg.peak;
    const peakMark = peak
      ? `<circle class="chart-peak" cx="${x(peak.index).toFixed(2)}" cy="${y(values[peak.index]).toFixed(2)}" r="5" stroke-width="2.5"/>`
      : "";

    container.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.ariaLabel || "Energy generation chart"}">
        <defs>
          <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2cb06a" stop-opacity=".30"/>
            <stop offset="55%" stop-color="#2cb06a" stop-opacity=".12"/>
            <stop offset="100%" stop-color="#2cb06a" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grid}
        ${xLabels}
        <path d="${area}" fill="url(#${gid})"/>
        <path class="chart-line" d="${line}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        ${peakMark}
        <line class="chart-hover-line" x1="0" y1="${pad.t}" x2="0" y2="${pad.t + plotH}"/>
        <circle class="chart-dot" r="4.5"/>
        ${hit}
      </svg>
      <div class="chart-tip"></div>`;

    const svg = $("svg", container);
    const tip = $(".chart-tip", container);
    const hoverLine = $(".chart-hover-line", container);
    const dot = $(".chart-dot", container);
    const geometry = { W, H, pad, plotW, plotH, step, x, y, values, unit, labels: cfg.labels };

    function showAt(index) {
      const v = values[index];
      const cx = x(index), cy = y(v);
      dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.style.opacity = "1";
      hoverLine.setAttribute("x1", cx); hoverLine.setAttribute("x2", cx); hoverLine.style.opacity = "1";
      tip.innerHTML = `<strong>${v} ${unit}</strong><span>${cfg.labels[index]}</span>`;
      const rect = svg.getBoundingClientRect();
      const left = (cx / W) * rect.width;
      const top = (cy / H) * rect.height;
      tip.style.left = left + "px";
      tip.style.top = Math.max(30, top) + "px";
      tip.classList.add("on");
    }
    function hide() {
      dot.style.opacity = "0";
      hoverLine.style.opacity = "0";
      tip.classList.remove("on");
    }

    svg.addEventListener("pointermove", (e) => {
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      let i = Math.round((px - pad.l) / (step || 1));
      i = Math.max(0, Math.min(n - 1, i));
      showAt(i);
    });
    svg.addEventListener("pointerleave", hide);
    container._geometry = geometry;
  }

  function drawDonut() {
    const svg = $("#usageDonut svg");
    if (!svg) return;
    const r = 48, C = 2 * Math.PI * r, gap = 3;
    let acc = 0;
    let segs = "";
    DATA.usageSplit.forEach((s) => {
      const len = Math.max(2, (s.value / 100) * C - gap);
      segs += `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${s.color}" stroke-width="15"
        stroke-linecap="round" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}"
        stroke-dashoffset="${(-acc).toFixed(2)}"/>`;
      acc += (s.value / 100) * C;
    });
    svg.innerHTML = `<circle class="donut-track" cx="60" cy="60" r="${r}" fill="none" stroke-width="15"/>${segs}`;
  }

  function drawBars(container, items) {
    if (!container) return;
    const max = Math.max.apply(null, items.map((d) => d.value));
    container.innerHTML = items
      .map((d) => {
        const h = Math.max(8, Math.round((d.value / max) * 96));
        return `<div class="bar-col" title="${d.label}: ${d.value} kWh">
          <span class="bar-value">${d.value}</span>
          <div class="bar ${d.today ? "" : "muted"}" style="height:${h}px"></div>
          <span class="bar-label">${d.label}</span>
        </div>`;
      })
      .join("");
  }

  function renderCharts() {
    drawArea($("#genChart"), Object.assign({ ariaLabel: "Solar energy generation curve" }, DATA.today));
    drawArea($("#solarChart"), Object.assign({ ariaLabel: "Today's generation curve" }, DATA.today));
    drawDonut();
    drawBars($("#weekBars"), DATA.weekBars);
    drawBars($("#reportBars"), DATA.reportBars);
  }

  const rangeSelect = $("#rangeSelect");
  if (rangeSelect) {
    rangeSelect.addEventListener("change", () => {
      chartRange = rangeSelect.value;
      const cfg = DATA[chartRange] || DATA.today;
      drawArea($("#genChart"), Object.assign({ ariaLabel: "Solar energy generation curve" }, cfg));
      updateFootnote();
      replay($("#genChart"), "animate-swap");
    });
    chartRange = rangeSelect.value;
  }
  updateFootnote();

  /* ---------------------------------------------------------------- routing */
  const routes = Object.keys(PAGES);

  function currentRoute() {
    const h = (location.hash || "#dashboard").replace("#", "");
    return routes.indexOf(h) >= 0 ? h : "dashboard";
  }

  function renderRoute() {
    const route = currentRoute();
    $$(".page").forEach((p) => p.classList.toggle("active", p.id === "page-" + route));
    $$(".nav-item").forEach((a) => a.classList.toggle("active", a.dataset.page === route));

    // Stagger the entrance of each block on the page that just became active
    const active = document.getElementById("page-" + route);
    if (active) {
      const blocks = active.querySelectorAll(".stat, .card, .package, .owner-hero, .about-hero");
      blocks.forEach((el, i) => el.style.setProperty("--i", String(Math.min(i, 9))));
    }

    const meta = PAGES[route];
    const t = $("#pageTitle"), s = $("#pageSubtitle");
    if (t) t.textContent = meta.title;
    if (s) s.textContent = meta.subtitle;
    document.title = meta.title + " · Eco Farm Tech";
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", renderRoute);

  /* -------------------------------------------------------------- side nav */
  const sidebar = $("#sidebar");
  const scrim = $("#scrim");
  const menuBtn = $("#menuBtn");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("open");
    scrim.hidden = false;
    requestAnimationFrame(() => scrim.classList.add("show"));
    menuBtn && menuBtn.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    if (!sidebar || !sidebar.classList.contains("open")) return;
    sidebar.classList.remove("open");
    scrim.classList.remove("show");
    setTimeout(() => { scrim.hidden = true; }, 220);
    menuBtn && menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn && menuBtn.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  scrim && scrim.addEventListener("click", closeSidebar);

  /* -------------------------------------------------------------- dropdowns */
  const dropdowns = [
    { btn: $("#bellBtn"), menu: $("#bellMenu") },
    { btn: $("#profileBtn"), menu: $("#profileMenu") }
  ].filter((d) => d.btn && d.menu);

  dropdowns.forEach((d) => {
    d.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = d.menu.classList.contains("open");
      dropdowns.forEach((o) => { o.menu.classList.remove("open"); o.btn.setAttribute("aria-expanded", "false"); });
      if (!open) {
        d.menu.classList.add("open");
        d.btn.setAttribute("aria-expanded", "true");
      }
    });
    d.menu.addEventListener("click", (e) => e.stopPropagation());
  });

  document.addEventListener("click", () => {
    dropdowns.forEach((d) => { d.menu.classList.remove("open"); d.btn.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdowns.forEach((d) => { d.menu.classList.remove("open"); d.btn.setAttribute("aria-expanded", "false"); });
      closeSidebar();
    }
  });

  /* ------------------------------------------------------- pump on/off demo */
  let pumpOn = true;
  function applyPumpState() {
    const sw = $("#pumpSwitch");
    if (sw) {
      sw.classList.toggle("on", pumpOn);
      sw.setAttribute("aria-checked", String(pumpOn));
    }
    const ring = $("#pumpRing");
    if (ring) ring.classList.toggle("off", !pumpOn);
    const title = $("#pumpTitle"), desc = $("#pumpDesc"), pill = $("#pumpPill");
    if (title) title.textContent = pumpOn ? "Pump is ON" : "Pump is OFF";
    if (desc) desc.textContent = pumpOn
      ? "Running on solar power · 3.2 kW draw · Zone 1 sprinklers active"
      : "Irrigation paused · schedule resumes at 01:00 PM · Zone 2";
    if (pill) {
      pill.textContent = pumpOn ? "Running · solar direct" : "Paused · standby";
      pill.className = "pill" + (pumpOn ? "" : " gray");
    }
    const state = $("[data-pump-state]"), sub = $("[data-pump-sub]"), pulse = $("[data-pump-pulse]");
    if (state) state.textContent = pumpOn ? "ON" : "OFF";
    if (sub) sub.textContent = pumpOn ? "Irrigation Running" : "Irrigation Paused";
    if (pulse) pulse.style.display = pumpOn ? "" : "none";
  }

  const pumpSwitch = $("#pumpSwitch");
  pumpSwitch && pumpSwitch.addEventListener("click", () => {
    pumpOn = !pumpOn;
    applyPumpState();
    toast(pumpOn ? "Irrigation pump switched ON (demo)." : "Irrigation pump switched OFF (demo).");
  });

  /* --------------------------------------------------------------- switches */
  document.addEventListener("click", (e) => {
    const sw = e.target.closest(".switch");
    if (!sw || sw.id === "pumpSwitch") return;
    const on = !sw.classList.contains("on");
    sw.classList.toggle("on", on);
    sw.setAttribute("aria-checked", String(on));
  });

  /* ------------------------------------------------------------------ toast */
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-toast]");
    if (!trigger) return;
    if (trigger.tagName === "A" && trigger.getAttribute("href") === "#") e.preventDefault();
    toast(trigger.dataset.toast);
  });

  /* -------------------------------------------------------------- CSV/print */
  function downloadCSV() {
    const table = $("#reportTable");
    if (!table) return;
    const rows = $$("tr", table).map((tr) =>
      $$("th,td", tr).map((cell) => '"' + cell.textContent.trim().replace(/"/g, '""') + '"').join(",")
    );
    const csv = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eco-farm-tech-energy-report-nov-2026.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Report downloaded as CSV (demo data).");
  }
  const csvBtn = $("#csvBtn");
  csvBtn && csvBtn.addEventListener("click", downloadCSV);

  const printBtn = $("#printBtn");
  printBtn && printBtn.addEventListener("click", () => window.print());

  /* -------------------------------------------------------------- top bar fx */
  const topbar = $("#topbar");
  window.addEventListener("scroll", () => {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 6);
  }, { passive: true });


  /* =========================================================== dark mode === */
  const themeBtn = $("#themeBtn");
  const rootEl = document.documentElement;

  function syncThemeButton() {
    if (!themeBtn) return;
    const dark = rootEl.getAttribute("data-theme") === "dark";
    const use = themeBtn.querySelector("use");
    if (use) use.setAttribute("href", dark ? "#i-sun" : "#i-moon");
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    themeBtn.setAttribute("title", dark ? "Switch to light mode" : "Switch to dark mode");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#06120d" : "#0b3a28");
  }

  function applyTheme(theme, persist) {
    if (theme === "dark") rootEl.setAttribute("data-theme", "dark");
    else rootEl.removeAttribute("data-theme");
    if (persist !== false) {
      try { localStorage.setItem("eft-theme", theme); } catch (e) {}
    }
    syncThemeButton();
  }

  function setTheme(theme, persist) {
    // Crossfade the whole page when the browser supports View Transitions,
    // otherwise the CSS colour transitions on the surfaces take over.
    if (typeof document.startViewTransition === "function" && !motionQuery.matches) {
      document.startViewTransition(() => applyTheme(theme, persist));
    } else {
      applyTheme(theme, persist);
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
      toast(next === "dark" ? "Dark mode on" : "Light mode on");
    });
    syncThemeButton();
  }

  /* ===================================================== savings calculator */
  const BIZ = window.EFT_BUSINESS || {};
  const CALC = BIZ.calculator || {
    defaults: { capacity: 10, panels: 18, dailyUse: 42, price: 4.2 },
    panelWp: 550, fullOutputHours: 4.2, daysPerMonth: 30,
    co2PerKwh: 0.82, treeAbsorbKg: 21, coalPerKwh: 0.5
  };

  const calcState = Object.assign({}, CALC.defaults);
  const calcFields = $$("[data-calc]");

  function inr(n, decimals) {
    return n.toLocaleString("en-IN", { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
  }
  function round1(v) { return Math.round(v * 10) / 10; }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function paintCalculator() {
    const { capacity, panels, dailyUse, price } = calcState;
    const dailyGen = capacity * CALC.fullOutputHours;
    const monthlyGen = dailyGen * CALC.daysPerMonth;
    const monthlyUse = dailyUse * CALC.daysPerMonth;
    const coverage = monthlyUse > 0 ? Math.min(100, (monthlyGen / monthlyUse) * 100) : 0;
    const monthlySaving = Math.min(monthlyGen, monthlyUse) * price;
    const annualGen = monthlyGen * 12;
    const co2 = annualGen * CALC.co2PerKwh;
    const coal = annualGen * CALC.coalPerKwh;

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    const roll = (id, value) => tweenText(document.getElementById(id), value);
    roll("calcOutDaily", inr(dailyGen, 1));
    roll("calcOutMonthly", inr(monthlyGen));
    roll("calcOutValue", inr(monthlyGen * price));
    roll("calcOutMonthlySaving", inr(monthlySaving));
    roll("calcOutAnnualSaving", inr(monthlySaving * 12));
    roll("calcOutCoverage", inr(coverage));
    set("capLabel", inr(capacity, 1) + " kW");
    set("panelLabel", panels + " × " + CALC.panelWp + " Wp");
    set("useLabel", inr(dailyUse) + " kWh");
    set("priceLabel", "₹ " + price.toFixed(2) + " / unit");

    const co2El = document.getElementById("impactCo2");
    if (co2El) co2El.innerHTML = (co2 / 1000).toFixed(1) + " <small>t</small>";
    const treeEl = document.getElementById("impactTrees");
    if (treeEl) treeEl.textContent = inr(Math.round(co2 / CALC.treeAbsorbKg));
    const coalEl = document.getElementById("impactCoal");
    if (coalEl) coalEl.innerHTML = (coal / 1000).toFixed(1) + " <small>t</small>";
    const shareEl = document.getElementById("impactShare");
    if (shareEl) shareEl.innerHTML = inr(coverage) + "<small>%</small>";

    calcFields.forEach((input) => {
      const key = input.dataset.calc;
      const target = key === "price" ? calcState.price.toFixed(2) : String(calcState[key]);
      if (String(input.value) !== target) input.value = target;
    });
  }

  if (calcFields.length) {
    calcFields.forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.calc;
        const raw = parseFloat(input.value);
        if (isNaN(raw)) return;

        if (key === "panels") {
          const panels = clamp(Math.round(raw), 1, 200);
          calcState.panels = panels;
          calcState.capacity = clamp(round1(panels * CALC.panelWp / 1000), 0.1, 100);
        } else if (key === "capacity") {
          const capacity = clamp(round1(raw), 0.1, 100);
          calcState.capacity = capacity;
          calcState.panels = clamp(Math.round((capacity * 1000) / CALC.panelWp), 1, 200);
        } else if (key === "dailyUse") {
          calcState.dailyUse = clamp(Math.round(raw), 1, 500);
        } else if (key === "price") {
          calcState.price = clamp(round1(raw), 0.1, 20);
        }
        paintCalculator();
      });
    });
    paintCalculator();
  }

  /* ================================================= pricing & finance model */
  const FIN = BIZ.finance;

  function renderRevenueChart() {
    const host = $("#revChart");
    if (!host || !FIN) return;
    const max = Math.max.apply(null, FIN.monthlyRevenueSeries.concat(FIN.monthlyExpenseSeries));
    host.innerHTML = FIN.months.map((m, i) => {
      const rev = FIN.monthlyRevenueSeries[i];
      const exp = FIN.monthlyExpenseSeries[i];
      return `<div class="duo" title="${m}: revenue ₹${inr(rev)}, expenses ₹${inr(exp)}">
        <span>${m}</span>
        <div class="track">
          <div class="fill" style="width:${((rev / max) * 100).toFixed(1)}%"></div>
          <div class="fill alt" style="width:${((exp / max) * 100).toFixed(1)}%"></div>
        </div>
      </div>`;
    }).join("");
  }

  function paintFinance(key) {
    if (!FIN) return;
    const model = FIN[key] || FIN.singleFarm;
    const revenueTotal = model.revenue + model.subscription;
    const expenseTotal = model.maintenance + model.employee + model.other;
    const surplus = revenueTotal - expenseTotal;
    const rows = [
      { label: "Electricity revenue (pay-per-use)", value: model.revenue, dot: "#1e9e57" },
      { label: "Monitoring subscriptions", value: model.subscription, dot: "#3d8fdd" },
      { label: "Maintenance expense", value: -model.maintenance, dot: "#f0b429" },
      { label: "Employee expense", value: -model.employee, dot: "#f0b429" },
      { label: "Other expenses", value: -model.other, dot: "#b3c4ba" }
    ];
    const host = $("#finRows");
    if (host) {
      replay(host, "animate-swap");
      host.innerHTML = rows.map((r) => `<div class="fin-row">
        <span class="fin-label"><span class="dot" style="background:${r.dot}"></span>${r.label}</span>
        <b>${r.value < 0 ? "− " : ""}₹ ${inr(Math.abs(r.value))}</b>
      </div>`).join("") + `<div class="fin-row total">
        <span class="fin-label">Illustrative operating surplus</span><b>₹ ${inr(surplus)} / month</b>
      </div>`;
    }
    const annualSurplus = surplus * 12;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("finInvestment", inr(FIN.initialInvestment));
    set("finSurplus", inr(annualSurplus));
    tweenText(document.getElementById("finBreakEven"),
      annualSurplus > 0 ? (FIN.initialInvestment / annualSurplus).toFixed(1) : "—");
    set("finModel", key === "scaled" ? "Three farms" : "Single farm");
    const note = $("#finNote");
    if (note) {
      note.textContent = key === "scaled"
        ? "Same unit economics applied to three monitored farms: revenue and costs both scale, and the larger surplus shortens the payback period."
        : "Sample operating model for one monitored farm: electricity revenue plus subscription income, less maintenance, staff and other costs.";
    }
    $$("[data-fin]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.fin === key)));
  }

  if (FIN) {
    renderRevenueChart();
    paintFinance("singleFarm");
    $$("[data-fin]").forEach((btn) => {
      btn.addEventListener("click", () => {
        paintFinance(btn.dataset.fin);
        $$("[data-fin]").forEach((b) => b.classList.toggle("is-active", b.dataset.fin === btn.dataset.fin));
      });
    });
  }

  /* ============================================== farmer enquiry (demo only) */
  const enquiryForm = $("#enquiryForm");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const required = $$("[required]", enquiryForm);
      let firstInvalid = null;
      required.forEach((field) => {
        const ok = field.type === "checkbox" ? field.checked : String(field.value).trim().length > 0;
        field.style.borderColor = ok ? "" : "#d9534f";
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        toast("Please complete the highlighted required fields.");
        return;
      }
      const panel = $("#enquirySuccess");
      const ref = $("#enquiryRef");
      const name = (enquiryForm.querySelector('[name="name"]') || {}).value || "farmer";
      if (ref) {
        ref.textContent = "Reference EFT-DEMO-" + Math.floor(1000 + Math.random() * 8999) +
          " · Thank you, " + name.trim().split(" ")[0] + ". Nothing was transmitted — this prototype stops at validation.";
      }
      if (panel) {
        panel.classList.add("show");
        if (typeof panel.scrollIntoView === "function") {
          panel.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      toast("Estimate request prepared (demo — no data sent).");
    });
  }

  /* ------------------------------------------------------------------- boot */
  renderCharts();
  applyPumpState();
  renderRoute();
})();
