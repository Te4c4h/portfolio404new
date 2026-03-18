"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import Toast from "@/components/Toast";

interface Section {
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  sectionId: string;
  contentType: string;
  title: string;
  description: string;
  tags: string;
  coverImage: string;
  image1: string;
  image2: string;
  image3: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
  codeContent: string;
  codeLanguage: string;
  modelUrl: string;
  order: number;
}

interface FormData {
  sectionId: string;
  contentType: string;
  title: string;
  description: string;
  tags: string;
  coverImage: string;
  image1: string;
  image2: string;
  image3: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
  codeContent: string;
  codeLanguage: string;
  modelUrl: string;
}

const emptyForm: FormData = {
  sectionId: "", contentType: "project", title: "", description: "", tags: "",
  coverImage: "", image1: "", image2: "", image3: "",
  liveUrl: "", repoUrl: "", videoUrl: "", codeContent: "",
  codeLanguage: "", modelUrl: "",
};

const contentTypes = [
  { value: "project", label: "Project" },
  { value: "video", label: "Video" },
  { value: "code", label: "Code Block" },
  { value: "model3d", label: "3D Model" },
];

const codeLanguages = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "ruby", "php", "swift", "kotlin", "html", "css",
  "sql", "bash", "json", "yaml", "markdown",
];

