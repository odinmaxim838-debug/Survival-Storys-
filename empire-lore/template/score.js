// THE SCORE: "Napoleon Wasn't Short" (Part 3). No music: voice + sound effects only.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const VOT = node ? require('./vo_timing') : globalThis.VOT;
  const { m, makeClock } = MU;

  const FPS = 30;
  const FORMAT = U.pickFormat('9:16');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 120, offset: 0 });
  const { T, BEAT } = clock;
  const DURATION = 43;

  const LINE_AT = [0.4, 5.8, 11.5, 14.7, 20.7, 27.6, 31.4];
  const vo = VOT.map((l, i) => ({ at: LINE_AT[i], end: LINE_AT[i] + l.dur, text: l.text, words: l.words.map((w) => ({ w: w.w, t: +(LINE_AT[i] + w.t).toFixed(3), end: +(LINE_AT[i] + w.end).toFixed(3) })) }));

  const cut = [0, 5.5, 11.1, 14.3, 20.3, 27.2, 31.0];
  const S = { myth: [0, cut[1]], inches: [cut[1], cut[2]], toulon: [cut[2], cut[3]], crown: [cut[3], cut[4]], russia: [cut[4], cut[5]], elba: [cut[5], cut[6]], escape: [cut[6], DURATION] };

  const ev = {
    cuts: cut.slice(1),
    scratch: 0.05, // record scratch on the first frame
    grow: 3.0, // "He wasn't!": tiny Napoleon snaps to full size
    nothing: 3.9, // "AND THAT'S NOTHING"
    rulers: [5.9, 7.2], // the two inches slide in
    cartoon: 8.6, // the cartoonist starts scribbling
    cannon: [11.25, 12.4],
    general: 13.6, // GENERAL AT 24
    pope: 15.8, // the Pope lifts the crown
    take: 18.0, // Napoleon takes it
    onHead: 19.5, // ...and crowns himself
    march: 20.9,
    army: 22.5, // 612,000 appears
    count: [23.9, 25.4], // down to 112,000
    island: 28.1,
    boat: [31.1, 32.3], // the escape
    soldiers: 32.6, // the king's soldiers line up
    cock: 33.4, // muskets raised
    coat: 35.2, // he opens his coat
    hereIAm: 37.8,
    part2: 39.4,
  };

  const markers = {
    grow: { t: ev.grow, sync: 'av' },
    inches: { t: cut[1], sync: 'av' },
    toulon: { t: cut[2], sync: 'av' },
    general: { t: ev.general, sync: 'av' },
    crown: { t: cut[3], sync: 'av' },
    onHead: { t: ev.onHead, sync: 'av' },
    russia: { t: cut[4], sync: 'av' },
    elba: { t: cut[5], sync: 'av' },
    escape: { t: cut[6], sync: 'av' },
    coat: { t: ev.coat, sync: 'av' },
    part2: { t: ev.part2, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, ev, markers, vo, cut };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
