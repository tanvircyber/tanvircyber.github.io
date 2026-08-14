/* ============================================
   TANVIR ALAM — PORTFOLIO
   Boot sequence, nav toggle, misc
   ============================================ */

(function bootSequence() {
  const bootLog = document.getElementById('boot-log');
  const heroIdentity = document.querySelector('.hero-identity');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealHero() {
    if (heroIdentity) heroIdentity.classList.add('boot-done');
  }

  if (!bootLog) { revealHero(); return; }

  const lines = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', text: 'tanvir_alam' },
    { type: 'gap' },
    { type: 'cmd', text: 'nmap -sV --top-ports 3 tanvir_alam.dev' },
    { type: 'out', text: 'PORT     STATE   SERVICE' },
    { type: 'out', text: '443/tcp  open    bug-bounty' },
    { type: 'out', text: '22/tcp   open    automation' },
    { type: 'out', text: '80/tcp   open    build-log' },
    { type: 'gap' },
    { type: 'cmd', text: './resolve_identity.sh' },
    { type: 'out', text: 'access: granted', ok: true },
  ];

  function escapeHTML(str) {
    return str.replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  if (reduceMotion) {
    bootLog.innerHTML = lines.map(function (line) {
      if (line.type === 'gap') return '<br>';
      if (line.type === 'cmd') return '<div class="boot-line-cmd">' + escapeHTML(line.text) + '</div>';
      return '<div class="boot-line-out' + (line.ok ? ' ok' : '') + '">' + escapeHTML(line.text) + '</div>';
    }).join('');
    revealHero();
    return;
  }

  bootLog.innerHTML = '';
  let i = 0;

  function typeLine(line, callback) {
    if (line.type === 'gap') {
      bootLog.appendChild(document.createElement('br'));
      return callback();
    }

    const div = document.createElement('div');
    div.className = line.type === 'cmd' ? 'boot-line-cmd' : 'boot-line-out' + (line.ok ? ' ok' : '');
    bootLog.appendChild(div);

    if (line.type === 'out') {
      div.textContent = line.text;
      setTimeout(callback, 90);
      return;
    }

    const text = line.text;
    let idx = 0;
    (function step() {
      div.textContent = text.slice(0, idx);
      idx++;
      if (idx <= text.length) {
        setTimeout(step, 26);
      } else {
        setTimeout(callback, 160);
      }
    })();
  }

  function next() {
    if (i >= lines.length) { revealHero(); return; }
    typeLine(lines[i], function () { i++; next(); });
  }
  next();
})();

/* ---------- copy email to clipboard ---------- */
(function copyEmail() {
  const buttons = document.querySelectorAll('[data-copy-email]');
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    const originalText = btn.textContent;
    let resetTimer = null;

    btn.addEventListener('click', function () {
      const email = btn.getAttribute('data-copy-email');

      function showCopied() {
        clearTimeout(resetTimer);
        btn.textContent = 'copied to clipboard';
        btn.classList.add('copied');
        resetTimer = setTimeout(function () {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          fallbackCopy(email);
          showCopied();
        });
      } else {
        fallbackCopy(email);
        showCopied();
      }
    });
  });

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); } catch (e) { /* no-op */ }
    document.body.removeChild(temp);
  }
})();

/* ---------- mobile nav toggle ---------- */
(function navToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;

  toggle.addEventListener('click', function () {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  list.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      list.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- footer year ---------- */
(function footerYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
