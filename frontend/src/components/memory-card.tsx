import { motion } from "motion/react";
import { Heart, Clock } from "lucide-react";
import { GlitchText } from "./glitch-text";

interface Memory {
  id: string;
  author: string;
  title: string;
  content: string;
  date: string;
  daysAgo: number;
  isDecayed?: boolean;
}

interface MemoryCardProps {
  memory: Memory;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const decayLevel = Math.min(memory.daysAgo / 100, 0.8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 - decayLevel * 0.5 }}
      className={`bg-card border border-terminal-green/20 p-4 ${
        memory.isDecayed ? 'opacity-60' : ''
      }`}
      style={{
        filter: memory.isDecayed ? `blur(${decayLevel}px)` : 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-emergency-red" />
        <span className="font-mono text-xs text-terminal-green tracking-wide">
          {memory.author}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
          <Clock className="w-3 h-3" />
          {memory.daysAgo}d ago
        </div>
      </div>

      <h4 className="mb-2 text-white">
        {memory.isDecayed ? <GlitchText text={memory.title} intensity={0.3} /> : memory.title}
      </h4>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {memory.isDecayed ? <GlitchText text={memory.content} intensity={0.5} /> : memory.content}
      </p>

      {memory.isDecayed && (
        <div className="mt-3 pt-3 border-t border-emergency-red/20">
          <div className="text-xs font-mono text-emergency-red/60">
            [DATA CORRUPTION DETECTED]
          </div>
        </div>
      )}
    </motion.div>
  );
}
