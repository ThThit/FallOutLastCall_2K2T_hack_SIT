import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function SignalStrength() {
  const [strength, setStrength] = useState(42);
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStrength = Math.max(15, Math.min(85, strength + (Math.random() - 0.5) * 15));
      setStrength(Math.floor(newStrength));
      setIsFlickering(newStrength < 30);
    }, 3000);

    return () => clearInterval(interval);
  }, [strength]);

  return (
    <motion.div
      className="flex items-center justify-center px-3 py-1.5 bg-charcoal border border-terminal-green/30"
      animate={isFlickering ? { opacity: [1, 0.5, 1, 0.3, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <span className="font-mono text-xs text-terminal-green tracking-wider">
        SIGNAL: {strength}%
      </span>
    </motion.div>
  );
}
