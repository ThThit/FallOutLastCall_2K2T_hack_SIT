import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Star,
  Radio,
  Shield,
  MapPin,
  History,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";

interface UserStats {
  username: string;
  reputationScore: number;
  sector: number | null;
  role: string;
  totalSignals: number;
  trustedSignals: number;
  totalVerifications: number;
}

interface SettingsViewProps {
  onLogout?: () => void;
}

function reputationColor(score: number) {
  if (score >= 70) return "text-terminal-green";
  if (score >= 40) return "text-warning-amber";
  return "text-emergency-red";
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  const { user, logout, isLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/users/me/stats")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const roleColor =
    stats?.role === "MODERATOR"
      ? "text-cyan-400"
      : stats?.role === "ADMIN"
        ? "text-warning-amber"
        : "text-terminal-green";

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white">ACCOUNT INFORMATION</h3>
        </div>

        <div className="space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-charcoal border-2 border-terminal-green flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-terminal-green" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-mono text-lg mb-1 truncate">
                {user?.username ?? "—"}
              </div>
              <div className={`text-xs font-mono ${roleColor}`}>
                {statsLoading ? "LOADING..." : (stats?.role ?? "USER")}
              </div>
              <div className="text-xs text-terminal-green font-mono mt-0.5">
                STATUS: ACTIVE
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-terminal-green/10">
            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                SECTOR
              </div>
              <div className="text-sm text-white font-mono flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                {statsLoading
                  ? "—"
                  : stats?.sector != null
                    ? `SECTOR ${stats.sector}`
                    : "UNASSIGNED"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                REPUTATION
              </div>
              <div
                className={`text-sm font-mono flex items-center gap-1 ${statsLoading ? "text-muted-foreground" : reputationColor(stats?.reputationScore ?? 0)}`}
              >
                <Star className="w-3 h-3" />
                {statsLoading ? "—" : stats?.reputationScore}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                SIGNALS SENT
              </div>
              <div className="text-sm text-white font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 text-muted-foreground" />
                {statsLoading ? "—" : stats?.totalSignals}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                VERIFICATIONS
              </div>
              <div className="text-sm text-white font-mono flex items-center gap-1">
                <Shield className="w-3 h-3 text-muted-foreground" />
                {statsLoading ? "—" : stats?.totalVerifications}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                TRUSTED SIGNALS
              </div>
              <div className="text-sm text-terminal-green font-mono">
                {statsLoading ? "—" : stats?.trustedSignals}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-mono mb-1">
                ACCURACY
              </div>
              <div className="text-sm text-terminal-green font-mono">
                {statsLoading || !stats
                  ? "—"
                  : stats.totalSignals > 0
                    ? `${Math.round((stats.trustedSignals / stats.totalSignals) * 100)}%`
                    : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade History — placeholder until backend is ready */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white">TRADE HISTORY</h3>
        </div>
        <div className="text-center py-8">
          <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <div className="text-muted-foreground font-mono text-sm">
            NO TRADES YET
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Completed trades will appear here
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-card border border-emergency-red/20 p-6">
        <button
          onClick={() => {
            logout();
            onLogout?.();
          }}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emergency-red/10 border border-emergency-red text-emergency-red font-mono text-sm tracking-wide hover:bg-emergency-red/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          {isLoading ? "DISCONNECTING..." : "DISCONNECT & LOG OUT"}
        </button>
      </div>
    </div>
  );
}
