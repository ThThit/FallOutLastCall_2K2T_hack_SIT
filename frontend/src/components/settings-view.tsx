import { User, LogOut, History, ArrowLeftRight } from "lucide-react";

interface SettingsViewProps {
  onLogout: () => void;
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  const tradeHistory = [
    {
      id: 't1',
      date: '2026-05-28',
      type: 'COMPLETED',
      gave: '3x CANNED BEANS',
      received: '1x GAS MASK FILTER',
      trader: 'OUTPOST-12',
    },
    {
      id: 't2',
      date: '2026-05-26',
      type: 'COMPLETED',
      gave: '1x FLARE GUN',
      received: '4x ANTIBIOTICS',
      trader: 'MEDIC-77',
    },
    {
      id: 't3',
      date: '2026-05-24',
      type: 'COMPLETED',
      gave: '2x BATTERIES',
      received: '6x CANNED FOOD',
      trader: 'NOMAD-45',
    },
    {
      id: 't4',
      date: '2026-05-22',
      type: 'CANCELLED',
      gave: '1x WATER PURIFIER',
      received: '5x FUEL',
      trader: 'TECH-88',
    },
    {
      id: 't5',
      date: '2026-05-20',
      type: 'COMPLETED',
      gave: '5x ROPE',
      received: '2x MEDICAL KIT',
      trader: 'GUARDIAN-21',
    },
  ];

  return (
    <div className="space-y-6">
      {/* User Account Section */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white">ACCOUNT INFORMATION</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-charcoal border-2 border-terminal-green flex items-center justify-center">
              <User className="w-8 h-8 text-terminal-green" />
            </div>
            <div className="flex-1">
              <div className="text-white mb-1">RAVEN-47</div>
              <div className="text-xs text-muted-foreground font-mono">SURVIVOR ID: SRV-2047-NK</div>
              <div className="text-xs text-terminal-green font-mono mt-1">STATUS: ACTIVE</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-terminal-green/10">
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">JOINED</div>
              <div className="text-sm text-white font-mono">2025-11-03</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">TRUST LEVEL</div>
              <div className="text-sm text-terminal-green font-mono">VERIFIED</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">BROADCASTS</div>
              <div className="text-sm text-white font-mono">247</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">TRADES</div>
              <div className="text-sm text-white font-mono">89</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade History Section */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white">TRADE HISTORY</h3>
        </div>

        <div className="space-y-3">
          {tradeHistory.map((trade) => (
            <div
              key={trade.id}
              className="bg-charcoal border border-terminal-green/10 p-4 hover:border-terminal-green/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">{trade.date}</span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 border ${
                        trade.type === 'COMPLETED'
                          ? 'border-terminal-green/30 text-terminal-green bg-terminal-green/10'
                          : 'border-emergency-red/30 text-emergency-red bg-emergency-red/10'
                      }`}
                    >
                      {trade.type}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    WITH: <span className="text-cyan-400">{trade.trader}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-dark-gray border border-emergency-red/20 p-2">
                  <div className="text-xs text-muted-foreground font-mono mb-1">GAVE</div>
                  <div className="text-sm text-emergency-red font-mono">{trade.gave}</div>
                </div>

                <ArrowLeftRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 bg-dark-gray border border-terminal-green/20 p-2">
                  <div className="text-xs text-muted-foreground font-mono mb-1">RECEIVED</div>
                  <div className="text-sm text-terminal-green font-mono">{trade.received}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-card border border-emergency-red/20 p-6">
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 bg-emergency-red/10 border border-emergency-red text-emergency-red font-mono text-sm tracking-wide hover:bg-emergency-red/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          DISCONNECT & LOG OUT
        </button>
      </div>
    </div>
  );
}