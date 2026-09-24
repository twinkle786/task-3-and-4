import { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import api from "../api/axios";

export default function AISuggestModal({ project, onClose, onTasksAdded }) {
  const [description, setDescription] = useState(project.description || "");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setError("");
    if (!description.trim()) {
      setError("Pehle project description likho");
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await api.post("/ai/suggest-tasks", { description });
      setSuggestions(res.data.data);
      setSelected(res.data.data.map((_, i) => i));
    } catch (err) {
      setError(err.response?.data?.error || "AI suggestions abhi nahi mil payi, dobara try karo");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(index) {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleAddSelected() {
    setAdding(true);
    try {
      const tasksToAdd = selected.map((i) => suggestions[i]);
      const createdTasks = [];
      for (const title of tasksToAdd) {
        const res = await api.post("/tasks", { title, projectId: project._id, priority: "medium" });
        createdTasks.push(res.data.data);
      }
      onTasksAdded(createdTasks);
      onClose();
    } catch (err) {
      setError("Kuch tasks add karne mein dikkat aayi");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" /> AI Task Suggestions
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <label className="text-sm text-slate-300 mb-1 block">Project Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
          placeholder="Project kis baare mein hai, thoda detail likho..."
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          {loading ? "AI soch raha hai..." : "✨ Suggest Tasks"}
        </button>

        {suggestions.length > 0 && (
          <>
            <p className="text-sm text-slate-400 mt-5 mb-2">
              AI ne ye tasks suggest kiye hain — jo chahiye wo select karke add karo:
            </p>
            <div className="space-y-2 mb-4">
              {suggestions.map((task, i) => (
                <button
                  key={i}
                  onClick={() => toggleSelect(i)}
                  className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border text-sm transition ${
                    selected.includes(i)
                      ? "bg-purple-500/10 border-purple-500/50 text-slate-100"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      selected.includes(i) ? "bg-purple-500 border-purple-500" : "border-slate-600"
                    }`}
                  >
                    {selected.includes(i) && <Check size={12} className="text-white" />}
                  </div>
                  {task}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddSelected}
              disabled={adding || selected.length === 0}
              className="w-full py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {adding ? "Add ho raha hai..." : `${selected.length} Tasks Add Karo`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}