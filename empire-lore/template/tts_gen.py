import sys, json, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("/home/claude/tts/kokoro-v1.0.onnx", "/home/claude/tts/voices-v1.0.bin")
voice, speed, outdir = sys.argv[1], float(sys.argv[2]), sys.argv[3]
lines = json.load(open(sys.argv[4]))
import os; os.makedirs(outdir, exist_ok=True)
for i, text in enumerate(lines):
    a, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    sf.write(f"{outdir}/l{i}.wav", a, sr)
    print(i, round(len(a)/sr, 2), text)
