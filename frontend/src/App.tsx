import { useState } from "react";
import { useEffect } from "react";
import { Scanlines } from "./components/scanlines";
import { StatusBar } from "./components/status-bar";
import { Sidebar } from "./components/sidebar";
import { SignalStrength } from "./components/signal-strength";
import { SignalCard } from "./components/signal-card";
import { ResourceCard } from "./components/resource-card";
import { MemoryCard } from "./components/memory-card";
import { EmergencyAlert } from "./components/emergency-alert";
import { LoginScreen } from "./components/login-screen";
import { SurvivorProfile } from "./components/survivor-profile";
import { MobileNav } from "./components/mobile-nav";
import { NoiseOverlay } from "./components/noise-overlay";
import { SectorMap } from "./components/sector-map";
import { AlertsView } from "./components/alerts-view";
import { CRTGlow } from "./components/crt-glow";
import { BroadcastComposer } from "./components/broadcast-composer";
import { SettingsView } from "./components/settings-view";
import { VaultView } from "./components/vault-view";
import { TradeModal } from "./components/trade-modal";
import { Plus } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import axiosClient from "./api/axiosClient";

function AppContent() {
  const { isLoggedIn } = useAuth();
  const [activeSection, setActiveSection] = useState('signals');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedMarketItem, setSelectedMarketItem] = useState<any>(null);
  const [signalSort, setSignalSort] = useState<'date' | 'trust'>('date');
  const [marketSort, setMarketSort] = useState<'rarity' | 'condition'>('rarity');
  const [memorySort, setMemorySort] = useState<'date' | 'decay'>('date');
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await axiosClient.get('/signals');
        setSignals(response.data);
      } catch (error) {
        console.error('Failed to fetch signals:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }



  const handleTradeSubmit = (marketItemId: string, offeredItemIds: string[]) => {
    // Handle trade submission
    console.log('Trade submitted:', { marketItemId, offeredItemIds });
    // In a real app, this would send the trade offer to the backend
    alert(`Trade offer sent! You offered ${offeredItemIds.length} item(s) for market item ${marketItemId}`);
  };

  return (
    <div className="size-full bg-background flex flex-col overflow-hidden">
      <Scanlines />
      <NoiseOverlay />
      <CRTGlow />
      <StatusBar />

      <div className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        <div className="hidden md:block">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="tracking-tight text-white mb-1">
                  {activeSection === 'signals' && 'SIGNAL FEED'}
                  {activeSection === 'vault' && 'PERSONAL VAULT'}
                  {activeSection === 'market' && 'RESOURCE MARKET'}
                  {activeSection === 'memories' && 'MEMORY ARCHIVE'}
                  {activeSection === 'survivors' && 'SURVIVOR PROFILE'}
                  {activeSection === 'sectors' && 'SECTOR MAP'}
                  {activeSection === 'alerts' && 'EMERGENCY ALERTS'}
                  {activeSection === 'settings' && 'ABOUT ME'}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {activeSection === 'signals' && 'Real-time survivor broadcasts'}
                  {activeSection === 'vault' && 'Your protected inventory storage'}
                  {activeSection === 'market' && 'Essential supplies for trade'}
                  {activeSection === 'memories' && 'Messages from the fallen'}
                  {activeSection === 'survivors' && 'Your network profile'}
                  {activeSection === 'sectors' && 'Tactical zone overview'}
                  {activeSection === 'alerts' && 'Critical system notifications'}
                  {activeSection === 'settings' && 'Account & preferences'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SignalStrength />
                {activeSection === 'signals' && (
                  <button
                    onClick={() => setShowEmergency(true)}
                    className="px-4 py-2 bg-emergency-red/10 hover:bg-emergency-red/20 text-emergency-red font-mono text-xs tracking-wide transition-colors border border-emergency-red/30"
                  >
                    TEST ALERT
                  </button>
                )}
              </div>
            </div>

            {activeSection === 'signals' && (
              <div className="space-y-4">
                {/* Sorting Controls */}
                <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
                  <span className="text-xs text-muted-foreground font-mono">SORT BY:</span>
                  <button
                    onClick={() => setSignalSort('date')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${signalSort === 'date'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    DATE
                  </button>
                  <button
                    onClick={() => setSignalSort('trust')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${signalSort === 'trust'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    TRUST SCORE
                  </button>
                </div>

                <button
                  onClick={() => setShowBroadcast(true)}
                  className="w-full border-2 border-dashed border-terminal-green/30 hover:border-terminal-green/50 py-6 flex items-center justify-center gap-2 text-terminal-green font-mono text-sm tracking-wide transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  BROADCAST NEW SIGNAL
                </button>
                {signals
                  .sort((a, b) => {
                    if (signalSort === 'trust') {
                      return b.trustScore - a.trustScore;
                    }
                    return 0; // Keep original order for date
                  })
                  .map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
              </div>
            )}

            {activeSection === 'vault' && <VaultView />}

            {activeSection === 'market' && (
              <div className="space-y-4">
                {/* Sorting Controls */}
                <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
                  <span className="text-xs text-muted-foreground font-mono">SORT BY:</span>
                  <button
                    onClick={() => setMarketSort('rarity')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${marketSort === 'rarity'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    RARITY
                  </button>
                  <button
                    onClick={() => setMarketSort('condition')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${marketSort === 'condition'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    CONDITION
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                </div>
              </div>
            )}

            {activeSection === 'memories' && (
              <div className="space-y-6">
                {/* Sorting Controls */}
                <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
                  <span className="text-xs text-muted-foreground font-mono">SORT BY:</span>
                  <button
                    onClick={() => setMemorySort('date')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${memorySort === 'date'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    DATE
                  </button>
                  <button
                    onClick={() => setMemorySort('decay')}
                    className={`px-3 py-1 font-mono text-xs transition-colors ${memorySort === 'decay'
                      ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
                      : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
                      }`}
                  >
                    DECAY STATUS
                  </button>
                </div>

                <div className="bg-dark-gray border border-warning-amber/30 p-4">
                  <div className="text-xs font-mono text-warning-amber tracking-wide">
                    ⚠ ARCHIVE DEGRADATION WARNING
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Older entries experiencing data corruption. Memories fade with time.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                </div>
              </div>
            )}

            {activeSection === 'survivors' && <SurvivorProfile />}

            {activeSection === 'sectors' && <SectorMap />}

            {activeSection === 'alerts' && <AlertsView />}

            {activeSection === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {showEmergency && <EmergencyAlert onClose={() => setShowEmergency(false)} />}
      {showBroadcast && <BroadcastComposer onClose={() => setShowBroadcast(false)} />}


      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}