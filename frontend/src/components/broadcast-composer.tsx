import { useState } from "react";
import { motion } from "motion/react";
import { X, Send, MapPin, AlertTriangle } from "lucide-react";

interface BroadcastComposerProps {
  onClose: () => void;
}

export function BroadcastComposer({ onClose }: BroadcastComposerProps) {
  const [message, setMessage] = useState("");
  const [sector, setSector] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 280;

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setMessage(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = () => {
    if (message.trim() && sector) {
      onClose();
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
          <h2 className="text-white mb-2">BROADCAST NEW SIGNAL</h2>
          <div className="text-xs text-muted-foreground font-mono">
            Share critical information with the survivor network
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
              MESSAGE
            </label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Enter your message..."
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-3 text-white font-mono text-sm focus:border-terminal-green focus:outline-none transition-colors resize-none"
              rows={4}
            />
            <div className={`text-xs font-mono mt-1 text-right ${
              charCount > maxChars * 0.9 ? 'text-warning-amber' : 'text-muted-foreground'
            }`}>
              {charCount} / {maxChars}
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
                <option value="SECTOR 1">SECTOR 1</option>
                <option value="SECTOR 2">SECTOR 2</option>
                <option value="SECTOR 3">SECTOR 3</option>
                <option value="SECTOR 4">SECTOR 4</option>
                <option value="SECTOR 5">SECTOR 5</option>
                <option value="SECTOR 6">SECTOR 6</option>
                <option value="SECTOR 8">SECTOR 8</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                PRIORITY
              </label>
              <button
                onClick={() => setIsEmergency(!isEmergency)}
                className={`w-full px-4 py-3 font-mono text-sm tracking-wide transition-colors border ${
                  isEmergency
                    ? 'bg-emergency-red/20 border-emergency-red text-emergency-red'
                    : 'bg-charcoal border-terminal-green/30 text-muted-foreground'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {isEmergency ? 'EMERGENCY' : 'STANDARD'}
              </button>
            </div>
          </div>

          {isEmergency && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emergency-red/10 border border-emergency-red/30 p-4"
            >
              <div className="text-xs font-mono text-emergency-red tracking-wide mb-2">
                ⚠ EMERGENCY BROADCAST
              </div>
              <p className="text-xs text-muted-foreground">
                Emergency broadcasts will be prioritized and sent to all survivors in the network. Use only for critical threats or immediate danger.
              </p>
            </motion.div>
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
              disabled={!message.trim() || !sector}
              className="flex-1 px-4 py-3 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm tracking-wide hover:bg-terminal-green/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 inline mr-2" />
              BROADCAST
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
