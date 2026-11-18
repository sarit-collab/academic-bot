/* หน้าแชตน้อง Nora */
(function () {
  const { CFG, api, esc, markdown, local } = window.Common;
  const DEMO = !CFG.API_URL;
  const $ = (id) => document.getElementById(id);

  const TOPICS = [
    { key: 'reg', icon: '📝', label: 'ลงทะเบียนเรียน', qs: ['ลงทะเบียนเรียนภาคการศึกษานี้วันไหน', 'ลงทะเบียนล่าช้าต้องทำอย่างไร', 'เพิ่ม-ถอนรายวิชาได้ถึงวันไหน'] },
    { key: 'pay', icon: '💳', label: 'ชำระเงิน', qs: ['ชำระค่าธรรมเนียมการศึกษาได้ช่องทางไหนบ้าง', 'ชำระเงินไม่ทันกำหนดจะเป็นอย่างไร', 'ขอผ่อนผันการชำระค่าธรรมเนียมได้ไหม'] },
    { key: 'cal', icon: '📅', label: 'ปฏิทินการศึกษา', qs: ['เปิดภาคเรียนถัดไปวันไหน', 'สอบปลายภาคเริ่มวันไหน', 'วันสุดท้ายของการขอถอนรายวิชาได้ W'] },
    { key: 'form', icon: '📄', label: 'คำร้องต่างๆ', qs: ['ขอลาพักการศึกษาต้องใช้คำร้องอะไร', 'ขอรักษาสภาพนักศึกษาทำอย่างไร', 'ขอลาออกต้องทำอย่างไร'] },
    { key: 'claim', icon: '🧾', label: 'เอกสารเบิก', qs: ['เบิกค่าเล่าเรียนบุตรต้องใช้เอกสารอะไรบ้าง', 'ขอใบเสร็จค่าธรรมเนียมย้อนหลังได้ไหม'] },
    { key: 'grad', icon: '🎓', label: 'สำเร็จการศึกษา', qs: ['ยื่นคำร้องขอสำเร็จการศึกษาเมื่อไหร่', 'เงื่อนไขการได้เกียรตินิยมคืออะไร'] },
  ];

  const THINKING_LINES = ['กำลังเปิดระเบียบข้อบังคับ…', 'กำลังดูปฏิทินการศึกษา…', 'กำลังเทียบเงื่อนไขแต่ละกรณี…', 'กำลังเรียบเรียงคำตอบ…', 'ใกล้เสร็จแล้วครับ…'];
  const POKES = ['จั๊กจี้ครับ 😆', 'ถามอะไรน้องก็ได้นะครับ', 'วันนี้ลงทะเบียนครบหรือยังครับ?', 'น้องอ่านระเบียบมาแน่นเลยครับ 📚', 'ขอให้เรียนผ่านฉลุยนะครับ ✨'];

  // ── state ──
  let sid = local.get('pk_sid');
  if (!sid) { sid = 'S' + Math.random().toString(36).slice(2) + Date.now().toString(36); local.set('pk_sid', sid); }
  let history = [];
  try { history = JSON.parse(local.get('pk_history') || '[]'); } catch (e) { history = []; }
  let busy = false;

  // ── mascots ──
  const stage = Mascot.create($('stageMascot'), { onPoke: () => say(POKES[Math.floor(Math.random() * POKES.length)]) });
  const head = Mascot.create($('headerMascot'), { mini: true });
  function mood(m, hold) { stage.setMood(m, hold); head.setMood(m, hold); }
  let sayTimer;
  function say(text, ms) {
    const el = $('speech');
    el.textContent = text;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    clearTimeout(sayTimer);
    if (ms) sayTimer = setTimeout(() => say('ถามต่อได้เลยนะครับ'), ms);
  }

  // ── config bits ──
  if (DEMO) $('demoBanner').hidden = false;
  const contact = CFG.CONTACT || {};
  $('fbSide').href = contact.facebookUrl || '#';
  $('contactNoteSide').textContent = contact.note || '';

  // ── topics ──
  $('topicGrid').innerHTML = TOPICS.map((t) =>
    `<button type="button" class="topic" data-topic="${t.key}"><span class="topic-ic">${t.icon}</span><span>${esc(t.label)}</span></button>`).join('');
  $('topicGrid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-topic]');
    if (!b) return;
    const t = TOPICS.find((x) => x.key === b.dataset.topic);
    showTopic(t);
  });

  function showTopic(t) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    wrap.innerHTML = botShell(`<p>เรื่อง <strong>${esc(t.label)}</strong> ถามแบบนี้ได้เลยครับ 👇</p>
      <div class="chips">${t.qs.map((q) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`);
    $('messages').appendChild(wrap);
    scrollDown();
    say('เลือกคำถาม หรือพิมพ์เองก็ได้ครับ', 4000);
    mood('happy', 1200);
  }

  // ── rendering ──
  function botShell(inner, extraClass) {
    return `<div class="avatar" aria-hidden="true"></div><div class="bubble ${extraClass || ''}">${inner}</div>`;
  }
  function mountAvatar(node) {
    const av = node.querySelector('.avatar');
    if (av && !av.firstChild) Mascot.create(av, { mini: true });
  }

  function addUser(text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = `<div class="bubble">${esc(text).replace(/\n/g, '<br>')}</div>`;
    $('messages').appendChild(div);
    scrollDown();
  }

  function contactHtml(lead) {
    return `<div class="contact-inline">
      <div class="contact-text"><strong>${esc(lead)}</strong><span>${esc(contact.note || '')}</span></div>
      <a class="fb-btn" href="${esc(contact.facebookUrl || '#')}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v8h4v-8h3l.5-4h-3.5V9c0-.6.4-1 1-1z" fill="currentColor"/></svg>
        ${esc(contact.facebookName || 'Facebook')}</a>
    </div>`;
  }

  function addBot(data, opts) {
    opts = opts || {};
    const div = document.createElement('div');
    div.className = 'msg bot';
    const status = data.status || 'answered';
    let inner = `<div class="md">${markdown(data.answer)}</div>`;
    if (data.sources && data.sources.length) {
      inner += `<div class="sources"><span class="sources-label">อ้างอิง</span>${data.sources.map((s) =>
        `<span class="source">📄 ${esc(s)}</span>`).join('')}</div>`;
    }
    if (status === 'unknown' || status === 'partial') {
      inner += contactHtml(status === 'unknown' ? 'สอบถามเจ้าหน้าที่โดยตรงได้ที่' : 'ถ้ายังไม่ชัดเจน สอบถามเจ้าหน้าที่ได้ที่');
    }
    if (data.follow_ups && data.follow_ups.length) {
      inner += `<div class="chips">${data.follow_ups.map((q) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`;
    }
    if (data.logId && !opts.restored) {
      inner += `<div class="feedback" data-log="${esc(data.logId)}"><span>คำตอบนี้ช่วยได้ไหม?</span>
        <button type="button" data-fb="up" aria-label="ช่วยได้">👍</button><button type="button" data-fb="down" aria-label="ไม่ช่วย">👎</button></div>`;
    }
    div.innerHTML = botShell(inner, 'status-' + status);
    $('messages').appendChild(div);
    mountAvatar(div);
    if (!opts.restored) scrollDown(div);
  }

  function addError(message, retryText) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = botShell(`<p>${esc(message)}</p>${retryText ? `<div class="chips"><button type="button" class="chip chip-retry" data-q="${esc(retryText)}" data-retry="1">↻ ลองอีกครั้ง</button></div>` : ''}`, 'status-error');
    $('messages').appendChild(div);
    mountAvatar(div);
    scrollDown(div);
  }

  function addTyping() {
    const div = document.createElement('div');
    div.className = 'msg bot typing';
    div.innerHTML = botShell('<div class="typing-dots"><i></i><i></i><i></i></div><span class="typing-text">กำลังค้นข้อมูล…</span>');
    $('messages').appendChild(div);
    mountAvatar(div);
    scrollDown();
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(n + 1, THINKING_LINES.length - 1);
      const line = THINKING_LINES[n];
      const el = div.querySelector('.typing-text');
      if (el) el.textContent = line;
      say(line);
    }, 4500);
    return () => { clearInterval(t); div.remove(); };
  }

  function welcome() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = botShell(`<p class="welcome-title">สวัสดีครับ ผม<strong>${esc(CFG.BOT_NAME || 'น้อง Nora')}</strong> 🙏</p>
      <p>ผู้ช่วยของ${esc(CFG.ORG_NAME || '')} ${esc(CFG.UNIVERSITY || '')} ถามผมได้เรื่อง<strong>การลงทะเบียนเรียน การชำระเงิน ปฏิทินการศึกษา ระเบียบข้อบังคับ คำร้อง</strong> และ<strong>เอกสารประกอบการเบิก</strong>ครับ</p>
      <p class="hint">💡 บอกระดับการศึกษา (ป.ตรี/บัณฑิตศึกษา) ภาคปกติหรือภาคพิเศษ และคณะ มาด้วย ผมจะตอบได้ตรงกรณีมากขึ้นครับ</p>
      <div class="chips">${TOPICS.slice(0, 4).map((t) => `<button type="button" class="chip" data-q="${esc(t.qs[0])}">${esc(t.qs[0])}</button>`).join('')}</div>`);
    $('messages').appendChild(div);
    mountAvatar(div);
  }

  function scrollDown(node) {
    const box = $('messages');
    requestAnimationFrame(() => {
      if (node && node.offsetHeight > box.clientHeight * 0.7) {
        box.scrollTop = node.offsetTop - box.offsetTop - 12;
      } else {
        box.scrollTop = box.scrollHeight;
      }
    });
  }

  function saveHistory() {
    local.set('pk_history', JSON.stringify(history.slice(-30)));
  }

  function restore() {
    welcome();
    history.forEach((m) => {
      if (m.role === 'user') addUser(m.content);
      else addBot(m.data || { answer: m.content }, { restored: true });
    });
    $('messages').scrollTop = $('messages').scrollHeight;
  }

  // ── sending ──
  async function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    $('sendBtn').disabled = true;
    addUser(text);
    history.push({ role: 'user', content: text });
    saveHistory();
    mood('thinking');
    say('ขอน้องค้นในเอกสารแป๊บนึงนะครับ…');
    const stopTyping = addTyping();
    try {
      const messages = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const data = DEMO ? await demoAnswer(text) : await api('chat', { sid: sid, messages: messages });
      stopTyping();
      history.push({ role: 'assistant', content: data.answer, data: { answer: data.answer, status: data.status, sources: data.sources, follow_ups: data.follow_ups } });
      saveHistory();
      addBot(data);
      if (data.status === 'unknown' || data.status === 'off_topic') {
        mood('sorry', 3500);
        say(data.status === 'unknown' ? 'ขอโทษครับ เรื่องนี้น้องยังไม่รู้ 🙏' : 'ถามเรื่องงานวิชาการได้เลยครับ', 5000);
      } else if (data.status === 'need_info') {
        mood('talking', 2500);
        say('ขอข้อมูลเพิ่มนิดนึงนะครับ', 5000);
      } else {
        mood('happy', 2200);
        say('ได้คำตอบแล้วครับ! ✨', 5000);
      }
    } catch (err) {
      stopTyping();
      history.pop();
      saveHistory();
      mood('sorry', 3000);
      say('อุ๊ย มีปัญหานิดหน่อยครับ', 4000);
      addError(err.message || 'เชื่อมต่อไม่สำเร็จ', text);
    } finally {
      busy = false;
      $('sendBtn').disabled = false;
    }
  }

  $('composer').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('input').value;
    $('input').value = '';
    autoGrow();
    ask(v);
  });
  $('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      $('composer').requestSubmit();
    }
  });
  function autoGrow() {
    const t = $('input');
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 160) + 'px';
  }
  $('input').addEventListener('input', () => {
    autoGrow();
    if (!busy && stage.mood !== 'talking' && $('input').value.length === 1) { mood('talking', 1500); say('ฟังอยู่ครับ 👂', 3000); }
  });

  $('messages').addEventListener('click', async (e) => {
    const chip = e.target.closest('[data-q]');
    if (chip) {
      if (chip.dataset.retry) chip.closest('.msg').remove();
      ask(chip.dataset.q);
      return;
    }
    const fb = e.target.closest('[data-fb]');
    if (fb) {
      const box = fb.closest('.feedback');
      const value = fb.dataset.fb;
      box.innerHTML = value === 'up' ? '<span>ขอบคุณครับ 🙏 ดีใจที่ช่วยได้</span>' : '<span>ขอบคุณครับ น้องจะส่งเรื่องนี้ให้เจ้าหน้าที่ปรับปรุงนะครับ</span>';
      mood(value === 'up' ? 'happy' : 'sorry', 1800);
      if (!DEMO) { try { await api('feedback', { logId: box.dataset.log, value: value }); } catch (err) { /* ignore */ } }
    }
  });

  $('btnReset').addEventListener('click', () => {
    if (busy) return;
    history = [];
    saveHistory();
    $('messages').innerHTML = '';
    welcome();
    mood('happy', 1500);
    say('เริ่มคุยใหม่ได้เลยครับ!', 4000);
  });

  // ── "น้องรู้เรื่องอะไรบ้าง" drawer ──
  const drawer = $('knowsDrawer');
  $('btnKnows').addEventListener('click', async () => {
    drawer.hidden = false;
    const body = $('knowsBody');
    body.innerHTML = '<p class="muted">กำลังโหลด…</p>';
    try {
      const info = DEMO ? demoInfo() : await api('info');
      if (!info.docs.length) { body.innerHTML = '<p class="muted">ยังไม่มีเอกสารในระบบครับ</p>'; return; }
      const groups = {};
      info.docs.forEach((d) => { (groups[d.category] = groups[d.category] || []).push(d); });
      body.innerHTML = Object.keys(groups).map((c) => `<section class="know-group"><h3>${esc(c)}</h3><ul>${groups[c].map((d) =>
        `<li>📄 ${esc(d.title)}${d.updated ? `<small>ปรับปรุง ${esc(thaiDate(d.updated))}</small>` : ''}</li>`).join('')}</ul></section>`).join('');
    } catch (err) {
      body.innerHTML = `<p class="muted">${esc(err.message)}</p>`;
    }
  });
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) drawer.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') drawer.hidden = true; });

  function thaiDate(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  }

  // ── demo mode ──
  function demoInfo() {
    return { docs: [
      { title: 'ปฏิทินการศึกษา ปีการศึกษา 2569 (ตัวอย่าง)', category: 'ปฏิทินการศึกษา', updated: new Date().toISOString() },
      { title: 'ข้อบังคับว่าด้วยการศึกษาระดับปริญญาตรี (ตัวอย่าง)', category: 'ระเบียบ/ข้อบังคับ', updated: new Date().toISOString() },
      { title: 'แบบคำร้องทั่วไป (ตัวอย่าง)', category: 'คำร้อง/แบบฟอร์ม', updated: new Date().toISOString() },
    ] };
  }
  function demoAnswer(q) {
    return new Promise((resolve) => setTimeout(() => {
      if (/หอ|อาหาร|ที่จอดรถ|wifi|ไวไฟ/i.test(q)) {
        resolve({ status: 'unknown', sources: [], follow_ups: [], logId: 'demo',
          answer: 'ขอโทษครับ เรื่องนี้ยังไม่มีในเอกสารที่น้องได้รับมาครับ 🙏' });
      } else if (/ล่าช้า/.test(q)) {
        resolve({ status: 'answered', logId: 'demo', sources: ['ข้อบังคับว่าด้วยการศึกษาระดับปริญญาตรี (ตัวอย่าง)', 'ปฏิทินการศึกษา ปีการศึกษา 2569 (ตัวอย่าง)'],
          follow_ups: ['ค่าปรับลงทะเบียนล่าช้าเท่าไหร่', 'ถ้าเลยกำหนดลงทะเบียนล่าช้าแล้วทำอย่างไร'],
          answer: '**ลงทะเบียนล่าช้าได้ภายในช่วงที่ปฏิทินกำหนด** โดยมีค่าปรับตามประกาศครับ (ข้อความตัวอย่าง)\n\n1. ยื่นคำร้องขอลงทะเบียนล่าช้าผ่านระบบ\n2. ให้อาจารย์ที่ปรึกษาอนุมัติ\n3. ชำระค่าธรรมเนียมและค่าปรับ\n\n| กรณี | ค่าปรับ (ตัวอย่าง) |\n|---|---|\n| ภาคปกติ | วันละ 50 บาท |\n| ภาคพิเศษ | วันละ 100 บาท |' });
      } else {
        resolve({ status: 'need_info', logId: 'demo', sources: [],
          follow_ups: ['ปริญญาตรี ภาคปกติ', 'ปริญญาตรี ภาคพิเศษ', 'บัณฑิตศึกษา'],
          answer: 'เรื่องนี้เงื่อนไขต่างกันตามระดับการศึกษาและประเภทนักศึกษาครับ 🙂 ขอทราบก่อนว่าเป็น**นักศึกษากลุ่มไหน**ครับ? (ข้อความตัวอย่าง — ยังไม่ได้เชื่อมต่อ AI)' });
      }
    }, 2200));
  }

  restore();
})();