function SortableRow({
  item, sectionName, onEdit, onDelete, deletingId, setDeletingId,
}: {
  item: ContentItem;
  sectionName: string;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-[#181818] border border-[#2a2a2a] rounded-lg px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-[#555] hover:text-[#888]">
        <FiMenu size={16} />
      </button>
      {item.coverImage ? (
        <img src={item.coverImage} alt="" className="w-12 h-12 rounded object-cover bg-[#2a2a2a] flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded bg-[#2a2a2a] flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[#fafafa] font-medium text-sm truncate">{item.title}</p>
        <p className="text-[#666] text-xs truncate">{sectionName}</p>
        {item.tags && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {item.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-[#70E844]/10 text-[#70E844]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {deletingId === item.id ? (
        <div className="flex items-center gap-2">
          <span className="text-[#FE454E] text-xs">Are you sure?</span>
          <button onClick={() => onDelete(item.id)} className="px-3 py-1 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45]">Delete</button>
          <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-[#fafafa]">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-[#FE454E]">
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const load = useCallback(async () => {
    const [sRes, cRes] = await Promise.all([
      fetch("/api/sections"),
      fetch("/api/content"),
    ]);
    const secs = await sRes.json();
    setSections(secs);
    setItems(await cRes.json());
    setFilter((prev) => {
      if (!prev || !secs.find((s: Section) => s.id === prev)) return secs[0]?.id || "";
      return prev;
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = (filter ? items.filter((i) => i.sectionId === filter) : items)
    .slice()
    .sort((a, b) => a.order - b.order);
  const sectionName = (id: string) => sections.find((s) => s.id === id)?.name || "";

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sectionId: filter || (sections[0]?.id || "") });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      sectionId: item.sectionId, contentType: item.contentType || "project",
      title: item.title, description: item.description,
      tags: item.tags, coverImage: item.coverImage, image1: item.image1,
      image2: item.image2, image3: item.image3, liveUrl: item.liveUrl,
      repoUrl: item.repoUrl, videoUrl: item.videoUrl || "",
      codeContent: item.codeContent || "", codeLanguage: item.codeLanguage || "",
      modelUrl: item.modelUrl || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.sectionId) { setError("Section is required"); return; }
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (form.contentType === "project" && !form.description.trim()) { setError("Description is required"); return; }
    setSaving(true);
    setError("");

    const url = editingId ? `/api/content/${editingId}` : "/api/content";
    const method = editingId ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!r.ok) {
      const d = await r.json();
      setError(d.error || "Failed to save");
      setSaving(false);
      return;
    }
    setModalOpen(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = filtered.findIndex((i) => i.id === active.id);
    const newIdx = filtered.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(filtered, oldIdx, newIdx);
    // Save previous state for rollback
    const prevItems = [...items];
    // Optimistic local update — instant visual feedback
    const newItems = items.map((item) => {
      const idx = reordered.findIndex((r) => r.id === item.id);
      if (idx !== -1) return { ...item, order: idx };
      return item;
    });
    setItems(newItems);
    // Persist in background — rollback on failure
    try {
      const res = await fetch("/api/content/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered.map((item, i) => ({ id: item.id, order: i })) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems(prevItems);
      setToastMsg("Failed to save order — reverted");
      setToast(true);
    }
  };

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Sections Content</h1>
        {sections.length > 0 && (
          <button
            onClick={openAdd}
            disabled={filtered.length >= 6}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} /> Add
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <p className="text-[#666] text-sm text-center py-12">No sections yet — go to Portfolio → Sections to create one.</p>
      ) : (
        <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s.id ? "bg-[#70E844] text-[#131313]" : "bg-[#2a2a2a] text-[#888] hover:text-[#fafafa]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {filtered.length >= 6 && (
        <p className="text-[#888] text-[10px] mb-4">Maximum 6 items in this section</p>
      )}

      {filtered.length === 0 ? (
        <p className="text-[#666] text-sm text-center py-12">No content yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  sectionName={sectionName(item.sectionId)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                  setDeletingId={setDeletingId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
        </>)
      }

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-4">
              {editingId ? "Edit Content" : "Add Content"}
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Section *</label>
                  <select className="dash-input" value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}>
                    <option value="">Select section</option>
                    {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Type *</label>
                  <select className="dash-input" value={form.contentType} onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}>
                    {contentTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Title *</label>
                <input className="dash-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Content title" />
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Description{form.contentType === "project" ? " *" : ""}</label>
                <textarea className="dash-input min-h-[80px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" />
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">Tags</label>
                <input className="dash-input" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="React, Next.js, TypeScript" />
              </div>

              {/* Video fields */}
              {form.contentType === "video" && (
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Video URL *</label>
                  <input className="dash-input" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." />
                  <p className="text-[#555] text-[10px] mt-0.5">YouTube or Vimeo URL. Will be embedded as a player.</p>
                </div>
              )}

              {/* Code fields */}
              {form.contentType === "code" && (
                <>
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Language</label>
                    <select className="dash-input" value={form.codeLanguage} onChange={(e) => setForm((f) => ({ ...f, codeLanguage: e.target.value }))}>
                      <option value="">Auto-detect</option>
                      {codeLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Code *</label>
                    <textarea
                      className="dash-input min-h-[160px] font-mono text-xs"
                      value={form.codeContent}
                      onChange={(e) => setForm((f) => ({ ...f, codeContent: e.target.value }))}
                      placeholder="Paste your code here..."
                      spellCheck={false}
                    />
                  </div>
                </>
              )}

              {/* 3D Model fields */}
              {form.contentType === "model3d" && (
                <div>
                  <label className="text-xs text-[#888] mb-1 block">3D Model URL *</label>
                  <input className="dash-input" value={form.modelUrl} onChange={(e) => setForm((f) => ({ ...f, modelUrl: e.target.value }))} placeholder="https://... (.glb or .gltf)" />
                  <p className="text-[#555] text-[10px] mt-0.5">URL to a .glb or .gltf file. Will render as an interactive 3D viewer.</p>
                </div>
              )}

              {/* Project-specific fields */}
              {form.contentType === "project" && (
                <>
                  <div>
                    <label className="text-xs text-[#888] mb-1 block">Cover Image URL</label>
                    <input className="dash-input" value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." />
                    <p className="text-[#555] text-[10px] mt-0.5">Recommended: 1200x675px (16:9)</p>
                    {form.coverImage && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                        <img src={form.coverImage} alt="Cover preview" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Image 2</label>
                      <input className="dash-input" value={form.image1} onChange={(e) => setForm((f) => ({ ...f, image1: e.target.value }))} placeholder="URL" />
                      {form.image1 && (
                        <div className="mt-1 rounded overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                          <img src={form.image1} alt="Preview" className="w-full h-16 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Image 3</label>
                      <input className="dash-input" value={form.image2} onChange={(e) => setForm((f) => ({ ...f, image2: e.target.value }))} placeholder="URL" />
                      {form.image2 && (
                        <div className="mt-1 rounded overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                          <img src={form.image2} alt="Preview" className="w-full h-16 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Image 4</label>
                      <input className="dash-input" value={form.image3} onChange={(e) => setForm((f) => ({ ...f, image3: e.target.value }))} placeholder="URL" />
                      {form.image3 && (
                        <div className="mt-1 rounded overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]">
                          <img src={form.image3} alt="Preview" className="w-full h-16 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Live URL</label>
                      <input className="dash-input" value={form.liveUrl} onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs text-[#888] mb-1 block">Repo URL</label>
                      <input className="dash-input" value={form.repoUrl} onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))} placeholder="https://..." />
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && <p className="text-[#FE454E] text-xs mt-3">{error}</p>}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636] disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
