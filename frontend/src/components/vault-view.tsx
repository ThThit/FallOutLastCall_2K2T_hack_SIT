import { Package2, Shield, TrendingUp } from "lucide-react";

export function VaultView() {
  return (
    <div className="space-y-6">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package2 className="w-4 h-4 text-terminal-green" />
            <div className="text-xs text-muted-foreground font-mono">TOTAL ITEMS</div>
          </div>
          <div className="text-2xl text-terminal-green font-mono">0</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-muted-foreground font-mono">UNIQUE TYPES</div>
          </div>
          <div className="text-2xl text-cyan-400 font-mono">0</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-warning-amber" />
            <div className="text-xs text-muted-foreground font-mono">TRADE VALUE</div>
          </div>
          <div className="text-2xl text-warning-amber font-mono">—</div>
        </div>
      </div>

      <div className="text-center py-16">
        <Package2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <div className="text-muted-foreground font-mono text-sm">VAULT EMPTY</div>
        <p className="text-xs text-muted-foreground mt-2">
          Acquire items through trading to build your inventory
        </p>
      </div>
    </div>
  );
}
