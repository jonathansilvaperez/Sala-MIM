// ==========================================================
// Sala del Universo - Script principal
// Contiene: mapa estelar interactivo, cálculo de peso y mini quiz
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------
  // 🔭 MAPA ESTELAR INTERACTIVO
  // --------------------------

  // Dataset de estrellas principales
  const FEATURED_STARS = [
    { name: "Vega", mag: 0.03, dist: 25, type: "A0V", constellation: "Lira", x: 0.7, y: 0.28 },
    { name: "Betelgeuse", mag: 0.42, dist: 642, type: "M1-2Ia", constellation: "Orión", x: 0.35, y: 0.3 },
    { name: "Rigel", mag: 0.13, dist: 860, type: "B8Ia", constellation: "Orión", x: 0.42, y: 0.55 },
    { name: "Antares", mag: 1.06, dist: 550, type: "M1.5Iab", constellation: "Escorpio", x: 0.8, y: 0.6 },
    { name: "Sirio", mag: -1.46, dist: 8.6, type: "A1V", constellation: "Can Mayor", x: 0.2, y: 0.65 },
    { name: "Canopus", mag: -0.74, dist: 310, type: "A9II", constellation: "Carina", x: 0.15, y: 0.8 },
    { name: "Acrux", mag: 0.76, dist: 320, type: "B0.5IV", constellation: "Cruz Sur", x: 0.58, y: 0.8 },
    { name: "Aldebarán", mag: 0.85, dist: 65, type: "K5III", constellation: "Tauro", x: 0.52, y: 0.35 }
  ];

  const skySection = document.getElementById("sky");
  if (skySection) {
    let canvas = skySection.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "starfield";
      skySection.appendChild(canvas);
    }
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const w = skySection.clientWidth;
      const h = 400;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    const bgStars = Array.from({ length: 180 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.5 + 0.5
    }));

    function nx(x) { return x * canvas.width / (window.devicePixelRatio || 1); }
    function ny(y) { return y * canvas.height / (window.devicePixelRatio || 1); }

    function draw() {
      ctx.fillStyle = "#050814";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      bgStars.forEach(s => {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = "#e9f1ff";
        ctx.beginPath();
        ctx.arc(nx(s.x), ny(s.y), s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      FEATURED_STARS.forEach(s => {
        const x = nx(s.x);
        const y = ny(s.y);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0, "rgba(255,244,186,0.95)");
        g.addColorStop(1, "rgba(255,244,186,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function pickStar(px, py) {
      const R = 16;
      let found = null;
      FEATURED_STARS.forEach(s => {
        const dx = px - nx(s.x);
        const dy = py - ny(s.y);
        if (Math.hypot(dx, dy) < R) found = s;
      });
      return found;
    }

    canvas.addEventListener("click", e => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) * (canvas.width / rect.width);
      const py = (e.clientY - rect.top) * (canvas.height / rect.height);
      const s = pickStar(px, py);
      if (s) {
        showStarToast({
          title: "Estrella seleccionada",
          name: s.name,
          mag: s.mag,
          dist: s.dist,
          type: s.type,
          constellation: s.constellation
        });
      }
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
  }

  // --------------------------
  // 🌠 Toast de información
  // --------------------------
  function showStarToast({ title, name, mag, dist, type, constellation }) {
    const toast = document.createElement("div");
    toast.className = "toast-msg show";
    toast.innerHTML = `
      <span class="title">${title}</span> 
      <span class="meta">• ${name} • mag ${mag} • ${dist} a.l. • ${type} • ${constellation}</span>
    `;
    document.getElementById("toast").appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // --------------------------
  // ⚖️ CÁLCULO DE PESO
  // --------------------------
  const g = {
    mercurio: 3.7,
    venus: 8.87,
    luna: 1.62,
    marte: 3.71,
    jupiter: 24.79,
    saturno: 10.44,
    urano: 8.87,
    neptuno: 11.15
  };

  const btnCalc = document.getElementById("calc");
  if (btnCalc) {
    btnCalc.addEventListener("click", () => {
      const peso = parseFloat(document.getElementById("pesoTierra").value);
      const planeta = document.getElementById("planeta").value;
      if (peso > 0) {
        const resultado = (peso * g[planeta] / 9.8).toFixed(1);
        document.getElementById("resultado").textContent =
          `Tu peso en ${planeta.charAt(0).toUpperCase() + planeta.slice(1)} sería ${resultado} kg.`;
      }
    });
  }

  // --------------------------
  // 🧠 MINI QUIZ
  // --------------------------
  const quizForm = document.getElementById("quizForm");
  if (quizForm) {
    quizForm.addEventListener("submit", e => {
      e.preventDefault();
      const respuestas = { q1: "a", q2: "b", q3: "a", q4: "b", q5: "b" };
      let score = 0;
      for (const [q, ans] of Object.entries(respuestas)) {
        const sel = quizForm.querySelector(`input[name="${q}"]:checked`);
        if (sel && sel.value === ans) score++;
      }
      quizForm.querySelector("#score").textContent = `Puntaje: ${score}/5`;
    });
  }
});
