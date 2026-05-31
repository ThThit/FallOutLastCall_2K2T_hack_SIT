import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Users, Radio, AlertTriangle } from "lucide-react";
import axiosClient from "../api/axiosClient";

interface MyStats {
  sector: number;
  reputationScore: number;
  totalSignals: number;
  trustedSignals: number;
  totalVerifications: number;
}

interface LeaderboardEntry {
  username: string;
  sector: number;
  reputationScore: number;
}

interface SignalLite {
  sector: number;
  priority: string;
}

export function SurvivorProfile() {
  const [stats, setStats] = useState<MyStats | null>(null);
  const [survivors, setSurvivors] = useState<LeaderboardEntry[]>([]);
  const [signals, setSignals] = useState<SignalLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosClient.get("/users/me/stats").then((r) => r.data).catch(() => null),
      axiosClient.get("/users/leaderboard?limit=100").then((r) => r.data).catch(() => []),
      axiosClient.get("/signals").then((r) => r.data).catch(() => []),
    ]).then(([me, board, sigs]) => {
      setStats(me);
      setSurvivors(board || []);
      setSignals(sigs || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <p className="text-xs font-mono text-muted-foreground text-center py-8 tracking-widest animate-pulse">
        LOADING SECTOR DATA...
      </p>
    );
  }

  const sector = stats?.sector ?? 1;
  const sectorSurvivors = survivors.filter((s) => s.sector === sector);
  const sectorSignals = signals.filter((s) => s.sector === sector);
  const emergencyCount = sectorSignals.filter((s) => s.priority === "EMERGENCY").length;

  return (
    <div className="space-y-6">
      {/* Sector header */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-dark-gray border border-terminal-green/30 flex flex-col items-center justify-center">
            <MapPin className="w-8 h-8 text-terminal-green mb-1" />
            <span className="text-xs font-mono text-muted-foreground">SECTOR</span>
          </div>
          <div>
            <h2 className="text-white text-3xl font-mono">SECTOR {sector}</h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Your assigned operational zone
            </p>
          </div>
        </div>
      </div>

      {/* Sector overview stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "SURVIVORS IN SECTOR", value: sectorSurvivors.length, icon: Users },
          { label: "ACTIVE SIGNALS", value: sectorSignals.length, icon: Radio },
          { label: "EMERGENCIES", value: emergencyCount, icon: AlertTriangle },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.03 }}
            className="bg-card border border-terminal-green/20 p-4 text-center"
          >
            <stat.icon className="w-5 h-5 text-terminal-green mx-auto mb-2" />
            <div className="text-2xl text-terminal-green font-mono mb-1">{stat.value}</div>
            <div className="text-xs text-muted-foreground font-mono">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Survivors in this sector */}
      <div className="bg-card border border-terminal-green/20 p-6">
        <h3 className="text-white mb-4 font-mono">SURVIVORS IN SECTOR {sector}</h3>
        {sectorSurvivors.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground py-2">
            No other survivors registered in this sector.
          </p>
        ) : (
          <div className="space-y-3">
            {sectorSurvivors.map((s) => (
              <div
                key={s.username}
                className="flex items-center justify-between pb-3 border-b border-terminal-green/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-terminal-green" />
                  <span className="text-sm font-mono text-terminal-green tracking-wider">
                    {s.username}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  TRUST {s.reputationScore}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-dark-gray border border-warning-amber/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-amber mt-0.5" />
          <div>
            <div className="text-sm text-warning-amber font-mono mb-2">SECTOR ADVISORY</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monitor signals in your sector for local threats and supply opportunities.
              Coordinate with nearby survivors to strengthen your zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
