/* Course engine: modules, labs, gated quizzes (80%), final exam. Progress in localStorage (with in-memory fallback). */
(() => {
const C = window.COURSE;
const KEY = 'carhack-course-v1';
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = x => Math.round(x * 100);
const hs = s => { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h.toString(36); };
const GATE = `${pct(C.pass)}% (${Math.ceil(C.pass * C.perQuiz)} of ${C.perQuiz})`;

/* ---------- state (safe storage) ---------- */
let memOnly = false;
const blank = () => ({ passed: {}, best: {}, labs: {}, attempts: {}, missed: {}, final: null, unlockAll: false });
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const clamp01 = v => (typeof v === 'number' && isFinite(v)) ? Math.min(1, Math.max(0, v)) : null;
function normalise(o) {
  const b = blank(); if (!isObj(o)) return b;
  b.unlockAll = o.unlockAll === true;
  for (const k of ['labs', 'attempts', 'missed']) if (isObj(o[k])) b[k] = o[k];
  let prev = true;
  for (const m of C.modules) { // a module counts as passed only if every earlier one is
    const ok = prev && isObj(o.passed) && o.passed[m.id] === true; prev = ok;
    if (ok) { b.passed[m.id] = true; const v = isObj(o.best) ? clamp01(o.best[m.id]) : null; b.best[m.id] = v == null ? 1 : v; }
    else if (isObj(o.best) && clamp01(o.best[m.id]) != null) b.best[m.id] = clamp01(o.best[m.id]);
  }
  if (isObj(o.final) && clamp01(o.final.score) != null) b.final = { score: clamp01(o.final.score), passed: !!o.final.passed && prev };
  return b;
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { memOnly = true; return blank(); }
  try { return normalise(raw ? JSON.parse(raw) : null); } catch (e) { return blank(); }
}
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { memOnly = true; } };
const unlocked = id => S.unlockAll || id === 1 || !!S.passed[id - 1];
const allPassed = () => C.modules.every(m => S.passed[m.id]);
const finalOpen = () => S.unlockAll || allPassed();
let Q = null, onLeave = null;

/* ---------- header / routing ---------- */
function header() {
  const done = C.modules.filter(m => S.passed[m.id]).length + (S.final && S.final.passed ? 1 : 0), total = C.modules.length + 1;
  $('#top').innerHTML = `<nav aria-label="Course"><a class="brand" href="#home"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4.5 15h4V9h4v6h3V9h4" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linejoin="round"/></svg><span>Automotive Cybersecurity Course</span></a>
  <div class="bar" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-valuetext="${done} of ${total} gates passed"><i style="width:${pct(done / total)}%"></i></div>
  <small>${done} of ${total} gates passed</small></nav>`;
}
function setTitle(t) { document.title = (t ? t.replace(/\s+/g, ' ').trim() + ' | ' : '') + 'Automotive Cybersecurity Course'; }
function route() {
  if (onLeave) { onLeave(); onLeave = null; }
  const [page, arg] = (location.hash.slice(1) || 'home').split('/');
  header();
  let ok = true;
  if (page === 'm') ok = moduleView(+arg);
  else if (page === 'quiz') ok = startQuiz(+arg);
  else if (page === 'final') ok = startQuiz('final');
  else if (page === 'reset') resetView();
  else home();
  if (ok === false) return location.replace('#home');
  window.scrollTo(0, 0);
  focusHeading();
}
function focusHeading() { const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
window.addEventListener('hashchange', route);
document.addEventListener('click', e => { const a = e.target.closest('.skip'); if (a) { e.preventDefault(); const m = $('#app'); m.tabIndex = -1; m.focus(); } });

/* ---------- home ---------- */
function home() {
  setTitle('');
  const nextMod = C.modules.find(m => !S.passed[m.id] && unlocked(m.id));
  const done = C.modules.filter(m => S.passed[m.id]).length;
  const cta = nextMod ? `<a class="btn" href="#m/${nextMod.id}">${done ? 'Continue' : 'Start'}: Module ${nextMod.id}</a>`
    : (allPassed() && !(S.final && S.final.passed)) ? `<a class="btn" href="#final">Take the final exam</a>` : `<a class="btn sec" href="#m/1">Review from Module 1</a>`;
  const items = C.modules.map(m => {
    const lock = !unlocked(m.id), ok = S.passed[m.id];
    const state = ok ? `<span class="pill ok">Passed ${pct(S.best[m.id])}%</span>` : lock ? `<span class="pill">Locked</span>` : S.best[m.id] != null ? `<span class="pill warn">Best ${pct(S.best[m.id])}%</span>` : (nextMod && nextMod.id === m.id ? `<span class="pill go">Up next</span>` : `<span class="pill">Ready</span>`);
    const sub = lock ? (m.id - 1 === (nextMod ? nextMod.id : 0) ? `Locked: pass the Module ${m.id - 1} quiz with ${GATE} to unlock.` : `Locked until Module ${m.id - 1} is passed.`) : `Video ${mmss(m.range[0])}-${mmss(m.range[1])} · ${m.quiz.length}-question pool${S.labs[m.id] ? ' · lab done' : ''}`;
    const inner = `<div class="n" aria-hidden="true">${ok ? '&#10003;' : m.id}</div><div class="l"><b>${esc(m.title)}</b><span class="mute">${sub}</span></div>${state}`;
    return `<li>${lock ? `<div class="card mod locked" role="group" aria-label="Module ${m.id}: ${esc(m.title)} (locked)">${inner}</div>` : `<a class="card mod ${ok ? 'passed' : ''}" href="#m/${m.id}">${inner}</a>`}</li>`;
  }).join('');
  const fin = S.final && S.final.passed ? `<span class="pill ok">Passed ${pct(S.final.score)}%</span>` : finalOpen() ? '<span class="pill go">Ready</span>' : '<span class="pill">Locked</span>';
  const finInner = `<div class="n" aria-hidden="true">&#9733;</div><div class="l"><b>Final exam</b><span class="mute">${finalOpen() ? `${C.finalCount} questions from every module · ${GATE.replace(/\(.*\)/, '').trim()} to pass` : 'Locked: pass all eight module quizzes to unlock.'}</span></div>${fin}`;
  $('#app').innerHTML = `
  <section class="card hero"><h1>${esc(C.title)}</h1>
  <p class="mute">${esc(C.speaker)}. For each module: watch the segment, read the notes, do the hands-on lab, then pass the quiz (${GATE}) to unlock the next one.</p>
  <div class="row">${cta}<span class="mute">${done} of ${C.modules.length} modules passed</span>${S.unlockAll ? '<span class="pill warn">All modules unlocked</span>' : ''}</div>
  ${memOnly ? '<p class="fb bad" role="status">This browser is blocking storage, so progress will be lost when you close the tab. Use Progress, then Download, to save it.</p>' : ''}</section>
  <p class="card note" role="note"><b>Read this first.</b> ${esc(C.disclaimer)}</p>
  <h2>Modules</h2><ol class="mods">${items}</ol>
  <ul class="mods"><li>${finalOpen() ? `<a class="card mod" href="#final">${finInner}</a>` : `<div class="card mod locked" role="group" aria-label="Final exam (locked)">${finInner}</div>`}</li></ul>
  <section class="card"><h2>Summary of the talk</h2><ul>${C.digest.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
  <details><summary>Glossary</summary><dl class="gl">${C.glossary.map(g => `<dt>${esc(g[0])}</dt><dd>${esc(g[1])}</dd>`).join('')}</dl></details></section>
  <p style="margin-top:28px"><a class="plink" href="#reset">Progress: download, import or reset</a></p>`;
}

/* ---------- module page ---------- */
const ytId = u => { const m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; };
const driveId = u => { const m = String(u || '').match(/^https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/); return m ? m[1] : null; };
function videoCard(m) {
  const t = m.range[0], yt = ytId(C.videoUrl), dr = driveId(C.videoUrl);
  if (C.videoClips) return `<div class="card" id="vcard"><video id="vid" controls playsinline preload="metadata" src="${esc(C.videoClips)}m${m.id}.mp4" aria-label="Talk video, Module ${m.id} segment"><track kind="captions" srclang="en" label="English (auto-generated)" src="${esc(C.videoClips)}m${m.id}.vtt" default></video>
    <p class="mute">This clip is the module's part of the talk (${mmss(t)}-${mmss(m.range[1])} in the full recording). Captions are machine-generated and may contain errors.</p></div>`;
  if (dr) return `<div class="card"><div class="vid"><iframe title="Talk video, Module ${m.id} segment" src="https://drive.google.com/file/d/${dr}/preview" allow="autoplay; fullscreen" referrerpolicy="no-referrer" loading="lazy" allowfullscreen></iframe></div>
    <div class="row"><span class="pill tsbtn">Jump to ${mmss(t)}</span><span class="mute">This module covers ${mmss(m.range[0])}-${mmss(m.range[1])}. Use the player's time bar to jump there.</span></div>
    <p class="mute">Needs a Google account that has been given access. <a href="https://drive.google.com/file/d/${dr}/view" target="_blank" rel="noopener noreferrer">Open in Google Drive (new tab)</a></p></div>`;
  if (yt) return `<div class="card"><div class="vid"><iframe id="yt" title="Talk video, Module ${m.id} segment" src="https://www.youtube-nocookie.com/embed/${yt}?start=${t}&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" loading="lazy" allowfullscreen></iframe></div>
    <div class="row"><button class="btn sec small" id="seek" type="button">Restart at ${mmss(t)}</button><span class="mute">This module covers ${mmss(m.range[0])}-${mmss(m.range[1])} of the talk.</span></div></div>`;
  if (/^https:\/\//.test(C.videoUrl || '')) return `<div class="card"><p>Watch this module at <b>${mmss(t)}-${mmss(m.range[1])}</b> in the original talk.</p><a class="btn" href="${esc(C.videoUrl)}" target="_blank" rel="noopener noreferrer">Open the video (new tab)</a></div>`;
  return `<div class="card"><div class="vph"><span class="pill">${mmss(t)}-${mmss(m.range[1])}</span><p><b>Video link coming soon.</b><br><span class="mute">This module covers that segment of the original talk. The notes below summarise it.</span></p></div></div>`;
}
function moduleView(id) {
  const m = C.modules.find(x => x.id === id);
  if (!m || !unlocked(id)) return false;
  const next = C.modules.find(x => x.id === id + 1);
  setTitle(`Module ${m.id}: ${m.title}`);
  $('#app').innerHTML = `
  <p><a href="#home">&larr; All modules</a></p>
  <h1>Module ${m.id}: ${esc(m.title)}</h1>
  <div class="card"><b>By the end of this module you can:</b><ul class="obj">${m.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
  <h2 class="step">Step 1 &middot; Watch</h2>${videoCard(m)}
  <h2 class="step">Step 2 &middot; Read</h2><div class="card notes">${m.notes}</div>
  <h2 class="step">Step 3 &middot; Hands-on lab</h2><div class="card" id="lab"></div>
  <h2 class="step">Step 4 &middot; Exam gate</h2>
  <div class="card"><p>${m.id < C.modules.length ? `Score at least ${GATE} to unlock Module ${m.id + 1}.` : `Score at least ${GATE} to unlock the final exam.`} Each quiz draws ${C.perQuiz} questions from a pool of ${m.quiz.length}; retries reshuffle and bring back what you missed.</p>
  <div class="row"><a class="btn" href="#quiz/${m.id}">${S.passed[m.id] ? 'Retake quiz' : 'Start quiz'}</a>
  ${S.best[m.id] != null ? `<span class="mute">Best: ${pct(S.best[m.id])}%</span>` : ''}
  ${S.passed[m.id] && next ? `<a class="btn sec" href="#m/${next.id}">Next module &rarr;</a>` : ''}${S.passed[m.id] && !next ? '<a class="btn sec" href="#home">Back to the final exam</a>' : ''}</div></div>`;
  const sk = $('#seek');
  if (sk) sk.onclick = () => { const f = $('#yt'); if (f) f.src = f.src.replace(/start=\d+/, 'start=' + m.range[0]).replace(/&autoplay=1/, '') + '&autoplay=1'; };
  const v = $('#vid');
  if (v) v.addEventListener('error', () => { $('#vcard').innerHTML = `<p>The video clip could not be loaded. Try reloading the page. This module covers <b>${mmss(m.range[0])}-${mmss(m.range[1])}</b> of the talk; the notes below summarise it.</p>`; }, true);
  ({ can: labCAN, order: labOrder, classify: labClassify, tara: labTARA }[m.lab.type])($('#lab'), m);
  return true;
}
function labDone(m, el, msg) {
  S.labs[m.id] = true; save();
  let b = $('.labdone', el); const isNew = !b;
  if (isNew) { b = document.createElement('div'); b.className = 'labdone fb ok'; b.setAttribute('role', 'status'); el.appendChild(b); }
  const fill = () => { b.textContent = 'Lab complete: ' + msg; };
  if (isNew) setTimeout(fill, 80); else fill();
}
const setRes = (r, ok, text) => { r.className = 'res ' + (ok ? 'ok' : 'bad'); r.innerHTML = `<span aria-hidden="true">${ok ? '&#10003; ' : '&#10007; '}</span>${esc(text)}`; };
const labTitle = L => `<h3>${esc(L.title)}</h3><p class="mute">${esc(L.intro)}</p>`;

/* --- lab: classify --- */
function labClassify(el, m) {
  const L = m.lab;
  el.innerHTML = labTitle(L) + L.items.map((it, i) =>
    `<div class="labrow"><div class="t"><span id="ct${m.id}_${i}">${esc(it.t)}</span><div class="res" id="r${i}" role="status"></div></div>
     <select id="s${i}" aria-labelledby="ct${m.id}_${i}"><option value="">Choose an option</option>${L.options.map((o, j) => `<option value="${j}">${esc(o)}</option>`).join('')}</select></div>`).join('') +
    `<p><button class="btn" id="chk" type="button">Check answers</button></p>`;
  $('#chk', el).onclick = () => {
    let ok = 0;
    L.items.forEach((it, i) => {
      const v = $('#s' + i, el).value, r = $('#r' + i, el), good = v !== '' && +v === it.a;
      ok += good;
      if (v === '') { r.className = 'res bad'; r.textContent = 'Choose an answer.'; } else setRes(r, good, good ? 'Correct. ' + it.why : 'Not quite. Review the notes and try again.');
    });
    if (ok === L.items.length) labDone(m, el, 'all matches correct.');
  };
  if (S.labs[m.id]) labDone(m, el, 'already completed (you can redo it).');
}

/* --- lab: order --- */
function labOrder(el, m) {
  const L = m.lab; let focus = null;
  const live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('role', 'status'); el.after(live); const prevLeave = onLeave; onLeave = () => { live.remove(); if (prevLeave) prevLeave(); };
  let arr = shuffle(L.items.map((it, i) => ({ ...it, i })));
  if (arr.every((x, i) => x.i === i)) arr.reverse();
  const draw = () => {
    el.innerHTML = labTitle(L) + `<ol class="ord">` + arr.map((it, k) =>
      `<li class="labrow"><div class="t">${esc(it.t)}<div class="res" id="o${k}" role="status"></div></div>
       <div class="row nowrap"><button class="btn sec small" type="button" data-u="${k}" aria-label="Move up: ${esc(it.t)}" ${k === 0 ? 'disabled' : ''}>&uarr;</button><button class="btn sec small" type="button" data-d="${k}" aria-label="Move down: ${esc(it.t)}" ${k === arr.length - 1 ? 'disabled' : ''}>&darr;</button></div></li>`).join('') +
      `</ol><p><button class="btn" id="chk" type="button">Check order</button></p>`;
    const mv = (k, d, key) => { const moved = arr[k].t; [arr[k], arr[k + d]] = [arr[k + d], arr[k]]; focus = key; draw(); live.textContent = `${moved} moved to position ${k + d + 1} of ${arr.length}`; };
    el.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { const k = +b.dataset.u; mv(k, -1, k - 1 === 0 ? `[data-d="0"]` : `[data-u="${k - 1}"]`); });
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { const k = +b.dataset.d; mv(k, 1, k + 1 === arr.length - 1 ? `[data-u="${k + 1}"]` : `[data-d="${k + 1}"]`); });
    if (focus) { const f = $(focus, el); if (f) f.focus(); focus = null; }
    $('#chk', el).onclick = () => {
      let ok = 0;
      arr.forEach((it, k) => { const good = it.i === k; ok += good; setRes($('#o' + k, el), good, good ? 'Correct position. ' + it.why : 'Not in the correct position yet.'); });
      if (ok === arr.length) labDone(m, el, 'the order is correct.');
    };
  };
  draw();
  if (S.labs[m.id]) labDone(m, el, 'already completed (you can redo it).');
}

/* --- lab: simulated CAN bus --- */
function labCAN(el, m) {
  const st = { sent: new Set(), refl: false };
  el.innerHTML = labTitle(m.lab) + `
  <div class="tw"><table class="ecus"><caption class="sr-only">Simulated ECUs and the CAN IDs they listen for</caption><tr><th scope="col">ECU</th><th scope="col">Listens for CAN ID</th><th scope="col">Data byte 0</th><th scope="col">State</th></tr>
   <tr><td>Door lock</td><td><code>0x1A0</code></td><td><code>01</code> unlock, <code>00</code> lock</td><td id="sd">locked</td></tr>
   <tr><td>Wipers</td><td><code>0x3B0</code></td><td><code>01</code> on, <code>00</code> off</td><td id="sw">off</td></tr>
   <tr><td>Throttle (X-by-wire demo)</td><td><code>0x0C0</code></td><td>target % in hex, <code>00</code> to <code>64</code></td><td id="st">0%</td></tr>
   <tr><td>Instrument cluster</td><td><code>0x2C0</code></td><td>RPM / 100 (the engine ECU sends this every 2 s)</td><td id="sr">-</td></tr></table></div>
  <div class="row"><button class="btn sec small" id="pause" type="button" aria-pressed="false">Pause background traffic</button></div>
  <div class="log" id="log" role="log" aria-live="off" aria-label="Simulated CAN bus log" tabindex="0"></div>
  <div class="sr-only" id="lastact" role="status"></div>
  <div class="fields">
   <label class="f"><span>CAN ID (hex, up to 7FF)</span><input type="text" id="cid" value="1A0" inputmode="text" autocomplete="off" spellcheck="false"></label>
   <label class="f"><span>Data bytes (hex, 1 to 8, space separated)</span><input type="text" id="cdat" value="01" autocomplete="off" spellcheck="false"></label>
   <div class="f"><span>&nbsp;</span><button class="btn" id="snd" type="button">Send frame</button></div></div>
  <h4>Tasks</h4><ul id="tasks" class="tasks"><li id="k1"><span aria-hidden="true">&#9744;</span><span class="sr-only st">To do: </span> Unlock the doors by sending a frame</li><li id="k2"><span aria-hidden="true">&#9744;</span><span class="sr-only st">To do: </span> Turn the wipers on</li><li id="k3"><span aria-hidden="true">&#9744;</span><span class="sr-only st">To do: </span> Command the throttle to 80% (0x50): in a real car this would be an actuation command</li></ul>
  <h4>Reflection</h4><div class="fields"><label class="f"><span>What tells an ECU who sent a frame? Look at the log.</span><select id="refl"><option value="">Choose an option</option><option value="a">The source address field</option><option value="b">A cryptographic signature</option><option value="c">Nothing: the ID names the message type, and no field identifies or authenticates the sender</option></select></label>
  <div class="f"><span>&nbsp;</span><button class="btn" id="rc" type="button">Check</button></div></div><div id="rres" role="status"></div>
  <details><summary>Optional: try it on your own Linux machine (virtual CAN only)</summary>
   <p>This uses a <b>virtual</b> CAN interface, so no hardware or vehicle is involved:</p>
   <pre>sudo apt install can-utils
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0
candump vcan0 &amp;          # terminal 1: watch the bus
cansend vcan0 1A0#01      # terminal 2: send "unlock" to ID 0x1A0</pre>
   <p><code>candump</code> shows the interface, ID and data bytes only: there is no sender field.</p></details>`;
  const log = $('#log', el), say = t => { $('#lastact', el).textContent = t; };
  const add = (t, atk) => { const d = document.createElement('div'); if (atk) d.className = 'atk'; d.textContent = t; log.appendChild(d); while (log.childElementCount > 200) log.removeChild(log.firstChild); log.scrollTop = log.scrollHeight; };
  const hx = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, '0');
  const frame = (id, data) => `vcan0  ${hx(id, 3)}   [${data.length}]  ${data.map(b => hx(b)).join(' ')}`;
  let paused = false;
  $('#pause', el).onclick = e => { paused = !paused; e.currentTarget.setAttribute('aria-pressed', paused); e.currentTarget.textContent = paused ? 'Resume background traffic' : 'Pause background traffic'; };
  const tick = setInterval(() => { if (paused) return; const b = 7 + Math.floor(Math.random() * 4); add(frame(0x2C0, [b])); $('#sr', el).textContent = '~' + b * 100 + ' rpm'; }, 2000);
  onLeave = () => clearInterval(tick);
  const mark = n => { const li = $('#k' + n, el); li.firstChild.textContent = '☑'; $('.st', li).textContent = 'Done: '; st.sent.add(n); check(); };
  const check = () => { if (st.sent.size === 3 && st.refl) labDone(m, el, 'you drove three ECUs without any sender identity or authentication check.'); };
  $('#snd', el).onclick = () => {
    const idS = $('#cid', el).value.trim(), dS = $('#cdat', el).value.trim().split(/[\s,]+/).filter(Boolean);
    const okTok = (t, n) => new RegExp('^(0x)?[0-9a-f]{1,' + n + '}$', 'i').test(t);
    const id = okTok(idS, 3) ? parseInt(idS.replace(/^0x/i, ''), 16) : NaN;
    const data = dS.every(t => okTok(t, 2)) ? dS.map(t => parseInt(t.replace(/^0x/i, ''), 16)) : [];
    if (isNaN(id) || id > 0x7FF || !data.length || data.length > 8) { add('! Invalid frame: use a hex ID up to 7FF and 1-8 hex data bytes.', true); return say('Invalid frame.'); }
    add(frame(id, data) + '   (sender: ??)', true);
    let r;
    if (id === 0x1A0) { const u = data[0] === 1; $('#sd', el).textContent = u ? 'UNLOCKED' : 'locked'; if (u) mark(1); r = 'Door ECU accepted the frame and acted on it'; }
    else if (id === 0x3B0) { const o = data[0] === 1; $('#sw', el).textContent = o ? 'ON' : 'off'; if (o) mark(2); r = 'Wiper ECU accepted the frame'; }
    else if (id === 0x0C0) { if (data[0] > 0x64) { add('! Throttle ECU expects 00 to 64 (0-100%).', true); return say('Throttle value out of range.'); } $('#st', el).textContent = data[0] + '%'; if (data[0] === 0x50) mark(3); r = 'Throttle ECU accepted the frame (simulation only)'; }
    else if (id === 0x2C0) { $('#sr', el).textContent = '~' + data[0] * 100 + ' rpm'; r = 'Instrument cluster accepted the frame and now shows a spoofed RPM'; }
    else r = 'No ECU listens to this ID; frame ignored';
    add('  -> ' + r); say(r + '.');
  };
  $('#rc', el).onclick = () => {
    const v = $('#refl', el).value, r = $('#rres', el); if (!v) return; st.refl = v === 'c';
    r.className = 'fb ' + (st.refl ? 'ok' : 'bad');
    setRes(r, st.refl, st.refl ? 'Correct. A CAN frame carries an ID that names the message type, plus data, so any node can send any ID. That is why the speaker describes the bus as having no source address, destination, encryption or authentication.' : 'Not quite. Look at the log again: each frame carries an ID and data only.'); r.className = 'fb ' + (st.refl ? 'ok' : 'bad');
    check();
  };
  if (S.labs[m.id]) labDone(m, el, 'already completed (you can redo it).');
}

