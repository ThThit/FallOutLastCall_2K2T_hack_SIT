import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Package, AlertTriangle } from "lucide-react";

interface VaultItem {
  id: string;
  name: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  condition: number;
  quantity: number;
}

interface MarketItem {
  id: string;
  name: string;
  seller: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  condition: number;
  quantity: number;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketItem: MarketItem | null;
  vaultItems: VaultItem[];
  onSubmitTrade: (marketItemId: string, offeredItemIds: string[]) => void;
}

export function TradeModal({ isOpen, onClose, marketItem, vaultItems, onSubmitTrade }: TradeModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = () => {
    if (marketItem && selectedItems.length > 0) {
      onSubmitTrade(marketItem.id, selectedItems);
      setSelectedItems([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedItems([]);
    onClose();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-warning-amber';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-cyan-400';
      default: return 'text-muted-foreground';
    }
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 80) return 'text-terminal-green';
    if (condition >= 50) return 'text-warning-amber';
    return 'text-emergency-red';
  };

  if (!marketItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-hidden z-50"
          >
            <div className="bg-dark-gray border-2 border-terminal-green/40 shadow-[0_0_30px_rgba(0,255,0,0.1)]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-terminal-green/20">
                <div>
                  <h2 className="text-2xl font-mono text-terminal-green tracking-wider mb-1">
                    TRADE NEGOTIATION
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    SELECT ITEMS TO OFFER IN EXCHANGE
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-terminal-green/10 transition-colors"
                >
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Trade Overview */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mb-8">
                  {/* Requested Item */}
                  <div className="bg-charcoal border border-terminal-green/20 p-4">
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      REQUESTING
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-terminal-green" />
                        <span className="font-mono text-white">{marketItem.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className={getRarityColor(marketItem.rarity)}>
                          {marketItem.rarity.toUpperCase()}
                        </span>
                        <span className={getConditionColor(marketItem.condition)}>
                          {marketItem.condition}% CONDITION
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        From: <span className="text-cyan-400">{marketItem.seller}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-terminal-green" />
                  </div>

                  {/* Offered Items Summary */}
                  <div className="bg-charcoal border border-terminal-green/20 p-4">
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      YOUR OFFER
                    </div>
                    {selectedItems.length === 0 ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-mono">No items selected</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-terminal-green" />
                          <span className="font-mono text-white">
                            {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'} Selected
                          </span>
                        </div>
                        <div className="text-xs font-mono text-terminal-green">
                          {vaultItems
                            .filter(item => selectedItems.includes(item.id))
                            .map(item => item.name)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vault Items Selection */}
                <div>
                  <h3 className="text-sm font-mono text-terminal-green mb-4 tracking-wider">
                    SELECT ITEMS FROM YOUR VAULT
                  </h3>
                  
                  {vaultItems.length === 0 ? (
                    <div className="bg-charcoal border border-terminal-green/20 p-8 text-center">
                      <AlertTriangle className="w-8 h-8 text-warning-amber mx-auto mb-2" />
                      <p className="text-sm font-mono text-muted-foreground">
                        Your vault is empty. No items to offer.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vaultItems.map((item) => (
                        <motion.button
                          key={item.id}
                          onClick={() => toggleItemSelection(item.id)}
                          whileHover={{ scale: 1.02 }}
                          className={`text-left bg-charcoal border p-4 transition-all ${
                            selectedItems.includes(item.id)
                              ? 'border-terminal-green bg-terminal-green/10'
                              : 'border-terminal-green/20 hover:border-terminal-green/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-terminal-green flex-shrink-0" />
                              <span className="font-mono text-white text-sm">
                                {item.name}
                              </span>
                            </div>
                            {selectedItems.includes(item.id) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-5 h-5 bg-terminal-green rounded-sm flex items-center justify-center flex-shrink-0"
                              >
                                <svg className="w-3 h-3 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {item.category}
                            </span>
                            <span className={`text-xs font-mono ${getRarityColor(item.rarity)}`}>
                              {item.rarity.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            <span className={getConditionColor(item.condition)}>
                              {item.condition}% CONDITION
                            </span>
                            <span className="text-muted-foreground">
                              QTY: {item.quantity}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-terminal-green/20 bg-charcoal">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-muted-foreground/30 text-muted-foreground font-mono text-sm hover:border-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedItems.length === 0}
                  className="px-6 py-2 bg-terminal-green/20 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  SEND TRADE OFFER
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
