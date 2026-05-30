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
  const [showOnlyRestored, setShowOnlyRestored] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("All");

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
      emotionalTag: m.emotionalTag,
      category: m.category,
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
      decayLevel: m.isRestored
        ? (m.decayLevel || 0)
        : Math.max(
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
      updatedAt: m.updatedAt,
      isRestored: m.isRestored,
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
              updatedAt: updated.updatedAt,
            }
          : memory,
      ),
    );

    void loadMemories();
  };

  const searchableMemories = [...memories].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredMemories = searchableMemories.filter((memory) => {
    const matchesSearch =
      !normalizedSearch ||
      memory.title.toLowerCase().includes(normalizedSearch) ||
      memory.author.toLowerCase().includes(normalizedSearch);

    const matchesEmotion =
      selectedEmotion === "All" || memory.emotionalTag === selectedEmotion;

    const matchesRestored =
      !showOnlyRestored || memory.isRestored === true;

    return matchesSearch && matchesEmotion && matchesRestored;
  });

  const sortedMemories = [...filteredMemories];

  const lastPreservedMemories = filteredMemories.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Sorting Controls */}
      <div className="space-y-3 bg-charcoal border border-terminal-green/20 p-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]">
          <label className="space-y-1 text-xs font-mono text-muted-foreground">
            SEARCH ARCHIVE
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or survivor alias"
              className="w-full bg-black/80 border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/60"
            />
          </label>

          <label className="space-y-1 text-xs font-mono text-muted-foreground">
            EMOTIONAL TAG
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="w-full bg-black/80 border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/60"
            >
              <option>All</option>
              <option>Hope</option>
              <option>Fear</option>
              <option>Loss</option>
              <option>Survival</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            FILTER:
          </span>
          <button
            onClick={() => setShowOnlyRestored((prev) => !prev)}
            className={`px-3 py-1 font-mono text-xs transition-colors border ${
              showOnlyRestored
                ? "bg-terminal-green/20 border-terminal-green text-terminal-green"
                : "bg-charcoal border-terminal-green/25 text-muted-foreground hover:border-terminal-green/50 hover:text-terminal-green"
            }`}
          >
            {showOnlyRestored ? "SHOWING: RESTORED" : "SHOW RESTORED DATA"}
          </button>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedEmotion("All");
              setShowOnlyRestored(false);
            }}
            className="px-3 py-1 font-mono text-xs bg-black/50 border border-terminal-green/20 text-terminal-green/80 hover:text-terminal-green hover:border-terminal-green/40"
          >
            CLEAR FILTERS
          </button>
        </div>
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

      {/* Last preserved memories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono tracking-[0.35em] text-terminal-green/70 uppercase">
              Last Preserved Memories
            </div>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              The newest entries still holding together in the archive.
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            {lastPreservedMemories.length} preserved
          </div>
        </div>

        {lastPreservedMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lastPreservedMemories.map((memory) => (
              <MemoryCard
                key={`preserved-${memory.id}`}
                memory={memory}
                currentUser={currentUser}
                onDelete={handleDeleteMemory}
                onUpdate={handleUpdateMemory}
                onRestore={loadMemories}
              />
            ))}
          </div>
        ) : (
          <div className="border border-terminal-green/20 bg-black/60 p-4 text-xs font-mono text-muted-foreground">
            No preserved memories match the current search and emotional filter.
          </div>
        )}
      </section>

      {/* Grid of Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedMemories
          .filter((memory) => !lastPreservedMemories.some((l) => l.id === memory.id))
          .map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              currentUser={currentUser}
              onDelete={handleDeleteMemory}
              onUpdate={handleUpdateMemory}
              onRestore={loadMemories}
            />
          ))}
      </div>
    </div>
  );
}
