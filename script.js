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

/* ---------- load dynamic content (status, projects, roadmap) ---------- */
(function loadContent() {
  const caseGrid = document.getElementById('case-grid');
  const queueList = document.getElementById('queue-list');
  const statusLine = document.getElementById('status-line');

  function escapeHTML(str) {
    return String(str).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }

  function statusClass(status) {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'status-active';
    if (s === 'PLANNED') return 'status-planned';
    if (s === 'IN PROGRESS') return 'status-progress';
    return 'status-planned';
  }

  function renderProjects(projects) {
    if (!caseGrid) return;
    if (!projects || !projects.length) {
      caseGrid.innerHTML = '<p class="load-msg">No case files yet.</p>';
      return;
    }
    caseGrid.innerHTML = projects.map(function (p) {
      const tags = (p.tags || []).map(function (t) {
        return '<span>' + escapeHTML(t) + '</span>';
      }).join('');
      return (
        '<article class="case-card">' +
          '<div class="case-card-head">' +
            '<span class="status ' + statusClass(p.status) + '">' + escapeHTML(p.status || 'ACTIVE') + '</span>' +
            '<span class="case-id">' + escapeHTML(p.id || '') + '</span>' +
          '</div>' +
          '<h3>' + escapeHTML(p.title || '') + '</h3>' +
          '<p>' + escapeHTML(p.description || '') + '</p>' +
          '<div class="tags">' + tags + '</div>' +
          (p.repo ? '<a class="case-link" href="' + escapeHTML(p.repo) + '" target="_blank" rel="noopener">view repo →</a>' : '') +
        '</article>'
      );
    }).join('');
    caseGrid.removeAttribute('data-loading');
  }

  function renderRoadmap(roadmap) {
    if (!queueList) return;
    if (!roadmap || !roadmap.length) {
      queueList.innerHTML = '<li class="load-msg-li"><p class="load-msg">Nothing queued right now.</p></li>';
      return;
    }
    queueList.innerHTML = roadmap.map(function (r) {
      return (
        '<li>' +
          '<span class="status ' + statusClass(r.status) + '">' + escapeHTML(r.status || 'PLANNED') + '</span>' +
          '<div>' +
            '<h3>' + escapeHTML(r.title || '') + '</h3>' +
            '<p>' + escapeHTML(r.description || '') + '</p>' +
          '</div>' +
        '</li>'
      );
    }).join('');
    queueList.removeAttribute('data-loading');
  }

  fetch('content/portfolio.json', { cache: 'no-store' })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (statusLine && data.status) {
        statusLine.textContent = 'status: ' + data.status;
      }
      renderProjects(data.projects);
      renderRoadmap(data.roadmap);
    })
    .catch(function () {
      if (caseGrid) caseGrid.innerHTML = '<p class="load-msg">Couldn\'t load case files. Refresh, or check content/portfolio.json.</p>';
      if (queueList) queueList.innerHTML = '<li class="load-msg-li"><p class="load-msg">Couldn\'t load roadmap.</p></li>';
    });
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
