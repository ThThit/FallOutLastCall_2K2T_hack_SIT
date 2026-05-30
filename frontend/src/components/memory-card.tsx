import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  fetchMemoryHistory,
  restoreMemoryData,
  type MemoryArchiveRevision,
} from "../services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const glitchChars = "█▓▒░_<>//[]#";

const pickGlitchChar = () =>
  glitchChars[Math.floor(Math.random() * glitchChars.length)];

const renderHeaderDecay = (text: string, decayLevel: number) => {
  if (decayLevel < 18) return <>{text}</>;

  return (
    <>
      {text.split("").map((char, idx) => {
        if (char === " ") return " ";
        if (Math.random() < Math.min(0.45, decayLevel / 180)) {
          return (
            <span key={idx} className="animate-glitch text-emergency-red font-bold">
              {pickGlitchChar()}
            </span>
          );
        }
        return char;
      })}
    </>
  );
};

const renderTextDecay = (text: string, decayLevel: number) => {
  if (decayLevel < 5) return <>{text}</>;

  const corruptionProbability = Math.min(0.75, decayLevel / 140);

  return (
    <>
      {text.split(" ").map((word, wordIdx) => {
        if (!word) return <span key={wordIdx}> </span>;

        if (decayLevel > 35 && Math.random() < decayLevel / 260) {
          return (
            <span key={wordIdx} className="animate-glitch text-emergency-red font-bold">
              {pickGlitchChar()}{" "}
            </span>
          );
        }

        const chars = word.split("").map((char, charIdx) => {
          if (char === " ") return " ";
          if (Math.random() < corruptionProbability) {
            return (
              <span key={charIdx} className="animate-glitch text-emergency-red font-bold">
                {pickGlitchChar()}
              </span>
            );
          }
          return char;
        });

        return (
          <span key={wordIdx}>
            {chars}
            {" "}
          </span>
        );
      })}
    </>
  );
};

const getDecayMessage = (decayLevel: number) => {
  if (decayLevel < 18) {
    return "I can still hear their voices in the static.";
  }

  if (decayLevel < 35) {
    return "The ink is fading, but the warning still reads clear.";
  }

  if (decayLevel < 65) {
    return "Pages are missing now. Someone tore these memories apart.";
  }

  return "If you find this, do not follow where the last survivor went.";
};

const formatDaysAgo = (daysAgo: number) => {
  if (daysAgo <= 0) return "today";
  if (daysAgo === 1) return "1 day ago";
  return `${daysAgo} days ago`;
};

const normalizeAlias = (alias?: string | null) => {
  const cleanedAlias = (alias || "").trim();
  if (!cleanedAlias) return "Anonymous";

  if (
    /^anonymo\/?s$/i.test(cleanedAlias) ||
    /^anon(y|i)?mou?s$/i.test(cleanedAlias)
  ) {
    return "Anonymous";
  }

  return cleanedAlias;
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Final Message":
      return {
        accentClass: "text-red-500",
        textClass: "text-red-400",
        footerTextClass: "text-red-400/90",
        borderClass: "border-red-500/30 hover:border-red-500/60 hover:shadow-[0_0_24px_rgba(239,68,68,0.25)]",
        glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.15)]",
        pulseClass: "animate-[pulse_3s_infinite]",
        tagBg: "bg-red-500/10 text-red-400 border-red-500/30",
        radialGradient: "rgba(239, 68, 68, 0.08)",
      };
    case "Survival Story":
      return {
        accentClass: "text-emerald-500",
        textClass: "text-emerald-400",
        footerTextClass: "text-emerald-400/90",
        borderClass: "border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]",
        glowClass: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
        pulseClass: "",
        tagBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        radialGradient: "rgba(16, 185, 129, 0.08)",
      };
    case "Diary":
      return {
        accentClass: "text-amber-500",
        textClass: "text-amber-400",
        footerTextClass: "text-amber-400/90",
        borderClass: "border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
        glowClass: "shadow-[0_0_12px_rgba(245,158,11,0.15)]",
        pulseClass: "",
        tagBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        radialGradient: "rgba(245, 158, 11, 0.08)",
      };
    case "Historical Knowledge":
      return {
        accentClass: "text-cyan-500",
        textClass: "text-cyan-400",
        footerTextClass: "text-cyan-400/90",
        borderClass: "border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_24px_rgba(6,182,212,0.25)]",
        glowClass: "shadow-[0_0_12px_rgba(6,182,212,0.15)]",
        pulseClass: "",
        tagBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        radialGradient: "rgba(6, 182, 212, 0.08)",
      };
    case "Audio Log":
      return {
        accentClass: "text-indigo-500",
        textClass: "text-indigo-400",
        footerTextClass: "text-indigo-400/90",
        borderClass: "border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-[0_0_24px_rgba(99,102,241,0.25)]",
        glowClass: "shadow-[0_0_12px_rgba(99,102,241,0.15)]",
        pulseClass: "",
        tagBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
        radialGradient: "rgba(99, 102, 241, 0.08)",
      };
    default:
      return {
        accentClass: "text-terminal-green",
        textClass: "text-green-400",
        footerTextClass: "text-terminal-green/90",
        borderClass: "border-terminal-green/30 hover:border-terminal-green/60 hover:shadow-[0_0_24px_rgba(0,255,65,0.25)]",
        glowClass: "",
        pulseClass: "",
        tagBg: "bg-terminal-green/10 text-terminal-green border-terminal-green/30",
        radialGradient: "rgba(0, 255, 65, 0.08)",
      };
  }
};

