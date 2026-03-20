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
import Toast from "@/components/Toast";

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
  "Email", "Phone", "GitHub", "LinkedIn", "Telegram", "WhatsApp", "Instagram",
  "Facebook", "Behance", "Upwork", "Fiverr", "Viber", "YouTube", "Other",
];

const urlHints: Record<string, string> = {
  Email: "e.g. hello@gmail.com",
  Phone: "e.g. +37400000000",
};
const defaultHint = "e.g. https://...";

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
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--muted-foreground)] hover:text-[var(--muted)]">
        <FiMenu size={16} />
      </button>
      <Icon size={16} className="text-[var(--accent)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[var(--foreground)] font-medium text-sm truncate">{link.platform}</p>
        <p className="text-[var(--muted-foreground)] text-xs truncate">{link.url}</p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-[var(--danger)] text-xs">Sure?</span>
          <button onClick={() => { onDelete(link.id); setConfirming(false); }} className="px-3 py-1 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">Delete</button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(link)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"><FiEdit2 size={14} /></button>
          <button onClick={() => setConfirming(true)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]"><FiTrash2 size={14} /></button>
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [contactTitle, setContactTitle] = useState("");
  const [contactSubtitle, setContactSubtitle] = useState("");
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [linkSaving, setLinkSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = useCallback(async () => {
    const [siteRes, linksRes] = await Promise.all([
      fetch("/api/site"),
      fetch("/api/contact-links"),
    ]);
    const d = await siteRes.json();
    if (d) {
      setContactTitle(d.contactTitle || "");
      setContactSubtitle(d.contactSubtitle || "");
    }
    setLinks(await linksRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactTitle, contactSubtitle }),
    });
    setSaving(false);
    setToast(true);
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (l: ContactLink) => {
    let displayUrl = l.url;
    if (l.platform === "Email" && displayUrl.startsWith("mailto:")) displayUrl = displayUrl.slice(7);
    if (l.platform === "Phone" && displayUrl.startsWith("tel:")) displayUrl = displayUrl.slice(4);
    setEditingId(l.id); setForm({ platform: l.platform, url: displayUrl }); setError(""); setModalOpen(true);
  };

  const handleLinkSave = async () => {
    if (!form.url.trim()) { setError("URL is required"); return; }
    setLinkSaving(true); setError("");
    let finalUrl = form.url.trim();
    if (form.platform === "Email" && !finalUrl.startsWith("mailto:")) finalUrl = `mailto:${finalUrl}`;
    if (form.platform === "Phone" && !finalUrl.startsWith("tel:")) finalUrl = `tel:${finalUrl}`;
    const payload = { ...form, url: finalUrl };
    const url = editingId ? `/api/contact-links/${editingId}` : "/api/contact-links";
    const method = editingId ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) { const d = await r.json(); setError(d.error || "Failed"); setLinkSaving(false); return; }
    setModalOpen(false); setLinkSaving(false); load();
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

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Contact Info</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Contact Section Text */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Contact Section</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Contact Title</label>
              <input className="dash-input" maxLength={30} value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Get in Touch" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Contact Subtitle</label>
              <input className="dash-input" value={contactSubtitle} onChange={(e) => setContactSubtitle(e.target.value)} placeholder="I'd love to hear from you" />
            </div>
          </div>
        </div>

        {/* Contact Links */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Contact Links</h2>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]">
              <FiPlus size={14} /> Add
            </button>
          </div>
          {links.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-sm text-center py-8">No contact links yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {links.map((l) => <SortableRow key={l.id} link={l} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">{editingId ? "Edit Link" : "Add Link"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">Platform</label>
                <select className="dash-input" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                  {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">URL *</label>
                <input className="dash-input" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder={urlHints[form.platform] || defaultHint} />
                <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{urlHints[form.platform] || defaultHint}</p>
              </div>
            </div>
            {error && <p className="text-[var(--danger)] text-xs mt-3">{error}</p>}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">Cancel</button>
              <button onClick={handleLinkSave} disabled={linkSaving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
                {linkSaving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message="Contact saved!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
