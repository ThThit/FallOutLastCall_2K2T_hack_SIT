import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare, Send, Loader, User, Star, Flag, Trash2, ShieldOff } from "lucide-react";
import { GlitchText } from "./glitch-text";
import { TrustPanel } from "./trust-panel";
import { FlagModal } from "./flag-modal";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { useAuth } from "../context/AuthContext";
import { client } from "../api/client";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

interface Signal {
  id: string | number;
  title: string;
  content: string;
  timeStamp: string;
  sector: string | number;
  trustScore: number;
  author?: string;
  authorReputation?: number;
  isCorrupted?: boolean;
  isEmergency?: boolean;
  flagged?: boolean;
  verifiedVotes: number;
  unverifiedVotes: number;
  verificationStatus: string;
  comments?: Comment[];
}

interface SignalCardProps {
  signal: Signal;
  onVerify?: (signalId: string | number) => void;
  onDelete?: (signalId: string | number) => void;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current === value) return;
    const start = prevRef.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    prevRef.current = value;
  }, [value]);

  return <span>{displayed}</span>;
}

export function SignalCard({ signal, onVerify, onDelete }: SignalCardProps) {
  const { isModerator } = useAuth();

  const [voted, setVoted] = useState<'VERIFIED' | 'SUSPICIOUS' | 'OUTDATED' | null>(null);
  const [verifiedVotes, setVerifiedVotes] = useState(signal.verifiedVotes);
  const [unverifiedVotes, setUnverifiedVotes] = useState(signal.unverifiedVotes);
  const [trustScore, setTrustScore] = useState(signal.trustScore);
  const [verificationStatus, setVerificationStatus] = useState(signal.verificationStatus);
  const [isFlagged, setIsFlagged] = useState(signal.flagged ?? false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(signal.comments || []);
  const [newComment, setNewComment] = useState('');

  const [loading, setLoading] = useState(false);
  const [activeVoteLoading, setActiveVoteLoading] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [showFlagModal, setShowFlagModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'signal' | 'verifications' | null>(null);

  const [isDeleted, setIsDeleted] = useState(false);
  const [showRemovedFlash, setShowRemovedFlash] = useState(false);

  const [authorRep, setAuthorRep] = useState(signal.authorReputation ?? 0);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const triggerRemoval = (message: string) => {
    showToastMessage(message);
    setShowRemovedFlash(true);
    setTimeout(() => {
      setIsDeleted(true);
      if (onDelete) onDelete(signal.id);
    }, 900);
  };

  const handleVote = async (voteType: 'VERIFIED' | 'SUSPICIOUS' | 'OUTDATED') => {
    try {
      setLoading(true);
      setActiveVoteLoading(voteType);

      const response = await client.post(`/signals/${signal.id}/verify`, { status: voteType });

      if (response.data.deleted) {
        triggerRemoval('Signal auto-removed: too many suspicious votes');
        return;
      }

      setVoted(voteType);
      setVerifiedVotes(response.data.verifiedVotes);
      setUnverifiedVotes(response.data.unverifiedVotes);
      setTrustScore(response.data.trustScore);
      setVerificationStatus(response.data.verificationStatus);
      if (response.data.authorReputation !== undefined) setAuthorRep(response.data.authorReputation);

      showToastMessage(`Vote recorded: ${voteType}`);
      if (onVerify) onVerify(signal.id);
    } catch (error: any) {
      showToastMessage(error.response?.data?.error || 'Failed to record vote');
    } finally {
      setLoading(false);
      setActiveVoteLoading(null);
    }
  };

  const handleFlag = async (reason: string) => {
    await client.post(`/signals/${signal.id}/flag`, { reason });
    setIsFlagged(true);
    showToastMessage('Signal flagged for moderator review');
  };

  const handleDeleteSignal = async () => {
    await client.delete(`/signals/${signal.id}`);
    triggerRemoval('Signal removed by moderator');
  };

  const handleClearVerifications = async () => {
    await client.delete(`/signals/${signal.id}/verifications`);
    setVerifiedVotes(0);
    setUnverifiedVotes(0);
    setTrustScore(0);
    setVerificationStatus('UNVERIFIED');
    showToastMessage('Verifications cleared by moderator');
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: signal.author || 'UNKNOWN',
        message: newComment.trim(),
        timestamp: 'Just now',
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const reputationColor =
    authorRep >= 70 ? 'text-terminal-green' :
    authorRep >= 40 ? 'text-warning-amber' :
    'text-emergency-red';

  return (
    <>
      <AnimatePresence>
        {!isDeleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.35 } }}
            className={`bg-card border p-4 hover:border-terminal-green/40 transition-colors group relative overflow-hidden ${
              isFlagged
                ? 'border-emergency-red/40'
                : 'border-terminal-green/20'
            }`}
          >
            {/* Red removed flash overlay */}
            <AnimatePresence>
              {showRemovedFlash && (
                <motion.div
                  key="removed-flash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.7, 0.5] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 z-40 bg-emergency-red/30 flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono text-emergency-red text-sm tracking-widest border border-emergency-red px-4 py-2 bg-black/60"
                  >
                    ⚠ SIGNAL REMOVED
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flagged stripe */}
            {isFlagged && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-emergency-red/60" />
            )}

            {/* Toast */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  key="toast"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-2 right-2 bg-charcoal border border-terminal-green text-terminal-green px-3 py-2 text-xs font-mono rounded z-50"
                >
                  {toastMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-terminal-green tracking-wider truncate">
                    {signal.title}
                  </span>
                  {signal.isEmergency && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-4 h-4 text-emergency-red flex-shrink-0" />
                    </motion.div>
                  )}
                  {isFlagged && (
                    <span className="px-1.5 py-0.5 text-xs font-mono border border-emergency-red/50 text-emergency-red bg-emergency-red/10 flex-shrink-0">
                      FLAGGED
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {signal.timeStamp}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Sector {signal.sector}
                  </div>
                  {signal.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-cyan-400 tracking-wide">{signal.author}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust + Reputation */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <motion.div
                  key={trustScore}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`px-2 py-1 text-xs font-mono whitespace-nowrap ${
                    trustScore >= 70 ? 'bg-terminal-green/20 text-terminal-green' :
                    trustScore >= 40 ? 'bg-warning-amber/20 text-warning-amber' :
                    'bg-emergency-red/20 text-emergency-red'
                  }`}
                >
                  TRUST: <AnimatedNumber value={trustScore} />%
                </motion.div>

                {signal.authorReputation !== undefined && (
                  <div className={`flex items-center gap-1 text-xs font-mono ${reputationColor}`}>
                    <Star className="w-3 h-3" />
                    REP: <AnimatedNumber value={authorRep} />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed mb-4">
              {signal.isCorrupted ? (
                <GlitchText text={signal.content} intensity={0.4} />
              ) : (
                signal.content
              )}
            </p>

            {/* Vote Buttons */}
            <div className="flex items-center gap-2 pt-3 border-t border-terminal-green/10 flex-wrap">
              {(
                [
                  { type: 'VERIFIED',   icon: ThumbsUp,       activeClass: 'bg-terminal-green/20 text-terminal-green border-terminal-green', hoverClass: 'hover:text-terminal-green hover:border-terminal-green/50' },
                  { type: 'SUSPICIOUS', icon: AlertTriangle,   activeClass: 'bg-warning-amber/20 text-warning-amber border-warning-amber',   hoverClass: 'hover:text-warning-amber hover:border-warning-amber/50' },
                  { type: 'OUTDATED',   icon: ThumbsDown,      activeClass: 'bg-emergency-red/20 text-emergency-red border-emergency-red',   hoverClass: 'hover:text-emergency-red hover:border-emergency-red/50' },
                ] as const
              ).map(({ type, icon: Icon, activeClass, hoverClass }) => (
                <motion.button
                  key={type}
                  onClick={() => handleVote(type)}
                  disabled={loading || voted !== null}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors border disabled:cursor-not-allowed ${
                    voted === type
                      ? activeClass
                      : voted !== null
                      ? 'border-transparent text-muted-foreground opacity-40'
                      : `border-transparent text-muted-foreground ${hoverClass}`
                  }`}
                >
                  {activeVoteLoading === type
                    ? <Loader className="w-3 h-3 animate-spin" />
                    : <Icon className="w-3 h-3" />}
                  {type} ({type === 'VERIFIED'
                    ? <AnimatedNumber value={verifiedVotes} />
                    : <AnimatedNumber value={unverifiedVotes} />})
                </motion.button>
              ))}

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-cyan-400 transition-colors ml-auto"
              >
                <MessageSquare className="w-3 h-3" />
                {comments.length > 0 ? `COMMENTS (${comments.length})` : 'COMMENT'}
              </button>
            </div>

            {/* Status + action row */}
            <div className="mt-2 text-xs text-muted-foreground font-mono flex items-center gap-2 flex-wrap">
              <span>Status:</span>
              <motion.span
                key={verificationStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  verificationStatus === 'VERIFIED'   ? 'text-terminal-green' :
                  verificationStatus === 'SUSPICIOUS' ? 'text-warning-amber' :
                  'text-muted-foreground'
                }
              >
                {verificationStatus}
              </motion.span>

              {voted && (
                <span className="text-muted-foreground">
                  · You voted: <span className="text-cyan-400">{voted}</span>
                </span>
              )}

              {/* Flag button — any authenticated user */}
              {!isFlagged && (
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="ml-auto flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-warning-amber transition-colors"
                >
                  <Flag className="w-3 h-3" />
                  FLAG
                </button>
              )}

              {/* Moderator controls */}
              {isModerator && (
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setDeleteMode('verifications')}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-warning-amber transition-colors"
                  >
                    <ShieldOff className="w-3 h-3" />
                    CLEAR VOTES
                  </button>
                  <button
                    onClick={() => setDeleteMode('signal')}
                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-emergency-red transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    DELETE
                  </button>
                </div>
              )}
            </div>

            {/* Comments */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-terminal-green/10 overflow-hidden"
                >
                  {comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-charcoal border border-terminal-green/10 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-cyan-400 text-xs tracking-wider">{comment.author}</span>
                            <span className="text-xs text-muted-foreground font-mono">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{comment.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-dark-gray border border-terminal-green/20 p-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add comment..."
                      className="flex-1 bg-transparent px-2 py-1 text-xs font-mono text-white placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-3 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-mono text-xs hover:bg-terminal-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      SEND
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust Details Panel */}
            <TrustPanel signalId={signal.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flag Modal */}
      {showFlagModal && (
        <FlagModal
          signalTitle={signal.title}
          onConfirm={handleFlag}
          onClose={() => setShowFlagModal(false)}
        />
      )}

      {/* Delete / Clear Confirm Dialog */}
      {deleteMode && (
        <DeleteConfirmDialog
          mode={deleteMode}
          signalTitle={signal.title}
          onConfirm={deleteMode === 'signal' ? handleDeleteSignal : handleClearVerifications}
          onClose={() => setDeleteMode(null)}
        />
      )}
    </>
  );
}
