import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { createMemory } from "../services/api";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type Props = {
  onSuccess?: () => void;
  currentUser?: string | null;
};

export function SubmitForm({ onSuccess, currentUser }: Props) {
  const [title, setTitle] = useState("");
  const [survivorAlias, setSurvivorAlias] = useState("");
  const [category, setCategory] = useState("Diary");
  const [emotionalTag, setEmotionalTag] = useState("Hope");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[] | null>(null);
  const selectClassName =
    "w-full appearance-none rounded-md border border-terminal-green/35 bg-black/90 px-3 py-2 pr-10 font-mono text-sm font-semibold tracking-wide text-terminal-green shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(0,255,65,0.04)] transition-colors focus:outline-none focus:border-terminal-green/70 focus:ring-2 focus:ring-terminal-green/20";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side validation to provide immediate, friendly feedback
    const missing: string[] = [];
    if (!title.trim()) missing.push("Transmission failed: Title missing.");
    if (!content.trim()) missing.push("Transmission failed: Content missing.");
    if (missing.length) {
      setErrors(missing);
      setSuccess(null);
      return;
    }

    setLoading(true);
    setSuccess(null);
    setErrors(null);

    try {
      const newMemory = await createMemory({
        title,
        survivorAlias: survivorAlias.trim() || currentUser || "Anonymous",
        category,
        content,
        emotionalTag,
      });

      if (newMemory && newMemory.id) {
        try {
          const myMemories = JSON.parse(localStorage.getItem("myCreatedMemories") || "[]");
          if (Array.isArray(myMemories)) {
            myMemories.push(newMemory.id);
            localStorage.setItem("myCreatedMemories", JSON.stringify(myMemories));
          }
        } catch (e) {
          console.error("Failed to save created memory ownership local", e);
        }
      }
      setTitle("");
      setSurvivorAlias("");
      setCategory("Diary");
      setEmotionalTag("Hope");
      setContent("");
      setSuccess("Memory uploaded successfully.");
      // small visual effect
      onSuccess?.();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      // Prefer readable Error.message thrown by api helper
      const msg = err?.message || "Transmission failed: Unknown error.";
      setErrors([msg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-card border border-terminal-green/20 rounded"
    >
      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter transmission title..."
          className="w-full mt-1 bg-black border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/60 placeholder:text-muted-foreground/60"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Alias
        </label>
        <Input
          value={survivorAlias}
          onChange={(e) => setSurvivorAlias(e.target.value)}
          placeholder="Anonymous"
          className="w-full mt-1 bg-black border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/60 placeholder:text-muted-foreground/60"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Category
        </label>
        <div className="relative mt-1">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Emotional Tag
        </label>
        <div className="relative mt-1">
          <select
            value={emotionalTag}
            onChange={(e) => setEmotionalTag(e.target.value)}
            className={selectClassName}
          >
            <option>Hope</option>
            <option>Fear</option>
            <option>Loss</option>
            <option>Survival</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-terminal-green/70" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Content
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type memory log or message transmission content..."
          rows={6}
          className="w-full mt-1 bg-black border border-terminal-green/30 px-3 py-2 text-terminal-green font-mono focus:outline-none focus:border-terminal-green/60 placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-terminal-green/10 border border-terminal-green/30 text-terminal-green font-mono text-xs hover:bg-terminal-green/20 transition-colors uppercase cursor-pointer"
        >
          {loading ? "Uploading…" : "Upload Memory"}
        </button>
        {success && (
          <div className="text-sm font-mono text-terminal-green">{success}</div>
        )}
        {errors && (
          <div className="text-sm font-mono text-rose-400">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

export default SubmitForm;
