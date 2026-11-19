/* น้อง Nora — มาสคอตหุ่นยนต์ 3D (ภาพ PNG 4 ท่า) ขยับด้วย CSS
 * Mascot.create(el, {mini, onPoke}) → { setMood(mood, holdMs) }
 * moods: idle | thinking | talking | happy | sorry
 */
(function () {
  const POSES = { idle: 'idle', thinking: 'thinking', talking: 'talking', happy: 'happy', sorry: 'thinking' };
  const SRC = (p) => 'nora-' + p + '.png?v=1';

  function full() {
    return `
<div class="nr" role="img" aria-label="น้อง Nora">
  <div class="nr-shadow"></div>
  <div class="nr-float"><div class="nr-tilt">
    ${['idle', 'thinking', 'talking', 'happy'].map((p) => `<img class="nr-pose nr-${p}" src="${SRC(p)}" alt="" draggable="false">`).join('')}
  </div></div>
  <div class="nr-think"><i></i><i></i><i></i></div>
  <div class="nr-sweat"></div>
  <div class="nr-spark"><b>✦</b><b>✦</b><b>✦</b></div>
</div>`;
  }

  function create(el, opts) {
    opts = opts || {};
    el.classList.add('mascot');
    if (opts.mini) {
      el.classList.add('mascot--mini');
      el.innerHTML = `<img class="nr-head" src="${SRC('head')}" alt="น้อง Nora" draggable="false">`;
    } else {
      el.innerHTML = full();
    }
    let timer = null;
    const api = {
      el: el,
      mood: 'idle',
      setMood(mood, holdMs) {
        clearTimeout(timer);
        el.classList.remove('is-idle', 'is-thinking', 'is-talking', 'is-happy', 'is-sorry');
        el.classList.add('is-' + mood);
        if (!opts.mini) {
          const pose = POSES[mood] || 'idle';
          el.querySelectorAll('.nr-pose').forEach((img) => img.classList.toggle('on', img.classList.contains('nr-' + pose)));
        }
        api.mood = mood;
        if (holdMs) timer = setTimeout(() => api.setMood('idle'), holdMs);
      },
    };
    api.setMood('idle');

    if (!opts.mini) {
      // เอียงตัวตามเมาส์เล็กน้อย
      const tilt = el.querySelector('.nr-tilt');
      window.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(300, window.innerWidth / 2);
        tilt.style.transform = `rotate(${Math.max(-1, Math.min(1, dx)) * 4}deg)`;
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
