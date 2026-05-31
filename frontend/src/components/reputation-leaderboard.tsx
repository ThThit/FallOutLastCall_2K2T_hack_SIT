import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Star, Radio, Shield, MapPin } from "lucide-react";
import axiosClient from "../api/axiosClient";

interface LeaderboardEntry {
  rank: number;
  username: string;
  reputationScore: number;
  sector: number | null;
  role: string;
  totalSignals: number;
  totalVerifications: number;
}

const RANK_ICON: Record<number, { symbol: string; color: string }> = {
  1: { symbol: '▲', color: 'text-yellow-400' },
  2: { symbol: '◆', color: 'text-slate-300' },
  3: { symbol: '●', color: 'text-orange-400' },
};

function reputationColor(score: number) {
  if (score >= 70) return 'text-terminal-green';
  if (score >= 40) return 'text-warning-amber';
  return 'text-emergency-red';
}

function ReputationBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? 'bg-terminal-green' :
    clamped >= 40 ? 'bg-warning-amber' :
    'bg-emergency-red';

  return (
    <div className="w-full h-1 bg-dark-gray mt-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full ${color}`}
      />
    </div>
  );
}

export function ReputationLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosClient.get('/users/leaderboard?limit=10')
      .then(res => setEntries(res.data))
      .catch(() => setError('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-terminal-green/20 p-6 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <div className="w-2 h-2 bg-terminal-green animate-pulse rounded-full" />
        FETCHING SURVIVOR RANKINGS...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-emergency-red/20 p-4 text-xs font-mono text-emergency-red">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-card border border-terminal-green/20">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-terminal-green/20">
        <Trophy className="w-4 h-4 text-warning-amber" />
        <h3 className="text-sm font-mono text-white tracking-wider">REPUTATION LEADERBOARD</h3>
        <span className="ml-auto text-xs font-mono text-muted-foreground">TOP {entries.length}</span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[32px_1fr_80px] gap-2 px-4 py-2 border-b border-terminal-green/10 text-xs font-mono text-muted-foreground">
        <span>#</span>
        <span>SURVIVOR</span>
        <span className="text-right">REP</span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-terminal-green/10">
        {entries.map((entry, i) => {
          const rankStyle = RANK_ICON[entry.rank];
          return (
            <motion.div
              key={entry.username}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[32px_1fr_80px] gap-2 items-center px-4 py-3 hover:bg-terminal-green/5 transition-colors ${
                entry.rank === 1 ? 'bg-yellow-400/5' : ''
              }`}
            >
              {/* Rank */}
              <span className={`font-mono text-sm font-bold text-center ${rankStyle ? rankStyle.color : 'text-muted-foreground'}`}>
                {rankStyle ? rankStyle.symbol : entry.rank}
              </span>

              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm text-white truncate">{entry.username}</span>
                  {entry.role === 'MODERATOR' && (
                    <span className="px-1 py-0.5 text-xs font-mono border border-cyan-400/40 text-cyan-400 flex-shrink-0 leading-none">
                      MOD
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                  {entry.sector != null && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />S-{entry.sector}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5" title="Signals sent">
                    <Radio className="w-2.5 h-2.5" />{entry.totalSignals}
                  </span>
                  <span className="flex items-center gap-0.5" title="Verifications made">
                    <Shield className="w-2.5 h-2.5" />{entry.totalVerifications}
                  </span>
                </div>
                <ReputationBar score={entry.reputationScore} />
              </div>

              {/* Score */}
              <div className={`flex items-center justify-end gap-1 font-mono text-sm font-bold ${reputationColor(entry.reputationScore)}`}>
                <Star className="w-3 h-3 flex-shrink-0" />
                {entry.reputationScore}
              </div>
            </motion.div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="px-4 py-8 text-center text-xs font-mono text-muted-foreground">
          NO SURVIVORS RANKED YET
        </div>
      )}
    </div>
  );
}
