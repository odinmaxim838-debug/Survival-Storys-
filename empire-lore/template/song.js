// THE SOUND: voiceover + sound effects, no music -> out/music.wav
const path = require('path');
const { SR, Bus, reverb, OnePole } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Voice = require('./engine/audio/voice');
const sc = require('./score');
const { DURATION, ev, cut } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const voice = bus(), fx = bus(), hits = bus(), amb = bus(), verb = bus();

// ---------- voiceover ----------
sc.vo.forEach((l, i) => {
  const a = Voice.decode(path.join(__dirname, `assets/vo/l${i}.wav`));
  let s = 0, c = 0; for (const x of a) if (Math.abs(x) > 0.01) { s += x * x; c++; }
  const g = Math.min(6, 0.12 / Math.sqrt(s / c));
  const hp = new OnePole();
  const y = new Float32Array(a.length);
  for (let k = 0; k < a.length; k++) y[k] = hp.hp(a[k] * g, 90);
  voice.addMono(y, l.at, 1.0);
});

// ---------- ambience per scene (stops before PART 2) ----------
const amb1 = (t0, t1, f, g, seed) => amb.addMono(I.noiseSweep(t1 - t0, f, f * 1.3, { q: 0.7, pink: true, seed, shape: (x) => Math.min(1, x * 8, (1 - x) * 8) }), t0, g);
amb1(cut[2], cut[3], 250, 0.08, 1); // battlefield
amb1(cut[3], cut[4], 400, 0.07, 2); // cathedral crowd murmur
amb1(cut[4], cut[5], 900, 0.16, 3); // blizzard wind
amb1(cut[5], cut[6], 300, 0.12, 4); // sea
amb1(cut[6], ev.coat, 220, 0.07, 5);

// ---------- helpers ----------
const stamp = (t, g = 1) => { hits.addMono(I.thwack(), t, 0.85 * g); hits.addMono(I.woodTick(0.7), t, 0.5 * g); };
const cutHit = (t) => {
  fx.addMono(I.noiseSweep(0.35, 400, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), t - 0.5, 0.2);
  hits.addMono(I.kick({ punch: 1.3, seed: 3 }), t, 0.6);
  hits.addMono(I.tom(75, 0.3), t, 0.4);
};
const cannon = (t, g, seed) => {
  hits.addMono(I.subBoom(1.3, 85, 28), t, 0.8 * g);
  hits.addMono(I.kick({ punch: 1.5, seed }), t, 0.8 * g);
  hits.addMono(I.noiseSweep(0.6, 2500, 150, { q: 0.6, pink: true, seed, shape: (x) => Math.exp(-x * 5) }), t, 0.5 * g);
  verb.addMono(I.thud(60, 0.2, seed), t, 0.4 * g);
};
for (const t of ev.cuts) cutHit(t);

// ---------- 0: the myth ----------
hits.addMono(I.scratch(), ev.scratch, 0.7);
hits.addMono(I.boing(), ev.grow, 0.5);
stamp(ev.grow);
fx.addMono(I.pop(500), ev.nothing, 0.4);
// ---------- 1: the inches + the cartoonist ----------
ev.rulers.forEach((t, i) => { fx.addMono(I.paperFwip(1, 10 + i), t, 0.35); fx.addMono(I.woodTick(1.1), t + 0.25, 0.4); });
fx.addMono(I.scribble(1.6), ev.cartoon, 0.45);
fx.addMono(I.pop(1300), ev.cartoon + 1.7, 0.35);
// ---------- 2: Toulon ----------
ev.cannon.forEach((t, i) => cannon(t, i ? 0.3 : 0.5, 20 + i));
stamp(ev.general);
fx.addMono(I.bell(1320, 1.0, 1.1, 2.0), ev.general + 0.05, 0.12);
// ---------- 3: the crown ----------
for (let i = 0; i < 3; i++) fx.addMono(I.bell(990 + i * 330, 1.5, 1.2, 2.0), ev.pope + i * 0.08, 0.1);
hits.addMono(I.subBoom(0.8, 70, 35), ev.take, 0.5);
fx.addMono(I.noiseSweep(0.5, 300, 2500, { q: 0.8, pink: true, seed: 30 }), ev.take - 0.1, 0.25);
stamp(ev.onHead);
hits.addMono(I.crash(9), ev.onHead, 0.3);
fx.addMono(I.noiseSweep(1.0, 500, 900, { q: 0.7, pink: true, seed: 31, shape: (x) => Math.min(1, x * 10) * Math.exp(-x * 2) }), ev.onHead + 0.15, 0.3); // the crowd gasps
// ---------- 4: Russia ----------
for (let t = ev.march; t < ev.count[0]; t += 0.5) fx.addMono(I.tom(95, 0.12, 9), t, 0.3);
hits.addMono(I.thud(70, 0.15), ev.army, 0.6);
for (let i = 0; i <= 12; i++) fx.addMono(I.woodTick(1.3 - i * 0.03), ev.count[0] + (i / 12) * (ev.count[1] - ev.count[0]), 0.3);
hits.addMono(I.subBoom(1.2, 60, 30), ev.count[1], 0.6);
fx.addMono(I.noiseSweep(2.5, 1200, 400, { q: 1.2, pink: true, seed: 40, shape: (x) => Math.sin(Math.PI * x) }), ev.count[1] - 0.4, 0.25); // howling gust
// ---------- 5: Elba ----------
for (let t = cut[5] + 0.2; t < cut[6]; t += 1.3) fx.addMono(I.noiseSweep(1.2, 300, 1200, { q: 0.6, pink: true, seed: 50 + Math.round(t), shape: (x) => Math.sin(Math.PI * x) }), t, 0.2); // waves
fx.addMono(I.whistle(0.25), ev.island + 0.8, 0.12); // a gull
// ---------- 6: the escape ----------
for (let i = 0; i < 3; i++) fx.addMono(I.noiseSweep(0.3, 2000, 400, { q: 0.8, pink: true, seed: 60 + i, shape: (x) => Math.exp(-x * 6) }), ev.boat[0] + i * 0.4, 0.3); // oars
for (let i = 0; i < 6; i++) fx.addMono(I.tom(110, 0.1, 30 + i), ev.soldiers + i * 0.12, 0.3); // they line up
for (let i = 0; i < 4; i++) { fx.addMono(I.woodTick(1.6), ev.cock + i * 0.09, 0.4); fx.addMono(I.woodTick(2.0), ev.cock + i * 0.09 + 0.05, 0.3); } // muskets cocked
for (let t = ev.cock + 0.6; t < ev.part2 - 0.5; t += 0.85) fx.addMono(I.heartbeat(), t, 0.6);
fx.addMono(I.paperFwip(0.8, 70), ev.coat, 0.4);
hits.addMono(I.thud(80, 0.12), ev.coat, 0.6);
hits.addMono(I.subBoom(2.6, 70, 25), ev.part2, 1.0);
hits.addMono(I.kick({ punch: 1.6, seed: 8 }), ev.part2, 1.0);
hits.addMono(I.crash(18), ev.part2, 0.4);

// ---------- mix ----------
const stems = { voice, fx, hits, amb, verb: reverb(verb, { room: 0.8, damp: 0.4 }) };
const GAIN = { voice: 1.9, fx: 0.9, hits: 0.9, amb: 1, verb: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 25);
MIX.fadeOut(mix, DURATION - 1.2, DURATION);
const M = MIX.master(mix, 0.8, undefined, { lufs: parseFloat(process.env.LUFS || '-14') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION}s, ${M.lufs.toFixed(1)} LUFS, drive ${M.drive.toFixed(2)})`);
