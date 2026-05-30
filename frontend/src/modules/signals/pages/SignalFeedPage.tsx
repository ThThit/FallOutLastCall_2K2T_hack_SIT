import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { signalApi } from "../apis/signal.api";
import type { Signal } from "../types/signal.types";
import { SignalCard } from "../components/signal-card";
import { BroadcastComposer } from "../components/broadcast-composer";

export function SignalFeedPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalSort, setSignalSort] = useState<'date' | 'trust'>('date');
  const [showBroadcast, setShowBroadcast] = useState(false);

  const [callsign, setCallsign] = useState(() => localStorage.getItem('callsign') ?? '');
  const [showCallsignPrompt, setShowCallsignPrompt] = useState(false);
  const [callsignInput, setCallsignInput] = useState('');

  useEffect(() => {
    setSignalsLoading(true);
    signalApi.getAll({ sort: signalSort })
      .then(setSignals)
      .finally(() => setSignalsLoading(false));
  }, [signalSort]);

  useEffect(() => {
    if (!callsign) setShowCallsignPrompt(true);
  }, [callsign]);

  const handleSaveCallsign = () => {
    const trimmed = callsignInput.trim().toUpperCase();
    if (!trimmed) return;
    localStorage.setItem('callsign', trimmed);
    setCallsign(trimmed);
    setShowCallsignPrompt(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Identity + Sort — single combined bar */}
        <div className="flex items-center justify-between bg-charcoal border border-terminal-green/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">IDENTITY:</span>
            {callsign ? (
              <span className="text-xs font-mono text-terminal-green tracking-widest">{callsign}</span>
            ) : (
              <span className="text-xs font-mono text-warning-amber animate-pulse">NOT SET</span>
            )}
            <button
              onClick={() => { setCallsignInput(callsign); setShowCallsignPrompt(true); }}
              className="text-xs font-mono text-muted-foreground hover:text-terminal-green transition-colors ml-1"
            >
              [{callsign ? 'CHANGE' : 'SET'}]
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">SORT:</span>
            <button
              onClick={() => setSignalSort('date')}
              className={`px-2 py-0.5 font-mono text-xs transition-colors ${signalSort === 'date'
                  ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                  : 'border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                }`}
            >
              DATE
            </button>
            <button
              onClick={() => setSignalSort('trust')}
              className={`px-2 py-0.5 font-mono text-xs transition-colors ${signalSort === 'trust'
                  ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                  : 'border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                }`}
            >
              TRUST
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowBroadcast(true)}
          className="w-full border-2 border-dashed border-terminal-green/30 hover:border-terminal-green/50 py-6 flex items-center justify-center gap-2 text-terminal-green font-mono text-sm tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" />
          BROADCAST NEW SIGNAL
        </button>

        {signalsLoading && (
          <p className="text-xs font-mono text-muted-foreground text-center py-8 tracking-widest animate-pulse">
            SCANNING FREQUENCIES...
          </p>
        )}
        {!signalsLoading && signals.length === 0 && (
          <p className="text-xs font-mono text-muted-foreground text-center py-8">
            NO SIGNALS DETECTED
          </p>
        )}
        <AnimatePresence>
          {!signalsLoading && signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              callsign={callsign}
              onDelete={(id) => setSignals((prev) => prev.filter((s) => s.id !== id))}
              onUpdate={(updated) => setSignals((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s))}
            />
          ))}
        </AnimatePresence>
      </div>

      {showBroadcast && (
        <BroadcastComposer
          onClose={() => setShowBroadcast(false)}
          callsign={callsign}
          onCreated={(signal) => setSignals((prev) => [signal, ...prev])}
        />
      )}

      {showCallsignPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-w-sm w-full bg-dark-gray border-2 border-terminal-green/40 p-6">
            <h2 className="text-terminal-green font-mono text-sm tracking-widest mb-2">
              IDENTIFY YOURSELF
            </h2>
            <p className="text-xs text-muted-foreground font-mono mb-4">
              Enter your survivor callsign to broadcast on the network.
            </p>
            <input
              type="text"
              value={callsignInput}
              onChange={(e) => setCallsignInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveCallsign()}
              placeholder="e.g. OUTPOST-47"
              maxLength={20}
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none mb-4 tracking-widest"
              autoFocus
            />
            <button
              onClick={handleSaveCallsign}
              disabled={!callsignInput.trim()}
              className="w-full px-4 py-3 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm tracking-wide hover:bg-terminal-green/20 transition-colors disabled:opacity-50"
            >
              CONNECT TO NETWORK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
