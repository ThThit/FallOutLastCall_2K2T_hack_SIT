import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, ShieldOff, X, Loader, AlertTriangle } from "lucide-react";

type DeleteMode = 'signal' | 'verifications';

interface DeleteConfirmDialogProps {
  mode: DeleteMode;
  signalTitle: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const CONFIG = {
  signal: {
    icon: Trash2,
    label: 'DELETE SIGNAL',
    borderColor: 'border-emergency-red/50',
    buttonClass: 'border-emergency-red text-emergency-red bg-emergency-red/10 hover:bg-emergency-red/20',
    tagClass: 'text-emergency-red',
    warning: 'This will permanently remove the signal and all its verification records. This action cannot be undone.',
  },
  verifications: {
    icon: ShieldOff,
    label: 'CLEAR VERIFICATIONS',
    borderColor: 'border-warning-amber/50',
    buttonClass: 'border-warning-amber text-warning-amber bg-warning-amber/10 hover:bg-warning-amber/20',
    tagClass: 'text-warning-amber',
    warning: 'This will delete all vote records and reset the trust score to zero. The signal itself remains.',
  },
};

export function DeleteConfirmDialog({ mode, signalTitle, onConfirm, onClose }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = CONFIG[mode];
  const Icon = cfg.icon;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="delete-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Red vignette pulse */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse at center, #ff000033 0%, transparent 70%)' }}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`bg-card border ${cfg.borderColor} p-6 w-full max-w-md mx-4 font-mono relative`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${cfg.tagClass}`} />
              <h2 className={`text-sm tracking-wider ${cfg.tagClass}`}>{cfg.label}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Signal info */}
          <p className="text-xs text-muted-foreground mb-1">Target signal:</p>
          <p className="text-sm text-white mb-4 border border-emergency-red/20 px-3 py-2 bg-emergency-red/5 truncate">
            {signalTitle}
          </p>

          {/* Warning */}
          <div className="flex items-start gap-2 mb-5 bg-emergency-red/5 border border-emergency-red/20 px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-emergency-red mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{cfg.warning}</p>
          </div>

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
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 text-xs border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${cfg.buttonClass}`}
            >
              {loading && <Loader className="w-3 h-3 animate-spin" />}
              CONFIRM {cfg.label}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
