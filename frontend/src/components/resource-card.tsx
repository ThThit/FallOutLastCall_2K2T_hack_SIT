import { motion } from "motion/react";
import { Package, AlertCircle } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  trader: string;
  quantity: number;
  condition: 'pristine' | 'good' | 'worn' | 'damaged';
  cost: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'critical';
}

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const rarityColors = {
    common: 'text-muted-foreground',
    uncommon: 'text-terminal-green',
    rare: 'text-cyan-accent',
    critical: 'text-emergency-red',
  };

  const conditionColors = {
    pristine: 'bg-terminal-green/20 text-terminal-green',
    good: 'bg-cyan-accent/20 text-cyan-accent',
    worn: 'bg-warning-amber/20 text-warning-amber',
    damaged: 'bg-emergency-red/20 text-emergency-red',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-card border border-terminal-green/20 p-4 hover:border-terminal-green/40 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-dark-gray">
            <Package className="w-5 h-5 text-terminal-green" />
          </div>
          <div>
            <h4 className={`font-mono tracking-wide ${rarityColors[resource.rarity]}`}>
              {resource.name}
            </h4>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              TRADER: {resource.trader}
            </div>
          </div>
        </div>
        {resource.rarity === 'critical' && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertCircle className="w-4 h-4 text-emergency-red" />
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="text-xs font-mono text-muted-foreground">
          QTY: {resource.quantity}
        </div>
        <div className={`px-2 py-0.5 text-xs font-mono uppercase ${conditionColors[resource.condition]}`}>
          {resource.condition}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-terminal-green/10">
        <div className="font-mono text-terminal-green">
          {resource.cost}
        </div>
        <button className="px-4 py-1 bg-terminal-green/10 hover:bg-terminal-green/20 text-terminal-green font-mono text-xs tracking-wide transition-colors">
          TRADE
        </button>
      </div>
    </motion.div>
  );
}
