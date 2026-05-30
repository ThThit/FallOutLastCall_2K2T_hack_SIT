import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
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
import { signalApi, type Signal } from "./lib/api";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('signals');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedMarketItem, setSelectedMarketItem] = useState<any>(null);
  const [signalSort, setSignalSort] = useState<'date' | 'trust'>('date');
  const [marketSort, setMarketSort] = useState<'rarity' | 'condition'>('rarity');
  const [memorySort, setMemorySort] = useState<'date' | 'decay'>('date');

  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [callsign, setCallsign] = useState(() => localStorage.getItem('callsign') ?? '');
  const [showCallsignPrompt, setShowCallsignPrompt] = useState(false);
  const [callsignInput, setCallsignInput] = useState('');

  useEffect(() => {
    if (isLoggedIn && activeSection === 'signals') {
      setSignalsLoading(true);
      signalApi.getAll({ sort: signalSort })
        .then(setSignals)
        .finally(() => setSignalsLoading(false));
    }
  }, [isLoggedIn, activeSection, signalSort]);

  useEffect(() => {
    if (isLoggedIn && activeSection === 'signals' && !callsign) {
      setShowCallsignPrompt(true);
    }
  }, [isLoggedIn, activeSection, callsign]);

  const handleSaveCallsign = () => {
    const trimmed = callsignInput.trim().toUpperCase();
    if (!trimmed) return;
    localStorage.setItem('callsign', trimmed);
    setCallsign(trimmed);
    setShowCallsignPrompt(false);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => { localStorage.setItem('isLoggedIn', 'true'); setIsLoggedIn(true); }} />;
  }


  const resources = [
    {
      id: '1',
      name: 'MEDICAL KIT',
      trader: 'OUTPOST-12',
      quantity: 3,
      condition: 'good' as const,
      cost: '2x FUEL',
      rarity: 'critical' as const,
    },
    {
      id: '2',
      name: 'BATTERIES (AA)',
      trader: 'NOMAD-45',
      quantity: 24,
      condition: 'pristine' as const,
      cost: '1x CANNED FOOD',
      rarity: 'uncommon' as const,
    },
    {
      id: '3',
      name: 'CANNED FOOD',
      trader: 'SAFEHOUSE-7',
      quantity: 12,
      condition: 'worn' as const,
      cost: '3x BATTERIES',
      rarity: 'common' as const,
    },
    {
      id: '4',
      name: 'AMMUNITION',
      trader: 'GUARDIAN-21',
      quantity: 50,
      condition: 'good' as const,
      cost: '1x MEDICINE',
      rarity: 'rare' as const,
    },
    {
      id: '5',
      name: 'RADIO PARTS',
      trader: 'TECH-88',
      quantity: 1,
      condition: 'damaged' as const,
      cost: '5x FUEL',
      rarity: 'rare' as const,
    },
    {
      id: '6',
      name: 'FUEL CANISTER',
      trader: 'NOMAD-12',
      quantity: 8,
      condition: 'good' as const,
      cost: '2x FOOD',
      rarity: 'uncommon' as const,
    },
  ];

  const memories = [
    {
      id: '1',
      author: 'SARAH-K',
      title: 'To whoever finds this',
      content: 'If you\'re reading this, I made it to the northern checkpoint. Tell my brother I tried. The sunset here reminds me of home.',
      date: '2026-04-15',
      daysAgo: 44,
      isDecayed: false,
    },
    {
      id: '2',
      author: 'ALEX-M',
      title: 'Birthday message',
      content: 'Happy 8th birthday Emma. Dad misses you every day. I hope you still remember our song. Stay strong, little one.',
      date: '2026-03-20',
      daysAgo: 70,
      isDecayed: true,
    },
    {
      id: '3',
      author: 'DR-CHEN',
      title: 'Medical log',
      content: 'F_nal ent_y. Vac_ine res_arch l_st. All s_mples c_rrup_ed. I\'m s_rry.',
      date: '2026-02-10',
      daysAgo: 108,
      isDecayed: true,
    },
    {
      id: '4',
      author: 'MARIA-L',
      title: 'Last transmission',
      content: 'The stars are beautiful tonight. I can see them clearly for the first time in months. Thank you for everything.',
      date: '2026-05-01',
      daysAgo: 28,
      isDecayed: false,
    },
  ];

  const vaultItems = [
    {
      id: 'v1',
      name: 'Water Purification Tablets',
      category: 'Medical',
      rarity: 'Rare' as const,
      condition: 95,
      quantity: 50,
    },
    {
      id: 'v2',
      name: 'Emergency Rations',
      category: 'Food',
      rarity: 'Common' as const,
      condition: 80,
      quantity: 12,
    },
    {
      id: 'v3',
      name: 'Signal Booster',
      category: 'Equipment',
      rarity: 'Epic' as const,
      condition: 70,
      quantity: 1,
    },
    {
      id: 'v4',
      name: 'Portable Generator',
      category: 'Tools',
      rarity: 'Legendary' as const,
      condition: 85,
      quantity: 1,
    },
    {
      id: 'v5',
      name: 'Flashlight Batteries',
      category: 'Equipment',
      rarity: 'Common' as const,
      condition: 100,
      quantity: 24,
    },
    {
      id: 'v6',
      name: 'First Aid Kit',
      category: 'Medical',
      rarity: 'Rare' as const,
      condition: 90,
      quantity: 3,
    },
  ];

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
                  {resources
                    .sort((a, b) => {
                      if (marketSort === 'rarity') {
                        const rarityOrder = { common: 0, uncommon: 1, rare: 2, critical: 3 };
                        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                      } else {
                        const conditionOrder = { damaged: 0, worn: 1, good: 2, pristine: 3 };
                        return conditionOrder[b.condition] - conditionOrder[a.condition];
                      }
                    })
                    .map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} onClick={() => {
                        setSelectedMarketItem(resource);
                        setShowTradeModal(true);
                      }} />
                    ))}
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
                  {memories
                    .sort((a, b) => {
                      if (memorySort === 'decay') {
                        return (b.isDecayed ? 1 : 0) - (a.isDecayed ? 1 : 0);
                      } else {
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                      }
                    })
                    .map((memory) => (
                      <MemoryCard key={memory.id} memory={memory} />
                    ))}
                </div>
              </div>
            )}

            {activeSection === 'survivors' && <SurvivorProfile />}

            {activeSection === 'sectors' && <SectorMap />}

            {activeSection === 'alerts' && <AlertsView />}

            {activeSection === 'settings' && <SettingsView onLogout={() => { localStorage.removeItem('isLoggedIn'); setIsLoggedIn(false); }} />}
          </div>
        </main>
      </div>

      {showEmergency && <EmergencyAlert onClose={() => setShowEmergency(false)} />}
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
      <TradeModal
        isOpen={showTradeModal}
        onClose={() => {
          setShowTradeModal(false);
          setSelectedMarketItem(null);
        }}
        marketItem={selectedMarketItem}
        vaultItems={vaultItems}
        onSubmitTrade={handleTradeSubmit}
      />

      <MobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}