/* ==========================================================
   Mapa estelar interactivo – MIM
   Autor: Jonathan Silva
   Dependencias: ninguna (Canvas API puro)
   Estructura esperada en index.html:
     <section id="sky" class="card">
       <h2>Mapa estelar</h2>
       <!-- el canvas se inyecta aquí automáticamente -->
     </section>
     ...
     <div id="toast" aria-live="polite" aria-atomic="true"></div>
   ========================================================== */

(() => {
  // ---------- Utilidades UI (toast) ----------
  function ensureToastHost() {
    let host = document.getElementById("toast");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast";
      document.body.appendChild(host);
    }
    // estilos mínimos inyectados si el CSS no los tiene
    const STYLE_ID = "__toast_style__";
    if (!document.getElementById(STYLE_ID)) {
      const css = `
        #toast{position:fixed;right:16px;top:16px;z-index:9999;pointer-events:none;font-size:14px}
        .toast-msg{background:rgba(20,24,33,.95);color:#fff;border:1px solid rgba(255,255,255,.08);
          padding:10px 14px;border-radius:10px;margin-bottom:8px;box-shadow:0 10px 25px rgba(0,0,0,.25);
          opacity:0;transform:translateY(-6px);transition:opacity .25s ease, transform .25s ease}
        .toast-msg.show{opacity:1;transform:translateY(0)}
        .toast-msg .title{font-weight:700;margin-right:6px}
        .toast-msg .meta{opacity:.85}
        canvas.starfield{display:block;width:100%;height:auto;border-radius:10px;outline:none}
        .star-cursor{cursor:crosshair}
      `;
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }
    return host;
  }

  function showStarToast({ title = "Estrella", name = "", mag = "", dist = "", type = "", constellation = "" }) {
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = "toast-msg";
    const parts = [];
    if (name) parts.push(name);
    if (mag !== "" && mag != null) parts.push(`mag ${mag}`);
    if (dist !== "" && dist != null) parts.push(`${dist} a.l.`);
    if (type) parts.push(type);
    if (constellation) parts.push(constellation);

    el.innerHTML = `<span class="title">${title}</span> <span class="meta">• ${parts.join(" • ")}</span>`;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 260);
    }, 3200);
  }

  // ---------- Dataset principal (algunas estrellas brillantes) ----------
  // Posiciones normalizadas (0..1) en el canvas; son "demo" pero estables.
  const FEATURED_STARS = [
    { name: "Vega",        mag: 0.03,  dist: 25,  type: "A0V",   constellation: "Lira",    x: 0.70, y: 0.28 },
    { name: "Betelgeuse",  mag: 0.42,  dist: 642, type: "M1-2Ia",constellation: "Orión",   x: 0.35, y: 0.30 },
    { name: "Rigel",       mag: 0.13,  dist: 860, type: "B8Ia",  constellation: "Orión",   x: 0.42, y: 0.55 },
    { name: "Antares",     mag: 1.06,  dist: 550, type: "M1.5Iab",constellation:"Escorpio",x: 0.80, y: 0.60 },
    { name: "
