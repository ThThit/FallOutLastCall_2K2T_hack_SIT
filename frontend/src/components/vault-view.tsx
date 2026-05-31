import { useState } from "react";
import { Package2, TrendingUp, Shield, AlertTriangle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useVault } from "../hooks/useVault";
import { useMarketplace } from "../hooks/useMarketplace";

interface TradeListingModalProps {
  item: any;
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
          <div className="text-terminal-green font-mono">{item.resourceName}</div>
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

const CATEGORIES = ['MEDICINE', 'FOOD', 'FUEL', 'BATTERIES', 'TOOLS', 'PARTS', 'AMMO'] as const;
const CONDITIONS = ['PRISTINE', 'GOOD', 'WORN', 'DAMAGED'] as const;

function AddItemModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (data: any) => Promise<void> }) {
  const [form, setForm] = useState({
    resourceName: '',
    quantity: 1,
    condition: 'GOOD',
    category: 'FOOD',
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resourceName.trim()) return;
    try {
      setSubmitting(true);
      setErr('');
      await onConfirm({ ...form, acquiredDate: new Date().toISOString() });
      onClose();
    } catch (e: any) {
      setErr(e.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
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
          <Plus className="w-5 h-5 text-terminal-green" />
          <h3 className="text-white font-mono tracking-wide">ADD ITEM TO VAULT</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">ITEM NAME</label>
            <input
              type="text"
              value={form.resourceName}
              onChange={(e) => setForm({ ...form, resourceName: e.target.value })}
              placeholder="e.g. Antibiotics, Diesel Fuel"
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">QUANTITY</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">CATEGORY</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">CONDITION</label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {err && (
            <div className="text-emergency-red font-mono text-xs">{err}</div>
          )}

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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/20 transition-colors disabled:opacity-50"
            >
              {submitting ? 'ADDING...' : 'ADD TO VAULT'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function VaultView() {
  const { items, stats, loading, error, addItem } = useVault();
  const { createTrade } = useMarketplace();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [vaultSort, setVaultSort] = useState<'rarity' | 'condition'>('rarity');

  const handleListForTrade = async (itemId: string, quantity: number, requestedItem: string) => {
    try {
      await createTrade({
        vaultItemId: itemId,
        quantity,
        requestedItem,
        requestedQuantity: 1,
        traderName: "Survivor",
      });
      setSelectedItem(null);
    } catch (err: any) {
      console.error("Failed to create trade:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading vault...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-emergency-red">Error: {error}</div>;
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'PRISTINE':
        return 'text-terminal-green';
      case 'GOOD':
        return 'text-cyan-400';
      case 'WORN':
        return 'text-warning-amber';
      case 'DAMAGED':
        return 'text-emergency-red';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRarityColor = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      MEDICINE: 'border-emergency-red/30 text-emergency-red',
      FOOD: 'border-warning-amber/30 text-warning-amber',
      FUEL: 'border-cyan-400/30 text-cyan-400',
      BATTERIES: 'border-terminal-green/30 text-terminal-green',
      TOOLS: 'border-muted-foreground/30 text-muted-foreground',
      PARTS: 'border-muted-foreground/30 text-muted-foreground',
      AMMO: 'border-warning-amber/30 text-warning-amber',
    };
    return rarityMap[rarity] || 'border-muted-foreground/30 text-muted-foreground';
  };
  return (
    <div className="space-y-6">
      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package2 className="w-4 h-4 text-terminal-green" />
            <div className="text-xs text-muted-foreground font-mono">TOTAL ITEMS</div>
          </div>
          <div className="text-2xl text-terminal-green font-mono">{stats?.totalItems || 0}</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div className="text-xs text-muted-foreground font-mono">UNIQUE TYPES</div>
          </div>
          <div className="text-2xl text-cyan-400 font-mono">{stats?.uniqueTypes || 0}</div>
        </div>

        <div className="bg-card border border-terminal-green/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-warning-amber" />
            <div className="text-xs text-muted-foreground font-mono">TRADE VALUE</div>
          </div>
          <div className="text-2xl text-warning-amber font-mono">{stats?.tradeValue || 'LOW'}</div>
        </div>
      </div>

      {/* Info Banner + Add Button */}
      <div className="flex items-center gap-3 bg-terminal-green/10 border border-terminal-green/30 p-4">
        <div className="flex-1">
          <div className="text-xs font-mono text-terminal-green tracking-wide">
            SECURE VAULT STORAGE
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your personal inventory is protected. Select any item to list it on the Resource Market for trade.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-green/20 border border-terminal-green text-terminal-green font-mono text-xs tracking-wide hover:bg-terminal-green/30 transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          ADD ITEM
        </button>
      </div>

      {/* Sorting Controls */}
      <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
        <span className="text-xs text-muted-foreground font-mono">SORT BY:</span>
        <button
          onClick={() => setVaultSort('rarity')}
          className={`px-3 py-1 font-mono text-xs transition-colors ${vaultSort === 'rarity'
            ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
            : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
            }`}
        >
          RARITY
        </button>
        <button
          onClick={() => setVaultSort('condition')}
          className={`px-3 py-1 font-mono text-xs transition-colors ${vaultSort === 'condition'
            ? 'bg-terminal-green/20 border border-terminal-green text-terminal-green'
            : 'bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green'
            }`}
        >
          CONDITION
        </button>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items
          .sort((a, b) => {
            if (vaultSort === 'rarity') {
              const categoryOrder: Record<string, number> = {
                MEDICINE: 3, AMMO: 2, FUEL: 2, BATTERIES: 2, TOOLS: 1, PARTS: 1, FOOD: 0
              };
              return (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0);
            } else {
              const conditionOrder: Record<string, number> = {
                PRISTINE: 3, GOOD: 2, WORN: 1, DAMAGED: 0
              };
              return (conditionOrder[b.condition] || 0) - (conditionOrder[a.condition] || 0);
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
                    <div className="text-white font-mono text-sm mb-1">{item.resourceName}</div>
                    <div className={`text-xs font-mono ${getRarityColor(item.category)}`}>
                      {item.category.toUpperCase()}
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
                    <span className="text-muted-foreground font-mono">
                      {new Date(item.acquiredDate).toLocaleDateString()}
                    </span>
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

      {items.length === 0 && (
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
        {showAddModal && (
          <AddItemModal
            onClose={() => setShowAddModal(false)}
            onConfirm={addItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}