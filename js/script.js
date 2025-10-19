// ==========================================================
// Sala del Universo - Script principal (robusto)
// Activa: mapa estelar, cálculo de peso y mini-quiz
// No revienta si faltan nodos; crea los que necesita.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Sala del Universo] JS cargado ✅");

  // ---------- Toast no bloqueante ----------
  function ensureToastHost() {
    let host = document.getElementById("toast");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast";
      document.body.appendChild(host);
    }
    // estilos mínimos si no existen
    if (!document.getElementById("__toast_style__")) {
      const style = document.createElement("style");
      style.id = "__toast_style__";
      style.textContent = `
        #toast{position:fixed;right:16px;top:16px;z-index:9999;pointer-events:none;font-size:14px}
        .toast-msg{background:rgba(20,24,33,.95);color:#fff;border:1px solid rgba(255,255,255,.08);
          padding:10px 14px;border-radius:10px;margin-bottom:8px;box-shadow:0 10px 25px rgba(0,0,0,.25);
          opacity:0;transform:translateY(-6px);transition:opacity .25s ease, transform .25s ease}
        .toast-msg.show{opacity:1;transform:translateY(0)}
        .toast-msg .title{font-weight:700;margin-right:6px}
        .toast-msg .meta{opacity:.85}
      `;
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
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 260); }, 3200);
  }

  // ---------- 🔭 Mapa estelar ----------
  (function initStarMap() {
    const skySection = document.g
