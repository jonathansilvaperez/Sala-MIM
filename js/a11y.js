
(function(){
  const root = document.documentElement;
  const body = document.body;
  const bContrast = document.getElementById('btn-contrast');
  const bInc = document.getElementById('font-inc');
  const bDec = document.getElementById('font-dec');
  const val = document.getElementById('font-val');
  function setScale(p){ p = Math.max(90, Math.min(150, p)); root.style.setProperty('--font-scale', p+'%'); localStorage.setItem('fontScale', p); if(val) val.textContent = p + '%'; }
  const savedScale = parseInt(localStorage.getItem('fontScale')||'100',10); setScale(savedScale);
  const savedContrast = localStorage.getItem('highContrast')==='1';
  if(savedContrast){ document.documentElement.classList.add('high-contrast'); if (bContrast) bContrast.setAttribute('aria-pressed','true'); }
  if(bContrast){ bContrast.addEventListener('click', function(){ const isOn = document.documentElement.classList.toggle('high-contrast'); localStorage.setItem('highContrast', isOn ? '1':'0'); bContrast.setAttribute('aria-pressed', String(isOn)); }); }
  if(bInc){ bInc.addEventListener('click', ()=> setScale((parseInt(getComputedStyle(root).getPropertyValue('--font-scale'))||100)+10)); }
  if(bDec){ bDec.addEventListener('click', ()=> setScale((parseInt(getComputedStyle(root).getPropertyValue('--font-scale'))||100)-10)); }
})();