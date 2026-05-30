import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const [tick, setTick] = useState(0);

  // Measured-height accordion for the comment section (smooth, no snap)
  const commentsContentRef = useRef<HTMLDivElement>(null);
  const [commentsHeight, setCommentsHeight] = useState(0);

  useLayoutEffect(() => {
    const el = commentsContentRef.current;
    if (!showComments || !el) return;

    const measure = () => {
      // scrollHeight excludes the element's own margins — add them back
      const style = getComputedStyle(el);
      const margins = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      setCommentsHeight(el.scrollHeight + margins);
    };

    measure();
    // Keep height in sync with any content change (load more, new comment, etc.)
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showComments]);

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
    setVoting(true);

    const voted = getVotedSignals();

    try {
      if (myVote === type) {
        // Toggle off — remove vote from backend
        const updated = await signalApi.vote(signal.id, type, "remove");
        setVerified(updated.verifiedCount);
        setUnverified(updated.unverifiedCount);
        setTrustScore(updated.trustScore);
        setMyVote(null);
        delete voted[signal.id];
      } else if (myVote && myVote !== type) {
        // Switch vote — remove old, add new
        await signalApi.vote(signal.id, myVote, "remove");
        const updated = await signalApi.vote(signal.id, type, "add");
        setVerified(updated.verifiedCount);
        setUnverified(updated.unverifiedCount);
        setTrustScore(updated.trustScore);
        setMyVote(type);
        voted[signal.id] = type;
      } else {
        // New vote
        const updated = await signalApi.vote(signal.id, type, "add");
        setVerified(updated.verifiedCount);
        setUnverified(updated.unverifiedCount);
        setTrustScore(updated.trustScore);
        setMyVote(type);
        voted[signal.id] = type;
      }
      localStorage.setItem("votedSignals", JSON.stringify(voted));
    } catch {
      // silently ignore — voting state resets in finally
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
        exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
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
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-terminal-green transition-colors"
              >
                <Pencil className="w-3 h-3" />
                EDIT
              </button>
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
            style={myVote === "unverified" ? { color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)' } : undefined}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
              myVote === "unverified" ? "" : "text-muted-foreground hover:text-terminal-green"
            }`}
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

        <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: commentsHeight, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2, ease: "easeInOut" },
            }}
            style={{ overflow: "hidden" }}
          >
          <div ref={commentsContentRef} className="mt-4 pt-4 pb-2 border-t border-terminal-green/10">
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
          </div>
          </motion.div>
        )}
        </AnimatePresence>
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
          onDelete={(id) => {
            setShowEdit(false);
            onDelete?.(id);
          }}
        />
      )}
    </>
  );
}