/* --- lab: mini TARA --- */
const IMP = ['Negligible', 'Minor', 'Moderate', 'Severe'], FEA = ['Very low', 'Low', 'Medium', 'High'], RESP = ['Accept', 'Remediate', 'Transfer', 'Remove'];
const MATRIX = [[1, 1, 1, 1], [1, 1, 2, 2], [1, 2, 3, 4], [2, 3, 4, 5]];
const RLABEL = ['', 'Very low', 'Low', 'Medium', 'High', 'Critical'];
const riskOf = (imp, fea, safety) => Math.min(5, MATRIX[imp][fea] + (safety && imp > 0 ? 1 : 0));
function labTARA(el, m) {
  const L = m.lab, sel = (id, arr, lab) => `<label class="f"><span>${lab}</span><select id="${id}"><option value="">Choose an option</option>${arr.map((x, j) => `<option value="${j}">${x}</option>`).join('')}</select></label>`;
  el.innerHTML = labTitle(L) + `<div id="mx"></div>` + L.scenarios.map((s, i) =>
    `<fieldset class="card sc" aria-describedby="sn${i}"><legend>Scenario ${i + 1}</legend><p id="sn${i}">${esc(s.name)}</p><div class="fields">${sel('i' + i, IMP, 'Dominant impact (' + esc(s.cat) + ')')}${sel('f' + i, FEA, 'Attack feasibility')}${sel('p' + i, RESP, 'Risk response')}</div><div class="res" id="t${i}" role="status"></div></fieldset>`).join('') +
    `<p><button class="btn" id="chk" type="button">Check all scenarios</button></p>`;
  const mxHtml = `<table class="mxt"><caption>Illustrative risk matrix (impact by feasibility)</caption><thead><tr><th scope="col"><span class="sr-only">Impact</span></th>${FEA.map(f => `<th scope="col">${f}</th>`).join('')}</tr></thead><tbody>` +
    [3, 2, 1, 0].map(ii => `<tr><th scope="row">${IMP[ii]}</th>${[0, 1, 2, 3].map(ff => { const r = MATRIX[ii][ff]; return `<td class="r${r}" data-i="${ii}" data-f="${ff}">${RLABEL[r]}</td>`; }).join('')}</tr>`).join('') + `</tbody></table><p class="mute" id="mxcap" role="status"></p>`;
  $('#mx', el).innerHTML = mxHtml;
  const drawMx = (hi, hf, i) => {
    el.querySelectorAll('#mx td').forEach(td => { const on = +td.dataset.i === hi && +td.dataset.f === hf; td.classList.toggle('hit', on); td.textContent = RLABEL[MATRIX[+td.dataset.i][+td.dataset.f]] + (on ? ' (selected)' : ''); });
    const safety = hi != null && hf != null && L.scenarios[i].cat === 'Safety';
    $('#mxcap', el).textContent = hi != null && hf != null ? `Scenario ${i + 1}: ${IMP[hi]} impact x ${FEA[hf].toLowerCase()} feasibility. The matrix cell reads ${RLABEL[MATRIX[hi][hf]]}${safety && hi > 0 ? `; safety adds one level, so the risk is ${RLABEL[riskOf(hi, hf, true)]}` : ''}.` : 'Pick an impact level and a feasibility for a scenario to see where it lands.';
  };
  drawMx(null, null, 0);
  L.scenarios.forEach((s, i) => ['i', 'f'].forEach(k => $('#' + k + i, el).onchange = () => { const a = $('#i' + i, el).value, b = $('#f' + i, el).value; drawMx(a === '' ? null : +a, b === '' ? null : +b, i); }));
  $('#chk', el).onclick = () => {
    let ok = 0;
    L.scenarios.forEach((s, i) => {
      const a = $('#i' + i, el).value, b = $('#f' + i, el).value, c = $('#p' + i, el).value, r = $('#t' + i, el);
      const fs = r.closest('fieldset'); fs.classList.remove('ok', 'bad');
      if (a === '' || b === '' || c === '') { r.className = 'res bad'; r.textContent = 'Choose all three values.'; return; }
      const safety = s.cat === 'Safety', got = riskOf(+a, +b, safety), want = s.okRisk || [riskOf(s.impact, s.feas, safety)];
      const feaOk = (s.okFeas || [s.feas]).includes(+b), good = +a === s.impact && feaOk && want.includes(got) && s.resp.includes(+c);
      ok += good; fs.classList.add(good ? 'ok' : 'bad');
      setRes(r, good, good ? 'Correct. ' + s.why : `Not quite: you rated this ${RLABEL[got].toLowerCase()} risk with the response "${RESP[+c]}". Re-check the matrix cell and whether the response fits that level.`);
    });
    if (ok === L.scenarios.length) labDone(m, el, 'you can rate risk and choose a defensible response.');
  };
  if (S.labs[m.id]) labDone(m, el, 'already completed (you can redo it).');
}

