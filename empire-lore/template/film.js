// THE FILM: "Napoleon Wasn't Short", Part 3. Every frame is a pure function of t.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, S = globalThis.SCORE, Studio = globalThis.Studio;
  const Data = globalThis.Data, Subs = globalThis.Subs;
  const { ev, cut } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const CX = SAFE.x + SAFE.w / 2;
  const INK = '#2A1E1A', GOLD = '#F2B84B', PURPLE = '#6E2A8A', RED = '#C8352E', CREAM = '#F6EBD6', BLUE = '#2B4A8B';
  const TITLE = 'Bungee';
  const GROUND = 1180;

  const SUBS = Subs.fromVoice({ lines: S.vo.map((l) => ({ t: l.at, end: l.end, text: l.text, words: l.words })) }, { maxWords: 5, hold: 0.25 });
  const sceneAt = (t) => { let i = 0; for (let k = 0; k < cut.length; k++) if (t >= cut[k]) i = k; return i; };
  const appear = (t, t0, d = 0.3) => ease.outBack(clamp((t - t0) / d), 2.2);
  const decay = (t, t0, k) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);

  // ---------- shared ----------
  function sky(ctx, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function tag(ctx, text, t, t0, { y = SAFE.y + 70, bg = CREAM } = {}) {
    const k = appear(t, t0, 0.35);
    if (k <= 0) return;
    ctx.save(); ctx.translate(CX, y); ctx.rotate(-0.03); ctx.scale(k, k);
    const w = G.measure(ctx, text, 58, TITLE, 400) + 70;
    G.tornPaper(ctx, -w / 2, -52, w, 88, { fill: bg, seed: text.length * 7 });
    G.text(ctx, text, 0, 18, { size: 58, fam: TITLE, weight: 400, color: INK, align: 'center' });
    ctx.restore();
  }
  function stamp(ctx, text, x, y, t, t0, { color = RED, size = 120, rot = -0.15 } = {}) {
    const a = t - t0;
    if (a < 0) return;
    const k = a < 0.12 ? lerp(2.4, 1, ease.inQuad(a / 0.12)) : 1 + 0.06 * Math.exp(-(a - 0.12) * 12);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    ctx.globalAlpha *= clamp(a / 0.06);
    const w = G.measure(ctx, text, size, TITLE, 400) + 60;
    ctx.fillStyle = 'rgba(246,235,214,0.85)';
    ctx.beginPath(); ctx.roundRect(-w / 2, -size * 0.85, w, size * 1.15, 18); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 12; ctx.stroke();
    G.text(ctx, text, 0, size * 0.12, { size, fam: TITLE, weight: 400, color, align: 'center', boil: 0.3 });
    ctx.restore();
  }
  function bigText(ctx, text, x, y, t, t0, { size = 110, color = GOLD } = {}) {
    const k = appear(t, t0, 0.3);
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    G.text(ctx, text, 0, 0, { size, fam: TITLE, weight: 400, color, align: 'center', stroke: INK, strokeW: size * 0.1 });
    ctx.restore();
  }
  function local(ctx, o, fn) { // draw in a standing/walking person's own units
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s || 1, o.s || 1); ctx.rotate(o.rot || 0); fn(ctx); ctx.restore();
  }
  function crown(ctx, x, y, s = 1, { rot = 0, seed = 1 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    G.poly(ctx, [[-60, 30], [-66, -34], [-34, -4], [0, -46], [34, -4], [66, -34], [60, 30]], { fill: GOLD, lw: 5, seed, hatch: { color: 'rgba(160,90,0,0.35)', gap: 8 } });
    for (const [jx, jc] of [[-34, RED], [0, '#3B7DD8'], [34, RED]]) G.ellipse(ctx, jx, 12, 9, 9, { fill: jc, lw: 3, seed: seed + jx });
    ctx.restore();
  }
  function smoke(ctx, x, y, t, t0, { n = 6, size = 70, seed = 1, color = '120,110,100' } = {}) {
    const a = t - t0;
    if (a < 0 || a > 3) return;
    for (let i = 0; i < n; i++) {
      const ang = U.hash(seed, i) * Math.PI * 2, sp = 60 + U.hash(seed, i, 2) * 120;
      const r = size * (0.5 + a * 0.9) * (0.7 + U.hash(seed, i, 3) * 0.6);
      ctx.fillStyle = `rgba(${color},${0.55 * Math.max(0, 1 - a / 3)})`;
      ctx.beginPath(); ctx.arc(x + Math.cos(ang) * sp * a, y + Math.sin(ang) * sp * a - a * 60, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  function flames(ctx, x, y, t, k, seed = 0, w = 16) {
    if (k <= 0) return;
    for (let i = 0; i < 5; i++) {
      const fx = x + (i - 2) * w, h = (55 + 30 * Math.sin(t * 14 + i * 2 + seed)) * k;
      G.poly(ctx, [[fx - w * 0.9, y], [fx, y - h], [fx + w * 0.9, y]], { fill: i % 2 ? GOLD : '#E0503E', lw: 3, seed: 300 + i + seed });
    }
  }

  // ---------- Napoleon ----------
  const NAP = { skin: Ch.SKIN_TONES[1], hair: '#3A2A1E', hairStyle: 'short', outfit: 'suit', robe: BLUE, pants: '#EDE8DC', shirt: '#F4F1EA', build: 'regular' };
  function bicorne(ctx, seed = 1) {
    G.poly(ctx, [[-135, -45], [-80, -118], [0, -138], [80, -118], [135, -45], [0, -78]], { fill: '#1A1A22', lw: 5, seed });
    G.ellipse(ctx, 40, -92, 20, 20, { fill: '#2B4AA8', lw: 3, seed: seed + 1 });
    G.ellipse(ctx, 40, -92, 13, 13, { fill: '#FFFFFF', lw: 0, seed: seed + 2 });
    G.ellipse(ctx, 40, -92, 6, 6, { fill: RED, lw: 0, seed: seed + 3 });
  }
  function napoleon(ctx, o, { hat = true, epaulettes = false, coatOpen = 0, ...face } = {}) {
    const head = o.pose === 'sit' ? -254 : -404;
    Ch.person(ctx, { pose: 'stand', style: NAP, brows: 'determined', mouth: 'smirk', seed: 2000, ...o, ...face });
    local(ctx, o, (c) => {
      if (coatOpen > 0) {
        G.rrect(c, -52, -322, 104, 196, 8, { fill: '#F4F1EA', lw: 3, seed: 2101 });
        for (const sd of [-1, 1]) {
          c.save(); c.translate(sd * 78, -322); c.rotate(sd * coatOpen * 0.75);
          G.poly(c, [[0, 0], [-sd * 70, 0], [-sd * 64, 200], [0, 200]], { fill: BLUE, lw: 4, seed: 2110 + sd });
          c.restore();
        }
      }
      if (epaulettes) for (const sd of [-1, 1]) G.rrect(c, sd * 78 - 34, -338, 68, 26, 10, { fill: GOLD, lw: 3, seed: 2120 + sd });
      if (hat) { c.save(); c.translate(0, head); bicorne(c, 2130); c.restore(); }
    });
  }

  // ---------- scene 0: the myth ----------
  const PX_PER_CM = 3;
  function scene0(ctx, t) {
    sky(ctx, '#F3E6CC', '#E6D2AE');
    G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: '#CDB892', lw: 5, seed: 3 });
    // the measuring tape
    const tx = 800;
    G.rrect(ctx, tx - 40, GROUND - 200 * PX_PER_CM, 80, 200 * PX_PER_CM, 8, { fill: '#F2D25A', lw: 5, seed: 4 });
    for (let cm = 0; cm <= 200; cm += 10) {
      const y = GROUND - cm * PX_PER_CM;
      G.line(ctx, [[tx - 40, y], [tx - 40 + (cm % 50 ? 22 : 40), y]], { color: INK, lw: 3, seed: 5 + cm });
      if (cm % 50 === 0 && cm) G.text(ctx, `${cm}`, tx + 18, y + 10, { size: 26, fam: TITLE, weight: 400, color: INK, align: 'center' });
    }
    const k = t < ev.grow ? 0 : ease.outBack(clamp((t - ev.grow) / 0.35), 1.8);
    const s = lerp(0.3, 1.05, k);
    napoleon(ctx, { x: 430, y: GROUND, s, pose: 'stand', look: 0.4 }, { mouth: t < ev.grow ? 'wavy' : 'smirk', eyes: t < ev.grow ? 'wide' : 'normal' });
    if (t >= ev.grow + 0.2) {
      const y = GROUND - 168 * PX_PER_CM, a = clamp((t - ev.grow - 0.2) / 0.3);
      ctx.save(); ctx.globalAlpha *= a; ctx.setLineDash([16, 12]); ctx.strokeStyle = RED; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(300, y); ctx.lineTo(tx - 40, y); ctx.stroke(); ctx.restore();
      G.text(ctx, '≈ 1.68 m', 600, y - 18, { size: 46, fam: TITLE, weight: 400, color: RED, align: 'center', alpha: a });
    }
    // TINY?  ->  crossed out  ->  AND THAT'S NOTHING
    if (t < ev.nothing) {
      G.text(ctx, 'TINY?', CX, SAFE.y + 230, { size: 130, fam: TITLE, weight: 400, color: '#FFFFFF', align: 'center', stroke: INK, strokeW: 12 });
      if (t >= ev.grow) { const u = clamp((t - ev.grow) / 0.2); ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(CX - 220, SAFE.y + 190); ctx.lineTo(CX - 220 + 440 * u, SAFE.y + 190 - 30 * u); ctx.stroke(); }
    } else bigText(ctx, "AND THAT'S NOTHING", CX, SAFE.y + 220, t, ev.nothing, { size: 70, color: GOLD });
  }

  // ---------- scene 1: the inches and the cartoonist ----------
  function scene1(ctx, t) {
    sky(ctx, '#BFD9EC', '#E9F2F8');
    tag(ctx, 'THE INCH PROBLEM', t, cut[1]);
    const PX = 250; // px per cm
    const bars = [['FRENCH INCH', 2.7, '2.7 cm', '#3B5BA8'], ['BRITISH INCH', 2.54, '2.54 cm', RED]];
    bars.forEach(([label, cm, txt, col], i) => {
      const t0 = ev.rulers[i];
      if (t < t0) return;
      const u = ease.outCubic(clamp((t - t0) / 0.4)), y = 470 + i * 170;
      G.text(ctx, label, SAFE.x + 40, y - 18, { size: 38, fam: TITLE, weight: 400, color: INK });
      G.rrect(ctx, SAFE.x + 40, y, cm * PX * u, 70, 10, { fill: col, lw: 5, seed: 40 + i });
      G.text(ctx, txt, SAFE.x + 40 + cm * PX * u + 20, y + 52, { size: 40, fam: TITLE, weight: 400, color: col, alpha: u });
    });
    // the British cartoonist
    if (t >= ev.cartoon - 0.3) {
      const k = appear(t, ev.cartoon - 0.3, 0.3);
      ctx.save(); ctx.translate(0, (1 - k) * 300); ctx.globalAlpha *= k;
      // easel
      G.line(ctx, [[640, 1200], [700, 860]], { color: '#6B4A2E', lw: 10, seed: 51 });
      G.line(ctx, [[860, 1200], [800, 860]], { color: '#6B4A2E', lw: 10, seed: 52 });
      G.rrect(ctx, 600, 820, 300, 260, 6, { fill: '#FBF6EA', lw: 5, seed: 53 });
      // the doodle: a TINY Napoleon, drawn bit by bit
      const d = clamp((t - ev.cartoon) / 1.6);
      ctx.save(); ctx.beginPath(); ctx.rect(600, 820 + 260 * (1 - d), 300, 260 * d); ctx.clip();
      napoleon(ctx, { x: 750, y: 1060, s: 0.22, pose: 'stand' }, { mouth: 'o', eyes: 'wide' });
      ctx.restore();
      Ch.person(ctx, { x: 420, y: GROUND + 40, s: 0.85, pose: 'stand', style: { skin: Ch.SKIN_TONES[0], hair: '#C98F4E', hairStyle: 'short', facialHair: 'mustache', outfit: 'suit', robe: '#2F5E3E', pants: '#3E3428' }, handR: [230, -300], mouth: t > ev.cartoon + 1.7 ? 'open' : 'smirk', eyes: t > ev.cartoon + 1.7 ? 'happy' : 'normal', look: 0.8, seed: 2200 });
      local(ctx, { x: 420, y: GROUND + 40, s: 0.85 }, (c) => { G.rrect(c, -62, -560, 124, 110, 8, { fill: '#1A1A22', lw: 4, seed: 54 }); G.rrect(c, -95, -462, 190, 22, 8, { fill: '#1A1A22', lw: 4, seed: 55 }); });
      ctx.restore();
      if (t > ev.cartoon + 1.7) bigText(ctx, 'HA HA!', 250, 790, t, ev.cartoon + 1.7, { size: 70, color: '#FFFFFF' });
    }
  }

  // ---------- scene 2: Toulon, general at 24 ----------
  function cannonGun(ctx, t, x, y, shots) {
    const recoil = shots.reduce((a, c) => a + 30 * decay(t, c, 9), 0);
    ctx.save(); ctx.translate(x - recoil, y); ctx.rotate(-0.3);
    G.rrect(ctx, -40, -40, 280, 80, 36, { fill: '#B08A3E', lw: 6, seed: 5, hatch: { color: 'rgba(90,60,10,0.3)', gap: 10 } });
    ctx.restore();
    G.ellipse(ctx, x + 20, y + 40, 60, 60, { fill: '#6B4A2E', lw: 5, seed: 7 });
    for (const c of shots) {
      const f = decay(t, c, 10), mx = x + Math.cos(0.3) * 250, my = y - Math.sin(0.3) * 250;
      if (f > 0.02) G.rays(ctx, mx, my, { n: 12, r0: 20, r1: 180 * f + 30, color: `rgba(255,210,90,${f})`, lw: 12 });
      smoke(ctx, mx, my, t, c, { seed: 80 + Math.round(c * 10), size: 70, color: '200,190,180' });
    }
  }
  function scene2(ctx, t) {
    sky(ctx, '#C9603A', '#F2B26B');
    tag(ctx, 'TOULON, 1793', t, cut[2]);
    G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: '#7A6440', lw: 5, seed: 14 });
    cannonGun(ctx, t, 560, GROUND - 60, [ev.cannon[0]]);
    cannonGun(ctx, t, 640, GROUND - 5, [ev.cannon[1]]);
    napoleon(ctx, { x: 280, y: GROUND + 20, s: 1.1, pose: 'stand', gesture: 'point', look: 0.7 }, { epaulettes: t >= 12.6 });
    if (t >= 12.6) { const f = decay(t, 12.6, 6); if (f > 0.05) G.rays(ctx, 280, GROUND + 20 - 1.1 * 330, { n: 10, r0: 30, r1: 140, color: `rgba(255,220,120,${f})`, lw: 8 }); }
    stamp(ctx, 'GENERAL AT 24', CX, 500, t, ev.general, { size: 92, color: '#2F7D4F' });
  }

  // ---------- scene 3: he crowns himself ----------
  const POPE = { skin: Ch.SKIN_TONES[0], hair: '#E8E4DA', hairStyle: 'bald', outfit: 'thobe', robe: '#F4F1EA', build: 'regular' };
  function scene3(ctx, t) {
    sky(ctx, '#2A2034', '#4A3A4E');
    tag(ctx, 'NOTRE-DAME, 1804', t, cut[3]);
    // gothic arches and a rose window
    for (const x of [180, 820]) G.poly(ctx, [[x - 120, GROUND], [x - 120, 560], [x, 380], [x + 120, 560], [x + 120, GROUND]], { fill: '#5A4A5E', lw: 5, seed: x, hatch: { color: 'rgba(0,0,0,0.2)', gap: 14 } });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.fillStyle = ['#C8352E', '#2B4AA8', '#F2B84B', '#3E8A6A'][i % 4]; ctx.beginPath(); ctx.moveTo(CX, 560); ctx.arc(CX, 560, 120, a, a + Math.PI / 6); ctx.fill(); }
    G.ellipse(ctx, CX, 560, 120, 120, { lw: 6, seed: 9 });
    G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: '#3A2E3E', lw: 5, seed: 10 });
    // the Pope
    const px = 700, ps = 0.95, raise = clamp((t - ev.pope) / 0.5);
    const shocked = t >= ev.take;
    Ch.person(ctx, { x: px, y: GROUND + 30, s: ps, pose: 'stand', style: POPE, eyes: shocked ? 'wide' : 'normal', mouth: shocked ? 'o' : 'smile', brows: shocked ? 'worried' : 'neutral', look: -0.7, handR: raise > 0 && !shocked ? [95, lerp(-260, -560, raise)] : null, handL: raise > 0 && !shocked ? [-95, lerp(-260, -560, raise)] : null, seed: 2300 });
    local(ctx, { x: px, y: GROUND + 30, s: ps }, (c) => G.poly(c, [[-55, -460], [-45, -600], [0, -650], [45, -600], [55, -460]], { fill: '#F4F1EA', lw: 5, seed: 2310 })); // mitre
    // Napoleon
    const nx = 330, ns = 1.0;
    const grabbing = t >= ev.take && t < ev.onHead;
    napoleon(ctx, { x: nx, y: GROUND + 30, s: ns, pose: 'stand', look: 0.5, handR: grabbing ? [70, -620] : null, handL: grabbing ? [-10, -620] : null }, { hat: false, epaulettes: true });
    // the crown's journey
    let cx, cy;
    const popeHands = [px, GROUND + 30 - ps * lerp(300, 650, raise)];
    if (t < ev.take) [cx, cy] = popeHands;
    else if (t < ev.take + 0.35) { const u = ease.inOutCubic((t - ev.take) / 0.35); cx = lerp(popeHands[0], nx + 30, u); cy = lerp(popeHands[1], GROUND + 30 - 680, u) - Math.sin(Math.PI * u) * 80; }
    else if (t < ev.onHead) { cx = nx + 30; cy = GROUND + 30 - 680; }
    else { const u = ease.outBounce(clamp((t - ev.onHead) / 0.3)); cx = lerp(nx + 30, nx, u); cy = lerp(GROUND + 30 - 680, GROUND + 30 - 404 * ns - 95, u); }
    crown(ctx, cx, cy, 0.75, { seed: 3 });
    if (t >= ev.onHead) { const f = decay(t, ev.onHead, 5); G.rays(ctx, nx, GROUND + 30 - 470, { n: 14, r0: 60, r1: 260, color: `rgba(255,210,90,${0.7 * f})`, lw: 10 }); }
    stamp(ctx, 'CROWNED HIMSELF', CX, 470, t, ev.onHead + 0.05, { size: 80, color: RED });
  }

  // ---------- scene 4: Russia ----------
  const ARMY = Array.from({ length: 36 }, (_, i) => ({ col: i % 9, row: Math.floor(i / 9), h: U.hash(i, 77) }));
  function scene4(ctx, t) {
    sky(ctx, '#8A97A8', '#DCE3EA');
    tag(ctx, 'RUSSIA, 1812', t, cut[4]);
    G.poly(ctx, [[-40, 1000], [W + 40, 1000], [W + 40, H + 40], [-40, H + 40]], { fill: '#F4F6F8', lw: 5, seed: 12 });
    const prog = clamp((t - ev.count[0]) / (ev.count[1] - ev.count[0]));
    const keep = lerp(1, 112 / 612, prog);
    ARMY.forEach((p) => {
      const x = 80 + p.col * 100 + p.row * 30 + ((t - cut[4]) * 30) % 100, y = 1040 + p.row * 50;
      if (p.h > keep) { G.ellipse(ctx, x, y - 6, 26, 10, { fill: '#FFFFFF', lw: 2, seed: 300 + p.col * 10 + p.row }); return; } // a snow mound where a soldier was
      Ch.person(ctx, { x, y, s: 0.22, pose: 'walk', walk: t * 1.4 + p.h * 3, style: { skin: Ch.SKIN_TONES[(p.col + p.row) % 6], outfit: 'suit', robe: BLUE, pants: '#EDE8DC', hairStyle: 'short', hair: '#3A2A1E' }, mouth: prog > 0.5 ? 'wavy' : 'flat', seed: 400 + p.col * 10 + p.row });
    });
    // snow
    for (let i = 0; i < 90; i++) {
      const sp = 120 + U.hash(i, 1) * 160, x = (U.hash(i, 2) * W + t * 140 + Math.sin(t * 2 + i) * 20) % W, y = (U.hash(i, 3) * H + t * sp) % H;
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x, y, 3 + U.hash(i, 4) * 5, 0, Math.PI * 2); ctx.fill();
    }
    if (t >= ev.army) {
      const done = t >= ev.count[1];
      G.text(ctx, done ? 'MADE IT BACK' : 'MARCHED IN', CX, SAFE.y + 210, { size: 46, fam: TITLE, weight: 400, color: INK, align: 'center' });
      const k = appear(t, ev.army, 0.3);
      ctx.save(); ctx.translate(CX, SAFE.y + 350); ctx.scale(k, k);
      Data.counter(ctx, { x: 0, y: 0, from: 612000, to: 112000, t, t0: ev.count[0], t1: ev.count[1], size: 130, fam: TITLE, weight: 400, color: done ? RED : '#FFFFFF', stroke: INK });
      ctx.restore();
    }
  }

  // ---------- scene 5: exiled on Elba ----------
  function scene5(ctx, t) {
    sky(ctx, '#7FB3D5', '#D6EAF5');
    tag(ctx, 'ELBA, 1814', t, cut[5]);
    G.poly(ctx, [[-40, 1050], [W + 40, 1050], [W + 40, H + 40], [-40, H + 40]], { fill: '#2D6A9A', lw: 4, seed: 20, hatch: { color: 'rgba(255,255,255,0.12)', gap: 18 } });
    const bob = Math.sin(t * 1.5) * 4;
    G.poly(ctx, [[CX - 230, 1070], [CX - 150, 960], [CX - 20, 920], [CX + 120, 950], [CX + 230, 1070]], { fill: '#A89070', lw: 5, seed: 21, hatch: { color: 'rgba(0,0,0,0.12)', gap: 12 } });
    napoleon(ctx, { x: CX - 20, y: 960 + bob * 0, s: 0.75, pose: 'sit', look: -0.3 }, { mouth: 'wavy', brows: 'worried', eyes: 'normal', epaulettes: true });
    for (let i = 0; i < 3; i++) { const x = (200 + i * 260 + t * 60) % W, y = 640 + Math.sin(t * 3 + i) * 20; G.line(ctx, [[x - 26, y - 10], [x, y], [x + 26, y - 10]], { color: INK, lw: 5, seed: 22 + i }); }
    bigText(ctx, 'EXILED', CX, SAFE.y + 240, t, ev.island, { size: 110, color: '#FFFFFF' });
  }

  // ---------- scene 6: the escape and the coat ----------
  const ROYAL = { skin: Ch.SKIN_TONES[1], hair: '#3A2A1E', hairStyle: 'buzz', outfit: 'suit', robe: '#E8E4DA', pants: '#E8E4DA', build: 'regular' };
  function scene6(ctx, t) {
    if (t < ev.boat[1]) {
      sky(ctx, '#3A4A6E', '#7F95B5');
      tag(ctx, '1815', t, cut[6]);
      G.poly(ctx, [[-40, 1050], [W + 40, 1050], [W + 40, H + 40], [-40, H + 40]], { fill: '#24507A', lw: 4, seed: 30 });
      G.poly(ctx, [[-60, 1070], [20, 980], [160, 1070]], { fill: '#A89070', lw: 5, seed: 31 });
      const u = clamp((t - ev.boat[0]) / (ev.boat[1] - ev.boat[0])), x = lerp(260, 900, ease.inQuad(u));
      G.poly(ctx, [[x - 120, 1030], [x + 120, 1030], [x + 90, 1080], [x - 90, 1080]], { fill: '#7A4A26', lw: 5, seed: 32 });
      napoleon(ctx, { x, y: 1040, s: 0.6, pose: 'stand', look: 0.8 }, { epaulettes: true });
      bigText(ctx, 'ESCAPED!', CX, SAFE.y + 240, t, cut[6] + 0.15, { size: 110, color: GOLD });
      return;
    }
    // the road: the king's soldiers block him
    sky(ctx, '#B07A4E', '#E9C08A');
    tag(ctx, '1815', t, cut[6]);
    G.poly(ctx, [[-40, GROUND], [W + 40, GROUND], [W + 40, H + 40], [-40, H + 40]], { fill: '#8A7650', lw: 5, seed: 33 });
    const zoom = 1 + 0.25 * ease.inOutCubic(clamp((t - ev.hereIAm) / 1.2));
    ctx.save(); ctx.translate(250, GROUND - 300); ctx.scale(zoom, zoom); ctx.translate(-250, -(GROUND - 300));
    const raised = clamp((t - ev.cock) / 0.3);
    for (let i = 0; i < 4; i++) {
      const x = 620 + i * 110, y = GROUND + 20 + (i % 2) * 20;
      const k = ease.outCubic(clamp((t - ev.soldiers - i * 0.12) / 0.3));
      if (k <= 0) continue;
      Ch.person(ctx, { x: x + (1 - k) * 400, y, s: 0.8, pose: 'stand', style: ROYAL, look: -0.8, brows: 'worried', mouth: 'flat', handL: [-110, -310], handR: [-40, -300], seed: 2400 + i });
      const mx = x + (1 - k) * 400;
      G.line(ctx, [[mx - 0.8 * 20, y - 0.8 * 300], [mx - 0.8 * lerp(60, 260, raised), y - 0.8 * lerp(160, 310, raised)]], { color: '#4A3020', lw: 9, seed: 2410 + i }); // musket
    }
    const open = clamp((t - ev.coat) / 0.35);
    napoleon(ctx, { x: 250, y: GROUND + 20, s: 1.05, pose: 'stand', look: 0.8, handL: open > 0 ? [-170, -330] : null, handR: open > 0 ? [170, -330] : null }, { epaulettes: true, coatOpen: open, brows: 'determined', mouth: t >= ev.coat ? 'open' : 'flat' });
    ctx.restore();
    if (t >= ev.coat) { const f = decay(t, ev.coat, 4); ctx.fillStyle = `rgba(255,240,200,${0.35 * f})`; ctx.fillRect(0, 0, W, H); }
    if (t >= ev.part2) {
      const a = t - ev.part2;
      ctx.fillStyle = `rgba(5,8,18,${0.75 * clamp(a / 0.15)})`; ctx.fillRect(0, 0, W, H);
      const f = decay(t, ev.part2, 8); ctx.fillStyle = `rgba(255,240,200,${0.6 * f})`; ctx.fillRect(0, 0, W, H);
      bigText(ctx, 'DID THEY SHOOT?', CX, 640, t, ev.part2 + 0.4, { size: 76, color: '#FFFFFF' });
      stamp(ctx, 'PART 2', CX, 860, t, ev.part2, { color: GOLD, size: 170, rot: -0.08 });
      const k = clamp((a - 0.9) / 0.4);
      G.text(ctx, 'Follow so you', CX, 1090, { size: 64, fam: 'Patrick Hand', weight: 400, color: CREAM, align: 'center', alpha: k });
      G.text(ctx, "don't miss it", CX, 1170, { size: 64, fam: 'Patrick Hand', weight: 400, color: CREAM, align: 'center', alpha: k });
    }
  }

  const SCENES = [scene0, scene1, scene2, scene3, scene4, scene5, scene6];
  Studio.film({
    draw(ctx, t) {
      const i = sceneAt(t), a = t - cut[i];
      const hitsAt = [ev.grow, ...ev.cannon, ev.onHead, ev.count[1], ev.coat, ev.part2];
      const shake = hitsAt.reduce((s, h) => s + 20 * decay(t, h, 7), 0);
      const z = 1 + 0.07 * Math.exp(-a * 9) + 0.025 * clamp(a / 6);
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake, U.noise1(t * 30, 2) * shake);
      ctx.translate(CX, H * 0.45); ctx.scale(z, z); ctx.translate(-CX, -H * 0.45);
      SCENES[i](ctx, t);
      ctx.restore();
      if (t < 0.2) { ctx.fillStyle = `rgba(255,240,200,${0.7 * (1 - t / 0.2)})`; ctx.fillRect(0, 0, W, H); }
      if (i > 0 && a < 0.15) { ctx.fillStyle = `rgba(255,255,255,${0.55 * (1 - a / 0.15)})`; ctx.fillRect(0, 0, W, H); }
      if (t < ev.part2) Subs.draw(ctx, t, SUBS, { style: 'pop', size: 64, y: SAFE.y + SAFE.h - 70, color: '#FFFFFF', highlight: '#FFD23F' });
    },
    post: { paper: 0.35, vignette: 0.35, grain: 0.05 },
    fadeOut: 1.0,
  });
})();
