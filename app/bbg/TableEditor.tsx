"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TraitCategory, TraitVariant } from "@/types/traits";
import { deleteEntry, bulkDeleteEntries } from "@/actions/db_delet";
import { insertEntry, bulkInsertEntries } from "@/actions/db_insert";
import { updateEntry } from "@/actions/db_update";

export default function TableEditor({
  activeTable,
  initialData,
  error,
  allTables,
}: {
  activeTable: TraitCategory;
  initialData: TraitVariant[];
  error?: string;
  allTables: TraitCategory[];
}) {
  const router = useRouter();
  
  // States
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(false);

  const handleTableChange = (table: string) => {
    router.push(`/bbg?table=${table}`);
    setIsEditing(null);
    setFormData({ title: "", description: "" });
    setBulkMode(false);
    setSelectedIds(new Set());
  };

  const handleEditClick = (row: TraitVariant) => {
    setIsEditing(row.id);
    setFormData({
      title: row.title,
      description: row.description,
    });
    setBulkMode(false);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setFormData({ title: "", description: "" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry? Gap will be filled automatically.")) return;
    
    setIsLoading(true);
    const result = await deleteEntry(activeTable, id);
    if (result.error) alert(`Error deleting: ${result.error}`);
    setIsLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} entries? Gaps will be filled.`)) return;

    setIsLoading(true);
    const result = await bulkDeleteEntries(activeTable, Array.from(selectedIds));
    if (result.error) alert(`Error bulk deleting: ${result.error}`);
    else setSelectedIds(new Set());
    setIsLoading(false);
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (bulkMode) {
      try {
        const parsed = JSON.parse(bulkJson);
        if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
        
        const result = await bulkInsertEntries(activeTable, parsed);
        if (result.error) alert(`Error bulk inserting: ${result.error}`);
        else {
          setBulkJson("");
          setBulkMode(false);
        }
      } catch (err: any) {
        alert("Invalid JSON format: " + err.message);
      }
    } else if (isEditing) {
      const result = await updateEntry(activeTable, isEditing, formData);
      if (result.error) alert(`Error updating: ${result.error}`);
      else {
        setIsEditing(null);
        setFormData({ title: "", description: "" });
      }
    } else {
      const result = await insertEntry(activeTable, formData);
      if (result.error) alert(`Error inserting: ${result.error}`);
      else setFormData({ title: "", description: "" });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Table Selector */}
      <div className="flex flex-wrap gap-2">
        {allTables.map((table) => (
          <button
            key={table}
            onClick={() => handleTableChange(table)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 shadow-sm ${
              activeTable === table
                ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-neutral-950 scale-105"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            }`}
          >
            {table}
          </button>
        ))}
      </div>

      {/* Editor Form */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-5 shadow-inner">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-neutral-100 flex items-center">
            <span className="bg-indigo-500 w-2 h-6 rounded-full mr-3"></span>
            {isEditing ? "Edit Entry" : bulkMode ? `Bulk Add to ${activeTable}` : `Add New Entry to ${activeTable}`}
          </h3>
          {!isEditing && (
            <button 
              onClick={() => setBulkMode(!bulkMode)}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {bulkMode ? "Switch to Single Entry" : "Switch to Bulk JSON Insert"}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {bulkMode ? (
            <div className="space-y-3">
              <div className="bg-neutral-950/50 border border-neutral-800/80 rounded-lg p-4 text-sm text-neutral-400 font-mono">
                <p className="text-neutral-300 font-semibold mb-2">Example Format:</p>
                <pre className="text-indigo-300 overflow-x-auto whitespace-pre-wrap">
{`[
  { "title": "Red Horns", "description": "Long red horns" },
  { "title": "Blue Eyes", "description": "Glowing blue eyes" }
]`}
                </pre>
              </div>
              <textarea
                placeholder='Paste your JSON array here...'
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                className="w-full h-48 bg-neutral-950 border border-neutral-800 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                required
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                required
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                required
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-lg shadow-indigo-900/20"
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : bulkMode ? "Insert All Entries" : "Add Entry"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-neutral-800 hover:bg-neutral-700 px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Table */}
      {error ? (
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 font-medium">
          Failed to load {activeTable}: {error}
        </div>
      ) : !initialData || initialData.length === 0 ? (
        <div className="p-12 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl text-neutral-500 italic font-medium">
          No data available for {activeTable}. Add your first entry above!
        </div>
      ) : (
        <div className="space-y-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl">
              <span className="font-medium text-neutral-300">{selectedIds.size} entries selected</span>
              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-red-900/20 disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          )}
          
          <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40 shadow-2xl backdrop-blur-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs tracking-wider font-bold border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-5 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(initialData.map(r => r.id)));
                        else setSelectedIds(new Set());
                      }}
                      checked={selectedIds.size === initialData.length && initialData.length > 0}
                      className="rounded border-neutral-700 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-6 py-5">Base 10</th>
                  <th className="px-6 py-5">Base 36</th>
                  <th className="px-6 py-5">Title</th>
                  <th className="px-6 py-5 w-full">Description</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {initialData.map((row) => (
                  <tr 
                    key={row.id} 
                    className={`transition-colors duration-200 group ${isEditing === row.id || selectedIds.has(row.id) ? 'bg-indigo-900/20' : 'hover:bg-neutral-800/50'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                        className="rounded border-neutral-700 bg-neutral-800 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-indigo-400 font-medium bg-neutral-950/20">
                      {row.base10_map}
                    </td>
                    <td className="px-6 py-4 font-mono text-pink-400 font-medium bg-neutral-950/20">
                      {row.base36_map}
                    </td>
                    <td className="px-6 py-4 text-neutral-200 font-bold">
                      {row.title}
                    </td>
                    <td className="px-6 py-4 text-neutral-400 truncate max-w-md" title={row.description}>
                      {row.description}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold uppercase text-xs tracking-wider transition-colors"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-400 hover:text-red-300 font-bold uppercase text-xs tracking-wider transition-colors"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
