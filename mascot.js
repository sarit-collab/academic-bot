/* น้อง Nora — มาสคอต SVG ขยับได้
 * Mascot.create(el, {size, mini}) → { setMood(mood, holdMs), say(text) }
 * moods: idle | thinking | talking | happy | sorry
 */
(function () {
  const SKIN = '#F8BFB3', SKIN_D = '#EA9C90', LINE = '#9A5248', EAR_IN = '#F6A3B5',
    GOLD = '#E2B33C', GOLD_D = '#B8861C', GREEN = '#2A7A62', GREEN_D = '#1B5A47', RED = '#D9483B';

  function svg(uid) {
    return `
<svg class="pk" viewBox="0 0 240 262" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="น้อง Nora">
  <defs>
    <radialGradient id="${uid}-skin" cx="45%" cy="35%" r="70%">
      <stop offset="0" stop-color="#FFD9CF"/><stop offset="1" stop-color="${SKIN}"/>
    </radialGradient>
    <linearGradient id="${uid}-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F8D86A"/><stop offset="1" stop-color="${GOLD}"/>
    </linearGradient>
  </defs>
  <ellipse class="pk-shadow" cx="120" cy="252" rx="58" ry="7" fill="#0F3B31" opacity=".16"/>
  <g class="pk-float">
    <!-- body -->
    <g class="pk-body">
      <ellipse cx="96" cy="240" rx="17" ry="10" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
      <ellipse cx="144" cy="240" rx="17" ry="10" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
      <ellipse cx="120" cy="190" rx="54" ry="48" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
      <ellipse cx="120" cy="196" rx="34" ry="29" fill="#FFD6CC" opacity=".8"/>
      <path d="M68 204 Q120 226 172 204 L170 228 Q120 248 70 228 Z" fill="${GREEN}" stroke="${GREEN_D}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M70 206 Q120 228 170 206" fill="none" stroke="url(#${uid}-gold)" stroke-width="5" stroke-linecap="round"/>
      <circle cx="120" cy="226" r="4" fill="${GOLD}"/>
      <path d="M90 156 Q118 186 150 214" fill="none" stroke="${GOLD}" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="120" cy="190" rx="3" ry="2.4" fill="${SKIN_D}"/>
    </g>
    <!-- left arm with book -->
    <g class="pk-arm-l">
      <path d="M78 172 Q56 186 60 204" fill="none" stroke="${LINE}" stroke-width="19" stroke-linecap="round"/>
      <path d="M78 172 Q56 186 60 204" fill="none" stroke="${SKIN}" stroke-width="14" stroke-linecap="round"/>
      <g transform="translate(9 -5) rotate(-12 52 206)">
        <rect x="34" y="192" width="36" height="28" rx="4" fill="${GREEN}" stroke="${GREEN_D}" stroke-width="2.5"/>
        <rect x="38" y="196" width="28" height="20" rx="2" fill="#F5F0E1"/>
        <path d="M52 196 V216" stroke="${GREEN_D}" stroke-width="2"/>
        <path d="M41 201 H49 M41 205 H49 M41 209 H48 M55 201 H63 M55 205 H63 M55 209 H62" stroke="#9FB8AE" stroke-width="1.6" stroke-linecap="round"/>
      </g>
      <circle cx="61" cy="206" r="8" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
    </g>
    <!-- right arm with modak -->
    <g class="pk-arm-r">
      <path d="M162 172 Q184 186 180 204" fill="none" stroke="${LINE}" stroke-width="19" stroke-linecap="round"/>
      <path d="M162 172 Q184 186 180 204" fill="none" stroke="${SKIN}" stroke-width="14" stroke-linecap="round"/>
      <path d="M170 198 Q170 182 182 176 Q194 182 194 198 Q182 204 170 198 Z" fill="#F4A940" stroke="#C2771C" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M176 196 Q178 186 182 180 M188 196 Q186 186 182 180" stroke="#C2771C" stroke-width="1.6" fill="none"/>
      <circle cx="180" cy="206" r="8" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
    </g>
    <!-- head -->
    <g class="pk-head">
      <g class="pk-ear-l">
        <path d="M84 78 C52 54 18 78 24 112 C28 138 60 150 86 128 Z" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M80 88 C58 72 36 88 40 110 C43 128 64 134 80 120 Z" fill="${EAR_IN}" opacity=".85"/>
      </g>
      <g class="pk-ear-r">
        <path d="M156 78 C188 54 222 78 216 112 C212 138 180 150 154 128 Z" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M160 88 C182 72 204 88 200 110 C197 128 176 134 160 120 Z" fill="${EAR_IN}" opacity=".85"/>
      </g>
      <ellipse cx="120" cy="102" rx="50" ry="48" fill="url(#${uid}-skin)" stroke="${LINE}" stroke-width="2.5"/>
      <!-- crown -->
      <g class="pk-crown">
        <path d="M90 60 Q92 30 120 8 Q148 30 150 60 Z" fill="url(#${uid}-gold)" stroke="${GOLD_D}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M100 46 Q120 36 140 46 M96 56 Q120 46 144 56" fill="none" stroke="${GOLD_D}" stroke-width="1.8"/>
        <circle cx="120" cy="8" r="5" fill="url(#${uid}-gold)" stroke="${GOLD_D}" stroke-width="2"/>
        <rect x="84" y="56" width="72" height="13" rx="6.5" fill="url(#${uid}-gold)" stroke="${GOLD_D}" stroke-width="2.5"/>
        <circle cx="120" cy="40" r="6" fill="${GREEN}" stroke="#fff" stroke-width="1.5"/>
        <circle cx="102" cy="62.5" r="2.6" fill="${RED}"/><circle cx="120" cy="62.5" r="3" fill="${GREEN}"/><circle cx="138" cy="62.5" r="2.6" fill="${RED}"/>
      </g>
      <!-- tilak -->
      <path d="M113 74 Q120 84 127 74" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="120" cy="80" r="2.4" fill="${RED}"/>
      <!-- eyes -->
      <g class="pk-eyes">
        <g class="pk-look">
          <ellipse cx="100" cy="98" rx="7.5" ry="9.5" fill="#2A2422"/>
          <ellipse cx="140" cy="98" rx="7.5" ry="9.5" fill="#2A2422"/>
          <circle cx="97.5" cy="94.5" r="3" fill="#fff"/><circle cx="137.5" cy="94.5" r="3" fill="#fff"/>
          <circle cx="102.5" cy="102" r="1.3" fill="#fff" opacity=".8"/><circle cx="142.5" cy="102" r="1.3" fill="#fff" opacity=".8"/>
        </g>
      </g>
      <g class="pk-eyes-happy" fill="none" stroke="#2A2422" stroke-width="3.2" stroke-linecap="round">
        <path d="M92 100 Q100 89 108 100"/><path d="M132 100 Q140 89 148 100"/>
      </g>
      <g class="pk-brows" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round">
        <path d="M92 84 L106 88"/><path d="M148 84 L134 88"/>
      </g>
      <ellipse cx="84" cy="118" rx="9" ry="5.5" fill="#F48FA0" opacity=".55"/>
      <ellipse cx="156" cy="118" rx="9" ry="5.5" fill="#F48FA0" opacity=".55"/>
      <!-- tusks: one whole, one broken -->
      <path d="M134 124 Q152 130 150 146 Q143 136 130 132 Z" fill="#FFFBF2" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M106 124 Q96 127 95 133 Q101 132 108 131 Z" fill="#FFFBF2" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <!-- mouth -->
      <path class="pk-mouth" d="M128 136 Q135 143 142 137" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse class="pk-mouth-open" cx="135" cy="139" rx="5" ry="4" fill="#B5424F" stroke="${LINE}" stroke-width="1.8"/>
      <!-- trunk -->
      <g class="pk-trunk">
        <path d="M120 106 C121 132 118 150 106 160 C97 167 86 162 90 151" fill="none" stroke="${LINE}" stroke-width="21" stroke-linecap="round"/>
        <path d="M120 106 C121 132 118 150 106 160 C97 167 86 162 90 151" fill="none" stroke="url(#${uid}-skin)" stroke-width="16" stroke-linecap="round"/>
        <path d="M113 124 Q120 127 127 124 M113 135 Q119 138 125 134 M108 146 Q114 149 119 145" fill="none" stroke="${SKIN_D}" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    </g>
  </g>
  <!-- extras -->
  <g class="pk-think">
    <circle cx="186" cy="54" r="5" fill="#fff" stroke="#8DBFAE" stroke-width="2"/>
    <circle cx="200" cy="36" r="7" fill="#fff" stroke="#8DBFAE" stroke-width="2"/>
    <g transform="translate(206 4)">
      <rect x="0" y="0" width="34" height="22" rx="11" fill="#fff" stroke="#8DBFAE" stroke-width="2"/>
      <circle class="pk-dot d1" cx="9" cy="11" r="2.6" fill="${GREEN}"/>
      <circle class="pk-dot d2" cx="17" cy="11" r="2.6" fill="${GREEN}"/>
      <circle class="pk-dot d3" cx="25" cy="11" r="2.6" fill="${GREEN}"/>
    </g>
  </g>
  <path class="pk-sweat" d="M170 70 Q176 82 170 86 Q164 82 170 70 Z" fill="#9FD3F0" stroke="#5DA6CF" stroke-width="1.6"/>
  <g class="pk-spark" fill="${GOLD}">
    <path class="s1" d="M40 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/>
    <path class="s2" d="M204 120 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4z"/>
    <path class="s3" d="M28 150 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/>
  </g>
</svg>`;
  }

  let counter = 0;
  function create(el, opts) {
    opts = opts || {};
    const uid = 'pk' + (++counter);
    el.classList.add('mascot');
    if (opts.mini) el.classList.add('mascot--mini');
    el.innerHTML = svg(uid);
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
      // ตามองเมาส์
      const look = el.querySelector('.pk-look');
      window.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * 0.38);
        const d = Math.max(1, Math.hypot(dx, dy));
        const k = Math.min(1, d / 300);
        look.setAttribute('transform', `translate(${(dx / d) * 3.2 * k} ${(dy / d) * 2.6 * k})`);
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
