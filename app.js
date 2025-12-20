// 風味輪：畫出分區並綁定點擊事件
(function(){
  const canvas = document.getElementById('flavorWheel');
  const resBox = document.getElementById('flavorResult');
  if (!canvas || !resBox) return;

  const ctx = canvas.getContext('2d');
  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  const radius = 220;

  // 定義風味分區
  const slices = [
    { key:'fruit',  label:'果香',  color:'#ff6b6b' },
    { key:'floral', label:'花香',  color:'#c084fc' },
    { key:'citrus', label:'柑橘',  color:'#ffd166' },
    { key:'nutty',  label:'堅果',  color:'#d1a46b' },
    { key:'cocoa',  label:'可可',  color:'#8b5e3c' },
    { key:'spice',  label:'香料',  color:'#e07a5f' },
  ];

  const angle = (Math.PI * 2) / slices.length;

  // 畫出分區與標籤
  slices.forEach((s, i) => {
    const start = i * angle;
    const end = start + angle;

    // slice
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.globalAlpha = 0.9;
    ctx.fill();

    // label
    const mid = start + angle / 2;
    const lx = center.x + Math.cos(mid) * (radius * 0.65);
    const ly = center.y + Math.sin(mid) * (radius * 0.65);
    ctx.fillStyle = '#0f0f10'; // 深色背景時可改為 '#fff'
    ctx.font = '600 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, lx, ly);
  });

  // 點擊事件：命中測試與商品篩選
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - center.x;
    const y = e.clientY - rect.top - center.y;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > radius) return; // 點到圓外

    // 角度轉區塊索引
    let theta = Math.atan2(y, x);
    if (theta < 0) theta += Math.PI * 2;
    const index = Math.floor(theta / angle);
    const picked = slices[index];

    // 篩選 .card
    const cards = document.querySelectorAll('.card');
    let count = 0;
    cards.forEach(card => {
      const flavors = (card.getAttribute('data-flavors') || '').split(',');
      const match = flavors.includes(picked.key);
      card.style.opacity = match ? 1 : 0.28;
      card.style.transform = match ? 'scale(1.0)' : 'scale(0.98)';
      if (match) count++;
    });

    // 更新結果
    resBox.innerHTML = `
      <h3>你的即時篩選</h3>
      <p>已套用「${picked.label}」風味關聯，共 ${count} 款符合。</p>
    `;
  });
})();

// 可選：簡易滾動進場（若你已有，保留單一版本即可）
(function(){
  const els = document.querySelectorAll('.card, .hero-visual, .bar-visual');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.style.transition = 'transform .6s ease, opacity .6s ease';
        en.target.style.opacity = 1;
        en.target.style.transform = 'translateY(0)';
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el=>{
    el.style.opacity = 0;
    el.style.transform = 'translateY(12px)';
    obs.observe(el);
  });
})();
// 資產修復（可選）：為 bags 圖片提供大小寫候選與佔位圖
(function(){
  function candidates(file){
    const base = 'assets/bags/';
    const name = file.replace('.svg','');
    return [
      base + file,
      base + name + '.SVG',
      base + name.toUpperCase() + '.svg',
      base + name.toUpperCase() + '.SVG',
      base + name.charAt(0).toUpperCase() + name.slice(1) + '.svg',
    ];
  }
  function placeholderSVG(label){
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
        <rect x="0" y="0" width="100%" height="100%" fill="#16171a" stroke="#2a2b31"/>
        <text x="50%" y="50%" fill="#cfd6e4" font-size="16" font-family="system-ui" text-anchor="middle" dominant-baseline="middle">
          ${label || 'Image not found'}
        </text>
      </svg>
    `);
    return 'data:image/svg+xml;charset=utf-8,' + svg;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      if (!src.includes('assets/bags/')) return;
      const ok = () => img.complete && img.naturalWidth > 0;
      if (ok()) return;

      const fileMatch = src.split('/').pop();
      const trials = candidates(fileMatch);
      let attemptIndex = 0;

      const tryNext = () => {
        if (attemptIndex >= trials.length) {
          img.setAttribute('src', placeholderSVG(fileMatch));
          return;
        }
        const testSrc = trials[attemptIndex++];
        const tester = new Image();
        tester.onload = function(){
          if (tester.naturalWidth > 0) {
            img.setAttribute('src', testSrc);
          } else {
            tryNext();
          }
        };
        tester.onerror = tryNext;
        tester.src = testSrc;
      };
      tryNext();
    });
  });
})();