export function MemoryCard({
  memory,
  currentUser,
  onDelete,
  onUpdate,
  onRestore,
}: {
  memory: any;
  currentUser: string | null;
  onDelete?: (id: string) => void;
  onUpdate?: (
    id: string,
    updates: {
      title: string;
      survivorAlias: string;
      category: string;
      content: string;
      emotionalTag: string;
    },
  ) => void;
  onRestore?: () => void;
}) {
  const styles = getCategoryStyle(memory.category);
  // We put the decayLevel in state so we can instantly change it to 0 on click
  const [currentDecay, setCurrentDecay] = useState(
    memory.decayLevel || (memory.isDecayed ? 50 : 0),
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [revisionHistory, setRevisionHistory] = useState<
    MemoryArchiveRevision[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [displayTitle, setDisplayTitle] = useState(memory.title);
  const [displayAuthor, setDisplayAuthor] = useState(
    normalizeAlias(memory.author),
  );
  const [displayContent, setDisplayContent] = useState(memory.content);
  const [editTitle, setEditTitle] = useState(memory.title);
  const [editAuthor, setEditAuthor] = useState(normalizeAlias(memory.author));
  const [editCategory, setEditCategory] = useState(memory.category || "Diary");
  const [editContent, setEditContent] = useState(memory.content);
  const [editEmotionalTag, setEditEmotionalTag] = useState(
    memory.emotionalTag || "Hope",
  );

  const [showMinigame, setShowMinigame] = useState(false);
  const [gameNodes, setGameNodes] = useState<{ id: number; address: string; status: "corrupted" | "restoring" | "stable" }[]>([]);
  const [timeLeft, setTimeLeft] = useState(12);
  const [gameResult, setGameResult] = useState<"playing" | "success" | "fail">("playing");
  const [flickerTick, setFlickerTick] = useState(0);

  // Flicker animation for glitching characters in minigame
  useEffect(() => {
    if (!showMinigame || gameResult !== "playing") return;
    const interval = setInterval(() => {
      setFlickerTick((t) => t + 1);
    }, 150);
    return () => clearInterval(interval);
  }, [showMinigame, gameResult]);

  // Countdown timer for minigame
  useEffect(() => {
    if (!showMinigame || gameResult !== "playing") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameResult("fail");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showMinigame, gameResult]);

  const selectClassName =
    "w-full appearance-none rounded-md border border-terminal-green/35 bg-black/90 px-3 py-2 pr-10 font-mono text-sm font-semibold tracking-wide text-terminal-green shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(0,255,65,0.04)] transition-colors focus:outline-none focus:border-terminal-green/70 focus:ring-2 focus:ring-terminal-green/20";

  const integrity = Math.max(0, 100 - currentDecay);
  const createdAt =
    memory.date || memory.createdAt
      ? new Date(memory.date || memory.createdAt)
      : null;
  const computedDaysAgo = createdAt
    ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : memory.daysAgo || 0;
  const daysAgoLabel = memory.daysAgoLabel || formatDaysAgo(computedDaysAgo);

  useEffect(() => {
    if (!isEditing) {
      setEditTitle(memory.title);
      setEditAuthor(normalizeAlias(memory.author));
      setEditCategory(memory.category || "Diary");
      setEditContent(memory.content);
      setEditEmotionalTag(memory.emotionalTag || "Hope");
    }
  }, [memory, isEditing]);

  useEffect(() => {
    setDisplayTitle(memory.title);
    setDisplayAuthor(normalizeAlias(memory.author));
    setDisplayContent(memory.content);
  }, [memory]);

  useEffect(() => {
    if (!isEditing) {
      setRevisionHistory([]);
      return;
    }

    let active = true;
    setIsLoadingHistory(true);

    fetchMemoryHistory(memory.id)
      .then((history) => {
        if (!active) return;
        setRevisionHistory(history);
      })
      .catch((error) => {
        console.error("Failed to load archive history", error);
        if (active) setRevisionHistory([]);
      })
      .finally(() => {
        if (active) setIsLoadingHistory(false);
      });

    return () => {
      active = false;
    };
  }, [isEditing, memory.id]);

  const startMinigame = () => {
    const addresses = ["0x2A", "0x5C", "0x9E", "0xD1", "0xF4", "0x8B"];
    const nodes = addresses.map((addr, idx) => ({
      id: idx,
      address: addr,
      status: idx < 3 ? ("corrupted" as const) : ("stable" as const),
    }));
    
    // Shuffle the array
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    
    setGameNodes(shuffled);
    setTimeLeft(12);
    setGameResult("playing");
    setShowMinigame(true);
  };

  const handleNodeClick = (nodeId: number) => {
    if (gameResult !== "playing") return;
    
    setGameNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId && n.status === "corrupted") {
          setTimeout(() => {
            setGameNodes((currentNodes) => {
              const updated = currentNodes.map((item) =>
                item.id === nodeId ? { ...item, status: "stable" as const } : item
              );
              
              const anyCorrupted = updated.some((item) => item.status === "corrupted" || item.status === "restoring");
              if (!anyCorrupted) {
                setGameResult("success");
                void triggerRestoreData();
              }
              
              return updated;
            });
          }, 400);
          
          return { ...n, status: "restoring" as const };
        }
        return n;
      }),
    );
  };

  const triggerRestoreData = async () => {
    try {
      setIsRestoring(true);

      // Call the backend to permanently update SQLite
      await restoreMemoryData(memory.id);

      setTimeout(() => {
        setCurrentDecay(0);
        setIsRestoring(false);
        setShowMinigame(false);
        onRestore?.();
      }, 1200);
    } catch (error) {
      console.error("Restoration failed", error);
      setGameResult("fail");
      setIsRestoring(false);
    }
  };

  const handleDeleteClick = () => {
    setShowPurgeConfirm(true);
  };

  const confirmDelete = async () => {
    setShowPurgeConfirm(false);
    setIsDeleting(true);
    setTimeout(() => {
      onDelete?.(memory.id);
    }, 950);
  };

  const handleEditSave = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setEditError("Transmission failed: title and content are required.");
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      await onUpdate?.(memory.id, {
        title: trimmedTitle,
        survivorAlias: normalizeAlias(editAuthor),
        category: editCategory,
        content: trimmedContent,
        emotionalTag: editEmotionalTag,
      });
      setDisplayTitle(trimmedTitle);
      setDisplayAuthor(normalizeAlias(editAuthor));
      setDisplayContent(trimmedContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Memory update failed", error);
      setEditError("Transmission failed: memory could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  // Check ownership: matches callsign OR memory id is in local storage list of created memories
  const isOwner = (() => {
    if (!currentUser) return false;
    
    const normalizedUser = normalizeAlias(currentUser);
    const normalizedAuthor = normalizeAlias(memory.author);
    if (normalizedUser === normalizedAuthor) return true;
    
    try {
      const myMemories = JSON.parse(localStorage.getItem("myCreatedMemories") || "[]");
      return Array.isArray(myMemories) && myMemories.includes(memory.id);
    } catch {
      return false;
    }
  })();

  const formatRevisionHeadline = (revision: MemoryArchiveRevision) => {
    if (revision.action === "RESTORE") {
      return "Recovered archive state";
    }

    return "Archived edit recorded";
  };

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, rotateZ: 0 }}
      animate={
        isDeleting
          ? {
              opacity: [1, 0.82, 0.2],
              scale: [1, 1.015, 0.94],
              rotateZ: [0, -0.5, 1.5],
              x: [0, -2, 6, -8],
              filter: ["blur(0px)", "blur(1px)", "blur(10px)"],
            }
          : { opacity: 1, scale: 1, rotateZ: 0, x: 0, filter: "blur(0px)" }
      }
      transition={{ duration: 0.95, ease: "easeInOut" }}
      className={`bg-black border p-4 relative group overflow-hidden transition-all duration-300 ${
        isDeleting
          ? "border-emergency-red/60 shadow-[0_0_24px_rgba(255,0,64,0.25)]"
          : styles.borderClass
      } ${styles.pulseClass} ${styles.glowClass}`}
    >
      {currentDecay >= 12 && (
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.05)_3px,rgba(255,255,255,0.05)_4px)] animate-pulse" />
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${styles.radialGradient}, transparent 55%)`
            }}
          />
        </div>
      )}

      {isDeleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,0,64,0.18)_0%,rgba(0,0,0,0)_32%,rgba(0,255,65,0.08)_68%,rgba(0,0,0,0.16)_100%)]" />
          <div className="absolute inset-0 animate-pulse bg-[repeating-linear-gradient(90deg,transparent,transparent_12px,rgba(255,255,255,0.06)_12px,rgba(255,255,255,0.06)_13px)]" />
          <div className="absolute top-3 right-3 text-[10px] font-mono tracking-[0.35em] text-emergency-red">
            PURGING...
          </div>
          <div className="absolute bottom-3 left-3 right-3 h-px bg-gradient-to-r from-transparent via-emergency-red to-transparent animate-pulse" />
        </motion.div>
      )}
          {showMinigame ? (
        <div className="min-h-[220px] flex flex-col justify-between font-mono text-terminal-green py-1">
          <div>
            <div className="flex justify-between items-center border-b border-terminal-green/30 pb-2 mb-3">
              <span className={`text-xs font-bold tracking-[0.2em] ${gameResult === "fail" ? "text-emergency-red animate-pulse" : "text-warning-amber"}`}>
                {gameResult === "fail" ? "[ OVERRIDE TIMEOUT ]" : "[ BYPASS PROTOCOL ]"}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 border ${
                timeLeft <= 4 
                  ? "border-emergency-red text-emergency-red animate-pulse bg-emergency-red/5" 
                  : "border-terminal-green text-terminal-green"
              }`}>
                SEC: {timeLeft}s
              </span>
            </div>

            {gameResult === "playing" && (
              <>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4 leading-normal">
                  Manual override: Purge corrupted sectors (blinking red with active glitch noise) to restore data stream integrity.
                </div>

                <div key={flickerTick} className="grid grid-cols-3 gap-2.5 mb-4">
                  {gameNodes.map((node) => {
                    let borderClass = "border-terminal-green/20 hover:border-terminal-green/50 text-terminal-green/70 hover:bg-terminal-green/5";
                    let bgClass = "bg-black/40";
                    
                    if (node.status === "corrupted") {
                      borderClass = "border-emergency-red/60 text-emergency-red hover:bg-emergency-red/10 cursor-pointer animate-glitch";
                    } else if (node.status === "restoring") {
                      borderClass = "border-warning-amber/60 text-warning-amber bg-warning-amber/5";
                    } else if (node.status === "stable") {
                      borderClass = "border-terminal-green/60 text-terminal-green bg-terminal-green/10";
                    }
                    
                    return (
                      <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        disabled={node.status !== "corrupted"}
                        className={`h-12 border flex flex-col items-center justify-center font-mono text-xs select-none transition-all ${borderClass} ${bgClass}`}
                      >
                        {node.status === "restoring" ? (
                          <span className="text-[9px] tracking-wider animate-pulse text-warning-amber font-bold">ALIGNING</span>
                        ) : node.status === "stable" ? (
                          <>
                            <span className="text-[8px] text-terminal-green/50">{node.address}</span>
                            <span className="font-bold tracking-wider text-terminal-green">STABLE</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[8px] text-emergency-red/50">{node.address}</span>
                            <span className="font-bold tracking-wider text-emergency-red">
                              {pickGlitchChar()}{pickGlitchChar()}{pickGlitchChar()}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {gameResult === "success" && (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 font-mono">
                <div className="text-sm font-bold tracking-[0.25em] text-terminal-green uppercase animate-bounce">
                  ✔ DECRYPTION SUCCESSFUL
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest leading-normal max-w-[280px]">
                  Sector alignment stabilized. Injecting recovery payload...
                </div>
                <div className="h-1 w-32 bg-terminal-green/20 overflow-hidden relative mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="h-full bg-terminal-green"
                  />
                </div>
              </div>
            )}

            {gameResult === "fail" && (
              <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 font-mono">
                <div className="text-xs font-bold tracking-[0.15em] text-emergency-red uppercase animate-glitch">
                  ⚠ SECTOR BYPASS TIMED OUT
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest leading-normal max-w-[280px]">
                  Bypass connection lost. Sectors remain corrupted.
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={startMinigame}
                    type="button"
                    className="px-3 py-1 border border-emergency-red text-emergency-red bg-emergency-red/10 text-xs hover:bg-emergency-red/20 transition-all font-mono"
                  >
                    [ RETRY ]
                  </button>
                  <button
                    onClick={() => setShowMinigame(false)}
                    type="button"
                    className="px-3 py-1 border border-terminal-green/30 text-terminal-green/80 bg-black text-xs hover:border-terminal-green/50 transition-all font-mono"
                  >
                    [ ABORT ]
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {gameResult === "playing" && (
            <div className="flex justify-between items-center border-t border-terminal-green/20 pt-2 text-[10px] text-muted-foreground">
              <span>STATUS: BYPASS ACTIVE</span>
              <button 
                onClick={() => setShowMinigame(false)}
                type="button"
                className="text-emergency-red/70 hover:text-emergency-red transition-colors"
              >
                [ ABORT ]
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start gap-4 mb-2">
            <div className="min-w-0 flex-1">
              <h3
                className={`font-mono font-bold ${
                  currentDecay >= 65
                    ? "text-emergency-red"
                    : currentDecay >= 35
                      ? "text-warning-amber"
                      : styles.accentClass
                }`}
              >
                {renderHeaderDecay(displayTitle, currentDecay)}
              </h3>

              <span
                className={`mt-1 block text-xs font-mono whitespace-nowrap ${
                  currentDecay >= 65
                    ? "text-emergency-red/90"
                    : currentDecay >= 35
                      ? "text-warning-amber/90"
                      : "text-muted-foreground"
                }`}
              >
                {renderHeaderDecay(displayAuthor, currentDecay)} // {daysAgoLabel}
              </span>

              <div className="flex gap-2 mt-2">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 border uppercase select-none ${styles.tagBg}`}>
                  {memory.category}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 border uppercase select-none bg-black/40 text-muted-foreground/90 border-muted-foreground/20">
                  {memory.emotionalTag}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isDeleting}
                    className="text-xs font-mono px-2 py-1 transition-colors border border-terminal-green/20 text-terminal-green/80 hover:text-terminal-green hover:bg-terminal-green/10 hover:border-terminal-green/30"
                  >
                    [EDIT]
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className={`text-xs font-mono px-2 py-1 transition-colors border border-transparent ${
                      isDeleting
                        ? "text-emergency-red bg-emergency-red/10 border-emergency-red/30 animate-pulse"
                        : "text-emergency-red/80 hover:text-emergency-red hover:bg-emergency-red/10 hover:border-emergency-red/30"
                    }`}
                  >
                    {isDeleting ? "[PURGING]" : "[PURGE]"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p
            className={`mt-4 mb-6 min-h-[60px] whitespace-pre-wrap font-mono text-sm ${
              currentDecay >= 65
                ? "text-emergency-red"
                : currentDecay >= 35
                  ? "text-warning-amber"
                  : styles.textClass
            } ${
              currentDecay >= 50
                ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.12)]"
                : ""
            }`}
            style={{
              opacity: Math.max(0.65, 1 - currentDecay / 200),
              textShadow:
                currentDecay >= 35
                  ? "0 0 6px rgba(0, 255, 65, 0.18), 0 0 2px rgba(255,255,255,0.08)"
                  : undefined,
            }}
          >
            {renderTextDecay(displayContent, currentDecay)}
          </p>

          <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground">
            {getDecayMessage(currentDecay)}
          </div>

          <div
            className={`flex items-center justify-between border-t pt-3 ${
              currentDecay >= 65
                ? "border-emergency-red/20"
                : currentDecay >= 35
                  ? "border-warning-amber/20"
                  : "border-terminal-green/20"
            }`}
            style={{
              borderColor: currentDecay < 35 ? "rgba(255, 255, 255, 0.1)" : undefined
            }}
          >
            <span
              className={`text-xs font-mono ${
                currentDecay >= 65
                  ? "text-emergency-red/70"
                  : currentDecay >= 35
                    ? "text-warning-amber/75"
                    : styles.footerTextClass
              }`}
            >
              INTEGRITY: {integrity}%
            </span>

            {currentDecay > 5 && (
              <button
                onClick={startMinigame}
                disabled={isRestoring}
                type="button"
                className={`px-3 py-1 font-mono text-xs transition-colors border ${
                  isRestoring
                    ? "bg-terminal-green text-black border-terminal-green animate-pulse"
                    : "bg-terminal-green/10 text-terminal-green border-terminal-green/30 hover:bg-terminal-green/20"
                }`}
              >
                {isRestoring ? "DECRYPTING..." : "RESTORE DATA"}
              </button>
            )}
          </div>
        </>
      )}

      <Dialog open={showPurgeConfirm} onOpenChange={setShowPurgeConfirm}>
        <DialogContent className="max-w-md border-emergency-red/45 bg-black text-emergency-red shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <DialogHeader className="text-left border-b border-emergency-red/20 pb-3">
            <DialogTitle className="font-mono uppercase tracking-[0.25em] text-emergency-red">
              ⚠ ARCHIVE PURGE PROTOCOL
            </DialogTitle>
            <DialogDescription className="font-mono text-muted-foreground/85 mt-1">
              PERMANENT DATA ERASURE REQUEST DETECTED
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 font-mono text-xs text-muted-foreground">
            <p className="text-emergency-red/90 leading-relaxed">
              WARNING: You are about to initiate a terminal purge sequence. This will permanently erase the memory transmission from the database:
            </p>
            <div className="bg-charcoal border border-emergency-red/20 p-3 space-y-2 text-white">
              <div>
                <span className="text-muted-foreground uppercase text-[9px] block">Transmission Title</span>
                <span className="text-sm font-semibold">{memory.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] block">Alias</span>
                  <span>{normalizeAlias(memory.author)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground uppercase text-[9px] block">Classification</span>
                  <span>{memory.category}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              This override protocol cannot be undone. Do you wish to proceed?
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 border-t border-emergency-red/20 pt-4">
            <button
              onClick={() => setShowPurgeConfirm(false)}
              type="button"
              className="px-4 py-2 font-mono text-xs border border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10 hover:border-muted-foreground transition-colors uppercase"
            >
              [ABORT]
            </button>
            <button
              onClick={confirmDelete}
              type="button"
              className="px-4 py-2 font-mono text-xs bg-emergency-red/20 text-emergency-red border border-emergency-red hover:bg-emergency-red/35 transition-colors uppercase"
            >
              [CONFIRM PURGE]
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-5xl border-terminal-green/30 bg-black text-terminal-green">
          <DialogHeader className="text-left">
            <DialogTitle className="font-mono uppercase tracking-[0.3em] text-terminal-green">
              Edit Memory Archive
            </DialogTitle>
            <DialogDescription className="font-mono text-muted-foreground">
              Modify the record and inspect its revision trail before saving.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="space-y-4">
              {editError && (
                <div className="text-xs font-mono text-emergency-red border border-emergency-red/30 bg-emergency-red/10 px-3 py-2">
                  {editError}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-xs font-mono text-muted-foreground md:col-span-2">
                  Title
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-charcoal border border-terminal-green/20 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/50"
                  />
                </label>

                <label className="space-y-1 text-xs font-mono text-muted-foreground md:col-span-2">
                  Survivor Alias
                  <input
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full bg-charcoal border border-terminal-green/20 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/50"
                  />
                </label>

                <label className="space-y-1 text-xs font-mono text-muted-foreground md:col-span-2">
                  Category
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className={selectClassName}
                    >
                      <option>Diary</option>
                      <option>Final Message</option>
                      <option>Survival Story</option>
                      <option>Historical Knowledge</option>
                      <option>Audio Log</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-terminal-green/70" />
                  </div>
                </label>

                <label className="space-y-1 text-xs font-mono text-muted-foreground md:col-span-2">
                  Emotional Tag
                  <div className="relative">
                    <select
                      value={editEmotionalTag}
                      onChange={(e) => setEditEmotionalTag(e.target.value)}
                      className={selectClassName}
                    >
                      <option>Hope</option>
                      <option>Fear</option>
                      <option>Loss</option>
                      <option>Survival</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-terminal-green/70" />
                  </div>
                </label>
              </div>

              <label className="space-y-1 text-xs font-mono text-muted-foreground block">
                Story Content
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full bg-charcoal border border-terminal-green/20 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/50"
                />
              </label>

              <DialogFooter className="pt-2">
                <button
                  onClick={handleEditSave}
                  type="button"
                  disabled={isSaving}
                  className="px-3 py-2 font-mono text-xs bg-terminal-green/10 text-terminal-green border border-terminal-green/30 hover:bg-terminal-green/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </DialogFooter>
            </div>

            <aside className="space-y-3 border border-terminal-green/20 bg-black/60 p-4">
              <div className="text-xs font-mono tracking-[0.3em] uppercase text-terminal-green/70">
                Revision History
              </div>

              {isLoadingHistory ? (
                <div className="text-xs font-mono text-muted-foreground">
                  Scanning archive logs...
                </div>
              ) : revisionHistory.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {revisionHistory.map((revision) => {
                    const timestamp = new Date(
                      revision.createdAt,
                    ).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const changedFields = [];
                    if (revision.titleBefore !== revision.titleAfter) {
                      changedFields.push("Title");
                    }
                    if (
                      revision.survivorAliasBefore !==
                      revision.survivorAliasAfter
                    ) {
                      changedFields.push("Alias");
                    }
                    if (revision.categoryBefore !== revision.categoryAfter) {
                      changedFields.push("Category");
                    }
                    if (revision.contentBefore !== revision.contentAfter) {
                      changedFields.push("Content");
                    }
                    if (
                      revision.emotionalTagBefore !== revision.emotionalTagAfter
                    ) {
                      changedFields.push("Emotion");
                    }
                    if (
                      revision.decayLevelBefore !== revision.decayLevelAfter ||
                      revision.isRestoredBefore !== revision.isRestoredAfter
                    ) {
                      changedFields.push("State");
                    }

                    return (
                      <div
                        key={revision.id}
                        className="border border-terminal-green/15 bg-black/80 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-mono text-terminal-green">
                            {formatRevisionHeadline(revision)}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                            {timestamp}
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.25em] text-warning-amber/80">
                          {changedFields.length > 0
                            ? changedFields.join(" • ")
                            : "Logged change"}
                        </div>

                        {revision.note && (
                          <div className="mt-2 text-xs font-mono text-muted-foreground">
                            {revision.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs font-mono text-muted-foreground">
                  No revision history recorded yet.
                </div>
              )}
            </aside>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
