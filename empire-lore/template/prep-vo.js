// Measures the Kokoro voice lines in assets/vo/ and writes vo_timing.js:
// per line its duration and the caption words (with numerals) timed by a syllable fit.
const fs = require('fs');
const Voice = require('./engine/audio/voice');
const { SR } = require('./engine/audio/dsp');
const DISPLAY = [
  "Everyone thinks Napoleon was tiny. He wasn't! And that's the least crazy thing about him.",
  'French inches were longer than British ones. And British cartoonists loved drawing him small.',
  'At 24, he was already a general.',
  'At 35, the Pope came to crown him. But Napoleon took the crown, and put it on himself!',
  'Then he invaded Russia with over 600,000 men. Only about 112,000 made it back.',
  'He lost everything, and got exiled to a tiny island.',
  'But he escaped. The king\'s soldiers blocked his path. He opened his coat and said: "If any of you will shoot your emperor, here I am!" Part 2.',
];
const W = { '24,': 3, '35,': 3, '600,000': 5, '112,000': 7, '2.': 1 };
const syl = (w) => W[w] || Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length);
const lines = DISPLAY.map((text, i) => {
  const audio = Voice.decode(`assets/vo/l${i}.wav`);
  const ws = text.split(' ');
  const words = Voice.fit(audio, ws, ws.map(syl)).map((w) => ({ w: w.w, t: +w.t.toFixed(3), end: +w.end.toFixed(3) }));
  return { text, dur: +(audio.length / SR).toFixed(3), words };
});
fs.writeFileSync('vo_timing.js', `(function(){const V=${JSON.stringify(lines)};if(typeof module!=='undefined')module.exports=V;else globalThis.VOT=V;})();\n`);
lines.forEach((l, i) => console.log(i, l.dur, l.words.map((w) => `${w.w}@${w.t}`).join(' ')));
