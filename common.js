/* ฟังก์ชันใช้ร่วมกันระหว่างหน้าแชตและหน้าแอดมิน */
(function () {
  const CFG = window.APP_CONFIG || {};

  async function api(action, payload) {
    if (!CFG.API_URL) throw new Error('ยังไม่ได้ตั้งค่า API_URL ใน config.js');
    const res = await fetch(CFG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain เพื่อไม่ให้เกิด CORS preflight กับ Apps Script
      body: JSON.stringify(Object.assign({ action: action }, payload || {})),
    });
    let json;
    try { json = await res.json(); } catch (e) { throw new Error('เชื่อมต่อระบบไม่สำเร็จ'); }
    if (!json.ok) {
      const err = new Error(json.error || 'เกิดข้อผิดพลาด');
      err.code = json.code;
      throw err;
    }
    return json.data;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ── Markdown แบบปลอดภัย (escape ก่อนแล้วค่อยแปลง) ──
  function inline(s) {
    s = esc(s);
    const links = [];
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => {
      links.push(`<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
      return '\u0000' + (links.length - 1) + '\u0000';
    });
    s = s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, (u) => {
      links.push(`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
      return '\u0000' + (links.length - 1) + '\u0000';
    });
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (m, i) => links[Number(i)]);
  }

  function splitRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  }

  function markdown(src) {
    const lines = String(src || '').replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      // table
      if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const head = splitRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        out.push('<div class="md-table"><table><thead><tr>' + head.map((h) => '<th>' + inline(h) + '</th>').join('') +
          '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>');
        continue;
      }
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { out.push('<h4 class="md-h' + h[1].length + '">' + inline(h[2]) + '</h4>'); i++; continue; }
      if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
        const ordered = /^\s*\d+[.)]\s+/.test(line);
        const items = [];
        while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) {
          const nested = /^\s{2,}/.test(lines[i]);
          const text = lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, '');
          items.push('<li' + (nested ? ' class="nested"' : '') + '>' + inline(text) + '</li>');
          i++;
        }
        out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
        continue;
      }
      if (/^>\s?/.test(line)) {
        const q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(inline(lines[i].replace(/^>\s?/, ''))); i++; }
        out.push('<blockquote>' + q.join('<br>') + '</blockquote>');
        continue;
      }
      const para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*([-*•]|\d+[.)])\s|>\s?|\s*\|.*\|\s*$)/.test(lines[i])) {
        para.push(inline(lines[i])); i++;
      }
      if (para.length) out.push('<p>' + para.join('<br>') + '</p>');
      else { out.push('<p>' + inline(line) + '</p>'); i++; }
    }
    return out.join('');
  }

  function store(kind) {
    const s = kind === 'session' ? 'sessionStorage' : 'localStorage';
    return {
      get(k) { try { return window[s].getItem(k); } catch (e) { return null; } },
      set(k, v) { try { window[s].setItem(k, v); } catch (e) { /* ignore */ } },
      del(k) { try { window[s].removeItem(k); } catch (e) { /* ignore */ } },
    };
  }

  window.Common = { CFG: CFG, api: api, esc: esc, markdown: markdown, local: store('local'), session: store('session') };
})();
