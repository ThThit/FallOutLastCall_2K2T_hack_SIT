import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Package2, X, AlertTriangle, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["MEDICINE", "FOOD", "FUEL", "BATTERIES", "TOOLS", "PARTS", "AMMO"] as const;

const URGENCY_LEVELS = [
  { value: "PRISTINE", label: "STANDARD", desc: "No rush — trading when convenient", color: "text-terminal-green", border: "border-terminal-green" },
  { value: "GOOD",     label: "ELEVATED", desc: "Needed within the week",             color: "text-cyan-400",       border: "border-cyan-400" },
  { value: "WORN",     label: "URGENT",   desc: "Needed within 48 hours",             color: "text-warning-amber",  border: "border-warning-amber" },
  { value: "DAMAGED",  label: "CRITICAL", desc: "Immediate need — life or death",     color: "text-emergency-red",  border: "border-emergency-red" },
] as const;

type Tab = "vault" | "direct";

interface CreateTradeModalProps {
  vaultItems: any[];
  onClose: () => void;
  onSubmit: (tradeData: any) => Promise<void>;
}

export function CreateTradeModal({ vaultItems, onClose, onSubmit }: CreateTradeModalProps) {
  const [tab, setTab] = useState<Tab>("vault");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Vault-linked form state
  const [selectedVaultId, setSelectedVaultId] = useState("");
  const [vaultQty, setVaultQty] = useState(1);

  // Direct form state
  const [resourceName, setResourceName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<string>("FOOD");

  // Shared fields
  const [requestedItem, setRequestedItem] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<string>("GOOD");

  const selectedVaultItem = vaultItems.find((i) => i.id === selectedVaultId);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!requestedItem.trim()) {
      setError("Requested exchange item is required");
      return;
    }

    let tradeData: any;

    if (tab === "vault") {
      if (!selectedVaultId) {
        setError("Please select a vault item to offer");
        return;
      }
      if (vaultQty < 1 || vaultQty > (selectedVaultItem?.quantity || 0)) {
        setError(`Quantity must be between 1 and ${selectedVaultItem?.quantity}`);
        return;
      }
      tradeData = {
        vaultItemId: selectedVaultId,
        quantity: vaultQty,
        requestedItem: requestedItem.toUpperCase(),
        requestedQuantity,
        traderName: user?.username || "UNKNOWN",
        location: location.trim() || undefined,
      };
    } else {
      if (!resourceName.trim()) {
        setError("Resource name is required");
        return;
      }
      tradeData = {
        resourceName: resourceName.toUpperCase(),
        quantity,
        condition: urgency,
        category,
        requestedItem: requestedItem.toUpperCase(),
        requestedQuantity,
        traderName: user?.username || "UNKNOWN",
        location: location.trim() || undefined,
      };
    }

    try {
      setSubmitting(true);
      await onSubmit(tradeData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create trade offer");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    const map: Record<string, string> = {
      MEDICINE: "text-emergency-red border-emergency-red/50",
      FOOD: "text-warning-amber border-warning-amber/50",
      FUEL: "text-cyan-400 border-cyan-400/50",
      BATTERIES: "text-terminal-green border-terminal-green/50",
      TOOLS: "text-muted-foreground border-muted-foreground/30",
      PARTS: "text-muted-foreground border-muted-foreground/30",
      AMMO: "text-warning-amber border-warning-amber/50",
    };
    return map[cat] || "text-muted-foreground border-muted-foreground/30";
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
        className="bg-dark-gray border-2 border-terminal-green/50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-terminal-green/20">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-terminal-green" />
            <span className="text-white font-mono tracking-wide">CREATE TRADE OFFER</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-terminal-green transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-terminal-green/20">
          <button
            type="button"
            onClick={() => setTab("vault")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs tracking-wide transition-colors ${
              tab === "vault"
                ? "bg-terminal-green/10 text-terminal-green border-b-2 border-terminal-green"
                : "text-muted-foreground hover:text-terminal-green"
            }`}
          >
            <Package2 className="w-4 h-4" />
            FROM VAULT
          </button>
          <button
            type="button"
            onClick={() => setTab("direct")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono text-xs tracking-wide transition-colors ${
              tab === "direct"
                ? "bg-terminal-green/10 text-terminal-green border-b-2 border-terminal-green"
                : "text-muted-foreground hover:text-terminal-green"
            }`}
          >
            <Zap className="w-4 h-4" />
            NEW OFFER
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <AnimatePresence mode="wait">
            {tab === "vault" ? (
              <motion.div
                key="vault"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Vault item selector */}
                <div>
                  <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                    SELECT ITEM FROM VAULT
                  </label>
                  {vaultItems.length === 0 ? (
                    <div className="bg-charcoal border border-warning-amber/30 p-4 text-xs text-warning-amber font-mono">
                      Your vault is empty. Add items first or use the NEW OFFER tab.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vaultItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setSelectedVaultId(item.id); setVaultQty(1); }}
                          className={`w-full text-left p-3 border transition-colors ${
                            selectedVaultId === item.id
                              ? "bg-terminal-green/20 border-terminal-green"
                              : "bg-charcoal border-terminal-green/20 hover:border-terminal-green/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-mono text-sm">{item.resourceName}</div>
                              <div className={`text-xs font-mono mt-0.5 border px-1 inline-block ${getCategoryBadgeColor(item.category)}`}>
                                {item.category}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-terminal-green font-mono">×{item.quantity}</div>
                              <div className="text-xs text-muted-foreground font-mono">{item.condition}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedVaultItem && (
                  <div>
                    <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                      QUANTITY TO OFFER
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedVaultItem.quantity}
                      value={vaultQty}
                      onChange={(e) => setVaultQty(Number(e.target.value))}
                      className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
                    />
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      Available: {selectedVaultItem.quantity} units
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="direct"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Resource name */}
                <div>
                  <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                    RESOURCE NAME
                  </label>
                  <input
                    type="text"
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder="e.g. ANTIBIOTICS, DIESEL FUEL"
                    className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                    QUANTITY
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-charcoal border border-terminal-green/30 px-4 py-2 text-terminal-green font-mono focus:border-terminal-green focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                    RESOURCE CATEGORY
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`py-2 text-xs font-mono border transition-colors ${
                          category === cat
                            ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
                            : "bg-charcoal border-terminal-green/20 text-muted-foreground hover:border-terminal-green/40 hover:text-terminal-green"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trade urgency */}
                <div>
                  <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                    TRADE URGENCY
                  </label>
                  <div className="space-y-2">
                    {URGENCY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setUrgency(level.value)}
                        className={`w-full flex items-center gap-3 p-3 border transition-colors text-left ${
                          urgency === level.value
                            ? `bg-charcoal ${level.border} border-2`
                            : "bg-charcoal border-terminal-green/20 hover:border-terminal-green/40"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${urgency === level.value ? "bg-current" : "bg-muted-foreground"} ${level.color}`} />
                        <div>
                          <div className={`text-xs font-mono font-bold ${level.color}`}>{level.label}</div>
                          <div className="text-xs text-muted-foreground font-mono">{level.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared fields — always visible */}
          <div className="border-t border-terminal-green/20 pt-5 space-y-4">
            <div className="text-xs font-mono text-muted-foreground tracking-wide mb-1">EXCHANGE REQUEST</div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                  REQUESTING IN EXCHANGE
                </label>
                <input
                  type="text"
                  value={requestedItem}
                  onChange={(e) => setRequestedItem(e.target.value)}
                  placeholder="e.g. BATTERIES, FUEL"
                  className="w-full bg-charcoal border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                  QTY NEEDED
                </label>
                <input
                  type="number"
                  min={1}
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                  className="w-full bg-charcoal border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-terminal-green tracking-wide mb-2">
                TRADE LOCATION <span className="text-muted-foreground">(OPTIONAL)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sector 7, Gate B / Central Hub"
                className="w-full bg-charcoal border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-warning-amber/10 border border-warning-amber/30 p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-amber mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground font-mono leading-relaxed">
              {tab === "vault"
                ? "Listed items will be held in reserve until the trade is completed or cancelled."
                : "Direct offers are listed immediately. No inventory deduction until trade accepted."}
            </div>
          </div>

          {error && (
            <div className="text-emergency-red font-mono text-xs">{error}</div>
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
              {submitting ? "POSTING..." : "POST TRADE OFFER"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
