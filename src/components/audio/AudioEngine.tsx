import { Volume2, VolumeX, Waves, Music, CloudRain } from 'lucide-react';
import { useAudioEngine } from '../../hooks/useAudioEngine';

export default function AudioEngine() {
  const { config, binauralConfigs, toggleBinaural, toggleLofi, toggleRain, setVolume, isPlaying } = useAudioEngine();

  return (
    <div className="animate-enter animate-enter-delay-1 space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gradient-primary mb-1">Cognitive Audio Synthesis</h1>
        <p className="text-sm text-text-secondary">Procedurally generated binaural beats and ambient soundscapes for optimal focus states.</p>
      </div>

      <div className="glass rounded-xl p-6 glow-primary">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Waves size={18} className="text-primary-glow" />
            <h2 className="text-lg font-semibold text-text-primary">Binaural Beat Oscillators</h2>
          </div>
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                Active
              </span>
            ) : (
              <span className="badge bg-text-tertiary/10 text-text-tertiary border border-border">
                Standby
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {binauralConfigs.map(cfg => {
            const isActive = config.activeBinaural === cfg.name;
            return (
              <button
                key={cfg.name}
                onClick={() => toggleBinaural(cfg.name)}
                className={`relative rounded-xl p-5 text-left transition-all duration-300 border ${
                  isActive
                    ? 'border-primary/40 bg-primary/5 glow-primary'
                    : 'border-border bg-surface-elevated/50 hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${isActive ? 'text-primary-glow' : 'text-text-primary'}`}>
                    {cfg.label}
                  </span>
                  <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isActive ? 'bg-primary border-primary' : 'border-text-tertiary'
                  }`} />
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{cfg.subtitle}</p>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl border-2 border-primary/20 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        <div className="divider mb-6" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-accent-teal" />
            <h3 className="text-sm font-semibold text-text-primary">Ambient Overlays</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={toggleLofi}
            className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-300 ${
              config.lofiEnabled
                ? 'border-accent-teal/40 bg-accent-teal/5'
                : 'border-border bg-surface-elevated/50 hover:border-border-strong'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${config.lofiEnabled ? 'bg-accent-teal/10' : 'bg-white/5'}`}>
              <Music size={20} className={config.lofiEnabled ? 'text-accent-teal' : 'text-text-tertiary'} />
            </div>
            <div className="text-left flex-1">
              <span className={`text-sm font-medium block ${config.lofiEnabled ? 'text-accent-teal-glow' : 'text-text-primary'}`}>
                Lofi Chords
              </span>
              <span className="text-xs text-text-tertiary">Warm synthesized chord pads</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${
              config.lofiEnabled ? 'bg-accent-teal' : 'bg-surface-elevated border border-border'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                config.lofiEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          <button
            onClick={toggleRain}
            className={`flex items-center gap-4 rounded-xl p-4 border transition-all duration-300 ${
              config.rainEnabled
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-surface-elevated/50 hover:border-border-strong'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${config.rainEnabled ? 'bg-primary/10' : 'bg-white/5'}`}>
              <CloudRain size={20} className={config.rainEnabled ? 'text-primary-glow' : 'text-text-tertiary'} />
            </div>
            <div className="text-left flex-1">
              <span className={`text-sm font-medium block ${config.rainEnabled ? 'text-primary-glow' : 'text-text-primary'}`}>
                Deep Rain
              </span>
              <span className="text-xs text-text-tertiary">Brownian noise rain synthesis</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${
              config.rainEnabled ? 'bg-primary' : 'bg-surface-elevated border border-border'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                config.rainEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setVolume(config.volume === 0 ? 0.5 : 0)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {config.volume === 0 ? <VolumeX size={18} className="text-text-tertiary" /> : <Volume2 size={18} className="text-text-secondary" />}
          </button>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-elevated rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #6366f1 ${config.volume * 100}%, rgba(255,255,255,0.06) ${config.volume * 100}%)`,
              }}
            />
          </div>
          <span className="text-xs text-text-tertiary w-10 text-right">{Math.round(config.volume * 100)}%</span>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Frequency Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
            <span className="text-primary-glow font-semibold block mb-1">Alpha (8-12 Hz)</span>
            <span className="text-text-secondary">Relaxed alertness. Ideal for creative work, light studying, and reading comprehension.</span>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
            <span className="text-accent-teal font-semibold block mb-1">Beta (13-30 Hz)</span>
            <span className="text-text-secondary">Active thinking and problem solving. Best for analytical tasks and exam preparation.</span>
          </div>
          <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
            <span className="text-accent-emerald font-semibold block mb-1">Gamma (30-100 Hz)</span>
            <span className="text-text-secondary">Peak cognitive function. Enhances memory retention and complex information processing.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