/* ---------- quiz engine ---------- */
function pool(id) {
  const mods = id === 'final' ? C.modules : [C.modules.find(x => x.id === id)];
  return mods.flatMap(m => m.quiz.map(q => ({ ...q, key: m.id + ':' + hs(q.q), mod: m.id })));
}
function draw(id) {
  const p = pool(id), n = id === 'final' ? C.finalCount : C.perQuiz, miss = S.missed[id] || [];
  if (id === 'final') {
    const by = {}; shuffle(p).forEach(q => (by[q.mod] = by[q.mod] || []).push(q));
    const keys = shuffle(Object.keys(by)), out = []; let any = true;
    while (out.length < n && any) { any = false; for (const k of keys) { if (out.length < n && by[k].length) { out.push(by[k].pop()); any = true; } } }
    return shuffle(out);
  }
  return shuffle(shuffle(p.filter(q => miss.includes(q.key))).concat(shuffle(p.filter(q => !miss.includes(q.key)))).slice(0, n));
}
function startQuiz(id) {
  if (id !== 'final' && (!C.modules.some(m => m.id === id) || !unlocked(id))) return false;
  if (id === 'final' && !finalOpen()) return false;
  Q = { id, qs: draw(id).map(q => q.type === 'fb' ? q : { ...q, order: shuffle(q.opts.map((_, i) => i)) }), i: 0, score: 0, wrong: [], answered: false, sel: new Set() };
  renderQ(); return true;
}
function renderQ() {
  const { id, qs, i } = Q, q = qs[i], title = id === 'final' ? 'Final exam' : 'Module ' + id + ' quiz';
  setTitle(`${title}: question ${i + 1} of ${qs.length}`);
  const kind = q.type === 'ms' ? 'checkbox' : 'radio';
  const body = q.type === 'fb' ? `<label class="sr-only" for="fbin">Your answer</label><input type="text" id="fbin" autocomplete="off" spellcheck="false" placeholder="Type your answer">`
    : q.order.map(k => `<label class="opt"><input type="${kind}" name="o" value="${k}"><span class="mk"></span><span class="tx">${esc(q.opts[k])}</span></label>`).join('');
  $('#app').innerHTML = `<p><a href="${id === 'final' ? '#home' : '#m/' + id}">&larr; Leave quiz</a></p>
  <h1>${title}</h1><p class="mute">Question ${i + 1} of ${qs.length}${q.type === 'ms' ? ' &middot; select all that apply' : ''}</p>
  <div class="prog" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${i}" aria-valuetext="${i} of ${qs.length} answered"><i style="width:${pct(i / qs.length)}%"></i></div>
  <fieldset class="card qa"><legend class="sr-only">Question ${i + 1}</legend><h2 class="q" id="qq" tabindex="-1">${esc(q.q)}</h2><div id="opts" ${q.type === 'fb' ? '' : `role="${q.type === 'ms' ? 'group' : 'radiogroup'}" aria-labelledby="qq"`}>${body}</div>
  <div id="fbk" role="status" aria-live="polite"></div>
  <div class="actions"><button class="btn" id="go" type="button">Check answer</button></div></fieldset>`;
  Q.answered = false; Q.sel = new Set();
  document.querySelectorAll('#opts input').forEach(inp => inp.addEventListener('change', () => {
    Q.sel = new Set([...document.querySelectorAll('#opts input:checked')].map(x => +x.value));
    document.querySelectorAll('#opts .opt').forEach(l => l.classList.toggle('sel', l.querySelector('input').checked));
  }));
  $('#go').onclick = onGo;
  const f = $('#fbin'); if (f) f.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); onGo(); } };
  const h = $('#qq'); h.focus({ preventScroll: true });
}
const norm = s => String(s).toLowerCase().replace(/[-.]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function onGo() {
  const q = Q.qs[Q.i];
  if (Q.answered) { Q.i++; return Q.i < Q.qs.length ? renderQ() : finishQuiz(); }
  let good;
  if (q.type === 'fb') {
    const v = norm($('#fbin').value);
    if (!v) { $('#fbk').innerHTML = '<div class="fb bad">Type an answer first.</div>'; return; }
    const st = x => x.replace(/s$/, ''); good = q.accepted.some(a => st(norm(a)) === st(v) || st(norm(a)).replace(/ /g, '') === st(v).replace(/ /g, '')); $('#fbin').readOnly = true;
  } else {
    if (!Q.sel.size) { $('#fbk').innerHTML = '<div class="fb bad">Select an answer first.</div>'; return; }
    const ans = new Set(q.type === 'mc' ? [q.ans] : q.ans);
    good = Q.sel.size === ans.size && [...Q.sel].every(k => ans.has(k));
    document.querySelectorAll('#opts .opt').forEach(l => {
      const inp = l.querySelector('input'), k = +inp.value; inp.disabled = true;
      const mk = $('.mk', l);
      if (ans.has(k)) { l.classList.add('right'); mk.innerHTML = '<span class="sr-only">(correct answer)</span><span aria-hidden="true">&#10003;</span>'; }
      else if (Q.sel.has(k)) { l.classList.add('wrong'); mk.innerHTML = '<span class="sr-only">(your choice, incorrect)</span><span aria-hidden="true">&#10007;</span>'; }
    });
  }
  Q.answered = true;
  if (good) Q.score++; else Q.wrong.push(q);
  const ans = q.type === 'fb' ? ` Accepted: ${esc(q.accepted.join(' / '))}.` : '';
  $('#fbk').innerHTML = `<div class="fb ${good ? 'ok' : 'bad'}"><b>${good ? 'Correct.' : 'Incorrect.'}</b> <span>${esc(q.why)}${ans} <i class="mute">(Video about ${mmss(q.t)})</i></span></div>`;
  $('#go').textContent = Q.i < Q.qs.length - 1 ? 'Next question' : 'See result'; $('#go').focus({ preventScroll: true });
}
function finishQuiz() {
  const { id, qs, score, wrong } = Q, frac = score / qs.length, passed = frac >= C.pass, key = id;
  const was = id === 'final' ? !!(S.final && S.final.passed) : !!S.passed[id];
  if (id === 'final') S.final = { score: Math.max(frac, S.final ? S.final.score : 0), passed: passed || was };
  else { S.best[id] = Math.max(frac, S.best[id] || 0); if (passed) S.passed[id] = true; }
  S.missed[key] = wrong.map(q => q.key); S.attempts[key] = (S.attempts[key] || 0) + 1; save(); header();
  setTitle((id === 'final' ? 'Final exam' : 'Module ' + id + ' quiz') + ' result');
  const by = {}; qs.forEach(q => { by[q.mod] = by[q.mod] || { n: 0, ok: 0 }; by[q.mod].n++; if (!wrong.includes(q)) by[q.mod].ok++; });
  const brk = id === 'final' ? `<h3>Score by module</h3><ul class="brk">` + Object.keys(by).sort((a, b) => a - b).map(k => `<li><span>${esc(C.modules[k - 1].title)}</span><b>${by[k].ok}/${by[k].n}</b>${by[k].ok < by[k].n ? ` <a href="#m/${k}">Review</a>` : ''}</li>`).join('') + '</ul>' : '';
  const nextId = typeof id === 'number' ? id + 1 : null, hasNext = nextId && nextId <= C.modules.length;
  const tone = passed ? 'ok' : (was || frac >= 0.6) ? 'warn' : 'bad';
  const need = Math.ceil(C.pass * qs.length), gateN = `${need} of ${qs.length} (${pct(C.pass)}%)`;
  const msg = passed ? (id === 'final' ? 'Passed. You have completed the course.' : hasNext ? `Passed. Module ${nextId} is unlocked.` : 'Passed. The final exam is unlocked.')
    : `${gateN} is needed to pass.${was ? ' You already passed this earlier, so this attempt does not change that.' : id === 'final' ? ' Review the modules you missed, then take a new draw.' : ' Review the notes and retry; the questions you missed come back first.'}`;
  const prim = passed ? (hasNext ? `<a class="btn" href="#m/${nextId}">Go to Module ${nextId}</a>` : id === 'final' ? '<a class="btn" href="#home">Back to home</a>' : '<a class="btn" href="#home">Go to the final exam</a>') : (id === 'final' ? '' : `<a class="btn" href="#m/${id}">Review the module</a>`);
  $('#app').innerHTML = `<h1>${id === 'final' ? 'Final exam' : 'Module ' + id + ' quiz'} result</h1>
  <div class="card res-card"><div class="ring ${tone}" style="--p:${pct(frac)}" role="img" aria-label="${pct(frac)} percent"><span>${pct(frac)}%</span></div>
  <div><p><b>${score} of ${qs.length} correct.</b> ${msg}</p>
  <div class="row">${prim}<button class="btn sec" id="again" type="button">${id === 'final' ? 'Take a new draw' : 'Retry quiz'}</button><a class="btn sec" href="#home">Home</a></div></div></div>
  ${brk}${id === 'final' ? `<p class="card note" role="note">${esc(C.disclaimer)}</p>` : ''}
  ${wrong.length ? `<h2>Review what you missed</h2>` + wrong.map(q => `<div class="card"><b>${esc(q.q)}</b><p class="mute">${esc(q.why)} <i>(Video about ${mmss(q.t)})</i></p></div>`).join('') : ''}`;
  $('#again').onclick = () => startQuiz(id);
  focusHeading();
}

/* ---------- progress: export / import / reset ---------- */
function resetView() {
  setTitle('Progress');
  $('#app').innerHTML = `<p><a href="#home">&larr; Home</a></p><h1>Progress</h1>
  <div class="card"><p class="mute">Progress is stored only in this browser. Download it to keep a copy or move it to another browser or device.</p>
  <div class="row"><button class="btn sec" id="dl" type="button">Download progress (JSON)</button>
  <label class="btn sec" for="imp">Import progress</label><input type="file" id="imp" accept="application/json,.json" class="sr-only"></div>
  <hr><h2>Module access</h2><p class="mute">${S.unlockAll ? 'All modules and the final exam are open. Your scores and passed status are unchanged.' : 'Skip the 80% gates so you can open any module, or the final exam, in any order. Your scores and passed status are not changed.'}</p>
  <button class="btn sec" id="unl" type="button" aria-pressed="${S.unlockAll}">${S.unlockAll ? 'Re-lock modules (follow my scores)' : 'Unlock all modules'}</button>
  <div id="pmsg" role="status"></div><details><summary>Show saved data</summary><pre id="pre">${esc(JSON.stringify(S, null, 2))}</pre></details>
  <hr><p>Reset erases every score and lab completion in this browser.</p><button class="btn danger" id="rst" type="button">Reset all progress</button></div>`;
  $('#unl').onclick = e => { S.unlockAll = !S.unlockAll; save(); header(); const b = e.currentTarget; b.setAttribute('aria-pressed', S.unlockAll); b.textContent = S.unlockAll ? 'Re-lock modules (follow my scores)' : 'Unlock all modules'; $('#pre').textContent = JSON.stringify(S, null, 2); msg(S.unlockAll ? 'All modules and the final exam are now unlocked.' : 'Modules follow your scores again.', true); };
  const msg = (t, ok) => { const p = $('#pmsg'); p.className = 'fb ' + (ok ? 'ok' : 'bad'); p.textContent = t; };
  $('#dl').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = 'course-progress.json'; a.click(); msg('Progress downloaded.', true); };
  $('#imp').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!isObj(o) || !isObj(o.passed)) throw 0; if (!confirm('Replace your current progress with the imported file?')) return msg('Import cancelled.', true); S = normalise(o); save(); header(); $('#pre').textContent = JSON.stringify(S, null, 2); msg('Progress imported.', true); } catch (x) { msg('That file is not a valid progress export.', false); } };
    r.readAsText(f);
  };
  $('#rst').onclick = () => { if (confirm('Erase all progress in this browser?')) { try { localStorage.removeItem(KEY); } catch (e) { } S = blank(); header(); $('#pre').textContent = JSON.stringify(S, null, 2); msg('Progress reset.', true); } };
}

route();
})();
