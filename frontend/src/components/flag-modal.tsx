import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Loader } from "lucide-react";

interface FlagModalProps {
  signalTitle: string;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

export function FlagModal({ signalTitle, onConfirm, onClose }: FlagModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to flag signal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="flag-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-warning-amber/40 p-6 w-full max-w-md mx-4 font-mono"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-amber" />
              <h2 className="text-sm text-warning-amber tracking-wider">FLAG SIGNAL</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-1">Flagging:</p>
          <p className="text-sm text-white mb-4 border border-warning-amber/20 px-3 py-2 bg-warning-amber/5 truncate">
            {signalTitle}
          </p>

          <p className="text-xs text-muted-foreground mb-2">
            Reason for flagging — describe why this signal may be misinformation or harmful:
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Location data is incorrect, spreading panic without evidence..."
            rows={3}
            className="w-full bg-dark-gray border border-warning-amber/20 text-white text-xs px-3 py-2 resize-none focus:outline-none focus:border-warning-amber/50 placeholder:text-muted-foreground mb-4"
          />

          {error && (
            <p className="text-xs text-emergency-red mb-3">{error}</p>
          )}

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs border border-terminal-green/30 text-muted-foreground hover:text-white hover:border-terminal-green/50 transition-colors disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || loading}
              className="px-4 py-2 text-xs border border-warning-amber text-warning-amber bg-warning-amber/10 hover:bg-warning-amber/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader className="w-3 h-3 animate-spin" />}
              SUBMIT FLAG
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
