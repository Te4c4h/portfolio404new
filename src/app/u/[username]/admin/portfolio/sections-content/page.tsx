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
import Image from "next/image";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
import { TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface Section {
  id: string;
  name: string;
}

interface ContentItem {
  id: string;
  sectionId: string;
  slug: string;
  contentType: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string;
  coverImage: string;
  coverImageDesc: string;
  image1: string;
  image1Desc: string;
  image2: string;
  image2Desc: string;
  image3: string;
  image3Desc: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
  videoDesc: string;
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
  longDescription: string;
  tags: string;
  coverImage: string;
  coverImageDesc: string;
  image1: string;
  image1Desc: string;
  image2: string;
  image2Desc: string;
  image3: string;
  image3Desc: string;
  liveUrl: string;
  repoUrl: string;
  videoUrl: string;
  videoDesc: string;
  codeContent: string;
  codeLanguage: string;
  modelUrl: string;
  cardBg: string;
  titleColor: string;
  titleFont: string;
  titleWeight: string;
  descColor: string;
  descFont: string;
  descWeight: string;
  tagBg: string;
  tagColor: string;
  tagFont: string;
  tagWeight: string;
  liveBtnText: string;
  liveBtnBg: string;
  liveBtnColor: string;
  liveBtnFont: string;
  liveBtnWeight: string;
  repoBtnText: string;
  repoBtnBg: string;
  repoBtnColor: string;
  repoBtnFont: string;
  repoBtnWeight: string;
  longDescColor: string;
  longDescFont: string;
  longDescWeight: string;
  imgDescColor: string;
  imgDescFont: string;
  imgDescWeight: string;
}

const emptyForm: FormData = {
  sectionId: "", contentType: "project", title: "", description: "", longDescription: "", tags: "",
  coverImage: "", coverImageDesc: "", image1: "", image1Desc: "", image2: "", image2Desc: "", image3: "", image3Desc: "",
  liveUrl: "", repoUrl: "", videoUrl: "", videoDesc: "", codeContent: "",
  codeLanguage: "", modelUrl: "",
  cardBg: "",
  titleColor: "", titleFont: "", titleWeight: "",
  descColor: "", descFont: "", descWeight: "",
  tagBg: "", tagColor: "", tagFont: "", tagWeight: "",
  liveBtnText: "", liveBtnBg: "", liveBtnColor: "", liveBtnFont: "", liveBtnWeight: "",
  repoBtnText: "", repoBtnBg: "", repoBtnColor: "", repoBtnFont: "", repoBtnWeight: "",
  longDescColor: "", longDescFont: "", longDescWeight: "",
  imgDescColor: "", imgDescFont: "", imgDescWeight: "",
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
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3">
      <button {...attributes} {...listeners} className="cursor-grab text-[var(--muted-foreground)] hover:text-[var(--muted)]">
        <FiMenu size={16} />
      </button>
      {item.coverImage ? (
        <Image src={item.coverImage} alt="" width={48} height={48} className="w-12 h-12 rounded object-cover bg-[var(--border)] flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded bg-[var(--border)] flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[var(--foreground)] font-medium text-sm truncate">{item.title}</p>
        <p className="text-[var(--muted-foreground)] text-xs truncate">{sectionName}</p>
        {item.tags && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {item.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--accent)]/10 text-[var(--accent)]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {deletingId === item.id ? (
        <div className="flex items-center gap-2">
          <span className="text-[var(--danger)] text-xs">{t("sectionsContent.areYouSure")}</span>
          <button onClick={() => onDelete(item.id)} className="px-3 py-1 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">{t("common.delete")}</button>
          <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">{t("common.cancel")}</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]">
            <FiEdit2 size={14} />
          </button>
          <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)]">
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const { t } = useTranslation();
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
  const [activeTab, setActiveTab] = useState<"content" | "media" | "links" | "style">("content");

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
    setActiveTab("content");
    setModalOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setForm({
      sectionId: item.sectionId, contentType: item.contentType || "project",
      title: item.title, description: item.description,
      longDescription: item.longDescription || "",
      tags: item.tags, coverImage: item.coverImage,
      coverImageDesc: item.coverImageDesc || "",
      image1: item.image1, image1Desc: item.image1Desc || "",
      image2: item.image2, image2Desc: item.image2Desc || "",
      image3: item.image3, image3Desc: item.image3Desc || "",
      liveUrl: item.liveUrl,
      repoUrl: item.repoUrl, videoUrl: item.videoUrl || "",
      videoDesc: item.videoDesc || "",
      codeContent: item.codeContent || "", codeLanguage: item.codeLanguage || "",
      modelUrl: item.modelUrl || "",
      cardBg: (item as never as Record<string, string>).cardBg || "",
      titleColor: (item as never as Record<string, string>).titleColor || "",
      titleFont: (item as never as Record<string, string>).titleFont || "",
      titleWeight: (item as never as Record<string, string>).titleWeight || "",
      descColor: (item as never as Record<string, string>).descColor || "",
      descFont: (item as never as Record<string, string>).descFont || "",
      descWeight: (item as never as Record<string, string>).descWeight || "",
      tagBg: (item as never as Record<string, string>).tagBg || "",
      tagColor: (item as never as Record<string, string>).tagColor || "",
      tagFont: (item as never as Record<string, string>).tagFont || "",
      tagWeight: (item as never as Record<string, string>).tagWeight || "",
      liveBtnText: (item as never as Record<string, string>).liveBtnText || "",
      liveBtnBg: (item as never as Record<string, string>).liveBtnBg || "",
      liveBtnColor: (item as never as Record<string, string>).liveBtnColor || "",
      liveBtnFont: (item as never as Record<string, string>).liveBtnFont || "",
      liveBtnWeight: (item as never as Record<string, string>).liveBtnWeight || "",
      repoBtnText: (item as never as Record<string, string>).repoBtnText || "",
      repoBtnBg: (item as never as Record<string, string>).repoBtnBg || "",
      repoBtnColor: (item as never as Record<string, string>).repoBtnColor || "",
      repoBtnFont: (item as never as Record<string, string>).repoBtnFont || "",
      repoBtnWeight: (item as never as Record<string, string>).repoBtnWeight || "",
      longDescColor: (item as never as Record<string, string>).longDescColor || "",
      longDescFont: (item as never as Record<string, string>).longDescFont || "",
      longDescWeight: (item as never as Record<string, string>).longDescWeight || "",
      imgDescColor: (item as never as Record<string, string>).imgDescColor || "",
      imgDescFont: (item as never as Record<string, string>).imgDescFont || "",
      imgDescWeight: (item as never as Record<string, string>).imgDescWeight || "",
    });
    setError("");
    setActiveTab("content");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.sectionId) { setError(t("sectionsContent.sectionRequired")); return; }
    if (!form.title.trim()) { setError(t("sectionsContent.titleRequired")); return; }
    if (form.contentType === "project" && !form.description.trim()) { setError(t("sectionsContent.descRequired")); return; }
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

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("sectionsContent.title")}</h1>
        {sections.length > 0 && (
          <button
            onClick={openAdd}
            disabled={filtered.length >= 6}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} /> {t("sectionsContent.addItem")}
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <p className="text-[var(--muted-foreground)] text-sm text-center py-12">{t("sectionsContent.noContent")}</p>
      ) : (
        <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s.id ? "bg-[var(--accent)] text-[var(--background)]" : "bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {filtered.length >= 6 && (
        <p className="text-[var(--muted)] text-[10px] mb-4">Maximum 6 items in this section</p>
      )}

      {filtered.length === 0 ? (
        <p className="text-[var(--muted-foreground)] text-sm text-center py-12">{t("sectionsContent.noContent")}</p>
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

      {/* Slide-in Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-[var(--overlay)]" />
          <div
            className="relative bg-[var(--surface)] border-l border-[var(--border)] w-full max-w-2xl h-full flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingId ? t("sectionsContent.editItem") : t("sectionsContent.addItem")}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] px-6 shrink-0">
              {(["content", "media", "links", "style"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t(`sectionsContent.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {/* ── CONTENT TAB ── */}
                {activeTab === "content" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.section")} *</label>
                        <select className="dash-input" value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))}>
                          <option value="">{t("sectionsContent.section")}</option>
                          {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.contentType")} *</label>
                        <select className="dash-input" value={form.contentType} onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}>
                          {contentTypes.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.itemTitle")} *</label>
                      <input className="dash-input" maxLength={60} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={t("sectionsContent.itemTitlePlaceholder")} />
                      <CharLimitHint max={60} current={form.title.length} />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.description")}{form.contentType === "project" ? " *" : ""}</label>
                      <textarea className="dash-input min-h-[80px]" maxLength={300} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder={t("sectionsContent.descriptionPlaceholder")} />
                      <CharLimitHint max={300} current={form.description.length} />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.tags")}</label>
                      <input className="dash-input" value={form.tags} onChange={(e) => {
                        const val = e.target.value;
                        const count = val.split(",").filter((s) => s.trim()).length;
                        if (count <= 6 || val.length < form.tags.length) setForm((f) => ({ ...f, tags: val }));
                      }} placeholder={t("sectionsContent.tagsPlaceholder")} />
                      <p className={`text-[10px] mt-0.5 ${form.tags.split(",").filter((s) => s.trim()).length >= 6 ? "text-[var(--danger)]" : "text-[var(--muted)]"}`}>
                        Comma-separated ({form.tags.split(",").filter((s) => s.trim()).length}/6 max){form.tags.split(",").filter((s) => s.trim()).length >= 6 ? " — limit reached" : ""}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.longDescription")}</label>
                      <textarea className="dash-input min-h-[120px]" value={form.longDescription} onChange={(e) => setForm((f) => ({ ...f, longDescription: e.target.value }))} placeholder={t("sectionsContent.longDescriptionPlaceholder")} />
                      <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">{t("sectionsContent.longDescriptionHint")}</p>
                    </div>

                    {/* Video fields */}
                    {form.contentType === "video" && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.videoUrl")} *</label>
                          <input className="dash-input" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder={t("sectionsContent.videoUrlPlaceholder")} />
                          <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">YouTube or Vimeo URL</p>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.videoDescription")}</label>
                          <input className="dash-input" value={form.videoDesc} onChange={(e) => setForm((f) => ({ ...f, videoDesc: e.target.value }))} placeholder={t("sectionsContent.videoDescriptionPlaceholder")} />
                        </div>
                      </>
                    )}

                    {/* Code fields */}
                    {form.contentType === "code" && (
                      <>
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.codeLanguage")}</label>
                          <select className="dash-input" value={form.codeLanguage} onChange={(e) => setForm((f) => ({ ...f, codeLanguage: e.target.value }))}>
                            <option value="">Auto-detect</option>
                            {codeLanguages.map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.codeContent")} *</label>
                          <textarea className="dash-input min-h-[160px] font-mono text-xs" value={form.codeContent} onChange={(e) => setForm((f) => ({ ...f, codeContent: e.target.value }))} placeholder="Paste your code here..." spellCheck={false} />
                        </div>
                      </>
                    )}

                    {/* 3D Model fields */}
                    {form.contentType === "model3d" && (
                      <div>
                        <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.modelUrl")} *</label>
                        <input className="dash-input" value={form.modelUrl} onChange={(e) => setForm((f) => ({ ...f, modelUrl: e.target.value }))} placeholder={t("sectionsContent.modelUrlPlaceholder")} />
                        <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">URL to a .glb or .gltf file</p>
                      </div>
                    )}
                  </>
                )}

                {/* ── MEDIA TAB ── */}
                {activeTab === "media" && (
                  <>
                    {form.contentType === "project" ? (
                      <>
                        <ImageUpload
                          label={t("sectionsContent.coverImage")}
                          value={form.coverImage}
                          onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
                          maxSizeMB={3}
                          recommendedDimensions={{ width: 1200, height: 675 }}
                          acceptedFormats={["JPG", "PNG", "WEBP"]}
                          folder="content"
                        />
                        {form.coverImage && (
                          <div>
                            <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.imageDescription")}</label>
                            <input className="dash-input" value={form.coverImageDesc} onChange={(e) => setForm((f) => ({ ...f, coverImageDesc: e.target.value }))} placeholder={t("sectionsContent.imageDescriptionPlaceholder")} />
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                          <div>
                            <ImageUpload label="Image 2" value={form.image1} onChange={(url) => setForm((f) => ({ ...f, image1: url }))} maxSizeMB={3} acceptedFormats={["JPG", "PNG", "WEBP"]} folder="content" />
                            {form.image1 && <input className="dash-input mt-1 text-xs" value={form.image1Desc} onChange={(e) => setForm((f) => ({ ...f, image1Desc: e.target.value }))} placeholder={t("sectionsContent.imageDescriptionPlaceholder")} />}
                          </div>
                          <div>
                            <ImageUpload label="Image 3" value={form.image2} onChange={(url) => setForm((f) => ({ ...f, image2: url }))} maxSizeMB={3} acceptedFormats={["JPG", "PNG", "WEBP"]} folder="content" />
                            {form.image2 && <input className="dash-input mt-1 text-xs" value={form.image2Desc} onChange={(e) => setForm((f) => ({ ...f, image2Desc: e.target.value }))} placeholder={t("sectionsContent.imageDescriptionPlaceholder")} />}
                          </div>
                          <div>
                            <ImageUpload label="Image 4" value={form.image3} onChange={(url) => setForm((f) => ({ ...f, image3: url }))} maxSizeMB={3} acceptedFormats={["JPG", "PNG", "WEBP"]} folder="content" />
                            {form.image3 && <input className="dash-input mt-1 text-xs" value={form.image3Desc} onChange={(e) => setForm((f) => ({ ...f, image3Desc: e.target.value }))} placeholder={t("sectionsContent.imageDescriptionPlaceholder")} />}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--muted)] text-center py-8">Media options are available for Project type items. Switch to Content tab to change the type.</p>
                    )}
                  </>
                )}

                {/* ── LINKS TAB ── */}
                {activeTab === "links" && (
                  <>
                    {form.contentType === "project" ? (
                      <>
                        {/* Link 1 */}
                        <div className="bg-[var(--background)] rounded-lg p-4 space-y-3">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{t("sectionsContent.link1")}</p>
                          <div>
                            <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.liveUrlHint")}</label>
                            <input className="dash-input" value={form.liveUrl} onChange={(e) => setForm((f) => ({ ...f, liveUrl: e.target.value }))} placeholder={t("sectionsContent.liveUrlPlaceholder")} />
                          </div>
                          {form.liveUrl && (
                            <>
                              <div>
                                <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.liveBtnText")}</label>
                                <input className="dash-input" value={form.liveBtnText} onChange={(e) => setForm((f) => ({ ...f, liveBtnText: e.target.value }))} placeholder={t("sectionsContent.liveBtnTextPlaceholder")} />
                              </div>
                              <div>
                                <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.liveBtnBg")}</label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={form.liveBtnBg || "#6366f1"} onChange={(e) => setForm((f) => ({ ...f, liveBtnBg: e.target.value }))} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
                                  <input className="dash-input" value={form.liveBtnBg} onChange={(e) => setForm((f) => ({ ...f, liveBtnBg: e.target.value }))} placeholder={t("common.default")} />
                                </div>
                              </div>
                              <TextStyleGroup
                                colorLabel={t("sectionsContent.liveBtnColor")} colorValue={form.liveBtnColor} onColorChange={(v) => setForm((f) => ({ ...f, liveBtnColor: v }))}
                                fontValue={form.liveBtnFont} onFontChange={(v) => setForm((f) => ({ ...f, liveBtnFont: v }))}
                                weightValue={form.liveBtnWeight} onWeightChange={(v) => setForm((f) => ({ ...f, liveBtnWeight: v }))}
                              />
                            </>
                          )}
                        </div>

                        {/* Link 2 */}
                        <div className="bg-[var(--background)] rounded-lg p-4 space-y-3">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{t("sectionsContent.link2")}</p>
                          <div>
                            <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.repoUrlHint")}</label>
                            <input className="dash-input" value={form.repoUrl} onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))} placeholder={t("sectionsContent.repoUrlPlaceholder")} />
                          </div>
                          {form.repoUrl && (
                            <>
                              <div>
                                <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.repoBtnText")}</label>
                                <input className="dash-input" value={form.repoBtnText} onChange={(e) => setForm((f) => ({ ...f, repoBtnText: e.target.value }))} placeholder={t("sectionsContent.repoBtnTextPlaceholder")} />
                              </div>
                              <div>
                                <label className="text-xs text-[var(--muted)] mb-1 block">{t("sectionsContent.repoBtnBg")}</label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={form.repoBtnBg || "#333333"} onChange={(e) => setForm((f) => ({ ...f, repoBtnBg: e.target.value }))} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
                                  <input className="dash-input" value={form.repoBtnBg} onChange={(e) => setForm((f) => ({ ...f, repoBtnBg: e.target.value }))} placeholder={t("common.default")} />
                                </div>
                              </div>
                              <TextStyleGroup
                                colorLabel={t("sectionsContent.repoBtnColor")} colorValue={form.repoBtnColor} onColorChange={(v) => setForm((f) => ({ ...f, repoBtnColor: v }))}
                                fontValue={form.repoBtnFont} onFontChange={(v) => setForm((f) => ({ ...f, repoBtnFont: v }))}
                                weightValue={form.repoBtnWeight} onWeightChange={(v) => setForm((f) => ({ ...f, repoBtnWeight: v }))}
                              />
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--muted)] text-center py-8">Link options are available for Project type items.</p>
                    )}
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {activeTab === "style" && (
                  <>
                    {/* Card background */}
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">
                        {t("sectionsContent.cardBgColor")}
                        {form.cardBg && <button onClick={() => setForm((f) => ({ ...f, cardBg: "" }))} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>}
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.cardBg || "#1a1a2e"} onChange={(e) => setForm((f) => ({ ...f, cardBg: e.target.value }))} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
                        <input className="dash-input" value={form.cardBg} onChange={(e) => setForm((f) => ({ ...f, cardBg: e.target.value }))} placeholder={t("common.default")} />
                      </div>
                    </div>

                    {/* Title style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sectionsContent.itemTitle")}</p>
                      <TextStyleGroup
                        colorLabel={t("sectionsContent.titleColor")} colorValue={form.titleColor} onColorChange={(v) => setForm((f) => ({ ...f, titleColor: v }))}
                        fontValue={form.titleFont} onFontChange={(v) => setForm((f) => ({ ...f, titleFont: v }))}
                        weightValue={form.titleWeight} onWeightChange={(v) => setForm((f) => ({ ...f, titleWeight: v }))}
                      />
                    </div>

                    {/* Description style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sectionsContent.description")}</p>
                      <TextStyleGroup
                        colorLabel={t("sectionsContent.descColor")} colorValue={form.descColor} onColorChange={(v) => setForm((f) => ({ ...f, descColor: v }))}
                        fontValue={form.descFont} onFontChange={(v) => setForm((f) => ({ ...f, descFont: v }))}
                        weightValue={form.descWeight} onWeightChange={(v) => setForm((f) => ({ ...f, descWeight: v }))}
                      />
                    </div>

                    {/* Tag style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sectionsContent.tags")}</p>
                      <TextStyleGroup
                        colorLabel={t("sectionsContent.tagTextColor")} colorValue={form.tagColor} onColorChange={(v) => setForm((f) => ({ ...f, tagColor: v }))}
                        fontValue={form.tagFont} onFontChange={(v) => setForm((f) => ({ ...f, tagFont: v }))}
                        weightValue={form.tagWeight} onWeightChange={(v) => setForm((f) => ({ ...f, tagWeight: v }))}
                      />
                      <div className="mt-2">
                        <label className="text-xs text-[var(--muted)] mb-1 block">
                          {t("sectionsContent.tagBgColor")}
                          {form.tagBg && <button onClick={() => setForm((f) => ({ ...f, tagBg: "" }))} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>}
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.tagBg || "#1a1a2e"} onChange={(e) => setForm((f) => ({ ...f, tagBg: e.target.value }))} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
                          <input className="dash-input" value={form.tagBg} onChange={(e) => setForm((f) => ({ ...f, tagBg: e.target.value }))} placeholder={t("common.default")} />
                        </div>
                      </div>
                    </div>

                    {/* Long description style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sectionsContent.longDescription")}</p>
                      <TextStyleGroup
                        colorLabel={t("sectionsContent.longDescColor")} colorValue={form.longDescColor} onColorChange={(v) => setForm((f) => ({ ...f, longDescColor: v }))}
                        fontValue={form.longDescFont} onFontChange={(v) => setForm((f) => ({ ...f, longDescFont: v }))}
                        weightValue={form.longDescWeight} onWeightChange={(v) => setForm((f) => ({ ...f, longDescWeight: v }))}
                      />
                    </div>

                    {/* Image description style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sectionsContent.imageDescription")}</p>
                      <TextStyleGroup
                        colorLabel={t("sectionsContent.imgDescColor")} colorValue={form.imgDescColor} onColorChange={(v) => setForm((f) => ({ ...f, imgDescColor: v }))}
                        fontValue={form.imgDescFont} onFontChange={(v) => setForm((f) => ({ ...f, imgDescFont: v }))}
                        weightValue={form.imgDescWeight} onWeightChange={(v) => setForm((f) => ({ ...f, imgDescWeight: v }))}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[var(--border)] px-6 py-4 flex items-center justify-between">
              {error && <p className="text-[var(--danger)] text-xs mr-4 truncate">{error}</p>}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">{t("common.cancel")}</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
                  {saving ? t("common.saving") : editingId ? t("common.update") : t("common.create")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
