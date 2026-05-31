import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SurvivorProfile } from "./components/survivor-profile";
import { SectorMap } from "./components/sector-map";
import { SettingsView } from "./components/settings-view";
import { VaultView } from "./components/vault-view";
import { MarketplaceView } from "./components/marketplace-view";
import { SignalFeedPage } from "./modules/signals/pages/SignalFeedPage";
import { ReputationLeaderboard } from "./components/reputation-leaderboard";
import { MemoryArchiveFeed } from "./components/MemoryArchiveFeed";
import { DEFAULT_ROUTE } from "./components/nav-config";
import { useAuth } from "./context/AuthContext";

function SignalsRoute() {
  const { user } = useAuth();
  return <SignalFeedPage authCallsign={user?.username} userRole={user?.role} />;
}

function MemoriesRoute() {
  const { user } = useAuth();
  return <MemoryArchiveFeed currentUser={user?.username ?? null} />;
}

function SurvivorsRoute() {
  return (
    <div className="space-y-8">
      <SurvivorProfile />
      <ReputationLeaderboard />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
        <Route path="/signals" element={<SignalsRoute />} />
        <Route path="/vault" element={<VaultView />} />
        <Route path="/market" element={<MarketplaceView />} />
        <Route path="/memories" element={<MemoriesRoute />} />
        <Route path="/survivors" element={<SurvivorsRoute />} />
        <Route path="/sectors" element={<SectorMap />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
