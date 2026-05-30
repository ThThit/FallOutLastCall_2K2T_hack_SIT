import { useState } from "react";
import { Scanlines } from "./components/scanlines";
import { StatusBar } from "./components/status-bar";
import { Sidebar } from "./components/sidebar";
import { SignalStrength } from "./components/signal-strength";
import { ResourceCard } from "./components/resource-card";
import { MemoryCard } from "./components/memory-card";
import { LoginScreen } from "./components/login-screen";
import { SurvivorProfile } from "./components/survivor-profile";
import { MobileNav } from "./components/mobile-nav";
import { NoiseOverlay } from "./components/noise-overlay";
import { SectorMap } from "./components/sector-map";
import { CRTGlow } from "./components/crt-glow";
import { SettingsView } from "./components/settings-view";
import { VaultView } from "./components/vault-view";
import { MarketplaceView } from "./components/marketplace-view";
import { TradeModal } from "./components/trade-modal";
import { SignalFeedPage } from "./modules/signals/pages/SignalFeedPage";
import { ReputationLeaderboard } from "./components/reputation-leaderboard";
import { MemoryArchiveFeed } from "./components/MemoryArchiveFeed";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isLoggedIn, user } = useAuth();
  const [activeSection, setActiveSection] = useState('signals');
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedMarketItem, setSelectedMarketItem] = useState<any>(null);
  const [marketSort, setMarketSort] = useState<'rarity' | 'condition'>('rarity');
  const [memorySort, setMemorySort] = useState<'date' | 'decay'>('date');

  if (!isLoggedIn) {
    return <LoginScreen />;
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

        <main className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h1 className="tracking-tight text-white mb-1">
                  {activeSection === 'signals' && 'SIGNAL FEED'}
                  {activeSection === 'vault' && 'PERSONAL VAULT'}
                  {activeSection === 'market' && 'RESOURCE MARKET'}
                  {activeSection === 'memories' && 'MEMORY ARCHIVE'}
                  {activeSection === 'survivors' && 'SURVIVOR PROFILE'}
                  {activeSection === 'sectors' && 'SECTOR MAP'}
                  {activeSection === 'settings' && 'ABOUT ME'}
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  {activeSection === 'signals' && 'Real-time survivor broadcasts'}
                  {activeSection === 'vault' && 'Your protected inventory storage'}
                  {activeSection === 'market' && 'Essential supplies for trade'}
                  {activeSection === 'memories' && 'Messages from the fallen'}
                  {activeSection === 'survivors' && 'Your network profile'}
                  {activeSection === 'sectors' && 'Tactical zone overview'}
                  {activeSection === 'settings' && 'Account & preferences'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SignalStrength />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {activeSection === 'signals' && <SignalFeedPage authCallsign={user?.username} userRole={user?.role} />}

              {activeSection === 'vault' && <VaultView />}

              {activeSection === 'market' && <MarketplaceView />}

              {activeSection === 'memories' && (
                <MemoryArchiveFeed currentUser={user?.username ?? null} />
              )}

              {activeSection === 'survivors' && (
                <div className="space-y-8">
                  <SurvivorProfile />
                  <ReputationLeaderboard />
                </div>
              )}

              {activeSection === 'sectors' && <SectorMap />}


              {activeSection === 'settings' && <SettingsView />}
            </div>
          </div>
        </main>
      </div>

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