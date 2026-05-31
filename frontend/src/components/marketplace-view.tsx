import { useState, useMemo, useEffect } from "react";
import {
    Zap, AlertTriangle, TrendingUp, Search, Filter,
    X, Plus, MapPin, Clock, Flame, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMarketplace } from "../hooks/useMarketplace";
import { useVault } from "../hooks/useVault";
import { CreateTradeModal } from "./create-trade-modal";

// ─── helpers ────────────────────────────────────────────────────────────────

const CATEGORIES = ["MEDICINE", "FOOD", "FUEL", "BATTERIES", "TOOLS", "PARTS", "AMMO"] as const;
const CONDITIONS = ["PRISTINE", "GOOD", "WORN", "DAMAGED"] as const;

const URGENCY_META: Record<string, { label: string; color: string; bg: string; border: string; pulse: boolean }> = {
    PRISTINE: { label: "STANDARD",  color: "text-terminal-green",  bg: "bg-terminal-green/10",  border: "border-terminal-green/40",  pulse: false },
    GOOD:     { label: "ELEVATED",  color: "text-cyan-400",         bg: "bg-cyan-400/10",         border: "border-cyan-400/40",         pulse: false },
    WORN:     { label: "URGENT",    color: "text-warning-amber",    bg: "bg-warning-amber/10",    border: "border-warning-amber/50",    pulse: false },
    DAMAGED:  { label: "CRITICAL",  color: "text-emergency-red",    bg: "bg-emergency-red/10",    border: "border-emergency-red/60",    pulse: true  },
};

const CATEGORY_META: Record<string, { color: string; border: string }> = {
    MEDICINE:  { color: "text-emergency-red",   border: "border-emergency-red/40"   },
    FOOD:      { color: "text-warning-amber",   border: "border-warning-amber/40"   },
    FUEL:      { color: "text-cyan-400",        border: "border-cyan-400/40"        },
    BATTERIES: { color: "text-terminal-green",  border: "border-terminal-green/40"  },
    TOOLS:     { color: "text-muted-foreground",border: "border-muted-foreground/30"},
    PARTS:     { color: "text-muted-foreground",border: "border-muted-foreground/30"},
    AMMO:      { color: "text-warning-amber",   border: "border-warning-amber/40"   },
};

const RARITY_RANK: Record<string, number> = { MEDICINE: 6, AMMO: 5, FUEL: 4, BATTERIES: 3, TOOLS: 2, PARTS: 1, FOOD: 0 };

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Accept Trade Modal ──────────────────────────────────────────────────────

function isItemMatch(item: any, requestedItem: string): boolean {
    const req = requestedItem.toLowerCase();
    const name = item.resourceName.toLowerCase();
    const cat = item.category.toLowerCase();
    // match if item name, category, or any word in the request overlaps
    const words = req.split(/\W+/).filter((w: string) => w.length > 2);
    return name.includes(req) || req.includes(name) || cat === req ||
        words.some((w: string) => name.includes(w) || cat.includes(w));
}

type TradePhase = "select" | "confirm" | "success";

