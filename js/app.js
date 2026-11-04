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

  /* ----------------------------------------------------------------- clock */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pad(n) { return String(n).padStart(2, "0"); }
  function clockStrings(d) {
    const time = `${((d.getHours() + 11) % 12) + 1}:${pad(d.getMinutes())} ${d.getHours() < 12 ? "AM" : "PM"}`;
    return { date: `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, time };
  }
  function tickClock() {
    const now = new Date();
    const s = clockStrings(now);
    const cd = $("#clockDate"), ct = $("#clockTime"), lu = $("#lastUpdated");
    if (cd) cd.textContent = s.date;
    if (ct) ct.textContent = s.time;
    if (lu) lu.textContent = `${s.date} · ${s.time}`;
  }
  tickClock();
  setInterval(tickClock, 20000);

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
      ? `<circle cx="${x(peak.index).toFixed(2)}" cy="${y(values[peak.index]).toFixed(2)}" r="5" fill="#1e9e57" stroke="#fff" stroke-width="2.5"/>`
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
        <path d="${line}" fill="none" stroke="#1e9e57" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
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
    svg.innerHTML = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="#eff5f1" stroke-width="15"/>${segs}`;
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
      const cfg = DATA[rangeSelect.value] || DATA.today;
      drawArea($("#genChart"), Object.assign({ ariaLabel: "Solar energy generation curve" }, cfg));
      const foot = $("#chartFootnote");
      if (foot) foot.textContent = cfg.footnote || "";
    });
  }

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

  /* ------------------------------------------------------------------- boot */
  renderCharts();
  applyPumpState();
  renderRoute();
})();
