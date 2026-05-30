import { useState } from "react";
import { motion } from "motion/react";
import { X, Send, MapPin, AlertTriangle } from "lucide-react";
import { signalApi } from "../apis/signal.api";
import type { Signal } from "../types/signal.types";

interface BroadcastComposerProps {
  onClose: () => void;
  onCreated: (signal: Signal) => void;
  callsign: string;
  editSignal?: Signal;
  onDelete?: (id: string) => void;
}

const SECTOR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const MAX_CHARS = 288;

export function BroadcastComposer({ onClose, onCreated, callsign, editSignal, onDelete }: BroadcastComposerProps) {
  const [message, setMessage] = useState(editSignal?.content ?? "");
  const [sector, setSector] = useState(editSignal ? String(editSignal.sector) : "");
  const [isEmergency, setIsEmergency] = useState(editSignal?.priority === "EMERGENCY");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editSignal;

  const handleSubmit = async () => {
    if (!message.trim() || !sector || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      if (isEdit) {
        const updated = await signalApi.update(editSignal.id, {
          content: message.trim(),
          sector: parseInt(sector),
          priority: isEmergency ? "EMERGENCY" : "STANDARD",
        });
        onCreated(updated);
      } else {
        const created = await signalApi.create({
          authorName: callsign,
          content: message.trim(),
          sector: parseInt(sector),
          priority: isEmergency ? "EMERGENCY" : "STANDARD",
        });
        onCreated(created);
      }
      onClose();
    } catch {
      setError("Failed to broadcast. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative max-w-2xl w-full bg-dark-gray border-2 border-terminal-green/30 p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-terminal-green transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-white mb-2">
            {isEdit ? "EDIT SIGNAL" : "BROADCAST NEW SIGNAL"}
          </h2>
          <div className="text-xs text-muted-foreground font-mono">
            Broadcasting as <span className="text-terminal-green">{callsign}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
              MESSAGE
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
              }}
              placeholder="Enter your message..."
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-white font-mono text-sm focus:border-terminal-green focus:outline-none transition-colors resize-none"
              rows={4}
            />
            <div className={`text-xs font-mono mt-1 text-right ${
              message.length > MAX_CHARS * 0.9 ? "text-warning-amber" : "text-muted-foreground"
            }`}>
              {message.length} / {MAX_CHARS}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                SECTOR
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-white font-mono text-sm focus:border-terminal-green focus:outline-none transition-colors"
              >
                <option value="">Select Sector</option>
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>SECTOR {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                PRIORITY
              </label>
              <button
                onClick={() => setIsEmergency((v) => !v)}
                className={`w-full px-4 py-3 font-mono text-sm tracking-wide transition-colors border ${
                  isEmergency
                    ? "bg-warning-amber/20 border-warning-amber text-warning-amber"
                    : "bg-charcoal border-terminal-green/30 text-muted-foreground"
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {isEmergency ? "EMERGENCY" : "STANDARD"}
              </button>
            </div>
          </div>

          {isEmergency && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-warning-amber/10 border border-warning-amber/30 p-4"
            >
              <div className="text-xs font-mono text-warning-amber tracking-wide mb-2">
                ⚠ EMERGENCY BROADCAST
              </div>
              <p className="text-xs text-muted-foreground">
                Emergency broadcasts will be prioritized across the network. Use only for critical threats or immediate danger.
              </p>
            </motion.div>
          )}

          {error && (
            <p className="text-xs font-mono text-emergency-red">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-charcoal border border-terminal-green/30 text-muted-foreground font-mono text-sm tracking-wide hover:border-terminal-green/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || !sector || submitting}
              className="flex-1 px-4 py-3 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm tracking-wide hover:bg-terminal-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 inline mr-2" />
              {submitting ? "BROADCASTING..." : isEdit ? "UPDATE" : "BROADCAST"}
            </button>
          </div>

          {isEdit && onDelete && (
            <div className="pt-3 border-t border-terminal-green/10">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground flex-1">DELETE THIS SIGNAL?</span>
                  <button
                    onClick={async () => { await signalApi.delete(editSignal!.id); onDelete(editSignal!.id); onClose(); }}
                    className="px-3 py-1.5 text-xs font-mono border transition-colors"
                    style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.5)' }}
                  >
                    YES, DELETE
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-xs font-mono text-muted-foreground border border-terminal-green/30 hover:text-terminal-green transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full px-4 py-2.5 text-xs font-mono tracking-wide border transition-colors hover:bg-red-500/10"
                  style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.4)' }}
                >
                  DELETE SIGNAL
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
