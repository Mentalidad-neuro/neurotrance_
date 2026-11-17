"""Genera fondos en loop perfecto (120 s, estéreo, 48 kHz): agua (arroyo), bosque, cuenco.
Todo es periódico (filtros por FFT circular y eventos con wrap-around), así que el loop no tiene corte."""
import sys, wave
import numpy as np

SR = 48000
T = 120
N = SR * T
rng = np.random.default_rng(7)
out = sys.argv[1]


def shaped_noise(lo, hi, tilt=0.0, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    X = np.fft.rfft(r.standard_normal(N))
    f = np.fft.rfftfreq(N, 1 / SR)
    g = np.zeros_like(f)
    band = (f >= lo) & (f <= hi)
    g[band] = 1.0
    # bordes suaves
    soft = 1 / (1 + np.exp(-(f - lo) / (lo * 0.15 + 1))) * 1 / (1 + np.exp((f - hi) / (hi * 0.15 + 1)))
    g = soft * np.where(f > 0, (np.maximum(f, 1) / 1000.0) ** tilt, 0)
    y = np.fft.irfft(X * g, N)
    return y / (np.abs(y).max() + 1e-9)


def slow_env(cut_hz, seed):
    """Envolvente lenta, periódica, entre 0 y 1."""
    e = shaped_noise(0.01, cut_hz, seed=seed)
    e = (e - e.min()) / (e.max() - e.min())
    return e


def place(buf, ev, start):
    """Suma un evento con wrap-around (loop perfecto)."""
    idx = (np.arange(len(ev)) + start) % N
    np.add.at(buf, idx, ev)


def stereo(m, pan):
    l = m * np.cos((pan + 1) * np.pi / 4)
    r = m * np.sin((pan + 1) * np.pi / 4)
    return l, r


def save(name, L, R, peak=0.5):
    x = np.stack([L, R], 1)
    x = x / (np.abs(x).max() + 1e-9) * peak
    pcm = (x * 32767).astype(np.int16)
    with wave.open(f"{out}/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def agua():
    L = np.zeros(N); R = np.zeros(N)
    # rumor del agua: ruido de banda media, con vaivén lento distinto en cada oído
    for ch, seed in ((L, 1), (R, 2)):
        base = shaped_noise(150, 3500, tilt=-0.6, seed=seed)
        ch += base * (0.55 + 0.45 * slow_env(0.4, seed + 10))
        ch += 0.35 * shaped_noise(1500, 7000, tilt=-0.3, seed=seed + 20) * slow_env(2.0, seed + 30)
    # burbujas: tonos cortos que suben, muy suaves
    t = np.arange(int(0.05 * SR)) / SR
    for _ in range(900):
        f0 = rng.uniform(450, 1300)
        dur = rng.uniform(0.015, 0.05)
        tt = t[t < dur]
        f = f0 * (1 + 2.5 * tt / dur)
        ph = 2 * np.pi * np.cumsum(f) / SR
        ev = np.sin(ph) * np.exp(-tt / (dur / 3)) * rng.uniform(0.04, 0.12)
        l, r = stereo(ev, rng.uniform(-0.7, 0.7))
        s = rng.integers(0, N)
        place(L, l, s); place(R, r, s)
    save("agua", L, R, 0.55)


def bosque():
    L = np.zeros(N); R = np.zeros(N)
    # viento entre los árboles: ruido grave con ráfagas lentas
    for ch, seed in ((L, 3), (R, 4)):
        ch += shaped_noise(80, 1200, tilt=-1.0, seed=seed) * (0.25 + 0.75 * slow_env(0.08, seed + 40) ** 2)
        ch += 0.25 * shaped_noise(2000, 6000, tilt=-0.5, seed=seed + 50) * slow_env(0.15, seed + 60) ** 3
    # pájaros: frases cortas y espaciadas, lejos y suaves
    t = np.arange(int(0.3 * SR)) / SR
    for _ in range(26):
        s0 = rng.integers(0, N)
        pan = rng.uniform(-0.8, 0.8)
        kind = rng.integers(0, 3)
        notes = rng.integers(2, 6)
        base = rng.uniform(2600, 4200)
        amp = rng.uniform(0.05, 0.12)
        off = 0
        for k in range(notes):
            dur = rng.uniform(0.06, 0.16)
            tt = t[t < dur]
            if kind == 0:  # silbido que baja
                f = base * (1.25 - 0.35 * tt / dur)
            elif kind == 1:  # trino
                f = base * (1 + 0.08 * np.sin(2 * np.pi * 38 * tt))
            else:  # nota que sube
                f = base * (0.85 + 0.3 * tt / dur)
            ph = 2 * np.pi * np.cumsum(f) / SR
            env = np.sin(np.pi * tt / dur) ** 2
            ev = np.sin(ph) * env * amp
            l, r = stereo(ev, pan)
            place(L, l, s0 + off); place(R, r, s0 + off)
            off += int((dur + rng.uniform(0.04, 0.12)) * SR)
    save("bosque", L, R, 0.5)


def cuenco():
    L = np.zeros(N); R = np.zeros(N)
    # 8 golpes suaves (uno cada 15 s); parciales inarmónicos de cuenco con batido lento
    f0 = 196.0
    partials = [(1.0, 1.0, 14), (2.71, 0.45, 9), (5.15, 0.18, 6), (8.1, 0.07, 4)]
    dur = 16.0
    t = np.arange(int(dur * SR)) / SR
    attack = np.minimum(1, t / 0.03)
    for k in range(8):
        s = int(k * 15 * SR)
        detune = 1 + rng.uniform(-0.004, 0.004)
        for side, buf in ((-1, L), (1, R)):
            ev = np.zeros_like(t)
            for ratio, a, dec in partials:
                f = f0 * ratio * detune
                beat = 0.6 + 0.4 * np.cos(2 * np.pi * (0.5 + 0.2 * ratio) * t + side)
                ev += a * np.sin(2 * np.pi * f * t + side * 0.3) * np.exp(-t / dec) * beat
            ev *= attack * 0.3
            place(buf, ev, s)
    # zumbido continuo muy suave del cuenco que canta
    tt = np.arange(N) / SR
    hum = 0.03 * np.sin(2 * np.pi * f0 * tt) * (0.5 + 0.5 * np.cos(2 * np.pi * tt / 30))
    L += hum; R += 0.03 * np.sin(2 * np.pi * (f0 + 0.5) * tt) * (0.5 + 0.5 * np.cos(2 * np.pi * tt / 30))
    save("cuenco", L, R, 0.5)


agua(); bosque(); cuenco()
print("ok")
