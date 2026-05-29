import { motion } from "motion/react";
import { Wifi, Battery, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 bg-charcoal border-b border-emergency-red/30 flex items-center justify-between px-6">
      <motion.div
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-emergency-red rounded-full" />
        <span className="font-mono text-xs text-emergency-red tracking-widest">
          SYSTEM UNSTABLE
        </span>
      </motion.div>

      <div className="flex items-center gap-6 text-xs font-mono text-terminal-green">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3" />
          WEAK
        </div>
        <div className="flex items-center gap-2">
          <Battery className="w-3 h-3" />
          23%
        </div>
      </div>
    </div>
  );
}
