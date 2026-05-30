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

const applyTextDecay = (text: string, decayLevel: number) => {
  if (decayLevel < 5) return text;

  const corruptionProbability = Math.min(0.75, decayLevel / 140);

  return text
    .split(" ")
    .map((word) => {
      if (!word) return word;

      if (decayLevel > 35 && Math.random() < decayLevel / 260) {
        return pickGlitchChar();
      }

      return word
        .split("")
        .map((char) => {
          if (char === " ") return char;
          if (Math.random() < corruptionProbability) {
            return pickGlitchChar();
          }
          return char;
        })
        .join("");
    })
    .join(" ");
};

const applyHeaderDecay = (text: string, decayLevel: number) => {
  if (decayLevel < 18) return text;

  return text
    .split("")
    .map((char) => {
      if (char === " ") return char;
      if (Math.random() < Math.min(0.45, decayLevel / 180)) {
        return pickGlitchChar();
      }
      return char;
    })
    .join("");
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

export function MemoryCard({
  memory,
  currentUser,
  onDelete,
  onUpdate,
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
}) {
  // We put the decayLevel in state so we can instantly change it to 0 on click
  const [currentDecay, setCurrentDecay] = useState(
    memory.decayLevel || (memory.isDecayed ? 50 : 0),
  );
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleRestore = async () => {
    try {
      setIsRestoring(true);

      // Call the backend to permanently update SQLite
      await restoreMemoryData(memory.id);

      // Fake a 1.5 second "hacking/decrypting" delay for a cool UI effect
      setTimeout(() => {
        setCurrentDecay(0); // Instantly clears the glitch text!
        setIsRestoring(false);
      }, 1500);
    } catch (error) {
      console.error("Restoration failed", error);
      setIsRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "WARNING: Purge this memory from the archive permanently?",
      )
    )
      return;

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

  const isOwner = currentUser === memory.author;

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
      className={`bg-black border border-terminal-green/30 p-4 relative group overflow-hidden transition-colors ${
        isDeleting
          ? "border-emergency-red/60 shadow-[0_0_24px_rgba(255,0,64,0.25)]"
          : currentDecay >= 35
            ? "hover:border-warning-amber/50"
            : "hover:border-terminal-green/60"
      }`}
    >
      {currentDecay >= 12 && (
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.05)_3px,rgba(255,255,255,0.05)_4px)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.08),transparent_55%)]" />
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

      <div className="flex justify-between items-start gap-4 mb-2">
        <div className="min-w-0 flex-1">
          <h3
            className={`font-mono font-bold ${
              currentDecay >= 65
                ? "text-emergency-red"
                : currentDecay >= 35
                  ? "text-warning-amber"
                  : "text-terminal-green"
            }`}
          >
            {applyHeaderDecay(displayTitle, currentDecay)}
          </h3>

          <span
            className={`mt-1 block text-xs font-mono whitespace-nowrap ${
              currentDecay >= 65
                ? "text-emergency-red/60"
                : currentDecay >= 35
                  ? "text-warning-amber/70"
                  : "text-muted-foreground"
            }`}
          >
            {applyHeaderDecay(displayAuthor, currentDecay)} // {daysAgoLabel}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-right">
          {isOwner && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
                className="text-xs font-mono px-2 py-1 transition-colors border border-terminal-green/20 text-terminal-green/70 hover:text-terminal-green hover:bg-terminal-green/10 hover:border-terminal-green/30"
              >
                [EDIT]
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-xs font-mono px-2 py-1 transition-colors border border-transparent ${
                  isDeleting
                    ? "text-emergency-red bg-emergency-red/10 border-emergency-red/30 animate-pulse"
                    : "text-emergency-red/70 hover:text-emergency-red hover:bg-emergency-red/10 hover:border-emergency-red/30"
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
            ? "text-emergency-red/70"
            : currentDecay >= 35
              ? "text-warning-amber/75"
              : "text-green-400/80"
        } ${
          currentDecay >= 50
            ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.12)]"
            : ""
        }`}
        style={{
          opacity: Math.max(0.35, 1 - currentDecay / 125),
          textShadow:
            currentDecay >= 35
              ? "0 0 6px rgba(0, 255, 65, 0.18), 0 0 2px rgba(255,255,255,0.08)"
              : undefined,
        }}
      >
        {applyTextDecay(displayContent, currentDecay)}
      </p>

      <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.35em] text-muted-foreground/80">
        {getDecayMessage(currentDecay)}
      </div>

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

      <div
        className={`flex items-center justify-between border-t pt-3 ${
          currentDecay >= 65
            ? "border-emergency-red/20"
            : currentDecay >= 35
              ? "border-warning-amber/20"
              : "border-terminal-green/20"
        }`}
      >
        <span
          className={`text-xs font-mono ${
            currentDecay >= 65
              ? "text-emergency-red/70"
              : currentDecay >= 35
                ? "text-warning-amber/75"
                : "text-terminal-green/50"
          }`}
        >
          INTEGRITY: {integrity}%
        </span>

        {currentDecay > 5 && (
          <button
            onClick={handleRestore}
            disabled={isRestoring}
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
    </motion.div>
  );
}
