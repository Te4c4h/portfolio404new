"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiEdit2, FiTrash2 } from "react-icons/fi";
import Toast from "@/components/Toast";

interface Section {
  id: string;
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  order: number;
}

interface ModalData {
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
}

const emptyModal: ModalData = { name: "", slug: "", label: "", subtitle: "", backgroundColor: "" };

function SortableRow({
  section,
  onEdit,
  onDelete,
}: {
  section: Section;
  onEdit: (s: Section) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--muted)] hover:text-[var(--foreground)]">
        <FiMenu size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--foreground)] font-medium text-sm truncate">{section.name}</p>
        <p className="text-[var(--muted)] text-xs truncate">/{section.slug} &middot; {section.label}</p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-[var(--danger)] text-xs">Are you sure?</span>
          <button onClick={() => { onDelete(section.id); setConfirming(false); }} className="px-3 py-1 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">
            Delete
          </button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(section)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => setConfirming(true)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]">
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModalData>(emptyModal);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const load = useCallback(async () => {
    const r = await fetch("/api/sections");
    const data = await r.json();
    setSections(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyModal);
    setSlugManual(false);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (s: Section) => {
    setEditingId(s.id);
    setForm({ name: s.name, slug: s.slug, label: s.label, subtitle: s.subtitle, backgroundColor: s.backgroundColor });
    setSlugManual(true);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.slug.trim()) { setError("Slug is required"); return; }
    setSaving(true);
    setError("");

    const body = {
      name: form.name,
      label: form.label || form.name,
      subtitle: form.subtitle,
      backgroundColor: form.backgroundColor,
    };

    const url = editingId ? `/api/sections/${editingId}` : "/api/sections";
    const method = editingId ? "PUT" : "POST";

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    const prevSections = [...sections];
    setSections(reordered);

    try {
      const res = await fetch("/api/sections/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((s, i) => ({ id: s.id, order: i })),
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSections(prevSections);
      setToastMsg("Failed to save order \u2014 reverted");
      setToast(true);
    }
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Categories</h1>
        <button
          onClick={openAdd}
          disabled={sections.length >= 4}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + Add Section
        </button>
      </div>
      {sections.length >= 4 && (
        <p className="text-[var(--muted)] text-[10px] mb-4">Maximum 4 sections reached</p>
      )}

      {sections.length === 0 ? (
        <p className="text-[var(--muted)] text-sm text-center py-12">No sections yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((s) => (
                <SortableRow key={s.id} section={s} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              {editingId ? "Edit Section" : "Add Section"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Name *</label>
                <input
                  className="dash-input"
                  maxLength={40}
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      ...(slugManual ? {} : { slug: autoSlug(name) }),
                    }));
                  }}
                  placeholder="e.g. Projects"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Slug *</label>
                <input
                  className="dash-input"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Section Label</label>
                <input className="dash-input" maxLength={30} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Display label" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Section Subtitle</label>
                <input className="dash-input" maxLength={100} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Optional subtitle" />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">
                  Background Color
                  {form.backgroundColor && (
                    <button onClick={() => setForm((f) => ({ ...f, backgroundColor: "" }))} className="ml-2 text-[var(--accent)] text-xs hover:underline">Clear</button>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.backgroundColor || "#181818"}
                    onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                    className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer"
                  />
                  <input
                    className="dash-input"
                    value={form.backgroundColor}
                    onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                    placeholder="#181818 (default)"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-[var(--danger)] text-xs mt-3">{error}</p>}

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
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
