import { motion } from "motion/react";
import { X, AlertTriangle } from "lucide-react";

interface EmergencyAlertProps {
  onClose: () => void;
}

export function EmergencyAlert({ onClose }: EmergencyAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,51,51,0.05)_2px,rgba(255,51,51,0.05)_4px)]" />

      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="relative max-w-2xl w-full mx-4 bg-charcoal border-2 border-emergency-red p-8"
      >
        <motion.div
          animate={{
            opacity: [1, 0.7, 1],
            boxShadow: [
              '0 0 20px rgba(255,51,51,0.5)',
              '0 0 40px rgba(255,51,51,0.3)',
              '0 0 20px rgba(255,51,51,0.5)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 border-2 border-emergency-red pointer-events-none"
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emergency-red hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <AlertTriangle className="w-20 h-20 text-emergency-red" />
          </motion.div>

          <div className="text-center space-y-4">
            <div className="font-mono tracking-widest text-emergency-red">
              ⚠ EMERGENCY BROADCAST ⚠
            </div>
            <h2 className="tracking-tight text-white">
              SECTOR 7 QUARANTINED
            </h2>
            <div className="font-mono text-sm text-emergency-red/80 tracking-wide">
              ALL CONTACT PROHIBITED
            </div>
          </div>

          <div className="w-full bg-dark-gray border border-emergency-red/30 p-4 font-mono text-xs text-white/70 leading-relaxed">
            <p>BROADCAST INITIATED: 23:47:12 UTC</p>
            <p className="mt-2">INFECTED ZONE DETECTED. MILITARY ENFORCEMENT ACTIVE.</p>
            <p className="mt-2">AVOID ALL CONTACT. SEEK SHELTER IMMEDIATELY.</p>
            <p className="mt-4 text-emergency-red">THIS IS NOT A DRILL</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-emergency-red hover:bg-emergency-red/80 text-white py-3 font-mono tracking-wide transition-colors"
          >
            ACKNOWLEDGE ALERT
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
