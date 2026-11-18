/* หลังบ้านน้อง Nora */
(function () {
  const { CFG, api, esc, session } = window.Common;
  const $ = (id) => document.getElementById(id);
  const DEMO = !CFG.API_URL;
  const CONTEXT_BUDGET = 900000; // token ที่ใช้กับเอกสารได้ (เผื่อพื้นที่ให้คำถาม-คำตอบ)
  const FREE_TPM = 250000; // โควตาฟรีโดยประมาณ (token ต่อนาที) — Google ปรับได้ ตรวจที่ aistudio.google.com
  const METHOD_LABEL = { ocr: 'ดึงอัตโนมัติ (OCR)', ai: 'ถอดความด้วย AI', manual: 'พิมพ์/แก้เอง', text: 'ไฟล์ข้อความ', sheet: 'ตาราง Excel' };
  const STATUS_LABEL = { answered: 'ตอบได้', partial: 'ได้บางส่วน', need_info: 'ถามข้อมูลเพิ่ม', unknown: 'ตอบไม่ได้', off_topic: 'นอกเรื่อง' };

  let token = session.get('pk_admin');
  let categories = [];
  let docs = [];
  let knowledge = {};

  Mascot.create($('headerMascot'), { mini: true });
  const loginMascot = Mascot.create($('loginMascot'), {});

  // ── api wrapper ──
  async function call(action, payload) {
    try {
      return DEMO ? await Demo.call(action, payload || {}) : await api(action, Object.assign({ token: token }, payload || {}));
    } catch (err) {
      if (err.code === 'AUTH') { logout(); toast('กรุณาเข้าสู่ระบบใหม่'); }
      throw err;
    }
  }

  function toast(msg, kind) {
    const t = $('toast');
    t.textContent = msg;
    t.className = 'toast ' + (kind || '');
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 3800);
  }

  // ── login ──
  function showLogin() { $('loginView').hidden = false; $('appView').hidden = true; $('btnLogout').hidden = true; }
  function showApp() { $('loginView').hidden = true; $('appView').hidden = false; $('btnLogout').hidden = false; loadDocs(); }
  function logout() { token = null; session.del('pk_admin'); showLogin(); }

  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('loginError').textContent = '';
    loginMascot.setMood('thinking');
    try {
      const r = DEMO ? await Demo.call('login', {}) : await api('login', { password: $('password').value });
      token = r.token; categories = r.categories || [];
      session.set('pk_admin', token);
      $('password').value = '';
      loginMascot.setMood('happy', 1200);
      showApp();
    } catch (err) {
      loginMascot.setMood('sorry', 2500);
      $('loginError').textContent = err.message;
    }
  });
  $('btnLogout').addEventListener('click', logout);

  // ── tabs ──
  document.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === b));
    ['docs', 'logs', 'stats'].forEach((k) => { $('tab-' + k).hidden = k !== b.dataset.tab; });
    if (b.dataset.tab === 'logs') loadLogs();
    if (b.dataset.tab === 'stats') loadStats();
  });

  // ── documents ──
  async function loadDocs() {
    try {
      const r = await call('listDocs');
      docs = r.docs; knowledge = r.knowledge || {}; categories = r.categories || categories; model = r.model || model;
      renderSummary(); renderDocs();
    } catch (err) {
      $('docList').innerHTML = `<p class="form-error">${esc(err.message)}</p>`;
    }
  }

  let model = '';

  function renderSummary() {
    const k = knowledge || {};
    const tokens = k.tokens || 0;
    const pct = Math.min(100, Math.round(tokens / CONTEXT_BUDGET * 100));
    const perMin = tokens ? Math.max(0, Math.floor(FREE_TPM / (tokens + 2000))) : 0;
    $('kbSummary').innerHTML = `
      <div class="kb-item"><span>เอกสารที่เปิดใช้</span><strong>${k.count || 0}</strong><small>จากทั้งหมด ${docs.length} รายการ</small></div>
      <div class="kb-item"><span>ขนาดความรู้</span><strong>${tokens ? tokens.toLocaleString() : '–'}</strong><small>token · ใช้ไป ${pct}% ของความจุ</small>
        <div class="meter ${pct > 85 ? 'warn' : ''}"><i style="width:${pct}%"></i></div></div>
      <div class="kb-item"><span>AI ที่ใช้ (ฟรี)</span><strong>${esc(model || 'Gemini')}</strong>
        <small>${tokens ? `รับได้ราว ${perMin.toLocaleString()} คำถาม/นาที ตามโควตาฟรี${perMin < 2 ?' — <b>เอกสารเยอะเกินไป ควรปิดฉบับที่ไม่จำเป็น</b>' : ''}` : 'ยังไม่มีเอกสาร'}</small></div>`;
  }

  function catOptions(sel) {
    return categories.map((c) => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('');
  }

  function renderDocs() {
    const q = $('docSearch').value.trim().toLowerCase();
    const list = docs.filter((d) => !q || (d.title + d.category + d.sourceName).toLowerCase().includes(q));
    if (!list.length) {
      $('docList').innerHTML = `<div class="empty"><div class="empty-ic">📭</div><p>${docs.length ? 'ไม่พบเอกสารที่ค้นหา' : 'ยังไม่มีเอกสาร เริ่มจากอัปโหลดปฏิทินการศึกษาหรือระเบียบก่อนได้เลย'}</p></div>`;
      return;
    }
    $('docList').innerHTML = list.map((d) => `
      <article class="doc ${d.active ? '' : 'off'}" data-id="${esc(d.id)}">
        <div class="doc-main">
          <div class="doc-title">${esc(d.title)}</div>
          <div class="doc-meta">
            <select class="mini-select" data-act="cat" aria-label="หมวด">${catOptions(d.category)}</select>
            <span class="badge">${esc(METHOD_LABEL[d.method] || d.method || '-')}</span>
            <span>${(d.chars || 0).toLocaleString()} ตัวอักษร</span>
            ${d.sourceUrl ? `<a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">ไฟล์ต้นฉบับ ↗</a>` : ''}
            <span>แก้ไข ${esc(fmtDate(d.updated))}</span>
          </div>
          ${d.note ? `<div class="doc-note">⚠️ ${esc(d.note)}</div>` : ''}
        </div>
        <div class="doc-actions">
          <label class="switch" title="เปิด/ปิดให้บอทใช้เอกสารนี้"><input type="checkbox" data-act="active" ${d.active ? 'checked' : ''}><i></i><span>${d.active ? 'ใช้งาน' : 'ปิด'}</span></label>
          <button class="btn btn-small" data-act="edit">ดู/แก้ข้อความ</button>
          ${d.canAi ? '<button class="btn btn-small btn-ai" data-act="ai">✨ ถอดความด้วย AI</button>' : ''}
          <button class="btn btn-small btn-danger" data-act="del" aria-label="ลบ">ลบ</button>
        </div>
      </article>`).join('');
  }
  $('docSearch').addEventListener('input', renderDocs);

  $('docList').addEventListener('change', async (e) => {
    const el = e.target;
    const id = el.closest('.doc') && el.closest('.doc').dataset.id;
    if (!id) return;
    try {
      if (el.dataset.act === 'active') await call('updateDoc', { id: id, active: el.checked });
      if (el.dataset.act === 'cat') await call('updateDoc', { id: id, category: el.value });
      toast('บันทึกแล้ว', 'ok');
      loadDocs();
    } catch (err) { toast(err.message, 'err'); loadDocs(); }
  });

  $('docList').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const d = docs.find((x) => x.id === b.closest('.doc').dataset.id);
    if (b.dataset.act === 'edit') openEdit(d);
    if (b.dataset.act === 'ai') openAi(d);
    if (b.dataset.act === 'del') confirmDelete(d);
  });

  function fmtDate(iso) {
    const d = new Date(iso);
    if (!iso || isNaN(d)) return '-';
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) + ' ' +
      d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  // ── upload queue ──
  const queue = [];
  function guessCategory(name) {
    const n = name.toLowerCase();
    if (/ปฏิทิน|calendar/.test(n)) return 'ปฏิทินการศึกษา';
    if (/ระเบียบ|ข้อบังคับ|ประกาศ|regulation/.test(n)) return 'ระเบียบ/ข้อบังคับ';
    if (/ลงทะเบียน|register/.test(n)) return 'การลงทะเบียน';
    if (/ชำระ|ค่าธรรมเนียม|ค่าเทอม|fee|payment/.test(n)) return 'การชำระเงิน';
    if (/คำร้อง|แบบฟอร์ม|form/.test(n)) return 'คำร้อง/แบบฟอร์ม';
    if (/เบิก|ใบเสร็จ|receipt/.test(n)) return 'เอกสารเบิกค่าเล่าเรียน';
    if (/สำเร็จ|จบ|grad/.test(n)) return 'การสำเร็จการศึกษา';
    return 'อื่นๆ';
  }

  function addFiles(files) {
    Array.from(files).forEach((f) => {
      if (f.size > 25 * 1024 * 1024) { toast(f.name + ' ใหญ่เกิน 25 MB', 'err'); return; }
      queue.push({ file: f, title: f.name.replace(/\.[^.]+$/, ''), category: guessCategory(f.name), state: 'wait', msg: '' });
    });
    renderQueue();
  }

  function renderQueue() {
    if (!queue.length) { $('queue').innerHTML = ''; return; }
    const pending = queue.some((q) => q.state === 'wait' || q.state === 'error');
    $('queue').innerHTML = queue.map((q, i) => `
      <div class="q-row q-${q.state}" data-i="${i}">
        <div class="q-file">📄 ${esc(q.file.name)} <small>${(q.file.size / 1024 / 1024).toFixed(1)} MB</small></div>
        <input class="q-title" value="${esc(q.title)}" ${q.state === 'done' || q.state === 'busy' ? 'disabled' : ''} aria-label="ชื่อเอกสาร" placeholder="ชื่อเอกสาร (บอทใช้อ้างอิง)">
        <select class="q-cat" ${q.state === 'done' || q.state === 'busy' ? 'disabled' : ''} aria-label="หมวด">${catOptions(q.category)}</select>
        <div class="q-state">${q.state === 'busy' ? '<span class="spinner"></span> กำลังอัปโหลดและอ่านไฟล์…' : esc(q.msg)}</div>
        ${q.state === 'wait' ? '<button class="icon-btn q-remove" aria-label="เอาออก">✕</button>' : ''}
      </div>`).join('') +
      `<div class="q-foot">${pending ? '<button class="btn btn-primary" id="btnUploadAll">อัปโหลดทั้งหมด</button>' : ''}
       <button class="btn btn-ghost" id="btnClearQueue">ล้างรายการ</button></div>`;
  }

  $('fileInput').addEventListener('change', (e) => { addFiles(e.target.files); e.target.value = ''; });
  const dz = $('dropzone');
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

  $('queue').addEventListener('input', (e) => {
    const row = e.target.closest('.q-row');
    if (!row) return;
    const q = queue[Number(row.dataset.i)];
    if (e.target.classList.contains('q-title')) q.title = e.target.value;
  });
  $('queue').addEventListener('change', (e) => {
    const row = e.target.closest('.q-row');
    if (row && e.target.classList.contains('q-cat')) queue[Number(row.dataset.i)].category = e.target.value;
  });
  $('queue').addEventListener('click', async (e) => {
    if (e.target.closest('.q-remove')) { queue.splice(Number(e.target.closest('.q-row').dataset.i), 1); renderQueue(); }
    if (e.target.id === 'btnClearQueue') { for (let i = queue.length - 1; i >= 0; i--) if (queue[i].state !== 'busy') queue.splice(i, 1); renderQueue(); }
    if (e.target.id === 'btnUploadAll') uploadAll();
  });

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
      r.readAsDataURL(file);
    });
  }

  async function uploadAll() {
    for (const q of queue) {
      if (q.state !== 'wait' && q.state !== 'error') continue;
      q.state = 'busy'; renderQueue();
      try {
        const data = await readBase64(q.file);
        const r = await call('uploadDoc', { name: q.file.name, mimeType: q.file.type || '', data: data, title: q.title, category: q.category });
        q.state = 'done';
        q.msg = r.note ? '⚠️ ' + r.note : `✓ อ่านได้ ${r.chars.toLocaleString()} ตัวอักษร`;
      } catch (err) {
        q.state = 'error'; q.msg = '✗ ' + err.message;
      }
      renderQueue();
    }
    loadDocs();
  }

  // ── modal helpers ──
  let modalClose = null;
  function openModal(title, bodyHtml, footHtml, onClose) {
    $('modalTitle').textContent = title;
    $('modalBody').innerHTML = bodyHtml;
    $('modalFoot').innerHTML = footHtml || '';
    $('modal').hidden = false;
    modalClose = onClose || null;
  }
  function closeModal() {
    if (modalClose && modalClose() === false) return;
    $('modal').hidden = true;
    modalClose = null;
  }
  $('modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });

  // ── edit text ──
  async function openEdit(d) {
    openModal('ข้อความที่น้องอ่าน', '<p class="muted">กำลังโหลด…</p>');
    try {
      const r = await call('getDocText', { id: d.id });
      openModal('ข้อความที่น้องอ่าน', `
        <div class="form-grid">
          <label>ชื่อเอกสาร<input id="edTitle" value="${esc(d.title)}"></label>
          <label>หมวด<select id="edCat">${catOptions(d.category)}</select></label>
        </div>
        <p class="muted small">ตรวจให้ตัวเลข วันที่ ตาราง ถูกต้องตามต้นฉบับ — บอทจะตอบจากข้อความนี้เท่านั้น ใช้ Markdown ได้ (เช่น | ตาราง |)</p>
        <textarea id="edText" class="big-text" spellcheck="false">${esc(r.text)}</textarea>
        <div class="muted small" id="edCount">${r.text.length.toLocaleString()} ตัวอักษร</div>`,
      '<button class="btn btn-ghost" data-close>ยกเลิก</button><button class="btn btn-primary" id="edSave">บันทึก</button>');
      $('edText').addEventListener('input', () => { $('edCount').textContent = $('edText').value.length.toLocaleString() + ' ตัวอักษร'; });
      $('edSave').addEventListener('click', async () => {
        $('edSave').disabled = true; $('edSave').textContent = 'กำลังบันทึก…';
        try {
          if ($('edTitle').value !== d.title || $('edCat').value !== d.category) {
            await call('updateDoc', { id: d.id, title: $('edTitle').value, category: $('edCat').value });
          }
          await call('saveDocText', { id: d.id, text: $('edText').value, method: d.method === 'ai' ? 'ai' : 'manual' });
          closeModal(); toast('บันทึกแล้ว น้องอ่านข้อความใหม่เรียบร้อย', 'ok'); loadDocs();
        } catch (err) { toast(err.message, 'err'); $('edSave').disabled = false; $('edSave').textContent = 'บันทึก'; }
      });
    } catch (err) { openModal('เกิดข้อผิดพลาด', `<p class="form-error">${esc(err.message)}</p>`); }
  }

  // ── add text doc ──
  $('btnAddText').addEventListener('click', () => {
    openModal('พิมพ์ข้อมูลให้น้องเอง', `
      <div class="form-grid">
        <label>ชื่อเรื่อง<input id="atTitle" placeholder="เช่น ช่องทางชำระค่าธรรมเนียม ภาค 2/2569"></label>
        <label>หมวด<select id="atCat">${catOptions('อื่นๆ')}</select></label>
      </div>
      <textarea id="atText" class="big-text" placeholder="พิมพ์หรือวางข้อความ เช่น คำถามที่พบบ่อยและคำตอบ ประกาศ ขั้นตอนการทำงาน…"></textarea>`,
    '<button class="btn btn-ghost" data-close>ยกเลิก</button><button class="btn btn-primary" id="atSave">บันทึก</button>');
    $('atSave').addEventListener('click', async () => {
      $('atSave').disabled = true;
      try {
        await call('addTextDoc', { title: $('atTitle').value, category: $('atCat').value, text: $('atText').value });
        closeModal(); toast('เพิ่มข้อมูลแล้ว', 'ok'); loadDocs();
      } catch (err) { toast(err.message, 'err'); $('atSave').disabled = false; }
    });
  });

  // ── delete ──
  function confirmDelete(d) {
    openModal('ลบเอกสาร', `<p>ลบ <strong>${esc(d.title)}</strong> ออกจากความรู้ของน้อง Nora?</p>
      <p class="muted small">ไฟล์ต้นฉบับและข้อความจะถูกย้ายไปถังขยะของ Google Drive (กู้คืนได้ภายใน 30 วัน)</p>`,
    '<button class="btn btn-ghost" data-close>ยกเลิก</button><button class="btn btn-danger" id="delOk">ลบเอกสาร</button>');
    $('delOk').addEventListener('click', async () => {
      $('delOk').disabled = true;
      try { await call('deleteDoc', { id: d.id }); closeModal(); toast('ลบแล้ว', 'ok'); loadDocs(); } catch (err) { toast(err.message, 'err'); $('delOk').disabled = false; }
    });
  }

  // ── AI transcription ──
  function openAi(d) {
    let running = false, cancelled = false, text = '';
    openModal('ถอดความด้วย AI — ' + d.title, `
      <p>ให้ AI (Gemini) อ่านไฟล์ต้นฉบับ (PDF/รูปภาพ) แล้วถอดเป็นข้อความพร้อมตาราง เหมาะกับปฏิทินการศึกษา ตารางค่าธรรมเนียม หรือไฟล์สแกนที่ OCR อ่านไม่ครบ</p>
      <div class="form-grid">
        <label>ครั้งละ<select id="aiStep"><option value="3">3 หน้า</option><option value="5" selected>5 หน้า</option><option value="8">8 หน้า</option></select></label>
        <div class="ai-status" id="aiStatus">พร้อมเริ่ม</div>
      </div>
      <div class="meter big"><i id="aiBar" style="width:0%"></i></div>
      <textarea id="aiText" class="big-text" placeholder="ข้อความที่ถอดได้จะแสดงที่นี่ ตรวจและแก้ไขได้ก่อนบันทึก" spellcheck="false"></textarea>`,
    '<button class="btn btn-ghost" data-close>ปิด</button><button class="btn btn-ai" id="aiStart">✨ เริ่มถอดความ</button><button class="btn btn-primary" id="aiSave" disabled>บันทึกแทนข้อความเดิม</button>',
    () => {
      if (running && !confirm('กำลังถอดความอยู่ ต้องการหยุดหรือไม่?')) return false;
      cancelled = true;
      return true;
    });

    $('aiStart').addEventListener('click', async () => {
      running = true; cancelled = false; text = '';
      $('aiStart').disabled = true; $('aiSave').disabled = true; $('aiText').value = '';
      const step = Number($('aiStep').value);
      let from = 1, total = null;
      try {
        while (!cancelled && (total === null || from <= total)) {
          const to = total ? Math.min(total, from + step - 1) : from + step - 1;
          $('aiStatus').innerHTML = `<span class="spinner"></span> กำลังถอดหน้า ${from}–${to}${total ? ' จาก ' + total : ''}…`;
          const r = await call('aiTranscribe', { id: d.id, fromPage: from, toPage: to });
          total = r.totalPages || 1;
          if (r.text) text += (text ? '\n\n' : '') + r.text.trim();
          $('aiText').value = text;
          $('aiBar').style.width = Math.min(100, Math.round(Math.min(to, total) / total * 100)) + '%';
          from = to + 1;
        }
        $('aiStatus').textContent = cancelled ? 'หยุดแล้ว' : `เสร็จแล้ว ${total} หน้า — ตรวจความถูกต้องก่อนบันทึก`;
        $('aiSave').disabled = !text;
      } catch (err) {
        $('aiStatus').textContent = '✗ ' + err.message + (text ? ' (เก็บส่วนที่ถอดได้แล้วไว้ให้)' : '');
        $('aiSave').disabled = !text;
      } finally {
        running = false;
        $('aiStart').disabled = false; $('aiStart').textContent = '↻ ถอดใหม่';
      }
    });
    $('aiSave').addEventListener('click', async () => {
      $('aiSave').disabled = true;
      try {
        await call('saveDocText', { id: d.id, text: $('aiText').value, method: 'ai', active: true });
        closeModal(); toast('บันทึกข้อความจาก AI แล้ว', 'ok'); loadDocs();
      } catch (err) { toast(err.message, 'err'); $('aiSave').disabled = false; }
    });
  }

  // ── logs ──
  let logFilter = 'all';
  $('logFilter').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    logFilter = b.dataset.f;
    $('logFilter').querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
    loadLogs();
  });

  async function loadLogs() {
    $('logList').innerHTML = '<p class="muted">กำลังโหลด…</p>';
    try {
      const rows = await call('listLogs', { filter: logFilter, limit: 150 });
      if (!rows.length) { $('logList').innerHTML = '<div class="empty"><div class="empty-ic">🌱</div><p>ยังไม่มีคำถามในหมวดนี้</p></div>'; return; }
      $('logList').innerHTML = rows.map((r) => `
        <details class="log">
          <summary>
            <span class="st st-${esc(r.status)}">${esc(STATUS_LABEL[r.status] || r.status)}</span>
            <span class="log-q">${esc(r.question)}</span>
            <span class="log-time">${esc(fmtDate(r.time))}${r.feedback ? ' · ' + (r.feedback === 'ดี' ? '👍' : '👎') : ''}</span>
          </summary>
          <div class="log-a md">${window.Common.markdown(r.answer)}</div>
          <div class="log-meta">${r.sources ? '📄 ' + esc(r.sources) + '' : ''}${r.comment ? (r.sources ? ' · ' : '') + 'ความเห็น: ' + esc(r.comment) : ''}</div>
        </details>`).join('');
    } catch (err) { $('logList').innerHTML = `<p class="form-error">${esc(err.message)}</p>`; }
  }

  // ── stats ──
  async function loadStats() {
    $('kpis').innerHTML = '<p class="muted">กำลังโหลด…</p>';
    try {
      const s = await call('stats');
      const answered = (s.byStatus.answered || 0) + (s.byStatus.need_info || 0);
      const rate = s.total ? Math.round(answered / s.total * 100) : 0;
      const kpi = (label, value, sub) => `<div class="kpi"><span>${label}</span><strong>${value}</strong>${sub ? `<small>${sub}</small>` : ''}</div>`;
      $('kpis').innerHTML =
        kpi('คำถามทั้งหมด', s.total.toLocaleString(), 'วันนี้ ' + s.today + ' / โควตา ' + s.dailyLimit + ' ต่อวัน') +
        kpi('ตอบได้', rate + '%', 'ตอบไม่ได้ ' + (s.byStatus.unknown || 0) + ' · บางส่วน ' + (s.byStatus.partial || 0)) +
        kpi('ความพึงพอใจ', '👍 ' + s.feedbackUp + ' · 👎 ' + s.feedbackDown, '') +
        kpi('AI ที่ใช้', esc(s.model || 'Gemini'), 'ฟรี (Gemini free tier)') +
        kpi('Token วันนี้', (s.tokensToday || 0).toLocaleString(), 'ใช้ดูว่าใกล้โควตาฟรีหรือยัง');
      $('dayTable').innerHTML = '<table><thead><tr><th>วันที่</th><th>จำนวนคำถาม</th></tr></thead><tbody>' +
        s.days.slice().reverse().map((d) => `<tr><td>${esc(new Date(d.day).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' }))}</td><td>${d.count}</td></tr>`).join('') +
        '</tbody></table>';
    } catch (err) { $('kpis').innerHTML = `<p class="form-error">${esc(err.message)}</p>`; }
  }

  // ── demo backend (เมื่อยังไม่ได้ตั้ง API_URL) ──
  const Demo = {
    docs: [
      { id: 'D1', title: 'ปฏิทินการศึกษา ปีการศึกษา 2569 (ตัวอย่าง)', category: 'ปฏิทินการศึกษา', sourceName: 'calendar-2569.pdf', sourceUrl: '#', chars: 8420, active: true, method: 'ai', updated: new Date().toISOString(), note: '', canAi: true },
      { id: 'D2', title: 'ข้อบังคับว่าด้วยการศึกษาระดับปริญญาตรี (ตัวอย่าง)', category: 'ระเบียบ/ข้อบังคับ', sourceName: 'reg.pdf', sourceUrl: '#', chars: 54210, active: true, method: 'ocr', updated: new Date().toISOString(), note: '', canAi: true },
      { id: 'D3', title: 'แบบคำร้องทั่วไป (ตัวอย่าง)', category: 'คำร้อง/แบบฟอร์ม', sourceName: 'form.jpg', sourceUrl: '#', chars: 0, active: false, method: 'ocr', updated: new Date().toISOString(), note: 'ไม่พบข้อความในไฟล์ แนะนำให้ใช้ "ถอดความด้วย AI"', canAi: true },
    ],
    async call(action, p) {
      await new Promise((r) => setTimeout(r, 500));
      const cats = ['ปฏิทินการศึกษา', 'ระเบียบ/ข้อบังคับ', 'การลงทะเบียน', 'การชำระเงิน', 'คำร้อง/แบบฟอร์ม', 'เอกสารเบิกค่าเล่าเรียน', 'การสำเร็จการศึกษา', 'อื่นๆ'];
      const meta = () => ({ count: this.docs.filter((d) => d.active).length, tokens: 61250 });
      switch (action) {
        case 'login': return { token: 'demo', categories: cats };
        case 'listDocs': return { docs: this.docs, knowledge: meta(), categories: cats, model: 'gemini-2.5-flash' };
        case 'getDocText': return { text: '# ตัวอย่างข้อความ\n\n| กิจกรรม | วันที่ |\n|---|---|\n| ลงทะเบียน | 1–5 ม.ค. 2570 |' };
        case 'aiTranscribe': return { totalPages: 7, text: '<!-- หน้า ' + p.fromPage + ' -->\nข้อความตัวอย่างหน้า ' + p.fromPage + '–' + p.toPage, costUsd: 0.04 };
        case 'uploadDoc': return { chars: 1234, note: '' };
        case 'listLogs': return [
          { time: new Date().toISOString(), question: 'ลงทะเบียนล่าช้าต้องทำอย่างไร', answer: '**ตัวอย่างคำตอบ**', status: 'answered', sources: 'ปฏิทินการศึกษา', cost: 0.031, feedback: 'ดี' },
          { time: new Date().toISOString(), question: 'หอพักในมหาวิทยาลัยราคาเท่าไหร่', answer: 'ยังไม่มีข้อมูล', status: 'unknown', sources: '', cost: 0.022, feedback: '' },
        ];
        case 'stats': return { total: 128, today: 9, dailyLimit: 500, byStatus: { answered: 101, need_info: 9, unknown: 12, partial: 6 }, feedbackUp: 40, feedbackDown: 3, model: 'gemini-2.5-flash', tokensToday: 412000, cacheHitRate: 70,
          days: Array.from({ length: 14 }, (_, i) => ({ day: new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10), count: Math.round(Math.random() * 15) })) };
        default: return { knowledge: meta() };
      }
    },
  };

  if (DEMO) toast('โหมดตัวอย่าง — ยังไม่ได้ตั้ง API_URL ใน config.js');
  if (token || DEMO) { if (DEMO) token = 'demo'; showApp(); } else showLogin();
})();
