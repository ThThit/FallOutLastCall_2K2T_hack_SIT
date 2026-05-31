import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarChart2, Users, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { client } from "../api/client";

interface VerificationHistoryEntry {
  username: string;
  voterReputation: number;
  status: string;
  timestamp: string;
}

interface TrustStats {
  signalId: number;
  title: string;
  trustPercentage: number;
  signalConfidence: number;
  verifiedVotes: number;
  suspiciousVotes: number;
  outdatedVotes: number;
  totalVotes: number;
  reliabilityLevel: string;
  communityConsensus: string;
  flagged: boolean;
  flagReason: string | null;
  authorReputation: number;
  verificationHistory: VerificationHistoryEntry[];
}

const RELIABILITY_STYLES: Record<string, { bar: string; badge: string }> = {
  TRUSTED:    { bar: 'bg-terminal-green',  badge: 'border-terminal-green/40 text-terminal-green bg-terminal-green/10' },
  HIGH:       { bar: 'bg-cyan-400',        badge: 'border-cyan-400/40 text-cyan-400 bg-cyan-400/10' },
  MEDIUM:     { bar: 'bg-warning-amber',   badge: 'border-warning-amber/40 text-warning-amber bg-warning-amber/10' },
  LOW:        { bar: 'bg-orange-400',      badge: 'border-orange-400/40 text-orange-400 bg-orange-400/10' },
  UNVERIFIED: { bar: 'bg-muted-foreground', badge: 'border-muted-foreground/20 text-muted-foreground bg-muted-foreground/5' },
};

const VOTE_STATUS_COLORS: Record<string, string> = {
  VERIFIED:   'text-terminal-green',
  SUSPICIOUS: 'text-warning-amber',
  OUTDATED:   'text-emergency-red',
};

export function TrustPanel({ signalId }: { signalId: string | number }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<TrustStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (stats) return;
    try {
      setLoading(true);
      setError(null);
      const res = await client.get(`/signals/${signalId}/trust`);
      setStats(res.data);
    } catch {
      setError('Failed to load trust data');
    } finally {
      setLoading(false);
    }
  };

  const rel = stats ? (RELIABILITY_STYLES[stats.reliabilityLevel] ?? RELIABILITY_STYLES.UNVERIFIED) : null;

  return (
    <div className="border-t border-terminal-green/10 pt-2 mt-2">
      <button
        onClick={toggle}
        className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-terminal-green transition-colors"
      >
        <BarChart2 className="w-3 h-3" />
        TRUST DETAILS
        {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="trust-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-4">

              {loading && (
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Loader className="w-3 h-3 animate-spin" />
                  LOADING TRUST DATA...
                </div>
              )}

              {error && (
                <p className="text-xs font-mono text-emergency-red">{error}</p>
              )}

              {stats && rel && (
                <>
                  {/* Trust Meter */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground">TRUST METER</span>
                      <span className={rel.badge.split(' ')[1]}>{stats.trustPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-gray overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.trustPercentage}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className={`h-full ${rel.bar}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono mt-1 text-muted-foreground">
                      <span>CONFIDENCE {(stats.signalConfidence * 100).toFixed(0)}%</span>
                      <span>{stats.totalVotes} VOTES</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 border text-xs font-mono tracking-wider ${rel.badge}`}>
                      {stats.reliabilityLevel}
                    </span>
                    <span className={`px-2 py-0.5 border text-xs font-mono ${
                      stats.communityConsensus === 'VERIFIED'
                        ? 'border-terminal-green/40 text-terminal-green bg-terminal-green/10'
                        : 'border-warning-amber/40 text-warning-amber bg-warning-amber/10'
                    }`}>
                      {stats.communityConsensus}
                    </span>
                    {stats.flagged && (
                      <span className="px-2 py-0.5 border border-emergency-red/40 text-emergency-red bg-emergency-red/10 text-xs font-mono">
                        FLAGGED
                      </span>
                    )}
                  </div>

                  {/* Vote Breakdown */}
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-2">VOTE BREAKDOWN</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'VERIFIED',   count: stats.verifiedVotes,   bar: 'bg-terminal-green' },
                        { label: 'SUSPICIOUS', count: stats.suspiciousVotes, bar: 'bg-warning-amber' },
                        { label: 'OUTDATED',   count: stats.outdatedVotes,   bar: 'bg-emergency-red' },
                      ].map(({ label, count, bar }) => (
                        <div key={label} className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-muted-foreground w-20 flex-shrink-0">{label}</span>
                          <div className="flex-1 h-1.5 bg-dark-gray">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: stats.totalVotes > 0 ? `${(count / stats.totalVotes) * 100}%` : '0%' }}
                              transition={{ duration: 0.5, delay: 0.15 }}
                              className={`h-full ${bar}`}
                            />
                          </div>
                          <span className="w-5 text-right text-muted-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification History */}
                  {stats.verificationHistory.length > 0 && (
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        VERIFIERS
                      </p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {stats.verificationHistory.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs font-mono bg-dark-gray px-2 py-1.5"
                          >
                            <span className="text-cyan-400 truncate">{v.username}</span>
                            <span className={`${VOTE_STATUS_COLORS[v.status] ?? 'text-muted-foreground'} mx-2`}>
                              {v.status}
                            </span>
                            <span className="text-muted-foreground flex-shrink-0">REP {v.voterReputation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.flagReason && (
                    <p className="text-xs font-mono text-emergency-red border border-emergency-red/20 px-2 py-1">
                      FLAG: {stats.flagReason}
                    </p>
                  )}
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
