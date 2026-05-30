import React, { useState } from "react";
import { createMemory } from "../services/api";

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
      await createMemory({
        title,
        survivorAlias: survivorAlias.trim() || currentUser || "Anonymous",
        category,
        content,
        emotionalTag,
      });
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mt-1 input"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Alias
        </label>
        <input
          value={survivorAlias}
          onChange={(e) => setSurvivorAlias(e.target.value)}
          placeholder="Anonymous"
          className="w-full mt-1 input"
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mt-1 input"
        >
          <option>Diary</option>
          <option>Final Message</option>
          <option>Survival Story</option>
          <option>Historical Record</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Emotional Tag
        </label>
        <select
          value={emotionalTag}
          onChange={(e) => setEmotionalTag(e.target.value)}
          className="w-full mt-1 input"
        >
          <option>Hope</option>
          <option>Fear</option>
          <option>Loss</option>
          <option>Survival</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono text-muted-foreground">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full mt-1 textarea"
        />
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={loading} className="btn">
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
