import { useState, useEffect } from "react";
import {
  deleteMemoryData,
  fetchMemories,
  updateMemoryData,
} from "../services/api";
import { MemoryCard } from "./memory-card"; // Adjust import path if needed
import SubmitForm from "./SubmitForm";

export function MemoryArchiveFeed({
  currentUser,
}: {
  currentUser: string | null;
}) {
  const decayGracePeriodDays = 7;
  const [memories, setMemories] = useState<any[]>([]);
  const [memorySort, setMemorySort] = useState<"date" | "decay">("date");
  const [showSubmitForm, setShowSubmitForm] = useState(false);

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

  const loadMemories = async () => {
    const data = await fetchMemories();

    const uiMemories = (data || []).map((m: any) => ({
      id: m.id,
      author: normalizeAlias(m.survivorAlias),
      title: m.title,
      content: m.content,
      date: m.date || m.createdAt,
      createdAt: m.createdAt,
      daysAgo: Math.floor(
        (Date.now() - new Date(m.date || m.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
      daysAgoLabel: formatDaysAgo(
        Math.floor(
          (Date.now() - new Date(m.date || m.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
      decayLevel: Math.max(
        m.decayLevel || 0,
        Math.min(
          85,
          Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(m.date || m.createdAt).getTime()) /
                (1000 * 60 * 60 * 24) -
                decayGracePeriodDays,
            ) * 6,
          ),
        ),
      ),
    }));

    setMemories(uiMemories);
  };

  // Fetch data on load
  useEffect(() => {
    let mounted = true;
    loadMemories()
      .then(() => {
        if (!mounted) return;
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteMemory = async (id: string) => {
    await deleteMemoryData(id);
    setMemories((prev) => prev.filter((memory) => memory.id !== id));
  };

  const handleUpdateMemory = async (
    id: string,
    updates: {
      title: string;
      survivorAlias: string;
      category: string;
      content: string;
      emotionalTag: string;
    },
  ) => {
    const updated = await updateMemoryData(id, updates);

    setMemories((prev) =>
      prev.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              author: normalizeAlias(updated.survivorAlias),
              title: updated.title,
              content: updated.content,
              category: updated.category,
              emotionalTag: updated.emotionalTag,
              date: updated.date || memory.date,
            }
          : memory,
      ),
    );

    void loadMemories();
  };

  return (
    <div className="space-y-6">
      {/* Sorting Controls */}
      <div className="flex items-center gap-2 bg-charcoal border border-terminal-green/20 p-3">
        <span className="text-xs text-muted-foreground font-mono">
          SORT BY:
        </span>
        <button
          onClick={() => setMemorySort("date")}
          className={`px-3 py-1 font-mono text-xs transition-colors ${
            memorySort === "date"
              ? "bg-terminal-green/20 border border-terminal-green text-terminal-green"
              : "bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green"
          }`}
        >
          DATE
        </button>
        <button
          onClick={() => setMemorySort("decay")}
          className={`px-3 py-1 font-mono text-xs transition-colors ${
            memorySort === "decay"
              ? "bg-terminal-green/20 border border-terminal-green text-terminal-green"
              : "bg-charcoal border border-terminal-green/30 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green"
          }`}
        >
          DECAY STATUS
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSubmitForm((s) => !s)}
          className="px-3 py-1 font-mono text-xs bg-terminal-green/10 border border-terminal-green/20 text-terminal-green"
        >
          {showSubmitForm ? "Close Upload" : "Upload Memory"}
        </button>
      </div>

      {showSubmitForm && (
        <div className="mt-4">
          <SubmitForm
            currentUser={currentUser}
            onSuccess={() => {
              void loadMemories();
            }}
          />
        </div>
      )}

      {/* Warning Banner */}
      <div className="bg-dark-gray border border-warning-amber/30 p-4">
        <div className="text-xs font-mono text-warning-amber tracking-wide">
          ⚠ ARCHIVE DEGRADATION WARNING
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Memories remain stable for {decayGracePeriodDays} days, then begin
          degrading with time.
        </p>
      </div>

      {/* Grid of Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories
          .sort((a, b) => {
            if (memorySort === "decay") {
              return b.decayLevel - a.decayLevel; // Highest decay first
            } else {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
          })
          .map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              currentUser={currentUser}
              onDelete={handleDeleteMemory}
              onUpdate={handleUpdateMemory}
            />
          ))}
      </div>
    </div>
  );
}
