import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Clock, ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare, Send } from "lucide-react";
import { GlitchText } from "./glitch-text";

interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
}

interface Signal {
  id: string;
  callsign: string;
  message: string;
  timestamp: string;
  sector: string;
  trustScore: number;
  isCorrupted?: boolean;
  isEmergency?: boolean;
  verifiedCount: number;
  unverifiedCount: number;
  comments?: Comment[];
}

interface SignalCardProps {
  signal: Signal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const [verifiedCount, setVerifiedCount] = useState(signal.verifiedCount);
  const [unverifiedCount, setUnverifiedCount] = useState(signal.unverifiedCount);
  const [trustScore, setTrustScore] = useState(signal.trustScore);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(signal.comments || []);
  const [newComment, setNewComment] = useState('');

  const calculateTrustScore = (verified: number, unverified: number) => {
    const total = verified + unverified;
    if (total === 0) return signal.trustScore;
    const score = Math.round((verified / total) * 100);
    return Math.max(0, Math.min(100, score));
  };

  const handleVote = (voteType: 'up' | 'down') => {
    let newVerified = verifiedCount;
    let newUnverified = unverifiedCount;

    if (voted === voteType) {
      // Unvoting
      if (voteType === 'up') {
        newVerified = verifiedCount - 1;
      } else {
        newUnverified = unverifiedCount - 1;
      }
      setVoted(null);
    } else {
      // Switching vote or new vote
      if (voted === 'up') {
        newVerified = verifiedCount - 1;
        newUnverified = unverifiedCount + 1;
      } else if (voted === 'down') {
        newUnverified = unverifiedCount - 1;
        newVerified = verifiedCount + 1;
      } else {
        // New vote
        if (voteType === 'up') {
          newVerified = verifiedCount + 1;
        } else {
          newUnverified = unverifiedCount + 1;
        }
      }
      setVoted(voteType);
    }

    setVerifiedCount(newVerified);
    setUnverifiedCount(newUnverified);
    setTrustScore(calculateTrustScore(newVerified, newUnverified));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'RAVEN-47',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-terminal-green/20 p-4 hover:border-terminal-green/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-terminal-green tracking-wider">
              {signal.callsign}
            </span>
            {signal.isEmergency && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-4 h-4 text-emergency-red" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {signal.timestamp}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {signal.sector}
            </div>
          </div>
        </div>

        <div className={`px-2 py-1 text-xs font-mono ${
          trustScore >= 70 ? 'bg-terminal-green/20 text-terminal-green' :
          trustScore >= 40 ? 'bg-warning-amber/20 text-warning-amber' :
          'bg-emergency-red/20 text-emergency-red'
        }`}>
          TRUST: {trustScore}%
        </div>
      </div>

      <p className="text-sm leading-relaxed mb-4">
        {signal.isCorrupted ? (
          <GlitchText text={signal.message} intensity={0.4} />
        ) : (
          signal.message
        )}
      </p>

      <div className="flex items-center gap-2 pt-3 border-t border-terminal-green/10">
        <button
          onClick={() => handleVote('up')}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
            voted === 'up'
              ? 'bg-terminal-green/20 text-terminal-green'
              : 'text-muted-foreground hover:text-terminal-green'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          VERIFIED ({verifiedCount})
        </button>
        <button
          onClick={() => handleVote('down')}
          className={`flex items-center gap-1 px-2 py-1 text-xs font-mono transition-colors ${
            voted === 'down'
              ? 'bg-emergency-red/20 text-emergency-red'
              : 'text-muted-foreground hover:text-emergency-red'
          }`}
        >
          <ThumbsDown className="w-3 h-3" />
          UNVERIFIED ({unverifiedCount})
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground hover:text-cyan-400 transition-colors ml-auto"
        >
          <MessageSquare className="w-3 h-3" />
          {comments.length > 0 ? `COMMENTS (${comments.length})` : 'COMMENT'}
        </button>
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-terminal-green/10"
        >
          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-charcoal border border-terminal-green/10 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-cyan-400 text-xs tracking-wider">
                      {comment.author}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comment.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
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
    </motion.div>
  );
}
