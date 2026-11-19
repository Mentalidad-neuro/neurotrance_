"""Ambientes limpios en loop perfecto (120 s, estéreo decorrelado, 48 kHz)."""
import sys, wave
import numpy as np
SR=48000; T=120; N=SR*T
out=sys.argv[1]
rng=np.random.default_rng(11)
f=np.fft.rfftfreq(N,1/SR)

def band(lo,hi,tilt=0.0,seed=0):
    X=np.fft.rfft(np.random.default_rng(seed).standard_normal(N))
    g=1/(1+np.exp(-(f-lo)/(lo*0.2+1)))/(1+np.exp((f-hi)/(hi*0.2+1)))
    g=g*np.where(f>0,(np.maximum(f,1)/1000.0)**tilt,0)
    y=np.fft.irfft(X*g,N); return y/np.sqrt(np.mean(y**2))

def env(cut,seed):
    e=band(0.005,cut,seed=seed); return (e-e.min())/(e.max()-e.min())

def place(buf,ev,s):
    idx=(np.arange(len(ev))+s)%N; np.add.at(buf,idx,ev)

def save(name,L,R,rms_db):
    x=np.stack([L,R],1); x=x/np.sqrt(np.mean(x**2))*10**(rms_db/20)
    pk=np.abs(x).max()
    if pk>0.5: x*=0.5/pk
    with wave.open(f"{out}/{name}.wav","wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x*32767).astype(np.int16).tobytes())

def lluvia():
    L=np.zeros(N);R=np.zeros(N)
    for ch,s in ((L,1),(R,2)):
        ch+=0.55*band(500,9000,tilt=-0.35,seed=s)*(0.8+0.2*env(0.2,s+5))
        ch+=0.30*band(70,500,tilt=-0.8,seed=s+10)
    # gotas: ráfagas cortas de ruido filtrado
    for _ in range(14000):
        d=int(rng.uniform(0.002,0.008)*SR); t=np.arange(d)
        ev=rng.standard_normal(d)*np.exp(-t/(d/4))
        ev=np.convolve(ev,[0.5,0.5],'same')*rng.uniform(0.05,0.35)
        p=rng.uniform(-1,1); s0=rng.integers(0,N)
        place(L,ev*np.cos((p+1)*np.pi/4),s0); place(R,ev*np.sin((p+1)*np.pi/4),s0)
    save("lluvia-suave",L,R,-22)

def olas():
    t=np.arange(N)/SR
    # oleaje: ciclos enteros en 120 s (periodos 12 s y 15 s) => loop perfecto
    w=0.5*(np.sin(2*np.pi*t/12)+1)**2/4+0.5*(np.sin(2*np.pi*t/15+1.3)+1)**2/4
    w=0.15+0.85*w
    L=np.zeros(N);R=np.zeros(N)
    for ch,s,sh in ((L,3,0),(R,4,int(0.35*SR))):
        ww=np.roll(w,sh)
        ch+=band(60,1800,tilt=-0.9,seed=s)*ww
        ch+=0.45*band(1500,8000,tilt=-0.4,seed=s+20)*ww**2
    save("olas-del-mar",L,R,-22)

def ruido(name,lo,hi,tilt,db):
    save(name,band(lo,hi,tilt,seed=hash(name)%1000),band(lo,hi,tilt,seed=hash(name)%1000+1),db)

def binaural(name,fl,fr,db):
    t=np.arange(N)/SR
    bed=[0.06*band(120,1500,tilt=-0.8,seed=s) for s in (31,32)]
    sw=0.92+0.08*np.cos(2*np.pi*t/30)   # vaivén suave, periodo 30 s
    L=0.30*np.sin(2*np.pi*fl*t)*sw+bed[0]*0.3
    R=0.30*np.sin(2*np.pi*fr*t)*sw+bed[1]*0.3
    save(name,L,R,db)

lluvia(); olas()
ruido("ruido-rosa",40,9000,-0.5,-24)
ruido("ruido-marron",30,1500,-1.0,-22)
binaural("ondas-delta",200,202,-26)
binaural("ondas-theta",180,186,-26)
binaural("ondas-alfa",200,210,-26)
binaural("ondas-beta",220,235,-26)
binaural("ondas-gamma",240,280,-26)
print("ok")
