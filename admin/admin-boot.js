/* ============================================
   TANVIR ALAM — ADMIN PANEL
   Boot sequence + publish transmission effect
   ============================================ */

(function bootSequence() {
  const overlay = document.getElementById('admin-boot');
  const logEl = document.getElementById('admin-boot-log');
  const barFill = document.getElementById('admin-boot-bar-fill');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!overlay) return;

  const lines = [
    'establishing uplink...',
    'authenticating channel...',
    'decrypting workspace...',
    'connection established.',
  ];

  function hideOverlay() {
    overlay.classList.add('hidden');
    setTimeout(function () { overlay.remove(); }, 700);
  }

  // If Decap CMS takes too long or fails to mount for any reason, don't
  // trap the user behind this overlay forever.
  const safetyTimeout = setTimeout(hideOverlay, 8000);

  if (reduceMotion) {
    if (logEl) logEl.textContent = lines[lines.length - 1];
    if (barFill) barFill.style.width = '100%';
    // Still give Decap a moment to mount before removing the overlay.
    setTimeout(function () {
      clearTimeout(safetyTimeout);
      hideOverlay();
    }, 600);
    return;
  }

  let i = 0;
  function nextLine() {
    if (!logEl) return;
    if (i >= lines.length) {
      clearTimeout(safetyTimeout);
      setTimeout(hideOverlay, 400);
      return;
    }
    logEl.innerHTML = lines[i] + '<span class="cursor"></span>';
    if (barFill) barFill.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
    i++;
    setTimeout(nextLine, 480);
  }
  nextLine();
})();

/* ---------- publish transmission effect ---------- */
(function publishFX() {
  const fx = document.getElementById('admin-publish-fx');
  if (!fx) return;

  function showFX() {
    fx.classList.add('show');
    setTimeout(function () {
      fx.classList.remove('show');
    }, 1400);
  }

  // Decap's publish/save buttons don't expose a stable JS hook or event we
  // can subscribe to directly, so we listen at the document level and match
  // on visible button text — this is best-effort and may not catch every
  // Decap version's exact wording, but covers the common ones.
  document.addEventListener('click', function (e) {
    const target = e.target.closest('button, a');
    if (!target) return;
    const label = (target.textContent || '').trim().toLowerCase();
    if (label === 'publish' || label === 'publish now' || label === 'save') {
      showFX();
    }
  }, true);
})();
