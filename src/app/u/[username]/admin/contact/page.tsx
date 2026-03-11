"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import {
  FiMail, FiGithub, FiLinkedin, FiInstagram, FiFacebook, FiYoutube, FiGlobe,
} from "react-icons/fi";

interface ContactLink {
  id: string;
  platform: string;
  url: string;
  order: number;
}

interface FormData {
  platform: string;
  url: string;
}

const emptyForm: FormData = { platform: "Email", url: "" };

const platforms = [
  "Email", "GitHub", "LinkedIn", "Telegram", "WhatsApp", "Instagram",
  "Facebook", "Behance", "Upwork", "Fiverr", "Viber", "YouTube", "Other",
];

const iconMap: Record<string, React.ElementType> = {
  Email: FiMail, GitHub: FiGithub, LinkedIn: FiLinkedin,
  Instagram: FiInstagram, Facebook: FiFacebook, YouTube: FiYoutube,
  Other: FiGlobe,
};

function SortableRow({
  link, onEdit, onDelete,
}: {
  link: ContactLink;
  onEdit: (l: ContactLink) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [confirming, setConfirming] = useState(false);
  const Icon = iconMap[link.platform] || FiGlobe;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-[#181818] border border-[#2a2a2a] rounded-lg px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-[#555] hover:text-[#888]">
        <FiMenu size={16} />
      </button>
      <Icon size={16} className="text-[#70E844] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[#fafafa] font-medium text-sm truncate">{link.platform}</p>
        <p className="text-[#666] text-xs truncate">{link.url}</p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-[#FE454E] text-xs">Sure?</span>
          <button onClick={() => { onDelete(link.id); setConfirming(false); }} className="px-3 py-1 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45]">Delete</button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(link)} className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-[#fafafa]"><FiEdit2 size={14} /></button>
          <button onClick={() => setConfirming(true)} className="p-1.5 rounded hover:bg-[#2a2a2a] text-[#888] hover:text-[#FE454E]"><FiTrash2 size={14} /></button>
        </div>
      )}
    </div>
  );
}

export default function ContactLinksPage() {
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    const r = await fetch("/api/contact-links");
    setLinks(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (l: ContactLink) => { setEditingId(l.id); setForm({ platform: l.platform, url: l.url }); setError(""); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.url.trim()) { setError("URL is required"); return; }
    setSaving(true); setError("");
    const url = editingId ? `/api/contact-links/${editingId}` : "/api/contact-links";
    const method = editingId ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) { const d = await r.json(); setError(d.error || "Failed"); setSaving(false); return; }
    setModalOpen(false); setSaving(false); load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/contact-links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = links.findIndex((l) => l.id === active.id);
    const newIdx = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIdx, newIdx);
    setLinks(reordered);
    await fetch("/api/contact-links/reorder", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map((l, i) => ({ id: l.id, order: i })) }),
    });
  };

  if (loading) return <div className="text-[#888] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Contact Links</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#70E844] text-[#131313] hover:bg-[#5ed636]">
          <FiPlus size={16} /> Add
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-[#666] text-sm text-center py-12">No contact links yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {links.map((l) => <SortableRow key={l.id} link={l} onEdit={openEdit} onDelete={handleDelete} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#fafafa] mb-4">{editingId ? "Edit Link" : "Add Link"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#888] mb-1 block">Platform</label>
                <select className="dash-input" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                  {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#888] mb-1 block">URL *</label>
                <input className="dash-input" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
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
    </div>
  );
}
