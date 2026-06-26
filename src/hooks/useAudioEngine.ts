import { useRef, useCallback, useEffect } from 'react';
import { useAudioConfig } from '../context/AcademicContext';

interface BinauralConfig {
  name: 'alpha' | 'beta' | 'gamma';
  baseFreq: number;
  beatFreq: number;
  label: string;
  subtitle: string;
}

const BINAURAL_CONFIGS: BinauralConfig[] = [
  { name: 'alpha', baseFreq: 200, beatFreq: 10, label: 'Alpha Waves (10 Hz)', subtitle: 'For Creative Flow & Calm Study / Calm Focus' },
  { name: 'beta', baseFreq: 200, beatFreq: 14, label: 'Beta Waves (14 Hz)', subtitle: 'For High-Alert Logic & Exam Cramming / Analytical processing matrix' },
  { name: 'gamma', baseFreq: 200, beatFreq: 40, label: 'Gamma Waves (40 Hz)', subtitle: 'For Peak Cognition & Heavy Memory Retention / Advanced Memory Retention mapping' },
];

export function useAudioEngine() {
  const { config, setConfig } = useAudioConfig();
  const audioContextRef = useRef<AudioContext | null>(null);
  const binauralNodesRef = useRef<{
    leftOsc: OscillatorNode;
    rightOsc: OscillatorNode;
    leftGain: GainNode;
    rightGain: GainNode;
    merger: ChannelMergerNode;
    masterGain: GainNode;
  } | null>(null);
  const lofiNodesRef = useRef<{
    oscs: OscillatorNode[];
    gains: GainNode[];
    masterGain: GainNode;
  } | null>(null);
  const rainNodesRef = useRef<{
    bufferSource: AudioBufferSourceNode;
    gain: GainNode;
  } | null>(null);

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopBinaural = useCallback(() => {
    if (binauralNodesRef.current) {
      try {
        binauralNodesRef.current.leftOsc.stop();
        binauralNodesRef.current.rightOsc.stop();
      } catch {
        // ignore if already stopped
      }
      binauralNodesRef.current = null;
    }
  }, []);

  const startBinaural = useCallback((type: 'alpha' | 'beta' | 'gamma') => {
    const ctx = getAudioContext();
    stopBinaural();

    const cfg = BINAURAL_CONFIGS.find(c => c.name === type);
    if (!cfg) return;

    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    const merger = ctx.createChannelMerger(2);
    const masterGain = ctx.createGain();

    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.value = cfg.baseFreq;
    rightOsc.frequency.value = cfg.baseFreq + cfg.beatFreq;

    const vol = config.volume * 0.15;
    leftGain.gain.value = vol;
    rightGain.gain.value = vol;
    masterGain.gain.value = 1;

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(masterGain);
    masterGain.connect(ctx.destination);

    leftOsc.start();
    rightOsc.start();

    binauralNodesRef.current = { leftOsc, rightOsc, leftGain, rightGain, merger, masterGain };
    setConfig({ ...config, activeBinaural: type, lofiEnabled: false, rainEnabled: false });
  }, [getAudioContext, stopBinaural, config, setConfig]);

  const stopLofi = useCallback(() => {
    if (lofiNodesRef.current) {
      lofiNodesRef.current.oscs.forEach(osc => {
        try { osc.stop(); } catch { /* ignore */ }
      });
      lofiNodesRef.current = null;
    }
  }, []);

  const startLofi = useCallback(() => {
    const ctx = getAudioContext();
    stopLofi();

    const chords = [
      [261.63, 329.63, 392.00],
      [293.66, 349.23, 440.00],
      [329.63, 392.00, 493.88],
      [349.23, 440.00, 523.25],
    ];

    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    const masterGain = ctx.createGain();
    masterGain.gain.value = config.volume * 0.08;

    chords[0].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      oscs.push(osc);
      gains.push(gain);
    });

    masterGain.connect(ctx.destination);
    lofiNodesRef.current = { oscs, gains, masterGain };
    setConfig({ ...config, lofiEnabled: true, activeBinaural: null, rainEnabled: false });
  }, [getAudioContext, stopLofi, config, setConfig]);

  const createBrownNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const duration = 2;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }, []);

  const stopRain = useCallback(() => {
    if (rainNodesRef.current) {
      try { rainNodesRef.current.bufferSource.stop(); } catch { /* ignore */ }
      rainNodesRef.current = null;
    }
  }, []);

  const startRain = useCallback(() => {
    const ctx = getAudioContext();
    stopRain();

    const buffer = createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = config.volume * 0.12;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    rainNodesRef.current = { bufferSource: source, gain };
    setConfig({ ...config, rainEnabled: true, activeBinaural: null, lofiEnabled: false });
  }, [getAudioContext, stopRain, createBrownNoiseBuffer, config, setConfig]);

  const toggleBinaural = useCallback((type: 'alpha' | 'beta' | 'gamma') => {
    if (config.activeBinaural === type) {
      stopBinaural();
      setConfig({ ...config, activeBinaural: null });
    } else {
      startBinaural(type);
    }
  }, [config, stopBinaural, startBinaural, setConfig]);

  const toggleLofi = useCallback(() => {
    if (config.lofiEnabled) {
      stopLofi();
      setConfig({ ...config, lofiEnabled: false });
    } else {
      startLofi();
    }
  }, [config, stopLofi, startLofi, setConfig]);

  const toggleRain = useCallback(() => {
    if (config.rainEnabled) {
      stopRain();
      setConfig({ ...config, rainEnabled: false });
    } else {
      startRain();
    }
  }, [config, stopRain, startRain, setConfig]);

  const setVolume = useCallback((volume: number) => {
    setConfig({ ...config, volume });
    const vol = volume;
    if (binauralNodesRef.current) {
      const v = vol * 0.15;
      binauralNodesRef.current.leftGain.gain.setValueAtTime(v, getAudioContext().currentTime);
      binauralNodesRef.current.rightGain.gain.setValueAtTime(v, getAudioContext().currentTime);
    }
    if (lofiNodesRef.current) {
      lofiNodesRef.current.masterGain.gain.setValueAtTime(vol * 0.08, getAudioContext().currentTime);
    }
    if (rainNodesRef.current) {
      rainNodesRef.current.gain.gain.setValueAtTime(vol * 0.12, getAudioContext().currentTime);
    }
  }, [config, setConfig, getAudioContext]);

  useEffect(() => {
    return () => {
      stopBinaural();
      stopLofi();
      stopRain();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopBinaural, stopLofi, stopRain]);

  return {
    config,
    binauralConfigs: BINAURAL_CONFIGS,
    toggleBinaural,
    toggleLofi,
    toggleRain,
    setVolume,
    isPlaying: config.activeBinaural !== null || config.lofiEnabled || config.rainEnabled,
  };
}
