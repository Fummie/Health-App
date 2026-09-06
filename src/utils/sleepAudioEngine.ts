import { 
  AlarmSoundId, 
  BackgroundSoundscapeId, 
  NocturnalAudioEvent, 
  SleepDisorderType 
} from '../types';

export interface AcousticMetrics {
  currentDb: number;
  peakDb: number;
  snoringProbability: number; // 0 to 100
  restlessnessScore: number;  // 0 to 100
  frequencyBands: {
    lowHz: number; // 60-350 Hz (snoring & heavy breathing)
    midHz: number; // 400-1500 Hz (movement & rustling)
    highHz: number; // >2000 Hz (ambient noise & voice)
  };
  isMicActive: boolean;
  isSimulated: boolean;
}

class SleepAudioEngine {
  private audioCtx: AudioContext | null = null;

  // Background Soundscape nodes
  private soundscapeSource: AudioNode | null = null;
  private soundscapeNodes: AudioNode[] = [];
  private soundscapeIntervals: number[] = [];
  private soundscapeGain: GainNode | null = null;
  private activeSoundscapeId: BackgroundSoundscapeId = 'off';

  // Alarm sound interval & nodes
  private alarmInterval: number | null = null;
  private alarmGain: GainNode | null = null;
  private isAlarmActive: boolean = false;
  private customAlarmAudio: HTMLAudioElement | null = null;
  private previewAudio: HTMLAudioElement | null = null;

  // Microphone monitoring & analysis
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isMonitoring: boolean = false;
  private isSimulatedMonitoring: boolean = false;
  private simIntervalId: number | null = null;

  // Snoring & disorder detector state
  private snoreHoldCount: number = 0;
  private lastEventTime: number = 0;
  private peakSessionDb: number = 32;

  // Listeners
  private onMetricsUpdate: ((metrics: AcousticMetrics) => void) | null = null;
  private onDisorderDetected: ((event: NocturnalAudioEvent) => void) | null = null;

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // -------------------------------------------------------------
  // 1. BACKGROUND SOUNDSCAPES & CALMING SLEEP TONES
  // -------------------------------------------------------------
  public playBackgroundSoundscape(id: BackgroundSoundscapeId, volumePercent: number = 50) {
    this.stopBackgroundSoundscape();
    if (id === 'off') {
      this.activeSoundscapeId = 'off';
      return;
    }

    try {
      const ctx = this.initAudioContext();
      this.activeSoundscapeId = id;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.01, (volumePercent / 100) * 0.4), ctx.currentTime);
      gain.connect(ctx.destination);
      this.soundscapeGain = gain;

