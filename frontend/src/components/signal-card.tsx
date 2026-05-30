import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MapPin, Clock, ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare, Send, Pencil } from "lucide-react";
import { signalApi, type Signal, type Comment } from "../lib/api";
import { BroadcastComposer } from "./broadcast-composer";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getCorruptionLevel(createdAt: string): number {
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  if (ageDays < 1) return 0;       // clean
  if (ageDays < 2.5) return 0.15;  // light
  if (ageDays < 5) return 0.30;    // medium + flicker
  if (ageDays < 6.5) return 0.50;  // heavy + flicker
  return 0.70;                     // severe + DATA CORRUPTION DETECTED
}

function applyCorruption(text: string, level: number): string {
  if (level === 0) return text;
  return text.split("").map((char) => {
    if (char === " ") return " ";
    return Math.random() < level ? "_" : char;
  }).join("");
}

interface SignalCardProps {
  signal: Signal;
  onDelete?: (id: string) => void;
  onUpdate?: (updated: Signal) => void;
  callsign: string;
}

function getVotedSignals(): Record<string, "verified" | "unverified"> {
  try { return JSON.parse(localStorage.getItem("votedSignals") || "{}"); } catch { return {}; }
}

export function SignalCard({ signal, onDelete, onUpdate, callsign }: SignalCardProps) {
  const [verified, setVerified] = useState(signal.verifiedCount);
  const [unverified, setUnverified] = useState(signal.unverifiedCount);
  const [trustScore, setTrustScore] = useState(signal.trustScore);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const COMMENTS_LIMIT = 3;
  const [commentCount, setCommentCount] = useState(signal._count?.comments ?? 0);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [myVote, setMyVote] = useState<"verified" | "unverified" | null>(
    () => getVotedSignals()[signal.id] ?? null
  );
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tick, setTick] = useState(0);

  const corruptionLevel = getCorruptionLevel(signal.createdAt);
  const isCorrupted = corruptionLevel > 0;
  const isSevere = corruptionLevel >= 0.70;
  const hasFlicker = corruptionLevel >= 0.30;
  const isEmergency = signal.priority === "EMERGENCY";
  const isOwn = signal.authorName === callsign;

  // Re-render corruption characters on a timer when signal is corrupted
  useEffect(() => {
    if (corruptionLevel === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, [corruptionLevel]);

  // applyCorruption uses Math.random() so re-runs on every tick
  const displayContent = applyCorruption(signal.content, corruptionLevel);
  void tick; // consumed by the effect above to trigger re-render

  const handleToggleComments = async () => {
    if (!showComments && !commentsLoaded) {
      setCommentsLoading(true);
      setShowComments(true);
      const data = await signalApi.getComments(signal.id);
      setComments(data);
      setCommentsLoaded(true);
      setCommentsLoading(false);
    } else {
      setShowComments((v) => !v);
    }
  };

  const recalcTrust = (v: number, u: number) => {
    const total = v + u;
    return total === 0 ? 50 : Math.round((v / total) * 1000) / 10;
  };

  const handleVote = async (type: "verified" | "unverified") => {
    if (voting) return;

    const voted = getVotedSignals();

    if (myVote === type) {
      // Toggle off — undo vote locally
      const newV = type === "verified" ? verified - 1 : verified;
      const newU = type === "unverified" ? unverified - 1 : unverified;
      setVerified(newV);
      setUnverified(newU);
      setTrustScore(recalcTrust(newV, newU));
      setMyVote(null);
      delete voted[signal.id];
      localStorage.setItem("votedSignals", JSON.stringify(voted));
      return;
    }

    if (myVote && myVote !== type) {
      // Switch vote — undo old, apply new locally
      const newV = type === "verified" ? verified + 1 : verified - 1;
      const newU = type === "unverified" ? unverified + 1 : unverified - 1;
      setVerified(newV);
      setUnverified(newU);
      setTrustScore(recalcTrust(newV, newU));
      setMyVote(type);
      voted[signal.id] = type;
      localStorage.setItem("votedSignals", JSON.stringify(voted));
      return;
    }

    // New vote — call backend
    setVoting(true);
    try {
      const updated = await signalApi.vote(signal.id, type);
      setVerified(updated.verifiedCount);
      setUnverified(updated.unverifiedCount);
      setTrustScore(updated.trustScore);
      setMyVote(type);
      voted[signal.id] = type;
      localStorage.setItem("votedSignals", JSON.stringify(voted));
    } finally {
      setVoting(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      const comment = await signalApi.addComment(signal.id, {
        authorName: callsign,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setCommentCount((n) => n + 1);
      setNewComment("");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    await signalApi.delete(signal.id);
    onDelete?.(signal.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={isEmergency ? { borderColor: '#f97316', borderWidth: '2px' } : undefined}
        className={`border p-4 transition-colors group ${
          isEmergency
            ? "bg-orange-950/40"
            : "bg-card border-terminal-green/20 hover:border-terminal-green/40"
        } ${hasFlicker ? "animate-pulse" : ""}`}
      >
        {isEmergency && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-orange-500/30">
            <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: '#ff4444' }} />
            <span className="font-mono text-xs tracking-widest" style={{ color: '#f97316' }}>
              EMERGENCY SIGNAL
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-terminal-green tracking-wider">
                {signal.authorName}
              </span>
              {isEmergency && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <AlertTriangle className="w-4 h-4" style={{ color: '#ff4444' }} />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(signal.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                SECTOR {signal.sector}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 text-xs font-mono ${
              trustScore >= 70
                ? "bg-terminal-green/20 text-terminal-green"
                : trustScore >= 40
                ? "bg-warning-amber/20 text-warning-amber"
                : "bg-emergency-red/20 text-emergency-red"
            }`}>
              TRUST: {trustScore}%
            </div>
            {isOwn && (
              <div className="relative">
                <button
                  onClick={() => { setShowMenu((v) => !v); setConfirmDelete(false); }}
                  className="px-2 py-1 text-muted-foreground hover:text-terminal-green font-mono text-sm transition-colors"
                >
                  ···
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-7 z-10 bg-dark-gray border border-terminal-green/30 w-36 shadow-lg">
                    <button
                      onClick={() => { setShowEdit(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-terminal-green hover:bg-terminal-green/10 transition-colors"
                    >
                      <Pencil className="w-3 h-3 shrink-0" />
                      EDIT
                    </button>
                    <div className="border-t border-terminal-green/10" />
                    {confirmDelete ? (
                      <div className="px-3 py-2 space-y-1.5">
                        <p className="text-xs font-mono text-emergency-red">CONFIRM?</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleDelete}
                            className="flex-1 py-1 text-xs font-mono text-emergency-red border border-emergency-red/50 hover:bg-emergency-red/20 transition-colors"
                          >
                            YES
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-1 text-xs font-mono text-muted-foreground border border-terminal-green/30 hover:text-terminal-green transition-colors"
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        style={{ color: '#ff4444' }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-red-500/10 transition-colors"
                      >
                        <Pencil className="w-3 h-3 shrink-0 opacity-0" />
                        DELETE
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className={`text-sm leading-relaxed mb-4 font-mono ${isCorrupted ? "text-terminal-green/60" : "text-white"}`}>
          {displayContent}
        </p>

        {isSevere && (
          <p className="text-xs font-mono text-warning-amber/70 mb-3 tracking-wide">
            [DATA CORRUPTION DETECTED]
          </p>
        )}

        <div className={`flex items-center gap-2 pt-3 border-t ${isEmergency ? "border-orange-500/20" : "border-terminal-green/10"}`}>
          <button
            onClick={() => handleVote("verified")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
              myVote === "verified"
                ? "text-terminal-green bg-terminal-green/10"
                : "text-muted-foreground hover:text-terminal-green"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            VERIFIED ({verified})
          </button>
          <button
            onClick={() => handleVote("unverified")}
            style={{ color: '#ff4444', backgroundColor: myVote === "unverified" ? 'rgba(255,68,68,0.1)' : undefined }}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors opacity-70 hover:opacity-100"
          >
            <ThumbsDown className="w-3 h-3" />
            UNVERIFIED ({unverified})
          </button>
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-cyan-400 transition-colors ml-auto"
          >
            <MessageSquare className="w-3 h-3" />
            COMMENTS ({commentsLoaded ? comments.length : commentCount})
          </button>
        </div>

        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-terminal-green/10"
          >
            {commentsLoading && (
              <p className="text-xs font-mono text-muted-foreground text-center py-4 tracking-widest animate-pulse">
                RECEIVING TRANSMISSIONS...
              </p>
            )}

            {!commentsLoading && commentsLoaded && comments.length === 0 && (
              <p className="text-xs font-mono text-muted-foreground text-center py-4 tracking-wide">
                NO TRANSMISSIONS YET — BE THE FIRST TO RESPOND
              </p>
            )}

            {!commentsLoading && comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {(showAllComments ? comments : comments.slice(0, COMMENTS_LIMIT)).map((comment) => (
                  <div key={comment.id} className="bg-charcoal border border-terminal-green/10 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-cyan-400 text-xs tracking-wider">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
                {comments.length > COMMENTS_LIMIT && (
                  <button
                    onClick={() => setShowAllComments((v) => !v)}
                    className="w-full py-1.5 text-xs font-mono text-muted-foreground hover:text-terminal-green border border-terminal-green/20 hover:border-terminal-green/40 transition-colors"
                  >
                    {showAllComments
                      ? 'SHOW LESS'
                      : `LOAD MORE (${comments.length - COMMENTS_LIMIT} more)`}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 bg-dark-gray border border-terminal-green/20 p-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder="Add comment..."
                className="flex-1 bg-transparent px-2 py-1 text-xs font-mono text-white placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim() || sendingComment}
                className="px-3 py-1 bg-terminal-green/20 border border-terminal-green text-terminal-green font-mono text-xs hover:bg-terminal-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                SEND
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {showEdit && (
        <BroadcastComposer
          onClose={() => setShowEdit(false)}
          callsign={callsign}
          editSignal={signal}
          onCreated={(updated) => {
            onUpdate?.(updated);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}