function AcceptTradeModal({
    trade, availableItems, onClose, onAccept, isLoading,
}: {
    trade: any; availableItems: any[]; onClose: () => void;
    onAccept: (itemId: string) => Promise<void>; isLoading: boolean;
}) {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [phase, setPhase] = useState<TradePhase>("select");
    const [tradeError, setTradeError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const selectedItem = availableItems.find((i) => i.id === selectedItemId);
    const requiredQty = trade.requestedQuantity || 1;

    // Split vault into matched / unmatched
    const matchedItems = availableItems.filter((i) => isItemMatch(i, trade.requestedItem));
    const otherItems = availableItems.filter((i) => !isItemMatch(i, trade.requestedItem));
    const displayItems = showAll ? availableItems : matchedItems.length > 0 ? matchedItems : availableItems;

    const hasEnough = selectedItem ? selectedItem.quantity >= requiredQty : false;

    const urgency = URGENCY_META[trade.condition] ?? URGENCY_META.GOOD;
    const catMeta = CATEGORY_META[trade.category] ?? CATEGORY_META.TOOLS;

    const handleConfirm = async () => {
        if (!selectedItemId) return;
        setTradeError(null);
        try {
            await onAccept(selectedItemId);
            setPhase("success");
        } catch (err: any) {
            setTradeError(err.message || "Trade failed. Please try again.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={phase === "success" ? onClose : undefined}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-gray border-2 border-terminal-green/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* ── Success state ── */}
                {phase === "success" ? (
                    <div className="p-8 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="w-16 h-16 border-2 border-terminal-green flex items-center justify-center mb-4"
                        >
                            <TrendingUp className="w-8 h-8 text-terminal-green" />
                        </motion.div>
                        <div className="text-terminal-green font-mono text-lg font-bold tracking-widest mb-2">
                            TRADE COMPLETE
                        </div>
                        <div className="text-muted-foreground font-mono text-xs space-y-1 mb-6">
                            <div>You gave: <span className="text-cyan-400">×{requiredQty} {selectedItem?.resourceName}</span></div>
                            <div>You received: <span className="text-terminal-green">×{trade.quantity} {trade.resourceName}</span></div>
                            <div className="mt-2 text-muted-foreground/60">Items have been updated in your vault.</div>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/20 transition-colors"
                        >
                            CLOSE
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-terminal-green/20">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-terminal-green" />
                                <span className="text-white font-mono tracking-wide">
                                    {phase === "confirm" ? "CONFIRM TRADE" : "ACCEPT TRADE"}
                                </span>
                            </div>
                            <button onClick={onClose} className="text-muted-foreground hover:text-terminal-green transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Exchange summary cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-charcoal border border-terminal-green/20 p-4">
                                    <div className="text-xs text-muted-foreground font-mono mb-1">YOU RECEIVE</div>
                                    <div className="text-terminal-green font-mono font-bold mb-1">{trade.resourceName}</div>
                                    <div className="text-lg text-terminal-green font-mono font-bold">×{trade.quantity}</div>
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        <span className={`text-xs font-mono border px-1 ${catMeta.color} ${catMeta.border}`}>{trade.category}</span>
                                        <span className={`text-xs font-mono border px-1 ${urgency.color} ${urgency.border}`}>{urgency.label}</span>
                                    </div>
                                </div>
                                <div className="bg-charcoal border border-cyan-400/20 p-4">
                                    <div className="text-xs text-muted-foreground font-mono mb-1">THEY NEED</div>
                                    <div className="text-cyan-400 font-mono font-bold mb-1">{trade.requestedItem}</div>
                                    <div className="text-lg text-cyan-400 font-mono font-bold">×{requiredQty}</div>
                                    {trade.location && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground font-mono">
                                            <MapPin className="w-3 h-3" />{trade.location}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Confirm phase ── */}
                            {phase === "confirm" && selectedItem ? (
                                <div className="space-y-4">
                                    <div className="bg-terminal-green/10 border border-terminal-green/40 p-4">
                                        <div className="text-xs font-mono text-terminal-green font-bold tracking-wide mb-3">TRADE BREAKDOWN</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm font-mono">
                                                <span className="text-muted-foreground">You give</span>
                                                <span className="text-emergency-red">−×{requiredQty} {selectedItem.resourceName}</span>
                                            </div>
                                            <div className="border-t border-terminal-green/20" />
                                            <div className="flex items-center justify-between text-sm font-mono">
                                                <span className="text-muted-foreground">You receive</span>
                                                <span className="text-terminal-green">+×{trade.quantity} {trade.resourceName}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-terminal-green/20 text-xs text-muted-foreground font-mono">
                                            Trader: <span className="text-terminal-green">{trade.traderName}</span>
                                        </div>
                                    </div>

                                    {tradeError && (
                                        <div className="bg-emergency-red/10 border border-emergency-red/40 p-3 text-xs text-emergency-red font-mono">
                                            {tradeError}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setPhase("select"); setTradeError(null); }}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 bg-charcoal border border-terminal-green/30 text-muted-foreground font-mono text-sm hover:border-terminal-green/50 transition-colors disabled:opacity-50"
                                        >
                                            BACK
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            disabled={isLoading}
                                            className="flex-1 px-4 py-2 bg-terminal-green/20 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/30 transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? "PROCESSING..." : "CONFIRM & EXECUTE"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── Select phase ── */
                                <div className="space-y-4">
                                    {/* Vault item list */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-mono text-terminal-green tracking-wide">
                                                SELECT YOUR OFFER
                                                {matchedItems.length > 0 && (
                                                    <span className="ml-2 text-terminal-green/60">
                                                        ({matchedItems.length} match{matchedItems.length !== 1 ? "es" : ""})
                                                    </span>
                                                )}
                                            </div>
                                            {otherItems.length > 0 && matchedItems.length > 0 && (
                                                <button
                                                    onClick={() => setShowAll((v) => !v)}
                                                    className="text-xs font-mono text-muted-foreground hover:text-terminal-green transition-colors"
                                                >
                                                    {showAll ? "SHOW MATCHES ONLY" : `SHOW ALL (${availableItems.length})`}
                                                </button>
                                            )}
                                        </div>

                                        {availableItems.length === 0 ? (
                                            <div className="bg-charcoal border border-warning-amber/30 p-4">
                                                <div className="text-xs text-warning-amber font-mono">
                                                    Your vault is empty. Add items before trading.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                                {displayItems.map((item) => {
                                                    const isMatch = isItemMatch(item, trade.requestedItem);
                                                    const enough = item.quantity >= requiredQty;
                                                    const isSelected = selectedItemId === item.id;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => enough && setSelectedItemId(item.id)}
                                                            disabled={!enough}
                                                            className={`w-full text-left p-3 border transition-colors ${isSelected
                                                                ? "bg-terminal-green/20 border-terminal-green"
                                                                : enough
                                                                    ? "bg-charcoal border-terminal-green/20 hover:border-terminal-green/50"
                                                                    : "bg-charcoal border-terminal-green/10 opacity-40 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-terminal-green font-mono text-sm">{item.resourceName}</span>
                                                                        {isMatch && (
                                                                            <span className="text-xs font-mono text-terminal-green border border-terminal-green/50 px-1">
                                                                                MATCH
                                                                            </span>
                                                                        )}
                                                                        {!enough && (
                                                                            <span className="text-xs font-mono text-emergency-red/70">
                                                                                NEED ×{requiredQty}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                                        {item.category} · {item.condition}
                                                                    </div>
                                                                </div>
                                                                <div className={`font-mono text-sm shrink-0 ${enough ? "text-terminal-green" : "text-muted-foreground"}`}>
                                                                    ×{item.quantity}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {matchedItems.length === 0 && availableItems.length > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground font-mono">
                                                No exact matches for "{trade.requestedItem}" — select any item to offer instead.
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected item preview */}
                                    {selectedItem && (
                                        <div className={`p-3 border text-xs font-mono ${hasEnough
                                            ? "bg-terminal-green/5 border-terminal-green/30"
                                            : "bg-emergency-red/5 border-emergency-red/30"
                                            }`}>
                                            {hasEnough ? (
                                                <div className="text-muted-foreground">
                                                    Offering <span className="text-cyan-400">×{requiredQty} {selectedItem.resourceName}</span> for <span className="text-terminal-green">×{trade.quantity} {trade.resourceName}</span>
                                                </div>
                                            ) : (
                                                <div className="text-emergency-red">
                                                    Insufficient stock — need ×{requiredQty}, have ×{selectedItem.quantity}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2 bg-charcoal border border-terminal-green/30 text-muted-foreground font-mono text-sm hover:border-terminal-green/50 transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={() => selectedItemId && hasEnough && setPhase("confirm")}
                                            disabled={!selectedItemId || !hasEnough}
                                            className="flex-1 px-4 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-sm hover:bg-terminal-green/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            REVIEW TRADE →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

// ─── Trade Card ──────────────────────────────────────────────────────────────

function TradeCard({
    trade, isOwn, demandCount, onAccept, onCancel, cancelling,
}: {
    trade: any; isOwn: boolean; demandCount: number;
    onAccept: () => void; onCancel: () => void; cancelling: boolean;
}) {
    const condition = trade.vaultItem?.condition ?? trade.condition;
    const category  = trade.vaultItem?.category  ?? trade.category;
    const name      = trade.vaultItem?.resourceName ?? trade.resourceName;

    const urgency  = URGENCY_META[condition]  ?? URGENCY_META.GOOD;
    const catMeta  = CATEGORY_META[category]  ?? CATEGORY_META.TOOLS;
    const isCritical = condition === "DAMAGED";
    const isHot = demandCount >= 2;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative bg-card border overflow-hidden transition-colors ${isOwn
                ? "border-warning-amber/40 hover:border-warning-amber/60"
                : isCritical
                    ? "border-emergency-red/50 hover:border-emergency-red/70"
                    : "border-terminal-green/20 hover:border-terminal-green/40"
                }`}
        >
            {/* Critical pulsing top bar */}
            {isCritical && !isOwn && (
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="h-0.5 w-full bg-emergency-red"
                />
            )}

            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-white font-mono text-sm truncate">{name}</span>
                            {isOwn && (
                                <span className="text-xs font-mono text-warning-amber border border-warning-amber/50 px-1 shrink-0">
                                    MINE
                                </span>
                            )}
                            {isHot && !isOwn && (
                                <motion.span
                                    animate={{ opacity: [1, 0.6, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-xs font-mono text-emergency-red border border-emergency-red/50 px-1 flex items-center gap-1 shrink-0"
                                >
                                    <Flame className="w-3 h-3" /> HOT
                                </motion.span>
                            )}
                        </div>

                        {/* Category + urgency badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-mono border px-1 ${catMeta.color} ${catMeta.border}`}>
                                {category}
                            </span>
                            <span className={`text-xs font-mono border px-1 ${urgency.color} ${urgency.border}`}>
                                {urgency.label}
                            </span>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="text-right ml-3 shrink-0">
                        <div className={`font-mono text-xl font-bold ${urgency.color}`}>×{trade.quantity}</div>
                        <div className="text-xs text-muted-foreground font-mono">units</div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-4 pb-4 border-b border-terminal-green/10 text-xs font-mono">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">WANTS</span>
                        <span className="text-cyan-400">
                            ×{trade.requestedQuantity || 1} {trade.requestedItem}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">TRADER</span>
                        <span className="text-terminal-green">{trade.traderName}</span>
                    </div>

                    {trade.location && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">LOCATION</span>
                            <span className="text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{trade.location}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">POSTED</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{timeAgo(trade.createdAt)}
                        </span>
                    </div>

                    {/* Demand indicator bar */}
                    {demandCount > 0 && (
                        <div className="flex items-center justify-between pt-0.5">
                            <span className="text-muted-foreground">DEMAND</span>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(demandCount, 5) }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 ${demandCount >= 4 ? "bg-emergency-red" : demandCount >= 2 ? "bg-warning-amber" : "bg-terminal-green"}`}
                                    />
                                ))}
                                {demandCount > 5 && <span className="text-warning-amber">+{demandCount - 5}</span>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action button */}
                {isOwn ? (
                    <button
                        onClick={onCancel}
                        disabled={cancelling}
                        className="w-full px-4 py-2 bg-emergency-red/10 border border-emergency-red/50 text-emergency-red font-mono text-xs tracking-wide hover:bg-emergency-red/20 transition-colors disabled:opacity-50"
                    >
                        {cancelling ? "REMOVING..." : "REMOVE FROM MARKET"}
                    </button>
                ) : (
                    <button
                        onClick={onAccept}
                        className={`w-full px-4 py-2 border font-mono text-xs tracking-wide transition-colors ${isCritical
                            ? "bg-emergency-red/10 border-emergency-red text-emergency-red hover:bg-emergency-red/20"
                            : "bg-terminal-green/10 border-terminal-green text-terminal-green hover:bg-terminal-green/20"
                            }`}
                    >
                        {isCritical ? "⚡ ACCEPT — CRITICAL" : "ACCEPT TRADE"}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Scarcity Warning Banner ─────────────────────────────────────────────────

function ScarcityBanner({ scarceCategories }: { scarceCategories: string[] }) {
    if (scarceCategories.length === 0) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden border border-emergency-red/40 bg-emergency-red/5 p-4"
        >
            {/* Animated scan line */}
            <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emergency-red/10 to-transparent pointer-events-none"
            />

            <div className="flex items-start gap-3">
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    <AlertTriangle className="w-5 h-5 text-emergency-red mt-0.5 shrink-0" />
                </motion.div>
                <div className="flex-1">
                    <div className="text-xs font-mono text-emergency-red font-bold tracking-widest mb-2">
                        SCARCITY ALERT — HIGH-DEMAND ITEMS
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {scarceCategories.map((cat) => {
                            const meta = CATEGORY_META[cat] ?? CATEGORY_META.TOOLS;
                            return (
                                <motion.span
                                    key={cat}
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.4, repeat: Infinity, delay: Math.random() * 0.5 }}
                                    className={`text-xs font-mono border px-2 py-0.5 ${meta.color} ${meta.border}`}
                                >
                                    {cat}
                                </motion.span>
                            );
                        })}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-2">
                        Multiple traders are requesting these resources. Consider listing yours.
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Cancel Confirm Modal ────────────────────────────────────────────────────

function CancelConfirmModal({
    trade, onClose, onConfirm, isLoading,
}: {
    trade: any; onClose: () => void; onConfirm: () => Promise<void>; isLoading: boolean;
}) {
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setError(null);
        try {
            await onConfirm();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to cancel trade");
        }
    };

    const name = trade.vaultItem?.resourceName ?? trade.resourceName;
    const isVaultLinked = !!trade.vaultItemId;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-dark-gray border-2 border-emergency-red/50 max-w-md w-full p-6"
            >
                {/* Pulsing warning bar */}
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="h-0.5 w-full bg-emergency-red mb-5"
                />

                <div className="flex items-start gap-3 mb-5">
                    <AlertTriangle className="w-6 h-6 text-emergency-red shrink-0 mt-0.5" />
                    <div>
                        <div className="text-white font-mono font-bold mb-1">REMOVE FROM MARKET?</div>
                        <div className="text-muted-foreground font-mono text-xs leading-relaxed">
                            This will remove <span className="text-emergency-red">×{trade.quantity} {name}</span> from the marketplace.
                            {isVaultLinked && (
                                <span className="text-terminal-green"> Items will be returned to your vault.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-charcoal border border-emergency-red/20 p-3 mb-5 space-y-1 text-xs font-mono">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">LISTING</span>
                        <span className="text-white">{name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">QUANTITY</span>
                        <span className="text-emergency-red">×{trade.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">VAULT RETURN</span>
                        <span className={isVaultLinked ? "text-terminal-green" : "text-muted-foreground"}>
                            {isVaultLinked ? `+×${trade.quantity} restored` : "N/A (direct offer)"}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-emergency-red/10 border border-emergency-red/40 p-3 mb-4 text-xs text-emergency-red font-mono">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-charcoal border border-terminal-green/30 text-muted-foreground font-mono text-sm hover:border-terminal-green/50 transition-colors disabled:opacity-50"
                    >
                        KEEP LISTING
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-emergency-red/10 border border-emergency-red text-emergency-red font-mono text-sm hover:bg-emergency-red/20 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "CANCELLING..." : "CONFIRM CANCEL"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Trade History Panel ─────────────────────────────────────────────────────

function TradeHistoryPanel({ history, myUserId }: { history: any[]; myUserId: string | null }) {
    const [open, setOpen] = useState(false);

    if (history.length === 0) return null;

    return (
        <div className="border border-terminal-green/20">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-charcoal hover:bg-charcoal/80 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground tracking-wide">
                        TRADE HISTORY
                    </span>
                    <span className="text-xs font-mono text-muted-foreground border border-muted-foreground/30 px-1.5">
                        {history.length}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                >
                    ▾
                </motion.div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="divide-y divide-terminal-green/10 max-h-96 overflow-y-auto">
                            {history.map((trade) => {
                                const isCreator = trade.creatorId === myUserId;
                                const completed = trade.status === "COMPLETED";
                                const name = trade.vaultItem?.resourceName ?? trade.resourceName;
                                const catMeta = CATEGORY_META[trade.category] ?? CATEGORY_META.TOOLS;

                                return (
                                    <motion.div
                                        key={trade.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 px-4 py-3 bg-dark-gray hover:bg-charcoal transition-colors"
                                    >
                                        {/* Status indicator */}
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${completed ? "bg-terminal-green" : "bg-muted-foreground"}`} />

                                        {/* Trade info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-mono text-white truncate">{name}</span>
                                                <span className={`text-xs font-mono border px-1 ${catMeta.color} ${catMeta.border}`}>
                                                    {trade.category}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                ×{trade.quantity} · {isCreator ? "you listed" : "you accepted"} · {timeAgo(trade.updatedAt)}
                                            </div>
                                        </div>

                                        {/* Status label */}
                                        <div className="shrink-0 text-right">
                                            <span className={`text-xs font-mono border px-2 py-0.5 ${completed
                                                ? "text-terminal-green border-terminal-green/40 bg-terminal-green/10"
                                                : "text-muted-foreground border-muted-foreground/30"
                                                }`}>
                                                {completed ? "COMPLETED" : "CANCELLED"}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main MarketplaceView ─────────────────────────────────────────────────────

export function MarketplaceView() {
    const { trades, demandMap, availableItems, tradeHistory, alerts, loading, error, createTrade, acceptTrade, cancelTrade, fetchTrades } = useMarketplace();
    const { items: vaultItems } = useVault();

    const [selectedTrade, setSelectedTrade] = useState<any>(null);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [tradeToCancel, setTradeToCancel] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
    // MARKET = other survivors' listings; MINE = your own listings
    const [viewMine, setViewMine] = useState(false);
    useEffect(() => {
        fetchTrades(viewMine ? { mine: "true" } : undefined);
    }, [viewMine]);

    const myUserId = localStorage.getItem("userId");

    // Compute scarcity: categories with 2+ demand requests
    const scarceCategories = useMemo(() => {
        const counts: Record<string, number> = {};
        trades.forEach((t) => {
            const key = t.requestedItem.toUpperCase();
            CATEGORIES.forEach((cat) => {
                if (key.includes(cat)) counts[cat] = (counts[cat] || 0) + 1;
            });
        });
        return Object.entries(counts)
            .filter(([, v]) => v >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([k]) => k);
    }, [trades]);

    const activeTrades = trades.filter((t) => t.status === "ACTIVE");

    const filteredTrades = useMemo(() => {
        let result = activeTrades.filter((trade) => {
            const category = trade.vaultItem?.category ?? trade.category;
            const condition = trade.vaultItem?.condition ?? trade.condition;
            const name = (trade.vaultItem?.resourceName ?? trade.resourceName).toLowerCase();

            if (selectedCategory && category !== selectedCategory) return false;
            if (selectedCondition && condition !== selectedCondition) return false;
            if (searchQuery && !name.includes(searchQuery.toLowerCase()) &&
                !trade.requestedItem.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !trade.traderName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });

        // Default ordering: most urgent (worst condition) first
        const rank: Record<string, number> = { DAMAGED: 3, WORN: 2, GOOD: 1, PRISTINE: 0 };
        result = [...result].sort((a, b) =>
            (rank[b.vaultItem?.condition ?? b.condition] ?? 0) -
            (rank[a.vaultItem?.condition ?? a.condition] ?? 0)
        );

        return result;
    }, [activeTrades, selectedCategory, selectedCondition, searchQuery]);

    const handleCancelTrade = async () => {
        if (!tradeToCancel) return;
        setCancellingId(tradeToCancel.id);
        try {
            await cancelTrade(tradeToCancel.id);
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <Activity className="w-8 h-8 text-terminal-green" />
                </motion.div>
                <div className="text-muted-foreground font-mono text-sm">SCANNING MARKETPLACE...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-12 text-emergency-red font-mono text-sm">{error}</div>;
    }

    const criticalCount = activeTrades.filter((t) => (t.vaultItem?.condition ?? t.condition) === "DAMAGED").length;
    const myListings = activeTrades.filter((t) => t.creatorId === myUserId).length;

    return (
        <div className="space-y-5">
            {/* MARKET / MY LISTINGS toggle */}
            <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-2">
                <span className="text-xs font-mono text-muted-foreground mr-1">VIEW:</span>
                <button
                    onClick={() => setViewMine(false)}
                    className={`px-3 py-1 font-mono text-xs transition-colors border ${!viewMine
                        ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
                        : "border-terminal-green/30 text-muted-foreground hover:text-terminal-green"}`}
                >
                    MARKET
                </button>
                <button
                    onClick={() => setViewMine(true)}
                    className={`px-3 py-1 font-mono text-xs transition-colors border ${viewMine
                        ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
                        : "border-terminal-green/30 text-muted-foreground hover:text-terminal-green"}`}
                >
                    MY LISTINGS
                </button>
            </div>

            {/* POST TRADE CTA */}
            {myUserId && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full border-2 border-dashed border-terminal-green/40 hover:border-terminal-green/70 py-4 flex items-center justify-center gap-2 text-terminal-green font-mono text-sm tracking-wide transition-colors hover:bg-terminal-green/5"
                >
                    <Plus className="w-4 h-4" />
                    POST TRADE OFFER
                </button>
            )}

            {/* Scarcity warning */}
            <ScarcityBanner scarceCategories={scarceCategories} />

            {/* Supply alerts from backend */}
            {alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-warning-amber/10 border border-warning-amber/30 p-4"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-warning-amber mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-mono text-warning-amber font-bold tracking-widest mb-2">
                                SUPPLY ALERTS
                            </div>
                            <div className="space-y-1">
                                {alerts.map((alert, i) => (
                                    <div key={i} className="text-xs font-mono text-warning-amber">{alert}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card border border-terminal-green/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3.5 h-3.5 text-terminal-green" />
                        <span className="text-xs text-muted-foreground font-mono">ACTIVE</span>
                    </div>
                    <div className="text-xl text-terminal-green font-mono font-bold">{activeTrades.length}</div>
                </div>

                <div className="bg-card border border-emergency-red/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                            <AlertTriangle className="w-3.5 h-3.5 text-emergency-red" />
                        </motion.div>
                        <span className="text-xs text-muted-foreground font-mono">CRITICAL</span>
                    </div>
                    <div className="text-xl text-emergency-red font-mono font-bold">{criticalCount}</div>
                </div>

                <div className="bg-card border border-warning-amber/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Flame className="w-3.5 h-3.5 text-warning-amber" />
                        <span className="text-xs text-muted-foreground font-mono">HIGH DEMAND</span>
                    </div>
                    <div className="text-xl text-warning-amber font-mono font-bold">{scarceCategories.length}</div>
                </div>

                <div className="bg-card border border-cyan-400/20 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-xs text-muted-foreground font-mono">MY LISTINGS</span>
                    </div>
                    <div className="text-xl text-cyan-400 font-mono font-bold">{myListings}</div>
                </div>
            </div>

            {/* Search + Sort */}
            <div className="bg-charcoal border border-terminal-green/20 p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search items, traders, or requested goods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-gray border border-terminal-green/30 pl-10 pr-4 py-2 text-terminal-green font-mono text-sm focus:border-terminal-green focus:outline-none"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-terminal-green">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category pills */}
                <div>
                    <div className="text-xs font-mono text-muted-foreground tracking-wide mb-2">CATEGORY</div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-3 py-1 text-xs font-mono border transition-colors ${!selectedCategory
                                ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
                                : "bg-dark-gray border-terminal-green/20 text-muted-foreground hover:border-terminal-green/40"
                                }`}
                        >
                            ALL
                        </button>
                        {CATEGORIES.map((cat) => {
                            const meta = CATEGORY_META[cat];
                            const active = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(active ? null : cat)}
                                    className={`px-3 py-1 text-xs font-mono border transition-colors ${active
                                        ? `${meta.bg ?? "bg-terminal-green/10"} ${meta.border} ${meta.color}`
                                        : `bg-dark-gray border-terminal-green/20 text-muted-foreground hover:${meta.border} hover:${meta.color}`
                                        }`}
                                    style={active ? undefined : undefined}
                                >
                                    {cat}
                                    {scarceCategories.includes(cat) && (
                                        <motion.span
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="ml-1 text-emergency-red"
                                        >●</motion.span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Condition filter */}
                <div>
                    <div className="text-xs font-mono text-muted-foreground tracking-wide mb-2">URGENCY / CONDITION</div>
                    <select
                        value={selectedCondition || ""}
                        onChange={(e) => setSelectedCondition(e.target.value || null)}
                        className="w-full bg-dark-gray border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono text-xs focus:border-terminal-green focus:outline-none"
                    >
                        <option value="">ALL URGENCY LEVELS</option>
                        {CONDITIONS.map((c) => (
                            <option key={c} value={c}>{URGENCY_META[c].label} ({c})</option>
                        ))}
                    </select>
                </div>

                {/* Active filter summary */}
                {(selectedCategory || selectedCondition || searchQuery) && (
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <Filter className="w-3 h-3" />
                        <span>{filteredTrades.length} of {activeTrades.length} listings</span>
                        <button
                            onClick={() => { setSelectedCategory(null); setSelectedCondition(null); setSearchQuery(""); }}
                            className="ml-auto text-warning-amber hover:text-terminal-green transition-colors"
                        >
                            CLEAR FILTERS
                        </button>
                    </div>
                )}
            </div>

            {/* Trade grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredTrades.length > 0 ? (
                        filteredTrades.map((trade) => {
                            const resourceName = (trade.vaultItem?.resourceName ?? trade.resourceName).toUpperCase();
                            const tradeCategory = (trade.vaultItem?.category ?? trade.category);
                            const demandScore = (demandMap[resourceName] ?? 0) +
                                (demandMap[tradeCategory] ?? 0) +
                                Object.entries(demandMap).reduce((s, [k, v]) =>
                                    resourceName.includes(k) || k.includes(resourceName) ? s + v : s, 0);

                            return (
                                <TradeCard
                                    key={trade.id}
                                    trade={trade}
                                    isOwn={viewMine || trade.creatorId === myUserId}
                                    demandCount={demandScore}
                                    onAccept={() => setSelectedTrade(trade)}
                                    onCancel={() => setTradeToCancel(trade)}
                                    cancelling={cancellingId === trade.id}
                                />
                            );
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full text-center py-16"
                        >
                            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <div className="text-muted-foreground font-mono text-sm">NO LISTINGS FOUND</div>
                            <p className="text-xs text-muted-foreground mt-2 font-mono">
                                Adjust filters or post a new trade offer
                            </p>
                            {myUserId && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 px-4 py-2 bg-terminal-green/10 border border-terminal-green text-terminal-green font-mono text-xs hover:bg-terminal-green/20 transition-colors"
                                >
                                    POST TRADE OFFER
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Trade Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateTradeModal
                        vaultItems={vaultItems}
                        onClose={() => setShowCreateModal(false)}
                        onSubmit={createTrade}
                    />
                )}
            </AnimatePresence>

            {/* Trade history panel */}
            <TradeHistoryPanel history={tradeHistory} myUserId={myUserId} />

            {/* Cancel confirm modal */}
            <AnimatePresence>
                {tradeToCancel && (
                    <CancelConfirmModal
                        trade={tradeToCancel}
                        onClose={() => setTradeToCancel(null)}
                        onConfirm={handleCancelTrade}
                        isLoading={cancellingId === tradeToCancel?.id}
                    />
                )}
            </AnimatePresence>

            {/* Accept Trade Modal */}
            <AnimatePresence>
                {selectedTrade && (
                    <AcceptTradeModal
                        trade={selectedTrade}
                        availableItems={availableItems}
                        onClose={() => setSelectedTrade(null)}
                        onAccept={async (acceptorVaultItemId) => {
                            setAcceptLoading(true);
                            try {
                                await acceptTrade(selectedTrade.id, acceptorVaultItemId);
                            } finally {
                                setAcceptLoading(false);
                            }
                        }}
                        isLoading={acceptLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