      if (id === 'starlight_piano_lullaby') {
        this.startStarlightPianoLullaby(ctx, gain);
      } else if (id === 'moonlit_music_box') {
        this.startMoonlitMusicBox(ctx, gain);
      } else if (id === 'celestial_dream_pad') {
        this.startCelestialDreamPad(ctx, gain);
      } else if (id === 'stellar_cosmic_slumber') {
        this.startStellarCosmicSlumber(ctx, gain);
      } else if (id === 'zen_bamboo_koto') {
        this.startZenBambooKoto(ctx, gain);
      } else if (id === 'twilight_acoustic_guitar') {
        this.startTwilightAcousticGuitar(ctx, gain);
      } else if (id === 'midnight_ocean_waves') {
        this.startMidnightOceanWaves(ctx, gain);
      } else if (id === 'solfeggio_639hz') {
        this.startSolfeggio639Hz(ctx, gain);
      } else if (id === 'brown_noise') {
        this.startBrownNoise(ctx, gain);
      } else if (id === 'pink_noise') {
        this.startPinkNoise(ctx, gain);
      } else if (id === 'rain_droplets') {
        this.startRainSoundscape(ctx, gain);
      } else if (id === 'forest_stream') {
        this.startStreamSoundscape(ctx, gain);
      } else if (id === 'delta_waves_4hz') {
        this.startDeltaWaves(ctx, gain);
      } else if (id === 'binaural_theta_6hz') {
        this.startBinauralTheta6Hz(ctx, gain);
      } else if (id === 'delta_restoration_2hz') {
        this.startDeltaRestoration2Hz(ctx, gain);
      } else if (id === 'solfeggio_528hz') {
        this.startSolfeggio528Hz(ctx, gain);
      } else if (id === 'solfeggio_432hz') {
        this.startSolfeggio432Hz(ctx, gain);
      } else if (id === 'somatic_vagus_pulse') {
        this.startSomaticVagusPulse(ctx, gain);
      } else if (id === 'tibetan_overtones') {
        this.startTibetanOvertones(ctx, gain);
      }
    } catch (err) {
      console.warn('Unable to initialize background soundscape / calming tone:', err);
    }
  }

  public setSoundscapeVolume(volumePercent: number) {
    if (this.soundscapeGain && this.audioCtx) {
      const targetGain = Math.max(0.001, (volumePercent / 100) * 0.4);
      this.soundscapeGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
    }
  }

  public stopBackgroundSoundscape() {
    // Clear recurring musical loops or soundscape timers
    for (const timer of this.soundscapeIntervals) {
      window.clearInterval(timer);
    }
    this.soundscapeIntervals = [];

    // Teardown primary source
    if (this.soundscapeSource) {
      try {
        if ('stop' in this.soundscapeSource) {
          (this.soundscapeSource as AudioScheduledSourceNode).stop();
        }
        this.soundscapeSource.disconnect();
      } catch {
        // Safe disposal
      }
      this.soundscapeSource = null;
    }

    // Teardown any multi-oscillator nodes
    for (const node of this.soundscapeNodes) {
      try {
        if ('stop' in node) {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Safe disposal
      }
    }
    this.soundscapeNodes = [];

    if (this.soundscapeGain) {
      try {
        this.soundscapeGain.disconnect();
      } catch {
        // Safe disposal
      }
      this.soundscapeGain = null;
    }
    this.activeSoundscapeId = 'off';
  }

  public getActiveSoundscapeId(): BackgroundSoundscapeId {
    return this.activeSoundscapeId;
  }

  // --- Procedural Sound Synthesis ---
  private startBrownNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain boost
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(260, ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(destination);
    whiteNoise.start();
    this.soundscapeSource = whiteNoise;
  }

  private startPinkNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const pinkSource = ctx.createBufferSource();
    pinkSource.buffer = noiseBuffer;
    pinkSource.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, ctx.currentTime);

    pinkSource.connect(lowpass);
    lowpass.connect(destination);
    pinkSource.start();
    this.soundscapeSource = pinkSource;
  }

  private startRainSoundscape(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Filter to simulate rain on leaves
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.25, ctx.currentTime);

    rainSource.connect(bandpass);
    bandpass.connect(rainGain);
    rainGain.connect(destination);

    rainSource.start();
    this.soundscapeSource = rainSource;
  }

  private startStreamSoundscape(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const streamSource = ctx.createBufferSource();
    streamSource.buffer = noiseBuffer;
    streamSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    // Subtle LFO wave modulation for moving water
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    lfoGain.gain.setValueAtTime(150, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    streamSource.connect(filter);
    filter.connect(destination);
    streamSource.start();
    this.soundscapeSource = streamSource;
  }

  private startDeltaWaves(ctx: AudioContext, destination: AudioNode) {
    // 4Hz difference: 196 Hz in left / general, 200 Hz in right
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(196, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(200, ctx.currentTime); // 4Hz delta beat

    const deltaGain = ctx.createGain();
    deltaGain.gain.setValueAtTime(0.18, ctx.currentTime);

    osc1.connect(deltaGain);
    osc2.connect(deltaGain);
    deltaGain.connect(destination);

    osc1.start();
    osc2.start();

    // Store nodes for teardown
    this.soundscapeSource = osc1;
    this.soundscapeNodes.push(osc2, deltaGain);
  }

  // --- Specialized Body-Calming & Sleep-Inducing Tones ---
  private startBinauralTheta6Hz(ctx: AudioContext, destination: AudioNode) {
    // 150 Hz / 156 Hz -> 6 Hz Theta wave for cognitive quieting and hypnagogic calm
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const subOsc = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(156, ctx.currentTime);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75, ctx.currentTime);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.2, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.06, ctx.currentTime);

    osc1.connect(mainGain);
    osc2.connect(mainGain);
    subOsc.connect(subGain);

    mainGain.connect(destination);
    subGain.connect(destination);

    osc1.start();
    osc2.start();
    subOsc.start();

    this.soundscapeSource = osc1;
    this.soundscapeNodes.push(osc2, subOsc, mainGain, subGain);
  }

  private startDeltaRestoration2Hz(ctx: AudioContext, destination: AudioNode) {
    // 118 Hz / 120 Hz -> 2 Hz Slow Delta Beat for deep cellular and physical restoration
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(118, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(120, ctx.currentTime);

    const deltaGain = ctx.createGain();
    deltaGain.gain.setValueAtTime(0.22, ctx.currentTime);

    osc1.connect(deltaGain);
    osc2.connect(deltaGain);
    deltaGain.connect(destination);

    osc1.start();
    osc2.start();

    this.soundscapeSource = osc1;
    this.soundscapeNodes.push(osc2, deltaGain);
  }

  private startSolfeggio528Hz(ctx: AudioContext, destination: AudioNode) {
    // 528 Hz Pure frequency (Somatic Harmony) + 264 Hz sub-octave fundamental with slow breath tremolo
    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();

    oscMain.type = 'sine';
    oscMain.frequency.setValueAtTime(528, ctx.currentTime);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(264, ctx.currentTime);

    // 0.08 Hz breath cycle modulation (approx 12 second gentle cycle)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.18, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    oscMain.connect(gainNode);
    oscSub.connect(gainNode);
    gainNode.connect(destination);

    lfo.start();
    oscMain.start();
    oscSub.start();

    this.soundscapeSource = oscMain;
    this.soundscapeNodes.push(oscSub, lfo, lfoGain, gainNode);
  }

  private startSolfeggio432Hz(ctx: AudioContext, destination: AudioNode) {
    // 432 Hz Natural harmonic calm + 436 Hz (4 Hz calming delta difference) + 216 Hz warm sub-base
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscSub = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(436, ctx.currentTime);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(216, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.19, ctx.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    oscSub.connect(gainNode);
    gainNode.connect(destination);

    osc1.start();
    osc2.start();
    oscSub.start();

    this.soundscapeSource = osc1;
    this.soundscapeNodes.push(osc2, oscSub, gainNode);
  }

  private startSomaticVagusPulse(ctx: AudioContext, destination: AudioNode) {
    // 0.1 Hz respiratory modulation (6 breaths per minute) over a warm 108 Hz drone
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(108, ctx.currentTime);

    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(216, ctx.currentTime);

    const breathLFO = ctx.createOscillator();
    breathLFO.frequency.setValueAtTime(0.1, ctx.currentTime); // 10s cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.16, ctx.currentTime);

    breathLFO.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    drone.connect(masterGain);
    overtone.connect(masterGain);
    masterGain.connect(destination);

    breathLFO.start();
    drone.start();
    overtone.start();

    this.soundscapeSource = drone;
    this.soundscapeNodes.push(overtone, breathLFO, lfoGain, masterGain);
  }

  private startTibetanOvertones(ctx: AudioContext, destination: AudioNode) {
    // 136.1 Hz Om base with 272.2 Hz & 408.3 Hz harmonics
    const fundamental = ctx.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(136.1, ctx.currentTime);

    const octave = ctx.createOscillator();
    octave.type = 'sine';
    octave.frequency.setValueAtTime(272.2, ctx.currentTime);

    const harmonic = ctx.createOscillator();
    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(408.3, ctx.currentTime);

    const gainFund = ctx.createGain();
    gainFund.gain.setValueAtTime(0.18, ctx.currentTime);

    const gainOct = ctx.createGain();
    gainOct.gain.setValueAtTime(0.09, ctx.currentTime);

    const gainHarm = ctx.createGain();
    gainHarm.gain.setValueAtTime(0.05, ctx.currentTime);

    fundamental.connect(gainFund);
    octave.connect(gainOct);
    harmonic.connect(gainHarm);

    gainFund.connect(destination);
    gainOct.connect(destination);
    gainHarm.connect(destination);

    fundamental.start();
    octave.start();
    harmonic.start();

    this.soundscapeSource = fundamental;
    this.soundscapeNodes.push(octave, harmonic, gainFund, gainOct, gainHarm);
  }

  // --- Bedtime Soft Music & Calming Tones Synthesis ---

  private startStarlightPianoLullaby(ctx: AudioContext, destination: AudioNode) {
    // Warm background acoustic bed drone
    const droneOsc = ctx.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(140, ctx.currentTime);

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.12, ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(destination);
    droneOsc.start();

    this.soundscapeSource = droneOsc;
    this.soundscapeNodes.push(droneFilter, droneGain);

    // Neo-Classical Lullaby chord progression (Cmaj9 -> Fmaj7 -> Am9 -> Gsus4/6)
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
      [174.61, 261.63, 329.63, 392.00, 523.25], // Fmaj7 (F3, C4, E4, G4, C5)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A3, C4, E4, G4, B4)
      [196.00, 293.66, 329.63, 392.00, 587.33], // G6/sus (G3, D4, E4, G4, D5)
    ];
    let chordIdx = 0;

    const playChordSequence = () => {
      if (this.activeSoundscapeId !== 'starlight_piano_lullaby') return;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, noteIdx) => {
        const noteDelay = noteIdx * 0.45;
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const noteFilter = ctx.createBiquadFilter();

        noteOsc.type = noteIdx === 0 ? 'sine' : 'triangle';
        noteOsc.frequency.setValueAtTime(freq, ctx.currentTime + noteDelay);

        noteFilter.type = 'lowpass';
        noteFilter.frequency.setValueAtTime(820, ctx.currentTime + noteDelay);

        const startTime = ctx.currentTime + noteDelay;
        const peakGain = 0.08 / (noteIdx === 0 ? 1 : 1.3);

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.4);

        noteOsc.connect(noteFilter);
        noteFilter.connect(noteGain);
        noteGain.connect(destination);

        noteOsc.start(startTime);
        noteOsc.stop(startTime + 3.5);

        this.soundscapeNodes.push(noteOsc, noteFilter, noteGain);
      });
    };

    // Play initial phrase and schedule loop
    playChordSequence();
    const intervalId = window.setInterval(playChordSequence, 5200);
    this.soundscapeIntervals.push(intervalId);
  }

  private startMoonlitMusicBox(ctx: AudioContext, destination: AudioNode) {
    // Warm celestial foundation
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.setValueAtTime(110, ctx.currentTime); // A2

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.08, ctx.currentTime);

    pad.connect(padGain);
    padGain.connect(destination);
    pad.start();

    this.soundscapeSource = pad;
    this.soundscapeNodes.push(padGain);

    // Crystalline lullaby chime motifs
    const melodyNotes = [
      [659.25, 830.61, 987.77],   // E5, G#5, B5
      [987.77, 1318.51, 1108.73], // B5, E6, C#6
      [830.61, 739.99, 659.25],   // G#5, F#5, E5
      [587.33, 739.99, 880.00],   // D5, F#5, A5
    ];
    let phraseIndex = 0;

    const playMusicBoxPhrase = () => {
      if (this.activeSoundscapeId !== 'moonlit_music_box') return;
      const notes = melodyNotes[phraseIndex % melodyNotes.length];
      phraseIndex++;

      notes.forEach((freq, i) => {
        const noteStart = ctx.currentTime + (i * 0.7);
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, noteStart);

        // Subtle inharmonic bell overtone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.76, noteStart);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.02, noteStart);
        osc2.connect(overtoneGain);
        overtoneGain.connect(noteGain);

        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.06, noteStart + 0.008);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.4);

        osc1.connect(noteGain);
        noteGain.connect(destination);

        osc1.start(noteStart);
        osc2.start(noteStart);
        osc1.stop(noteStart + 2.5);
        osc2.stop(noteStart + 2.5);

        this.soundscapeNodes.push(osc1, osc2, overtoneGain, noteGain);
      });
    };

    playMusicBoxPhrase();
    const interval = window.setInterval(playMusicBoxPhrase, 3800);
    this.soundscapeIntervals.push(interval);
  }

  private startCelestialDreamPad(ctx: AudioContext, destination: AudioNode) {
    // 3 rich analog-style oscillators tuned to warm fifths with subtle detune
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const oscSub = ctx.createOscillator();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    osc1.detune.setValueAtTime(-5, ctx.currentTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3
    osc2.detune.setValueAtTime(4, ctx.currentTime);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(261.63, ctx.currentTime); // C4

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 sub bass

    // Slow sweeping lowpass filter (0.04 Hz LFO)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.04, ctx.currentTime); // 25-second slow sweep
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.22, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    oscSub.connect(filter);
    filter.connect(padGain);
    padGain.connect(destination);

    lfo.start();
    osc1.start();
    osc2.start();
    osc3.start();
    oscSub.start();

    this.soundscapeSource = osc1;
    this.soundscapeNodes.push(osc2, osc3, oscSub, filter, lfo, lfoGain, padGain);
  }

  private startStellarCosmicSlumber(ctx: AudioContext, destination: AudioNode) {
    // 54 Hz sub-drone + 108 Hz warm triangle partial
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(54, ctx.currentTime);

    const mid = ctx.createOscillator();
    mid.type = 'triangle';
    mid.frequency.setValueAtTime(108, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, ctx.currentTime);

    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.08, ctx.currentTime);

    sub.connect(subGain);
    mid.connect(midGain);
    subGain.connect(destination);
    midGain.connect(destination);

    sub.start();
    mid.start();

    this.soundscapeSource = sub;
    this.soundscapeNodes.push(mid, subGain, midGain);

    // Stardust glistening sparkle pings
    const glistenFreqs = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00];
    const triggerStardust = () => {
      if (this.activeSoundscapeId !== 'stellar_cosmic_slumber') return;
      const freq = glistenFreqs[Math.floor(Math.random() * glistenFreqs.length)];
      const startT = ctx.currentTime;

      const ping = ctx.createOscillator();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(freq, startT);

      const pGain = ctx.createGain();
      pGain.gain.setValueAtTime(0.0001, startT);
      pGain.gain.linearRampToValueAtTime(0.025, startT + 0.05);
      pGain.gain.exponentialRampToValueAtTime(0.0001, startT + 2.8);

      ping.connect(pGain);
      pGain.connect(destination);

      ping.start(startT);
      ping.stop(startT + 2.9);

      this.soundscapeNodes.push(ping, pGain);
    };

    triggerStardust();
    const interval = window.setInterval(triggerStardust, 3600);
    this.soundscapeIntervals.push(interval);
  }

  private startZenBambooKoto(ctx: AudioContext, destination: AudioNode) {
    // Night bamboo breeze background
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'bandpass';
    breezeFilter.frequency.setValueAtTime(450, ctx.currentTime);
    breezeFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.08, ctx.currentTime);

    noiseSrc.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(destination);
    noiseSrc.start();

    this.soundscapeSource = noiseSrc;
    this.soundscapeNodes.push(breezeFilter, breezeGain);

    // Traditional Insen Japanese Pentatonic Scale (A3, Bb3, D4, E4, F4, A4)
    const kotoScale = [220.00, 233.08, 293.66, 329.63, 349.23, 440.00];
    let noteCounter = 0;

    const playKotoArpeggio = () => {
      if (this.activeSoundscapeId !== 'zen_bamboo_koto') return;
      const noteCount = 3;
      for (let i = 0; i < noteCount; i++) {
        const freq = kotoScale[(noteCounter + i) % kotoScale.length];
        const noteDelay = i * 0.6;
        const noteTime = ctx.currentTime + noteDelay;

        const stringOsc = ctx.createOscillator();
        stringOsc.type = 'triangle';
        stringOsc.frequency.setValueAtTime(freq, noteTime);

        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'bandpass';
        bodyFilter.frequency.setValueAtTime(freq * 1.5, noteTime);
        bodyFilter.Q.setValueAtTime(2.2, noteTime);

        const stringGain = ctx.createGain();
        stringGain.gain.setValueAtTime(0.0001, noteTime);
        stringGain.gain.linearRampToValueAtTime(0.09, noteTime + 0.008);
        stringGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.6);

        stringOsc.connect(bodyFilter);
        bodyFilter.connect(stringGain);
        stringGain.connect(destination);

        stringOsc.start(noteTime);
        stringOsc.stop(noteTime + 2.7);

        this.soundscapeNodes.push(stringOsc, bodyFilter, stringGain);
      }
      noteCounter = (noteCounter + 2) % kotoScale.length;
    };

    playKotoArpeggio();
    const interval = window.setInterval(playKotoArpeggio, 4200);
    this.soundscapeIntervals.push(interval);
  }

  private startTwilightAcousticGuitar(ctx: AudioContext, destination: AudioNode) {
    // Warm low wood body resonance
    const woodBody = ctx.createOscillator();
    woodBody.type = 'sine';
    woodBody.frequency.setValueAtTime(82.41, ctx.currentTime); // E2 low guitar string

    const woodGain = ctx.createGain();
    woodGain.gain.setValueAtTime(0.09, ctx.currentTime);

    woodBody.connect(woodGain);
    woodGain.connect(destination);
    woodBody.start();

    this.soundscapeSource = woodBody;
    this.soundscapeNodes.push(woodGain);

    // Fingerpicked nylon string arpeggios (Em9 / Cmaj7)
    const guitarChords = [
      [164.81, 246.94, 329.63, 392.00, 493.88], // Em9
      [130.81, 196.00, 261.63, 329.63, 392.00], // Cmaj7
    ];
    let chordStep = 0;

    const playGuitarPlucks = () => {
      if (this.activeSoundscapeId !== 'twilight_acoustic_guitar') return;
      const currentChord = guitarChords[chordStep % guitarChords.length];
      chordStep++;

      currentChord.forEach((freq, idx) => {
        const pluckTime = ctx.currentTime + (idx * 0.5);
        const pluckOsc = ctx.createOscillator();
        pluckOsc.type = 'triangle';
        pluckOsc.frequency.setValueAtTime(freq, pluckTime);

        const woodFilter = ctx.createBiquadFilter();
        woodFilter.type = 'lowpass';
        woodFilter.frequency.setValueAtTime(1100, pluckTime);

        const pluckGain = ctx.createGain();
        pluckGain.gain.setValueAtTime(0.0001, pluckTime);
        pluckGain.gain.linearRampToValueAtTime(0.08, pluckTime + 0.01);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, pluckTime + 2.5);

        pluckOsc.connect(woodFilter);
        woodFilter.connect(pluckGain);
        pluckGain.connect(destination);

        pluckOsc.start(pluckTime);
        pluckOsc.stop(pluckTime + 2.6);

        this.soundscapeNodes.push(pluckOsc, woodFilter, pluckGain);
      });
    };

    playGuitarPlucks();
    const interval = window.setInterval(playGuitarPlucks, 4600);
    this.soundscapeIntervals.push(interval);
  }

  private startSolfeggio639Hz(ctx: AudioContext, destination: AudioNode) {
    // 639 Hz (Heart Harmony & Peace) + 319.5 Hz sub-tone
    const osc639 = ctx.createOscillator();
    const oscSub = ctx.createOscillator();

    osc639.type = 'sine';
    osc639.frequency.setValueAtTime(639, ctx.currentTime);

    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(319.5, ctx.currentTime);

    // 0.08 Hz breath cycle modulation (approx 12-second slow breath)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(0.035, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.17, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    osc639.connect(gainNode);
    oscSub.connect(gainNode);
    gainNode.connect(destination);

    lfo.start();
    osc639.start();
    oscSub.start();

    this.soundscapeSource = osc639;
    this.soundscapeNodes.push(oscSub, lfo, lfoGain, gainNode);
  }

  private startMidnightOceanWaves(ctx: AudioContext, destination: AudioNode) {
    // Low frequency ocean floor sub rumble
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(42, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.12, ctx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(destination);
    subOsc.start();

    // Dual noise wave wash
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (last + 0.03 * white) / 1.03;
      last = output[i];
      output[i] *= 2.8;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    // 0.08 Hz tidal cycle swell (~12.5 seconds per wave)
    const waveLfo = ctx.createOscillator();
    const waveLfoGain = ctx.createGain();
    waveLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    waveLfoGain.gain.setValueAtTime(0.14, ctx.currentTime);

    const surfGain = ctx.createGain();
    surfGain.gain.setValueAtTime(0.18, ctx.currentTime);

    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(surfGain.gain);

    noiseSrc.connect(filter);
    filter.connect(surfGain);
    surfGain.connect(destination);

    waveLfo.start();
    noiseSrc.start();

    this.soundscapeSource = noiseSrc;
    this.soundscapeNodes.push(subOsc, subGain, filter, waveLfo, waveLfoGain, surfGain);
  }

  // -------------------------------------------------------------
  // 2. ALARM SYNTHESIZER & PHONE MUSIC AWAKENING TONES
  // -------------------------------------------------------------
  public playAlarm(sound: AlarmSoundId, volumePercent: number = 80, customAudioUrl?: string) {
    this.stopAlarm();
    this.isAlarmActive = true;

    // Check if custom audio URL from phone is provided
    if (customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.loop = true;
        audio.volume = Math.min(1.0, Math.max(0.05, volumePercent / 100));
        audio.play().catch(err => {
          console.warn('Autoplay of custom phone audio was restricted, falling back to gentle synth:', err);
          this.playProceduralAlarm(sound, volumePercent);
        });
        this.customAlarmAudio = audio;
        return;
      } catch (e) {
        console.warn('Failed custom audio load:', e);
      }
    }

    this.playProceduralAlarm(sound, volumePercent);
  }

  private playProceduralAlarm(sound: AlarmSoundId, volumePercent: number = 80) {
    const ctx = this.initAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(1.0, (volumePercent / 100) * 0.7), ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.alarmGain = masterGain;

    const triggerStroke = () => {
      if (!this.isAlarmActive) return;
      if (sound === 'zen_bowl') {
        this.synthesizeZenBowl(ctx, masterGain);
      } else if (sound === 'gentle_harp') {
        this.synthesizeHarpArpeggio(ctx, masterGain);
      } else if (sound === 'binaural_dawn') {
        this.synthesizeDawnPad(ctx, masterGain);
      } else if (sound === 'soft_marimba') {
        this.synthesizeMarimba(ctx, masterGain);
      } else if (sound === 'phone_track_sunrise_acoustic') {
        this.synthesizeAcousticGuitarSample(ctx, masterGain);
      } else if (sound === 'phone_track_pacific_breeze') {
        this.synthesizePacificDawnSample(ctx, masterGain);
      } else {
        this.synthesizeForestFlute(ctx, masterGain);
      }
    };

    triggerStroke();
    // Repeat alarm chime every 3.8 seconds until stopped/snoozed
    this.alarmInterval = window.setInterval(triggerStroke, 3800);
  }

  public stopAlarm() {
    this.isAlarmActive = false;

    if (this.customAlarmAudio) {
      try {
        this.customAlarmAudio.pause();
        this.customAlarmAudio.currentTime = 0;
      } catch {
        // safe cleanup
      }
      this.customAlarmAudio = null;
    }

    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.alarmGain) {
      try {
        this.alarmGain.disconnect();
      } catch {
        // Safe disposal
      }
      this.alarmGain = null;
    }
  }

  // --- Dedicated Standalone Preview for Local Phone Tracks ---
  public playTrackPreview(audioUrl?: string, trackId?: string, volumePercent: number = 75) {
    this.stopTrackPreview();

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.volume = Math.min(1.0, Math.max(0.05, volumePercent / 100));
        audio.play().catch(e => console.warn('Preview blocked:', e));
        this.previewAudio = audio;
        return;
      } catch (e) {
        console.warn('Track preview failed:', e);
      }
    }

    // Play synthetic preview for built-in or pre-seeded sample tracks
    if (trackId) {
      this.playAlarm(trackId as AlarmSoundId, volumePercent);
    }
  }

  public stopTrackPreview() {
    if (this.previewAudio) {
      try {
        this.previewAudio.pause();
        this.previewAudio.currentTime = 0;
      } catch {
        // safe cleanup
      }
      this.previewAudio = null;
    }
    this.stopAlarm();
  }

  public isAlarmRinging(): boolean {
    return this.isAlarmActive;
  }

  private synthesizeZenBowl(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    const freqs = [216, 542, 1084, 1626];
    const decays = [3.2, 2.5, 1.8, 1.2];
    const amps = [0.45, 0.25, 0.12, 0.05];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(amps[idx], t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decays[idx]);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t);
      osc.stop(t + decays[idx]);
    });
  }

  private synthesizeHarpArpeggio(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    // Pentatonic C major notes: C4, E4, G4, B4, D5
    const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
    notes.forEach((freq, i) => {
      const noteTime = t + (i * 0.18);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.8);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(noteTime);
      osc.stop(noteTime + 1.9);
    });
  }

  private synthesizeDawnPad(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    const freqs = [174.61, 220.00, 261.63, 329.63]; // Fmaj7 soothing morning chord
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(t);
      osc.stop(t + 3.3);
    });
  }

  private synthesizeMarimba(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    const notes = [392.0, 440.0, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.15);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.7);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.8);
    });
  }

  private synthesizeForestFlute(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    const freqs = [587.33, 659.25, 880.0];
    freqs.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.3);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(noteTime);
      osc.stop(noteTime + 1.3);
    });
  }

  private synthesizeAcousticGuitarSample(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    // Acoustic fingerpicked arpeggio: E3, B3, E4, G4, B4, D5 (Warm awakening morning chord)
    const notes = [164.81, 246.94, 329.63, 392.00, 493.88, 587.33];
    notes.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.16);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Triangle wave with slight warm low-pass filter gives nylon acoustic string timbre
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.4);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(noteTime);
      osc.stop(noteTime + 1.5);
    });
  }

  private synthesizePacificDawnSample(ctx: AudioContext, destination: AudioNode) {
    const t = ctx.currentTime;
    // Gentle melodic sunrise tones with soft ocean wash: A4, C#5, E5, G#5
    const notes = [440.00, 554.37, 659.25, 830.61];
    notes.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.22);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.6);

      osc.connect(gain);
      gain.connect(destination);
      osc.start(noteTime);
      osc.stop(noteTime + 1.7);
    });
  }

  // -------------------------------------------------------------
  // 3. NOCTURNAL ACOUSTIC TRACKER (Snore, Insomnia, Noise Spike)
  // -------------------------------------------------------------
  public async startAcousticMonitoring(
    onMetrics: (metrics: AcousticMetrics) => void,
    onEvent: (event: NocturnalAudioEvent) => void
  ) {
    this.stopAcousticMonitoring();
    this.onMetricsUpdate = onMetrics;
    this.onDisorderDetected = onEvent;
    this.isMonitoring = true;
    this.peakSessionDb = 32;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          } 
        });

        const ctx = this.initAudioContext();
        const source = ctx.createMediaStreamSource(this.micStream);
        this.analyser = ctx.createAnalyser();
        this.analyser.fftSize = 1024;
        this.analyser.smoothingTimeConstant = 0.8;
        source.connect(this.analyser);

        this.isSimulatedMonitoring = false;
        this.runRealAudioLoop();
      } else {
        throw new Error('getUserMedia not supported');
      }
    } catch (err) {
      console.warn('Microphone access restricted or denied. Activating Nocturnal Acoustic Simulator:', err);
      this.isSimulatedMonitoring = true;
      this.startSimulatedAudioLoop();
    }
  }

  public stopAcousticMonitoring() {
    this.isMonitoring = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.simIntervalId !== null) {
      clearInterval(this.simIntervalId);
      this.simIntervalId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    this.analyser = null;
    this.isSimulatedMonitoring = false;
  }

  public isAcousticMonitoring(): boolean {
    return this.isMonitoring;
  }

  private runRealAudioLoop() {
    if (!this.isMonitoring || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const timeDomainData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.isMonitoring || !this.analyser) return;

      this.analyser.getByteTimeDomainData(timeDomainData);
      this.analyser.getByteFrequencyData(freqData);

      // Compute RMS decibels
      let sumSquares = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (timeDomainData[i] - 128) / 128;
        sumSquares += val * val;
      }
      const rms = Math.sqrt(sumSquares / bufferLength);
      // Calibrated approximation: 30 dB ambient quiet to 85 dB loud
      const rawDb = 20 * Math.log10(Math.max(rms, 0.0001)) + 80;
      const currentDb = Math.round(Math.max(28, Math.min(88, rawDb)));
      this.peakSessionDb = Math.max(this.peakSessionDb, currentDb);

      // Analyze frequency bands
      // Bin resolution ~ 44100 / 1024 = ~43 Hz per bin
      let lowEnergy = 0; // 60 - 350 Hz (bins 1 to 8)
      for (let i = 1; i <= 8; i++) lowEnergy += freqData[i];
      lowEnergy = Math.round(lowEnergy / 8);

      let midEnergy = 0; // 400 - 1500 Hz (bins 9 to 35)
      for (let i = 9; i <= 35; i++) midEnergy += freqData[i];
      midEnergy = Math.round(midEnergy / 27);

      let highEnergy = 0; // > 2000 Hz (bins 46 to 100)
      for (let i = 46; i <= 100; i++) highEnergy += freqData[i];
      highEnergy = Math.round(highEnergy / 55);

      // Compute snoring probability
      // Snoring features: high low-energy resonance (80-250Hz), low-to-mid ratio, decibels > 44 dB
      const lowRatio = (lowEnergy + 1) / (midEnergy + highEnergy + 2);
      let snoreProb = 0;
      if (currentDb >= 44 && lowEnergy > 45) {
        snoreProb = Math.min(96, Math.round(lowRatio * 45 + (currentDb - 40) * 1.5));
      }

      // Restlessness / movement score
      let restlessScore = 0;
      if (currentDb >= 42 && midEnergy > 40) {
        restlessScore = Math.min(92, Math.round(midEnergy * 0.8));
      }

      // Dispatch real-time metrics
      if (this.onMetricsUpdate) {
        this.onMetricsUpdate({
          currentDb,
          peakDb: this.peakSessionDb,
          snoringProbability: snoreProb,
          restlessnessScore: restlessScore,
          frequencyBands: {
            lowHz: lowEnergy,
            midHz: midEnergy,
            highHz: highEnergy,
          },
          isMicActive: true,
          isSimulated: false,
        });
      }

      // Disorder Event Classification & Debouncing
      const now = Date.now();
      if (snoreProb > 72) {
        this.snoreHoldCount++;
        if (this.snoreHoldCount > 18 && (now - this.lastEventTime > 25000)) {
          this.triggerDisorderEvent({
            type: 'snoring',
            decibels: currentDb,
            durationSeconds: Math.floor(Math.random() * 8) + 12,
            confidence: snoreProb,
            title: 'Nocturnal Snoring Vibration',
            description: `Acoustic waveform exhibited low-frequency harmonic resonance (${currentDb} dB).`,
          });
          this.snoreHoldCount = 0;
          this.lastEventTime = now;
        }
      } else {
        this.snoreHoldCount = Math.max(0, this.snoreHoldCount - 1);
      }

      // Restless / Movement spike
      if (restlessScore > 75 && (now - this.lastEventTime > 30000)) {
        this.triggerDisorderEvent({
          type: 'restless_movement',
          decibels: currentDb,
          durationSeconds: 6,
          confidence: restlessScore,
          title: 'Bedside Movement / Tossing Rustle',
          description: `Mid-frequency transient movement burst detected (${currentDb} dB).`,
        });
        this.lastEventTime = now;
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  private startSimulatedAudioLoop() {
    let tick = 0;
    this.simIntervalId = window.setInterval(() => {
      if (!this.isMonitoring) return;
      tick++;

      // Baseline bedroom ambient quiet is 30-35 dB with subtle natural drift
      const baseDb = 32 + Math.sin(tick * 0.3) * 2;
      const noiseFluctuation = (Math.random() - 0.5) * 3;
      const currentDb = Math.round(Math.max(28, baseDb + noiseFluctuation));
      this.peakSessionDb = Math.max(this.peakSessionDb, currentDb);

      if (this.onMetricsUpdate) {
        this.onMetricsUpdate({
          currentDb,
          peakDb: this.peakSessionDb,
          snoringProbability: 8,
          restlessnessScore: 12,
          frequencyBands: {
            lowHz: 18 + Math.floor(Math.random() * 8),
            midHz: 14 + Math.floor(Math.random() * 6),
            highHz: 8 + Math.floor(Math.random() * 4),
          },
          isMicActive: false,
          isSimulated: true,
        });
      }
    }, 400);
  }

  public simulateManualEvent(type: SleepDisorderType) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (type === 'snoring') {
      const db = 52 + Math.floor(Math.random() * 8);
      this.peakSessionDb = Math.max(this.peakSessionDb, db);
      this.triggerDisorderEvent({
        type: 'snoring',
        decibels: db,
        durationSeconds: 16,
        confidence: 93,
        title: 'Snoring Vibration Detected (Simulated)',
        description: `Persistent 140 Hz pharyngeal tissue vibration burst recorded at ${timeStr}.`,
      });
    } else if (type === 'insomnia_wakefulness') {
      const db = 44 + Math.floor(Math.random() * 6);
      this.peakSessionDb = Math.max(this.peakSessionDb, db);
      this.triggerDisorderEvent({
        type: 'insomnia_wakefulness',
        decibels: db,
        durationSeconds: 35,
        confidence: 89,
        title: 'Insomnia Wakefulness Episode (Simulated)',
        description: `Prolonged restless wakefulness detected without deep delta sleep transition at ${timeStr}.`,
      });
    } else if (type === 'respiratory_apnea_pause') {
      const db = 58;
      this.peakSessionDb = Math.max(this.peakSessionDb, db);
      this.triggerDisorderEvent({
        type: 'respiratory_apnea_pause',
        decibels: db,
        durationSeconds: 14,
        confidence: 86,
        title: 'Nocturnal Respiratory Pause (Simulated)',
        description: `Brief 12-second airway cessation pattern followed by compensatory breath intake at ${timeStr}.`,
      });
    } else if (type === 'restless_movement') {
      const db = 46;
      this.peakSessionDb = Math.max(this.peakSessionDb, db);
      this.triggerDisorderEvent({
        type: 'restless_movement',
        decibels: db,
        durationSeconds: 8,
        confidence: 82,
        title: 'Restless Body Turning (Simulated)',
        description: `Bed linen friction and posture reorientation detected at ${timeStr}.`,
      });
    }
  }

  private triggerDisorderEvent(details: {
    type: SleepDisorderType;
    decibels: number;
    durationSeconds: number;
    confidence: number;
    title: string;
    description: string;
  }) {
    if (this.onDisorderDetected) {
      const event: NocturnalAudioEvent = {
        id: `noct_evt_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: details.type,
        decibels: details.decibels,
        durationSeconds: details.durationSeconds,
        confidence: details.confidence,
        title: details.title,
        description: details.description,
      };
      this.onDisorderDetected(event);
    }
  }
}

export const sleepAudioEngine = new SleepAudioEngine();
