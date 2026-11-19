/* น้อง Nora — หุ่นยนต์ 3D (SVG วาดใหม่ตามภาพต้นแบบ) ขยับได้
 * Mascot.create(el, {mini, onPoke}) → { setMood(mood, holdMs) }
 * moods: idle | thinking | talking | happy | sorry
 */
(function () {
  const GLOW = '#6FFFF0';

  // arm drawn hanging down from the shoulder (local origin = shoulder)
  function arm(uid, side, extra) {
    return `
    <g class="nr-arm nr-a${side}">
      <circle r="11" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <rect x="-8" y="2" width="16" height="32" rx="8" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <g transform="translate(0 34)"><g class="nr-a${side}f">
        <circle r="7.5" fill="url(#${uid}-gray)"/>
        <rect x="-7.5" y="2" width="15" height="28" rx="7.5" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
        <rect x="-8" y="19" width="16" height="5" rx="2.5" fill="url(#${uid}-teal)"/>
        <g transform="translate(0 35)">
          <rect x="-8.5" y="2" width="5" height="11" rx="2.5" fill="#5B646C"/>
          <rect x="-2.5" y="3" width="5" height="12" rx="2.5" fill="#5B646C"/>
          <rect x="3.5" y="2" width="5" height="11" rx="2.5" fill="#5B646C"/>
          <circle r="9" fill="url(#${uid}-gray)"/>
          ${extra || ''}
        </g>
      </g></g>
    </g>`;
  }

  function leg(x, uid) {
    return `
    <g>
      <rect x="${x - 9}" y="224" width="18" height="24" rx="8" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <ellipse cx="${x}" cy="250" rx="10.5" ry="6" fill="url(#${uid}-teal)"/>
      <rect x="${x - 10}" y="252" width="20" height="22" rx="8" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <rect x="${x - 16}" y="268" width="32" height="15" rx="7.5" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <rect x="${x - 16}" y="279" width="32" height="6" rx="3" fill="url(#${uid}-teal)"/>
    </g>`;
  }

  function svg(uid, mini) {
    const tablet = `<g class="nr-tablet" transform="rotate(95) translate(0 -2)">
      <rect x="-17" y="-22" width="34" height="44" rx="5" fill="url(#${uid}-slate)" stroke="#59626B" stroke-width="1.5"/>
      <rect x="-13" y="-18" width="26" height="34" rx="3" fill="#25384E"/>
      <path d="M-9 -10 H7 M-9 -4 H9 M-9 2 H4" stroke="${GLOW}" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    </g>`;
    return `
<svg class="nr" viewBox="${mini ? '36 14 168 168' : '0 0 240 300'}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="น้อง Nora">
  <defs>
    <radialGradient id="${uid}-white" cx="35%" cy="28%" r="80%">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#EEF3F5"/><stop offset="1" stop-color="#C9D4DA"/>
    </radialGradient>
    <linearGradient id="${uid}-teal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#93F1E4"/><stop offset="1" stop-color="#27AE9F"/>
    </linearGradient>
    <radialGradient id="${uid}-tealR" cx="40%" cy="30%" r="75%">
      <stop offset="0" stop-color="#A6F5EA"/><stop offset="1" stop-color="#22A596"/>
    </radialGradient>
    <linearGradient id="${uid}-gray" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#A2ABB3"/><stop offset="1" stop-color="#4C545C"/>
    </linearGradient>
    <linearGradient id="${uid}-slate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#C3CBD2"/><stop offset="1" stop-color="#7E8891"/>
    </linearGradient>
    <linearGradient id="${uid}-screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B2B44"/><stop offset="1" stop-color="#080F1C"/>
    </linearGradient>
    <linearGradient id="${uid}-cap" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#34437A"/><stop offset="1" stop-color="#1A2347"/>
    </linearGradient>
    <linearGradient id="${uid}-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F8D978"/><stop offset="1" stop-color="#C8962A"/>
    </linearGradient>
    <filter id="${uid}-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <ellipse class="nr-shadow" cx="120" cy="291" rx="50" ry="6.5" fill="#0F3B31" opacity=".2"/>
  <g class="nr-float">
    <g class="nr-legs">${leg(104, uid)}${leg(136, uid)}</g>

    <g transform="translate(156 176)">${arm(uid, 'r')}</g>

    <!-- torso -->
    <rect x="110" y="146" width="20" height="18" rx="5" fill="url(#${uid}-gray)"/>
    <path d="M84 168 Q120 158 156 168 Q166 200 150 232 Q120 243 90 232 Q74 200 84 168 Z" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
    <path d="M100 176 Q120 169 140 176 Q145 200 132 223 Q120 229 108 223 Q95 200 100 176 Z" fill="url(#${uid}-tealR)"/>
    <path d="M90 213 Q120 224 150 213" fill="none" stroke="#C3CED4" stroke-width="1.6"/>
    <circle class="nr-core" cx="120" cy="193" r="7" fill="#DFFFFB" filter="url(#${uid}-glow)"/>
    <ellipse cx="106" cy="178" rx="10" ry="3.5" fill="#fff" opacity=".55"/>

    <g transform="translate(84 176)">${arm(uid, 'l', tablet)}</g>

    <!-- head (pivot at neck) -->
    <g transform="translate(120 150)"><g class="nr-head"><g transform="translate(-120 -150)">
      <ellipse cx="52" cy="104" rx="12" ry="21" fill="url(#${uid}-tealR)"/>
      <ellipse cx="46" cy="104" rx="5.5" ry="12" fill="url(#${uid}-white)"/>
      <ellipse cx="188" cy="104" rx="12" ry="21" fill="url(#${uid}-tealR)"/>
      <ellipse cx="194" cy="104" rx="5.5" ry="12" fill="url(#${uid}-white)"/>
      <rect x="56" y="54" width="128" height="98" rx="42" fill="url(#${uid}-white)" stroke="#B9C6CC" stroke-width="1"/>
      <ellipse cx="92" cy="66" rx="24" ry="7" fill="#fff" opacity=".9"/>
      <rect x="69" y="71" width="102" height="68" rx="29" fill="url(#${uid}-screen)"/>
      <path d="M84 78 Q100 73 120 74" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".18"/>

      <g class="nr-face" filter="url(#${uid}-glow)">
        <g class="nr-look">
          <g class="nr-eyes"><ellipse cx="100" cy="102" rx="7" ry="10" fill="${GLOW}"/><ellipse cx="140" cy="102" rx="7" ry="10" fill="${GLOW}"/></g>
          <g class="nr-eyes-happy" fill="none" stroke="${GLOW}" stroke-width="4.5" stroke-linecap="round">
            <path d="M91 106 Q100 93 109 106"/><path d="M131 106 Q140 93 149 106"/>
          </g>
          <g class="nr-eyes-sad">
            <ellipse cx="101" cy="105" rx="5.5" ry="6.5" fill="${GLOW}"/><ellipse cx="139" cy="105" rx="5.5" ry="6.5" fill="${GLOW}"/>
            <path d="M91 94 L107 90 M149 94 L133 90" stroke="${GLOW}" stroke-width="3.2" stroke-linecap="round"/>
          </g>
          <path class="nr-mouth" d="M110 120 Q120 129 130 120" fill="none" stroke="${GLOW}" stroke-width="3.6" stroke-linecap="round"/>
          <path class="nr-mouth-open" d="M109 119 Q120 134 131 119 Q120 122 109 119 Z" fill="${GLOW}"/>
          <path class="nr-mouth-sad" d="M111 127 Q120 120 129 127" fill="none" stroke="${GLOW}" stroke-width="3.4" stroke-linecap="round"/>
        </g>
      </g>

      <!-- graduation cap -->
      <path d="M86 62 Q120 48 154 62 L151 44 Q120 35 89 44 Z" fill="url(#${uid}-cap)"/>
      <path d="M120 25 L178 41 L120 57 L62 41 Z" fill="#141C3A" transform="translate(0 3)"/>
      <path d="M120 25 L178 41 L120 57 L62 41 Z" fill="url(#${uid}-cap)"/>
      <path d="M120 27 L168 40" stroke="#4A5A96" stroke-width="1.4" opacity=".7"/>
      <g class="nr-tassel">
        <path d="M120 41 Q150 41 166 44 L167 64" fill="none" stroke="url(#${uid}-gold)" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M163 63 h8 l2 14 h-12 z" fill="url(#${uid}-gold)"/>
      </g>
      <circle cx="120" cy="41" r="3.2" fill="url(#${uid}-gold)"/>
    </g></g></g>
  </g>

  <!-- extras -->
  <g transform="translate(214 88)"><g class="nr-bulb">
    <circle r="15" fill="#BFFFF7" opacity=".45" filter="url(#${uid}-glow)"/>
    <path d="M0 -12 a10 10 0 0 1 6 18 v3 h-12 v-3 a10 10 0 0 1 6 -18z" fill="#EFFFFD" stroke="#7FE3D6" stroke-width="1.8"/>
    <rect x="-5" y="10" width="10" height="6" rx="2" fill="#8D969E"/>
    <path d="M0 -20 v-5 M14 -12 l4 -3 M-14 -12 l-4 -3 M18 1 h5 M-18 1 h-5" stroke="#7FE3D6" stroke-width="2" stroke-linecap="round"/>
  </g></g>
  <path class="nr-sweat" d="M186 70 Q193 83 186 88 Q179 83 186 70 Z" fill="#9FD3F0" stroke="#5DA6CF" stroke-width="1.5"/>
  <g class="nr-spark" fill="#E2B33C">
    <path class="s1" d="M30 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/>
    <path class="s2" d="M214 140 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z"/>
    <path class="s3" d="M24 170 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/>
  </g>
</svg>`;
  }

  let counter = 0;
  function create(el, opts) {
    opts = opts || {};
    const uid = 'nr' + (++counter);
    el.classList.add('mascot');
    if (opts.mini) el.classList.add('mascot--mini');
    el.innerHTML = svg(uid, !!opts.mini);
    let timer = null;
    const api = {
      el: el,
      mood: 'idle',
      setMood(mood, holdMs) {
        clearTimeout(timer);
        el.classList.remove('is-idle', 'is-thinking', 'is-talking', 'is-happy', 'is-sorry');
        el.classList.add('is-' + mood);
        api.mood = mood;
        if (holdMs) timer = setTimeout(() => api.setMood('idle'), holdMs);
      },
    };
    api.setMood('idle');

    if (!opts.mini) {
      // ตาบนจอมองตามเมาส์
      const look = el.querySelector('.nr-look');
      window.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.35);
        const d = Math.max(1, Math.hypot(dx, dy));
        const k = Math.min(1, d / 300);
        look.setAttribute('transform', `translate(${(dx / d) * 5 * k} ${(dy / d) * 3 * k})`);
      }, { passive: true });
      el.addEventListener('click', () => {
        if (api.mood === 'thinking') return;
        api.setMood('happy', 1600);
        if (opts.onPoke) opts.onPoke();
      });
    }
    return api;
  }

  window.Mascot = { create: create };
})();
