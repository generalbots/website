// GBFlood · full-page ASCII transition for theme / language changes.
// A swarm of glyph tiles colonises the screen and settles into ASCII "armour": dim mail texture
// everywhere, two meshing gears as shaded plates with contour glyphs on their rims.
// Rendering runs in a Worker on an OffscreenCanvas (glyphs blitted from a pre-rendered atlas), so the
// page's own work never stalls the animation and the animation never stalls the page. Falls back to
// the main thread where OffscreenCanvas/Worker are unavailable.
// GBFlood.swap(opts, fn)  cover → fn() → reveal (same page)
// opts: { theme:'dark'|'light' (destination), label, style:'Enxame'|'Origem'|'Ruído', color:'Arco-íris'|'Mono', speed, art, x, y (0–1 origin) }
(() => {
  const inWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
  if (!inWorker && window.GBFlood) return;
  const TH = { dark: { bg: '#000000', ink: '#ededed', L: '79.9%' }, light: { bg: '#ffffff', ink: '#171717', L: '52%' } };
  const GL = 'cseo6%&8@()x01{}<>/\\=+*#';
  const MONO = '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

  // ── renderer · shared by the worker and main thread, device pixels throughout ──
  function core(post) {
    const RAMP = 'cseo6%&8@', MAIL = 'cs(oe)x', FLYG = '01{}<>/\\=+*#', FLY = 200;
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const raf = f => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(f) : setTimeout(f, 16));
    const mk = (W, H) => typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
    let S = null, cv = null, ctx = null, L = null, lx = null, gen = 0;

    function gear(dx, dy, R, n, rot, cell) {
      // 0 outside · 1 plate · 2 rim · 3 blank halo that separates the gear from the mail
      const p = Math.hypot(dx, dy), ri = R * 0.34, h = cell * 1.8;
      if (p > R + h || p < ri - h) return 0;
      const cs = Math.cos((Math.atan2(dy, dx) - rot) * n), ro = cs > 0.1 ? R : R * 0.8;
      if (p > ro) return p <= ro + h ? 3 : 0;
      if (p < ri) return 3;
      return (p > ro - cell * 1.7 || p < ri + cell * 1.7 || (cs > 0.1 && cs < 0.42 && p > R * 0.8)) ? 2 : 1;
    }

    function times(pow) {
      const { cols, rows, cwd, chd, W, H, tt, ang, order, m } = S, n = cols * rows, noise = m.style === 'Ruído';
      let seeds = [];
      if (m.style === 'Origem' && m.x != null) seeds = [{ x: m.x * W, y: m.y * H, d: 0, v: 1 }];
      else for (let j = 0, c = m.narrow ? 4 : 6; j < c; j++) seeds.push({ x: Math.random() * W, y: Math.random() * H, d: Math.random() * 0.22, v: 0.8 + Math.random() * 0.5 });
      const diag = Math.hypot(W, H); let lo = 1e9, hi = -1e9;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, x = c * cwd + cwd / 2, y = r * chd + chd / 2;
        if (noise) { tt[i] = Math.random(); ang[i] = Math.random() * 6.283; }
        else {
          let best = 1e9, bx = 0, by = 0;
          for (let j = 0; j < seeds.length; j++) { const s = seeds[j], d = Math.hypot(x - s.x, y - s.y) / diag / s.v + s.d; if (d < best) { best = d; bx = x - s.x; by = y - s.y; } }
          tt[i] = best + (S.nz(x * 1.7 + 31, y * 1.7 + 17) - 0.5) * 0.16 + Math.random() * 0.035;
          ang[i] = Math.atan2(by, bx) + (Math.random() - 0.5) * 1.5;
        }
        if (tt[i] < lo) lo = tt[i]; if (tt[i] > hi) hi = tt[i];
      }
      const span = S.D - FLY, k = span / ((hi - lo) || 1), B = 1024, cnt = new Uint32Array(B + 1);
      for (let i = 0; i < n; i++) { tt[i] = Math.pow((tt[i] - lo) * k / span, pow) * span; cnt[Math.min(B - 1, (tt[i] / span * B) | 0) + 1]++; }
      for (let b = 0; b < B; b++) cnt[b + 1] += cnt[b];
      for (let i = 0; i < n; i++) order[cnt[Math.min(B - 1, (tt[i] / span * B) | 0)]++] = i;
      S.p = 0;
    }

    function settle(i) {
      const { cols, cwd, chd } = S, c = i % cols, x = c * cwd, y = ((i - c) / cols) * chd;
      lx.globalAlpha = 1; lx.fillRect(x, y, cwd, chd);
      lx.globalAlpha = S.ba[i]; lx.drawImage(S.atlas, S.bg[i] * cwd, S.hueRow[c] * chd, cwd, chd, x, y, cwd, chd);
    }
    function lift(i) { const { cols, cwd, chd } = S, c = i % cols; lx.clearRect(c * cwd, ((i - c) / cols) * chd, cwd, chd); }
    function fill() { lx.clearRect(0, 0, S.W, S.H); lx.fillStyle = S.m.bg; for (let i = 0, n = S.cols * S.rows; i < n; i++) settle(i); }
    // the reveal's timing field is computed on entering hold, so the hold → reveal switch does no work
    function setPhase(p) { S.phase = p; S.t0 = performance.now(); S.p = 0; if (p === 'cover') times(1); else if (p === 'hold') times(1.35); }

    function mount(m) {
      const { W, H, cwd, chd } = m;
      cv = m.canvas; cv.width = W; cv.height = H; ctx = cv.getContext('2d'); L = mk(W, H); lx = L.getContext('2d');
      const cols = Math.ceil(W / cwd), rows = Math.ceil(H / chd), n = cols * rows, gi = s => Array.from(s, ch => m.glyphs.indexOf(ch));
      const f = 6.283 / (Math.min(W, H) * 0.62), a = [0, 0, 0, 0].map(() => Math.random() * 6.283);
      const nz = (x, y) => 0.5 + 0.25 * Math.sin(x * f + a[0] + 1.7 * Math.sin(y * f * 1.3 + a[1])) + 0.25 * Math.sin(y * f * 0.9 + a[2] + 1.3 * Math.sin(x * f * 1.1 + a[3]));
      const mail = gi(MAIL), hues = m.rowsN - 1;
      const hueRow = new Uint8Array(cols); if (hues) for (let c = 0; c < cols; c++) hueRow[c] = 1 + Math.min(hues - 1, (c / cols * hues) | 0);
      const bg = new Uint8Array(n), ba = new Float32Array(n), k = new Float32Array(n);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, v = nz(c * cwd, r * chd);
        bg[i] = mail[(Math.floor(v * 9) + ((c + r) & 1)) % mail.length]; ba[i] = 0.1 + 0.2 * v; k[i] = Math.random();
      }
      const R = Math.min(W, H) * (m.narrow ? 0.31 : 0.3), R2 = R * 0.5, phi = 0.56, dist = 0.9 * (R + R2);
      const g1x = W / 2 - 0.32 * R, g1y = H * 0.47 - 0.1 * R;
      S = { m, W, H, cwd, chd, cols, rows, nz, atlas: m.atlas, hueRow, hues, bg, ba, k, tt: new Float32Array(n), ang: new Float32Array(n), order: new Uint32Array(n), p: 0,
        ramp: gi(RAMP), flyg: gi(FLYG), ctr: gi('()=\\/'), mail, D: m.D, e0: m.e0, phase: 'hold', t0: performance.now(), holdUntil: null,
        R, R2, phi, g1x, g1y, g2x: g1x + Math.cos(phi) * dist, g2y: g1y + Math.sin(phi) * dist,
        labelY: Math.min(rows - 3, Math.round((g1y + 1.22 * R) / chd) + 2) * chd };
      lx.fillStyle = m.bg; ctx.fillStyle = m.bg;
      if (m.full) { fill(); times(1.35); } else setPhase('cover');
      const g = ++gen;
      const loop = () => {
        if (!S || g !== gen) return;
        const now = performance.now(), t = now - S.t0;
        draw(now);
        if (!S.drawn) { S.drawn = true; post({ type: 'first' }); }
        if (S.phase === 'cover' && t >= S.D) { setPhase('hold'); post({ type: 'covered' }); }
        else if (S.phase === 'hold' && S.holdUntil != null && now >= S.holdUntil) { S.holdUntil = null; setPhase('reveal'); post({ type: 'reveal' }); }
        else if (S.phase === 'reveal' && t >= S.D) { ctx.clearRect(0, 0, S.W, S.H); S = null; post({ type: 'done' }); return; }
        raf(loop);
      };
      raf(loop);
    }

    function draw(now) {
      const { cols, rows, cwd, chd, tt, ang, order, k, atlas, hueRow, flyg } = S, n = cols * rows, t = now - S.t0, ph = S.phase, reach = cwd * 3.2;
      let a0 = 0, a1 = 0, step = 1;
      if (ph === 'cover') {
        while (S.p < n && tt[order[S.p]] + FLY <= t) settle(order[S.p++]);
        a0 = S.p; a1 = a0; while (a1 < n && tt[order[a1]] <= t) a1++;
      } else if (ph === 'reveal') {
        while (S.p < n && tt[order[S.p]] <= t) lift(order[S.p++]);
        a1 = S.p; a0 = a1; while (a0 > 0 && t - tt[order[a0 - 1]] < FLY) a0--;
      } else if (ph === 'hold') {
        // while waiting for the page, the mail keeps crawling: a few cells re-roll every frame
        const mail = S.mail;
        for (let j = 0, c = Math.max(8, (n * 0.012) | 0); j < c; j++) { const i = (Math.random() * n) | 0; S.bg[i] = mail[(Math.random() * mail.length) | 0]; settle(i); }
      }
      ctx.globalAlpha = 1; ctx.clearRect(0, 0, S.W, S.H); ctx.drawImage(L, 0, 0);
      // swarm · tiles in flight (arriving on cover, leaving on reveal)
      const tick = (now / 60) | 0, cover = ph === 'cover';
      for (let q = a0; q < a1; q += step) {
        const i = order[q], c = i % cols, r = (i - c) / cols, u = clamp((t - tt[i]) / FLY, 0, 1);
        const e = cover ? 1 - (1 - u) * (1 - u) : u, off = cover ? -(1 - e) * reach : e * reach;
        const x = Math.round(c * cwd + Math.cos(ang[i]) * off), y = Math.round(r * chd + Math.sin(ang[i]) * off);
        ctx.globalAlpha = cover ? e : 1 - e; ctx.fillRect(x, y, cwd, chd);
        ctx.drawImage(atlas, flyg[(i * 7 + tick) % flyg.length] * cwd, hueRow[c] * chd, cwd, chd, x, y, cwd, chd);
      }
      // armour · gears as shaded plates, contour glyphs on the rims
      if (S.m.art) {
        const rot = (Date.now() - S.e0) / 1000 * 1.4, rot2 = S.phi + Math.PI - Math.PI / 6 - (rot - S.phi) * 2, ramp = S.ramp, ctr = S.ctr;
        const hb = cwd * 2;
        const c0 = Math.max(0, Math.floor((S.g1x - S.R - hb) / cwd)), c1 = Math.min(cols - 1, Math.ceil((S.g2x + S.R2 + hb) / cwd));
        const r0 = Math.max(0, Math.floor((S.g1y - S.R - hb) / chd)), r1 = Math.min(rows - 1, Math.ceil((Math.max(S.g1y + S.R, S.g2y + S.R2) + hb) / chd));
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
          const i = r * cols + c, x = c * cwd + cwd / 2, y = r * chd + chd / 2;
          let dx = x - S.g1x, dy = y - S.g1y, mk2 = gear(dx, dy, S.R, 12, rot, cwd);
          if (mk2 !== 1 && mk2 !== 2) {
            const ex = x - S.g2x, ey = y - S.g2y, m2 = gear(ex, ey, S.R2, 6, rot2, cwd);
            if (m2 === 1 || m2 === 2) { dx = ex; dy = ey; mk2 = m2; } else mk2 = mk2 || m2;
          }
          if (!mk2) continue;
          let vis = 1;
          if (cover) { vis = clamp((t - tt[i] - FLY) / 200, 0, 1); if (vis <= 0) continue; }
          else if (ph === 'reveal' && t >= tt[i]) continue;
          if (mk2 === 3) { ctx.globalAlpha = vis; ctx.fillRect(c * cwd, r * chd, cwd, chd); continue; }
          const p = Math.hypot(dx, dy) || 1, ux = dx / p, uy = dy / p;
          let gi, row = 0, al;
          if (mk2 === 2) {
            gi = Math.abs(ux) > 0.78 ? (ux < 0 ? ctr[0] : ctr[1]) : Math.abs(uy) > 0.78 ? ctr[2] : (ux * uy < 0 ? ctr[3] : ctr[4]);
            if (S.hues) row = 1 + Math.min(S.hues - 1, (((Math.atan2(dy, dx) * 57.2958 + 360) % 360) / 360 * S.hues) | 0);
            al = vis;
          } else {
            const lum = clamp(0.4 + 0.5 * ((-0.6 * ux - 0.8 * uy + 1) / 2) + (k[i] - 0.5) * 0.18, 0, 0.999);
            gi = ramp[(lum * ramp.length) | 0]; al = vis * (0.7 + 0.3 * lum);
          }
          ctx.globalAlpha = 1; ctx.fillRect(c * cwd, r * chd, cwd, chd);
          ctx.globalAlpha = al; ctx.drawImage(atlas, gi * cwd, row * chd, cwd, chd, c * cwd, r * chd, cwd, chd);
        }
      }
      const lab = S.m.lab, la = ph === 'hold' ? 1 : cover ? clamp((t / S.D - 0.8) / 0.2, 0, 1) : clamp(1 - t / (0.2 * S.D), 0, 1);
      if (lab && la > 0) { ctx.globalAlpha = la; ctx.drawImage(atlas, 0, lab.y, lab.w, lab.h, Math.round((S.W - lab.w) / 2), S.labelY, lab.w, lab.h); }
      ctx.globalAlpha = 1;
    }

    return m => {
      if (m.type === 'mount') mount(m);
      else if (m.type === 'hold' && S) S.holdUntil = performance.now() + m.ms;
      else if (m.type === 'atlas' && S) { S.atlas = m.atlas; if (S.phase === 'hold') fill(); }
      else if (m.type === 'kill') { S = null; gen++; }
    };
  }

  if (inWorker) {
    const render = core(message => self.postMessage(message));
    self.onmessage = event => render(event.data);
    return;
  }

  // Load the worker from this same script so it works under the site's CSP.
  const workerUrl = document.currentScript?.src;
  const canOff = typeof OffscreenCanvas !== 'undefined' && !!HTMLCanvasElement.prototype.transferControlToOffscreen && typeof Worker !== 'undefined';
  let wk = null, local = null, cur = null;

  function onMsg(m) {
    if (!cur) return;
    if (m.type === 'covered') {
      const transition = cur;
      applyChange(transition);
      settled(4, 1200).then(() => {
        if (cur === transition) send({ type: 'hold', ms: transition.HOLD });
      });
    }
    else if (m.type === 'reveal') cur.cv.style.pointerEvents = 'none';
    else if (m.type === 'done') finish();
  }
  function send(m, tr) { if (wk) wk.postMessage(m, tr || []); else if (local) local(m); }
  function applyChange(transition) {
    if (!transition.change) return;
    const change = transition.change;
    transition.change = null;
    change();
  }

  function finish() {
    if (!cur) return;
    const transition = cur;
    cur = null;
    clearTimeout(transition.dog);
    transition.cv.remove();
    try { send({ type: 'kill' }); }
    finally {
      applyChange(transition);
      transition.resolve();
    }
  }

  // resolves once the page's own thread has produced `need` smooth frames in a row (or after `max` ms)
  function settled(need, max) {
    return new Promise(res => {
      let ok = 0, last = performance.now(), done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      const tick = now => { if (done) return; const d = now - last; last = now; ok = d < 34 ? ok + 1 : 0; if (ok >= need) fin(); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick); setTimeout(fin, max);
    });
  }

  function engine() {
    if (wk || local) return;
    if (canOff && workerUrl) try {
      wk = new Worker(workerUrl);
      wk.onmessage = e => onMsg(e.data);
      wk.onerror = () => { wk.terminate(); wk = null; local = core(onMsg); finish(); };
      return;
    } catch (e) { wk = null; }
    local = core(onMsg);
  }

  function atlas(th, mono, cwd, chd, dpr, label) {
    const colors = [th.ink]; if (!mono) for (let j = 0; j < 12; j++) colors.push('oklch(' + th.L + ' 0.15 ' + (25 + j * 25) + ')');
    const lf = '600 ' + Math.round(12 * dpr) + 'px ' + MONO, sp = (0.9 * dpr) + 'px', padX = Math.round(12 * dpr), lh = Math.round(26 * dpr);
    const mc = document.createElement('canvas').getContext('2d'); mc.font = lf; try { mc.letterSpacing = sp; } catch (e) {}
    const lw = label ? Math.ceil(mc.measureText(label).width) + padX * 2 : 0, y0 = colors.length * chd;
    const AW = Math.max(GL.length * cwd, lw, 1), AH = y0 + lh;
    const a = wk ? new OffscreenCanvas(AW, AH) : Object.assign(document.createElement('canvas'), { width: AW, height: AH }), g = a.getContext('2d');
    g.font = '600 ' + Math.round(chd * 0.66) + 'px ' + MONO; g.textAlign = 'center'; g.textBaseline = 'middle';
    colors.forEach((col, r) => { g.fillStyle = col; for (let j = 0; j < GL.length; j++) g.fillText(GL[j], j * cwd + cwd / 2, r * chd + chd / 2 + 0.5); });
    if (label) { g.fillStyle = th.bg; g.fillRect(0, y0, lw, lh); g.font = lf; try { g.letterSpacing = sp; } catch (e) {} g.textAlign = 'left'; g.fillStyle = th.ink; g.fillText(label, padX, y0 + lh / 2 + 0.5); }
    return { img: wk ? a.transferToImageBitmap() : a, rowsN: colors.length, lab: label ? { y: y0, w: lw, h: lh } : null };
  }

  function mount(o, change, resolve) {
    engine();
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); cv.dataset.gbFlood = '';
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:2147483000;display:block;pointer-events:auto';
    const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cwd = Math.round(clamp(w / 190, 6, 10) * dpr), chd = Math.round(cwd * 1.5);
    const th = TH[o.theme] || TH.dark, mono = o.color === 'Mono', speed = clamp(+o.speed || 1, 0.4, 3), D = 900 / speed;
    const at = atlas(th, mono, cwd, chd, dpr, o.label || '');
    const target = wk ? cv.transferControlToOffscreen() : cv;
    cur = { cv, change, resolve, HOLD: 180 / speed, e0: Date.now(), dog: 0 };
    document.body.appendChild(cv);
    send({ type: 'mount', canvas: target, W: Math.round(w * dpr), H: Math.round(h * dpr), cwd, chd, narrow: w < 760, atlas: at.img, glyphs: GL, rowsN: at.rowsN, lab: at.lab,
      bg: th.bg, style: o.style, art: o.art !== false, x: o.x, y: o.y, D, e0: cur.e0 }, wk ? [target, at.img] : []);
    cur.dog = setTimeout(finish, 2 * D + 3000);
  }

  let scrollRevision = 0;
  function applyWithoutScroll(change) {
    const revision = ++scrollRevision;
    const root = document.documentElement;
    const left = window.scrollX, top = window.scrollY;
    root.setAttribute('data-gb-switching', '');
    const restore = () => {
      if (window.scrollX !== left || window.scrollY !== top) {
        window.scrollTo({ left, top, behavior: 'instant' });
      }
    };
    try {
      change();
      restore();
    } finally {
      // The landing renderer can commit its layout on the next frame.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revision !== scrollRevision) return;
        restore();
        root.removeAttribute('data-gb-switching');
      }));
    }
  }

  let idle = Promise.resolve();
  window.GBFlood = {
    busy: () => !!cur,
    whenIdle: () => idle,
    swap(options, change) {
      if (cur) return idle;
      if (reduce()) {
        applyWithoutScroll(change);
        return idle;
      }
      idle = new Promise((resolve, reject) => {
        const apply = () => {
          try { applyWithoutScroll(change); }
          catch (error) { reject(error); }
        };
        try {
          mount({ style: 'Origem', color: 'Mono', ...options }, apply, resolve);
        } catch (error) {
          if (cur) finish();
          else { apply(); resolve(); }
        }
      });
      return idle;
    }
  };

  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
})();
