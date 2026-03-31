"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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
import { TextStyleGroup, CharLimitHint } from "@/components/StyleFields";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface Section {
  id: string;
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  order: number;
  nameColor: string;
  nameFont: string;
  nameWeight: string;
  labelColor: string;
  labelFont: string;
  labelWeight: string;
  subtitleColor: string;
  subtitleFont: string;
  subtitleWeight: string;
}

interface ModalData {
  name: string;
  slug: string;
  label: string;
  subtitle: string;
  backgroundColor: string;
  nameColor: string;
  nameFont: string;
  nameWeight: string;
  labelColor: string;
  labelFont: string;
  labelWeight: string;
  subtitleColor: string;
  subtitleFont: string;
  subtitleWeight: string;
}

const emptyModal: ModalData = {
  name: "", slug: "", label: "", subtitle: "", backgroundColor: "",
  nameColor: "", nameFont: "", nameWeight: "",
  labelColor: "", labelFont: "", labelWeight: "",
  subtitleColor: "", subtitleFont: "", subtitleWeight: "",
};

function SortableRow({
  section,
  onEdit,
  onDelete,
}: {
  section: Section;
  onEdit: (s: Section) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
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
          <span className="text-[var(--danger)] text-xs">{t("sectionsContent.areYouSure")}</span>
          <button onClick={() => { onDelete(section.id); setConfirming(false); }} className="px-3 py-1 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">
            {t("common.delete")}
          </button>
          <button onClick={() => setConfirming(false)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">
            {t("common.cancel")}
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
  const { data: session } = useSession();
  const { t } = useTranslation();
  const isAdmin = session?.user?.isAdmin === true;
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ModalData>(emptyModal);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"content" | "style">("content");

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
    setActiveTab("content");
    setModalOpen(true);
  };

  const openEdit = (s: Section) => {
    setEditingId(s.id);
    setForm({
      name: s.name, slug: s.slug, label: s.label, subtitle: s.subtitle, backgroundColor: s.backgroundColor,
      nameColor: s.nameColor || "", nameFont: s.nameFont || "", nameWeight: s.nameWeight || "",
      labelColor: s.labelColor || "", labelFont: s.labelFont || "", labelWeight: s.labelWeight || "",
      subtitleColor: s.subtitleColor || "", subtitleFont: s.subtitleFont || "", subtitleWeight: s.subtitleWeight || "",
    });
    setSlugManual(true);
    setError("");
    setActiveTab("content");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError(t("sections.nameRequired")); return; }
    if (!form.slug.trim()) { setError(t("sections.nameRequired")); return; }
    setSaving(true);
    setError("");

    const body = {
      name: form.name,
      label: form.label || form.name,
      subtitle: form.subtitle,
      backgroundColor: form.backgroundColor,
      nameColor: form.nameColor,
      nameFont: form.nameFont,
      nameWeight: form.nameWeight,
      labelColor: form.labelColor,
      labelFont: form.labelFont,
      labelWeight: form.labelWeight,
      subtitleColor: form.subtitleColor,
      subtitleFont: form.subtitleFont,
      subtitleWeight: form.subtitleWeight,
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

  if (loading) return <div className="text-[var(--muted)] text-sm">{t("common.loading")}</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("sections.title")}</h1>
        <button
          onClick={openAdd}
          disabled={!isAdmin && sections.length >= 4}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + {t("sections.addSection")}
        </button>
      </div>
      {!isAdmin && sections.length >= 4 && (
        <p className="text-[var(--muted)] text-[10px] mb-4">{t("sections.noSections")}</p>
      )}

      {sections.length === 0 ? (
        <p className="text-[var(--muted)] text-sm text-center py-12">{t("sections.noSections")}</p>
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

      {/* Slide-in Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setModalOpen(false)}>
          <div className="absolute inset-0 bg-[var(--overlay)]" />
          <div
            className="relative bg-[var(--surface)] border-l border-[var(--border)] w-full max-w-xl h-full flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {editingId ? t("sections.editSection") : t("sections.addSection")}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] text-lg leading-none">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] px-6 shrink-0">
              {(["content", "style"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t(`sections.tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {/* ── CONTENT TAB ── */}
                {activeTab === "content" && (
                  <>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sections.sectionName")} *</label>
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
                        placeholder={t("sections.sectionNamePlaceholder")}
                      />
                      <CharLimitHint max={40} current={form.name.length} />
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
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sections.sectionLabel")}</label>
                      <input className="dash-input" maxLength={30} value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder={t("sections.sectionLabelPlaceholder")} />
                      <CharLimitHint max={30} current={form.label.length} />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">{t("sections.sectionSubtitle")}</label>
                      <input className="dash-input" maxLength={100} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder={t("sections.sectionSubtitlePlaceholder")} />
                      <CharLimitHint max={100} current={form.subtitle.length} />
                    </div>
                  </>
                )}

                {/* ── STYLE TAB ── */}
                {activeTab === "style" && (
                  <>
                    {/* Background color */}
                    <div>
                      <label className="text-xs text-[var(--muted)] mb-1 block">
                        {t("sections.bgColor")}
                        {form.backgroundColor && (
                          <button onClick={() => setForm((f) => ({ ...f, backgroundColor: "" }))} className="ml-2 text-[var(--accent)] text-xs hover:underline">{t("common.clear")}</button>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.backgroundColor || "#181818"} onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))} className="w-9 h-9 rounded border border-[var(--border)] bg-transparent cursor-pointer" />
                        <input className="dash-input" value={form.backgroundColor} onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))} placeholder="#181818 (default)" />
                      </div>
                    </div>

                    {/* Name style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sections.sectionName")}</p>
                      <TextStyleGroup
                        colorLabel={t("sections.nameColor")} colorValue={form.nameColor} onColorChange={(v) => setForm((f) => ({ ...f, nameColor: v }))}
                        fontValue={form.nameFont} onFontChange={(v) => setForm((f) => ({ ...f, nameFont: v }))}
                        weightValue={form.nameWeight} onWeightChange={(v) => setForm((f) => ({ ...f, nameWeight: v }))}
                      />
                    </div>

                    {/* Label style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sections.sectionLabel")}</p>
                      <TextStyleGroup
                        colorLabel={t("sections.labelColor")} colorValue={form.labelColor} onColorChange={(v) => setForm((f) => ({ ...f, labelColor: v }))}
                        fontValue={form.labelFont} onFontChange={(v) => setForm((f) => ({ ...f, labelFont: v }))}
                        weightValue={form.labelWeight} onWeightChange={(v) => setForm((f) => ({ ...f, labelWeight: v }))}
                      />
                    </div>

                    {/* Subtitle style */}
                    <div className="bg-[var(--background)] rounded-lg p-4 space-y-2">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{t("sections.sectionSubtitle")}</p>
                      <TextStyleGroup
                        colorLabel={t("sections.subtitleColor")} colorValue={form.subtitleColor} onColorChange={(v) => setForm((f) => ({ ...f, subtitleColor: v }))}
                        fontValue={form.subtitleFont} onFontChange={(v) => setForm((f) => ({ ...f, subtitleFont: v }))}
                        weightValue={form.subtitleWeight} onWeightChange={(v) => setForm((f) => ({ ...f, subtitleWeight: v }))}
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
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">
                  {t("common.cancel")}
                </button>
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
