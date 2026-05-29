import { useState } from "react";
import { Package2, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VaultItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'pristine' | 'good' | 'worn' | 'damaged';
  rarity: 'common' | 'uncommon' | 'rare' | 'critical';
  category: 'medical' | 'supplies' | 'weapons' | 'food' | 'equipment';
  acquiredDate: string;
}

interface TradeListingModalProps {
  item: VaultItem;
  onClose: () => void;
  onConfirm: (itemId: string, quantity: number, requestedItem: string) => void;
}

function TradeListingModal({ item, onClose, onConfirm }: TradeListingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [requestedItem, setRequestedItem] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestedItem.trim()) {
      onConfirm(item.id, quantity, requestedItem);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-dark-gray border-2 border-terminal-green/50 max-w-md w-full p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white font-mono tracking-wide">CREATE TRADE LISTING</h3>
        </div>

        <div className="bg-charcoal border border-terminal-green/20 p-4 mb-6">
          <div className="text-xs text-muted-foreground font-mono mb-1">OFFERING</div>
          <div className="text-terminal-green font-mono">{item.name}</div>
          <div className="text-xs text-muted-foreground font-mono mt-1">
            AVAILABLE: {item.quantity} UNITS
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
              QUANTITY TO TRADE
            </label>
            <input
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
              REQUESTING IN EXCHANGE
            </label>
            <input
              type="text"
              value={requestedItem}
              onChange={(e) => setRequestedItem(e.target.value.toUpperCase())}
              placeholder="e.g. 2x FUEL, 3x BATTERIES"
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
            />
          </div>

          <div className="bg-warning-amber/10 border border-warning-amber/30 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-amber mt-0.5" />
              <div className="text-xs text-muted-foreground font-mono leading-relaxed">
                Once listed, items will appear in the Resource Market for other survivors to trade.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-charcoal border border-terminal-green/30 text-muted-foreground font-mono text-sm hover:border-terminal-green/50 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/20 transition-colors"
            >
              LIST FOR TRADE
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function VaultView() {
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [vaultSort, setVaultSort] = useState<'rarity' | 'condition'>('rarity');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([
    {
      id: 'v1',
      name: 'WATER PURIFIER',
      quantity: 2,
      condition: 'good',
      rarity: 'rare',
      category: 'equipment',
      acquiredDate: '2026-05-15',
    },
    {
      id: 'v2',
      name: 'ANTIBIOTICS',
      quantity: 8,
      condition: 'pristine',
      rarity: 'critical',
      category: 'medical',
      acquiredDate: '2026-05-20',
    },
    {
      id: 'v3',
      name: 'CANNED BEANS',
      quantity: 24,
      condition: 'good',
      rarity: 'common',
      category: 'food',
      acquiredDate: '2026-05-10',
    },
    {
      id: 'v4',
      name: 'FLARE GUN',
      quantity: 1,
      condition: 'worn',
      rarity: 'uncommon',
      category: 'weapons',
      acquiredDate: '2026-05-12',
    },
    {
      id: 'v5',
      name: 'GAS MASK FILTERS',
      quantity: 6,
      condition: 'good',
      rarity: 'uncommon',
      category: 'equipment',
      acquiredDate: '2026-05-18',
    },
    {
      id: 'v6',
      name: 'ROPE (50M)',
      quantity: 3,
      condition: 'good',
      rarity: 'common',
      category: 'supplies',
      acquiredDate: '2026-05-08',
    },
  ]);

  const handleListForTrade = (itemId: string, quantity: number, requestedItem: string) => {
    // Update vault quantity
    setVaultItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity - quantity }
          : item
      ).filter(item => item.quantity > 0)
    );
    
    setSelectedItem(null);
    
    // Show success message (in a real app, this would add to the market)
    console.log(`Listed ${quantity}x ${vaultItems.find(i => i.id === itemId)?.name} for ${requestedItem}`);
  };

  const getConditionColor = (condition: VaultItem['condition']) => {
    switch (condition) {
      case 'pristine':
        return 'text-terminal-green';
      case 'good':
        return 'text-cyan-400';
      case 'worn':
        return 'text-warning-amber';
      case 'damaged':
        return 'text-emergency-red';
    }
  };

  const getRarityColor = (rarity: VaultItem['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-muted-foreground/30 text-muted-foreground';
      case 'uncommon':
        return 'border-cyan-400/30 text-cyan-400';
      case 'rare':
        return 'border-warning-amber/30 text-warning-amber';
      case 'critical':
        return 'border-emergency-red/30 text-emergency-red';
    }
  };

  const totalItems = vaultItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package2 className="w-4 h-4 text-terminal-green" />
            <div className="text-xs text-muted-foreground font-mono">TOTAL ITEMS</div>
          </div>
          <div className="text-2xl text-terminal-green font-mono">{totalItems}</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-muted-foreground font-mono">UNIQUE TYPES</div>
          </div>
          <div className="text-2xl text-cyan-400 font-mono">{vaultItems.length}</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-warning-amber" />
            <div className="text-xs text-muted-foreground font-mono">TRADE VALUE</div>
          </div>
          <div className="text-2xl text-warning-amber font-mono">HIGH</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-terminal-green/10 border border-terminal-green/30 p-4">
        <div className="text-xs font-mono text-terminal-green tracking-wide">
          🔒 SECURE VAULT STORAGE
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Your personal inventory is protected. Select any item to list it on the Resource Market for trade.
        </p>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
        <span className="text-xs text-muted-foreground font-mono">SORT BY:</span>
        <button
          onClick={() => setVaultSort('rarity')}
          className={`px-3 py-1 font-mono text-xs transition-colors ${
            vaultSort === 'rarity'
              ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
              : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
          }`}
        >
          RARITY
        </button>
        <button
          onClick={() => setVaultSort('condition')}
          className={`px-3 py-1 font-mono text-xs transition-colors ${
            vaultSort === 'condition'
              ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
              : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
          }`}
        >
          CONDITION
        </button>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vaultItems
          .sort((a, b) => {
            if (vaultSort === 'rarity') {
              const rarityOrder = { common: 0, uncommon: 1, rare: 2, critical: 3 };
              return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            } else {
              const conditionOrder = { damaged: 0, worn: 1, good: 2, pristine: 3 };
              return conditionOrder[b.condition] - conditionOrder[a.condition];
            }
          })
          .map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-terminal-green/20 hover:border-terminal-green/40 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-white font-mono text-sm mb-1">{item.name}</div>
                    <div className={`text-xs font-mono ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-terminal-green font-mono text-lg">×{item.quantity}</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">CONDITION</span>
                    <span className={`font-mono ${getConditionColor(item.condition)}`}>
                      {item.condition.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">CATEGORY</span>
                    <span className="text-white font-mono">
                      {item.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-mono">ACQUIRED</span>
                    <span className="text-muted-foreground font-mono">{item.acquiredDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full px-4 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-xs tracking-wide hover:bg-terminal-green/20 transition-colors"
                >
                  LIST FOR TRADE
                </button>
              </div>
            </motion.div>
          ))}
      </div>

      {vaultItems.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-muted-foreground font-mono text-sm">VAULT EMPTY</div>
          <p className="text-xs text-muted-foreground mt-2">
            Acquire items through trading to build your inventory
          </p>
        </div>
      )}

      {/* Trade Listing Modal */}
      <AnimatePresence>
        {selectedItem && (
          <TradeListingModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onConfirm={handleListForTrade}
          />
        )}
      </AnimatePresence>
    </div>
  );
}