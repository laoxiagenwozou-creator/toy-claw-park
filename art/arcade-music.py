"""Render the original 16-bar arcade theme. Requires NumPy and FFmpeg."""
import argparse
import math
from pathlib import Path
import subprocess
import tempfile
import wave

import numpy as np

RATE = 44100
BEAT = 60 / 96
LENGTH = round(RATE * 64 * BEAT)
TAU = math.tau
rng = np.random.default_rng(260)
mix = np.zeros((LENGTH, 2), dtype=np.float64)


def place(beat, tone, pan, gain):
    offset = round(beat * BEAT * RATE) % LENGTH
    stereo = np.column_stack((tone * math.sqrt((1-pan)/2), tone * math.sqrt((1+pan)/2))) * gain
    n = min(len(tone), LENGTH-offset)
    mix[offset:offset+n] += stereo[:n]
    if n < len(tone):
        mix[:len(tone)-n] += stereo[n:]


def voice(pitch, beats, kind):
    duration = beats * BEAT
    t = np.arange(round((duration + .22)*RATE)) / RATE
    f = 440 * 2**((pitch-69)/12)
    phase = TAU*f*t
    if kind == 'wood':
        # A felt mallet with an inharmonic attack and a warm, ringing fundamental.
        a = (np.sin(phase) * np.exp(-3.5*t) + .34*np.sin(3.02*phase)*np.exp(-12*t)
             + .13*np.sin(4.16*phase)*np.exp(-20*t))
        a *= 1-np.exp(-t/.004)
    elif kind == 'string':
        a = (np.sin(phase)+.38*np.sin(2*phase+.2)+.16*np.sin(3*phase)+.07*np.sin(4*phase))*np.exp(-5.5*t)
        a *= 1-np.exp(-t/.007)
    elif kind == 'bass':
        a = (np.sin(phase+.10*np.sin(phase*2))+.18*np.sin(2*phase))*np.exp(-2.9*t)
        a *= 1-np.exp(-t/.012)
    else:
        a = (np.sin(phase)+.24*np.sin(2.006*phase)+.10*np.sin(3*phase))*np.exp(-4*t)
        a *= 1-np.exp(-t/.014)
    return a * np.exp(-np.maximum(t-duration,0)/.046)


# F major. Each phrase leaves space for machine sounds between answers.
chords = [
 (41,[57,60,64,65]),(40,[55,60,62,64]),(38,[53,57,60,65]),(34,[53,57,62,65]),
 (43,[53,58,62,65]),(36,[55,58,62,64]),(41,[53,57,60,64]),(36,[55,60,62,65]),
 (38,[53,57,60,64]),(33,[52,55,60,64]),(34,[53,57,62,65]),(41,[53,57,60,65]),
 (43,[53,58,62,65]),(36,[52,55,58,62]),(41,[53,57,60,64]),(36,[55,58,62,64])]
melody = [
 [(0,69,1), (1.5,72,.45),(2,74,.72),(3,72,.72)],
 [(.5,67,.52),(1.5,69,.52),(2.5,67,1)],
 [(0,65,.75),(1,69,.6),(2,72,1.3)],
 [(.5,74,.65),(1.5,72,.6),(2.5,69,1)],
 [(0,67,.85),(1.5,70,.5),(2,74,1.4)],
 [(0,76,.7),(1,74,.5),(2,72,.9),(3.5,67,.4)],
 [(0,69,1.45),(2,65,1.2)],[(1.5,67,.6),(3,72,.7)],
 [(0,77,1),(1.5,76,.45),(2,74,.7),(3.25,72,.5)],
 [(0,72,1.2),(2,69,.6),(3,67,.6)],
 [(.5,70,.68),(1.5,74,.6),(2.5,77,1)],
 [(0,76,.53),(1,72,1),(2.75,69,.6)],
 [(0,67,.8),(1,70,.7),(2,74,1.3)],
 [(.5,76,.6),(1.5,74,.5),(2.5,67,.9)],
 [(0,69,1.2),(1.5,72,.6),(2.5,65,1.3)],
 [(1.25,67,.5),(2.25,64,.5),(3.25,67,.46)]]
for bar,(bass,notes) in enumerate(chords):
    base=4*bar
    place(base,voice(bass,.95,'bass'),-.07,.30)
    place(base+2.05,voice(bass+7,.65,'bass'),-.07,.19)
    for half in [0.55,2.55]:
        for n,pitch in enumerate(notes[1:]):
            place(base+half+n*.033,voice(pitch,.62,'string'),-.30+n*.12,.070 if half<1 else .058)
    for offset,pitch,dur in melody[bar]:
        place(base+offset,voice(pitch,dur,'wood'),.10+.07*math.sin(bar),.32 if offset<1 else .285)
    if bar in [1,3,6,7,9,11,14]:
        place(base+3.55,voice(notes[1]+12,.45,'bell'),.47,.075)
    for i in range(8):
        t=np.arange(round(.115*RATE))/RATE
        noise=rng.normal(0,.22,len(t));grain=np.r_[0,np.diff(noise)]
        hat=grain*(1-np.exp(-t/.003))*np.exp(-t/(.018 if i%2 else .028))
        place(base+i*.5+(.022 if i%2 else 0),hat,.36,.055 if i%2 else .078)
    for beat in [1,3]:
        t=np.arange(round(.09*RATE))/RATE
        tap=(np.sin(TAU*760*t)+.28*np.sin(TAU*1385*t))*(1-np.exp(-t/.0015))*np.exp(-t/.013)
        place(base+beat+.016,tap,-.42,.057)
# Circular early reflections preserve the tail from bar 16 at the loop start.
dry=mix.copy()
for seconds,gain in [(.041,.14),(.077,.095),(.129,.057),(.209,.034)]:
    mix+=np.roll(dry[:,::-1],round(seconds*RATE),axis=0)*gain
mix=np.tanh(mix*.96)
mix*=.78/np.max(np.abs(mix))

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('output',type=Path)
    args=parser.parse_args()
    with tempfile.TemporaryDirectory() as folder:
        wav=Path(folder)/'theme.wav'
        with wave.open(str(wav),'wb') as out:
            out.setnchannels(2);out.setsampwidth(2);out.setframerate(RATE)
            out.writeframes(np.rint(mix*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libvorbis','-q:a','4',
                        '-metadata','title=玩具抓抓乐 · 开门啦',str(args.output)],check=True)
