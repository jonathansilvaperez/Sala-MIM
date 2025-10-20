// ==========================================================
// Sala del Universo - Script principal (robusto + mobile canvas fix)
// Incluye: mapa estelar, cálculo de peso y mini-quiz
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // ---------- Toast ----------
  function ensureToastHost() {
    let host = document.getElementById("toast");
    if (!host) { host = document.createElement("div"); host.id = "toast"; document.body.appendChild(host); }
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
  function showStarToast({ title="Estrella", name="", mag="", dist="", type="", constellation="" }) {
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
    const skySection = document.getElementById("sky");
    if (!skySection) return;

    // Canvas existente o lo crea
    let canvas = document.getElementById("skyCanvas") || skySection.querySelector("canvas");
    if (!canvas) { canvas = document.createElement("canvas"); canvas.id = "skyCanvas"; canvas.className = "starfield"; skySection.appendChild(canvas); }
    const ctx = canvas.getContext("2d");

    // Dataset
    const FEATURED_STARS = [
      { name:"Vega",       mag:0.03,  dist:25,  type:"A0V",    constellation:"Lira",     x:0.70, y:0.28 },
      { name:"Betelgeuse", mag:0.42,  dist:642, type:"M1-2Ia", constellation:"Orión",    x:0.35, y:0.30 },
      { name:"Rigel",      mag:0.13,  dist:860, type:"B8Ia",   constellation:"Orión",    x:0.42, y:0.55 },
      { name:"Antares",    mag:1.06,  dist:550, type:"M1.5Iab",constellation:"Escorpio", x:0.80, y:0.60 },
      { name:"Sirio",      mag:-1.46, dist:8.6, type:"A1V",    constellation:"Can Mayor",x:0.20, y:0.65 },
      { name:"Canopus",    mag:-0.74, dist:310, type:"A9II",   constellation:"Carina",   x:0.15, y:0.80 },
      { name:"Acrux",      mag:0.76,  dist:320, type:"B0.5IV", constellation:"Cruz Sur", x:0.58, y:0.80 },
      { name:"Aldebarán",  mag:0.85,  dist:65,  type:"K5III",  constellation:"Tauro",    x:0.52, y:0.35 }
    ];
    const bgStars = Array.from({ length: 200 }, () => ({ x:Math.random(), y:Math.random(), r:Math.random()*1.6+0.4, a:0.6+Math.random()*0.4 }));

    // Helpers: coordenadas en px CSS (no de dispositivo)
    function nx(x){ return x * (canvas.width / (window.devicePixelRatio || 1)); }
    function ny(y){ return y * (canvas.height / (window.devicePixelRatio || 1)); }

    // Resize leyendo tamaño real del CSS (aspect-ratio)
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();       // px CSS dados por CSS
      const w = Math.max(320, rect.width);
      const h = Math.max(180, rect.height);

      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";                     // height lo maneja el CSS (aspect-ratio)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);            // dibujar en px CSS
      draw();
    }

    function draw() {
      // Fondo
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#050814"); grad.addColorStop(1, "#0b1020");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tamaño relativo (para brillos escalables)
      const dpr = window.devicePixelRatio || 1;
      const wCSS = canvas.width / dpr;
      const hCSS = canvas.height / dpr;
      const GLOW_R = Math.max(10, Math.min(18, Math.min(wCSS, hCSS) * 0.03));
      const CORE_R = Math.max(1.6, Math.min(2.4, Math.min(wCSS, hCSS) * 0.0045));

      // Fondo de estrellas
      ctx.save();
      bgStars.forEach(s=>{
        ctx.globalAlpha = s.a; ctx.fillStyle = "#e9f1ff";
        ctx.beginPath(); ctx.arc(nx(s.x), ny(s.y), s.r, 0, Math.PI*2); ctx.fill();
      });
      ctx.restore();

      // Estrellas destacadas
      FEATURED_STARS.forEach(s=>{
        const x = nx(s.x), y = ny(s.y);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, GLOW_R);
        glow.addColorStop(0, "rgba(255,244,186,0.95)");
        glow.addColorStop(1, "rgba(255,244,186,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, GLOW_R, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(x, y, CORE_R, 0, Math.PI*2); ctx.fill();
      });
    }

    // Selección (px CSS) con radio ampliado
    function pick(px, py) {
      const R = 24; let best = Infinity, star = null;
      FEATURED_STARS.forEach(s=>{
        const dx = px - nx(s.x), dy = py - ny(s.y);
        const d = Math.hypot(dx, dy);
        if (d < R && d < best) { best = d; star = s; }
      });
      return star;
    }

    // Click en px CSS
    canvas.addEventListener("click", e => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const s = pick(px, py);
      if (s) showStarToast({ title:"Estrella", name:s.name, mag:s.mag, dist:s.dist, type:s.type, constellation:s.constellation });
    });

    // Observa cambios reales de tamaño (más fiable en móvil)
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    // Respaldo por resize de ventana
    window.addEventListener("resize", () => { clearTimeout(resize._t); resize._t = setTimeout(resize, 100); });

    // Inicial
    resize();
  })();

  // ---------- ⚖️ Peso en otros planetas ----------
  (function initWeight(){
    const peso = document.getElementById("pesoTierra");
    const sel = document.getElementById("planeta");
    const btn = document.getElementById("calc");
    const out = document.getElementById("resultado");
    if (!peso || !sel || !btn || !out) return;

    const g = { mercurio:3.7, venus:8.87, luna:1.62, marte:3.71, jupiter:24.79, saturno:10.44, urano:8.87, neptuno:11.15 };

    btn.addEventListener("click", ()=>{
      const m = parseFloat(peso.value);
      if (!isFinite(m) || m <= 0) { out.textContent = "Ingresa un peso válido (kg)."; return; }
      const p = sel.value;
      const r = (m * g[p] / 9.8).toFixed(1);
      out.textContent = `Tu peso en ${p.charAt(0).toUpperCase()+p.slice(1)} sería ${r} kg.`;
    });
  })();

  // ---------- 🧠 Mini-quiz ----------
  (function initQuiz(){
    const form = document.getElementById("quizForm");
    if (!form) return;
    let scoreEl = form.querySelector("#score");
    if (!scoreEl) { scoreEl = document.createElement("p"); scoreEl.id = "score"; form.appendChild(scoreEl); }
    const correct = { q1:"a", q2:"b", q3:"a", q4:"b", q5:"b" };
    form.addEventListener("submit", e=>{
      e.preventDefault();
      let score = 0;
      for (const q in correct) {
        const sel = form.querySelector(`input[name="${q}"]:checked`);
        if (sel && sel.value === correct[q]) score++;
      }
      scoreEl.textContent = `Puntaje: ${score}/5`;
    });
  })();
});
