"use client";

import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiTrash2, FiSave, FiDownload } from "react-icons/fi";
import Toast from "@/components/Toast";
// jsPDF and docx are dynamically imported at use-time to reduce initial bundle

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  order: number;
}

interface Skill {
  id: string;
  name: string;
  level: string;
  order: number;
}

interface ResumeData {
  id: string;
  templateId: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  showOnPortfolio: boolean;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
}

const templates = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export default function ResumePage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Resume saved!");
  const [downloading, setDownloading] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/resume");
      if (r.ok) {
        setResume(await r.json());
      } else {
        const err = await r.text();
        console.error("Resume load failed:", r.status, err);
        setError(`Failed to load resume (${r.status})`);
      }
    } catch (e) {
      console.error("Resume fetch error:", e);
      setError("Network error loading resume");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveInfo = async () => {
    if (!resume) return;
    setSaving(true);
    await fetch("/api/resume", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: resume.templateId,
        fullName: resume.fullName,
        jobTitle: resume.jobTitle,
        email: resume.email,
        phone: resume.phone,
        location: resume.location,
        website: resume.website,
        summary: resume.summary,
        showOnPortfolio: resume.showOnPortfolio,
      }),
    });
    setSaving(false);
    setToastMsg("Resume saved!");
    setToast(true);
  };

  const hasContent = resume && (
    resume.fullName.trim() ||
    resume.experiences.length > 0 ||
    resume.educations.length > 0 ||
    resume.skills.length > 0
  );

  const downloadJSON = () => {
    if (!resume || !hasContent) {
      setToastMsg("Resume data incomplete — please fill in at least one section");
      setToast(true);
      return;
    }
    setDownloading("json");
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.fullName || "resume"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(null);
  };

  const downloadPDF = async () => {
    if (!resume || !hasContent) {
      setToastMsg("Resume data incomplete — please fill in at least one section");
      setToast(true);
      return;
    }
    setDownloading("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ format: "a4" });
      const margin = 45 * 0.352778; // ~16mm ≈ 45px
      const marginL = margin + 2;
      const marginR = margin + 2;
      let y = margin + 4;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - marginL - marginR;
      const lineH = 1.5; // line height multiplier

      // Professional dark blue-gray accent
      const accent = { r: 45, g: 55, b: 72 };
      const body = { r: 33, g: 33, b: 33 };
      const muted = { r: 110, g: 110, b: 110 };
      const light = { r: 150, g: 150, b: 150 };

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin + 4;
        }
      };

      const drawSectionHeading = (title: string) => {
        checkPage(18);
        y += 4;
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accent.r, accent.g, accent.b);
        // Letter-spaced uppercase
        const spaced = title.toUpperCase().split("").join(" ");
        doc.text(spaced, marginL, y);
        y += 2.5;
        doc.setDrawColor(accent.r, accent.g, accent.b);
        doc.setLineWidth(0.4);
        doc.line(marginL, y, pageWidth - marginR, y);
        y += 6;
        doc.setTextColor(body.r, body.g, body.b);
      };

      // ── Full Name ──
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(body.r, body.g, body.b);
      doc.text(resume.fullName || "Resume", marginL, y);
      y += 9;

      // ── Job Title ──
      if (resume.jobTitle) {
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(muted.r, muted.g, muted.b);
        doc.text(resume.jobTitle, marginL, y);
        y += 7;
      }

      // ── Contact Row ──
      const contactParts = [resume.email, resume.phone, resume.location, resume.website].filter(Boolean);
      if (contactParts.length) {
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(light.r, light.g, light.b);
        doc.text(contactParts.join("   \u2022   "), marginL, y);
        y += 5;
      }

      // ── Accent-colored header rule ──
      y += 1;
      doc.setDrawColor(accent.r, accent.g, accent.b);
      doc.setLineWidth(0.8);
      doc.line(marginL, y, pageWidth - marginR, y);
      y += 8;

      // ── Professional Summary ──
      if (resume.summary) {
        drawSectionHeading("Professional Summary");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(body.r, body.g, body.b);
        const lines = doc.splitTextToSize(resume.summary, maxWidth);
        const lh = 10 * 0.352778 * lineH;
        checkPage(lines.length * lh);
        doc.text(lines, marginL, y, { lineHeightFactor: lineH });
        y += lines.length * lh + 4;
      }

      // ── Experience ──
      if (resume.experiences.length > 0) {
        drawSectionHeading("Experience");
        resume.experiences.forEach((exp, idx) => {
          checkPage(24);
          // Position + date on same line
          doc.setFontSize(10.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(body.r, body.g, body.b);
          doc.text(exp.position || "Position", marginL, y);
          const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" \u2013 ");
          if (dateStr) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(light.r, light.g, light.b);
            doc.text(dateStr, pageWidth - marginR, y, { align: "right" });
          }
          y += 4.5;
          // Company · Location
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(muted.r, muted.g, muted.b);
          doc.text([exp.company, exp.location].filter(Boolean).join(" \u00B7 "), marginL, y);
          y += 5;
          // Description
          doc.setTextColor(body.r, body.g, body.b);
          if (exp.description) {
            doc.setFontSize(9.5);
            const indent = marginL + 2;
            const descWidth = maxWidth - 2;
            const descLines = doc.splitTextToSize(exp.description, descWidth);
            const lh = 9.5 * 0.352778 * 1.4;
            checkPage(descLines.length * lh);
            doc.text(descLines, indent, y, { lineHeightFactor: 1.4 });
            y += descLines.length * lh;
          }
          y += idx < resume.experiences.length - 1 ? 5 : 2;
        });
        y += 2;
      }

      // ── Education ──
      if (resume.educations.length > 0) {
        drawSectionHeading("Education");
        resume.educations.forEach((edu, idx) => {
          checkPage(20);
          // Degree + date on same line
          doc.setFontSize(10.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(body.r, body.g, body.b);
          doc.text([edu.degree, edu.field].filter(Boolean).join(" in ") || "Degree", marginL, y);
          const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" \u2013 ");
          if (dateStr) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(light.r, light.g, light.b);
            doc.text(dateStr, pageWidth - marginR, y, { align: "right" });
          }
          y += 4.5;
          // School
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(muted.r, muted.g, muted.b);
          doc.text(edu.school || "", marginL, y);
          y += 5;
          // Description
          doc.setTextColor(body.r, body.g, body.b);
          if (edu.description) {
            doc.setFontSize(9.5);
            const indent = marginL + 2;
            const descWidth = maxWidth - 2;
            const descLines = doc.splitTextToSize(edu.description, descWidth);
            const lh = 9.5 * 0.352778 * 1.4;
            checkPage(descLines.length * lh);
            doc.text(descLines, indent, y, { lineHeightFactor: 1.4 });
            y += descLines.length * lh;
          }
          y += idx < resume.educations.length - 1 ? 5 : 2;
        });
        y += 2;
      }

      // ── Skills ──
      if (resume.skills.length > 0) {
        drawSectionHeading("Skills");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(body.r, body.g, body.b);
        const skillsText = resume.skills.map((s) => s.level ? `${s.name} (${s.level})` : s.name).join("   \u2022   ");
        const skillLines = doc.splitTextToSize(skillsText, maxWidth);
        const lh = 10 * 0.352778 * lineH;
        checkPage(skillLines.length * lh);
        doc.text(skillLines, marginL, y, { lineHeightFactor: lineH });
      }

      doc.save(`${resume.fullName || "resume"}.pdf`);
    } catch {
      setToastMsg("Failed to generate PDF");
      setToast(true);
    }
    setDownloading(null);
  };

  const downloadDOCX = async () => {
    if (!resume || !hasContent) {
      setToastMsg("Resume data incomplete — please fill in at least one section");
      setToast(true);
      return;
    }
    setDownloading("docx");
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const children: InstanceType<typeof Paragraph>[] = [];
      const accentHex = "2D3748"; // professional dark blue-gray
      const grayHex = "666666";
      const lightGray = "999999";

      const sectionHeading = (title: string) => new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, font: "Calibri", color: accentHex })],
        spacing: { before: 280, after: 80 },
        border: { bottom: { style: "single" as const, size: 6, color: accentHex, space: 4 } },
      });

      // Name
      children.push(new Paragraph({
        children: [new TextRun({ text: resume.fullName || "Resume", bold: true, size: 48, font: "Calibri" })],
        spacing: { after: 40 },
      }));

      // Job Title
      if (resume.jobTitle) {
        children.push(new Paragraph({
          children: [new TextRun({ text: resume.jobTitle, size: 26, color: accentHex, font: "Calibri" })],
          spacing: { after: 60 },
        }));
      }

      // Contact
      const contact = [resume.email, resume.phone, resume.location, resume.website].filter(Boolean).join("   \u2022   ");
      if (contact) {
        children.push(new Paragraph({
          children: [new TextRun({ text: contact, size: 18, color: lightGray, font: "Calibri" })],
          spacing: { after: 120 },
          border: { bottom: { style: "single" as const, size: 2, color: "CCCCCC", space: 8 } },
        }));
      }

      // Summary
      if (resume.summary) {
        children.push(sectionHeading("Professional Summary"));
        children.push(new Paragraph({
          children: [new TextRun({ text: resume.summary, size: 20, font: "Calibri" })],
          spacing: { after: 120 },
        }));
      }

      // Experience
      if (resume.experiences.length > 0) {
        children.push(sectionHeading("Experience"));
        resume.experiences.forEach((exp, idx) => {
          const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" \u2013 ");
          children.push(new Paragraph({
            children: [
              new TextRun({ text: exp.position || "Position", bold: true, size: 22, font: "Calibri" }),
              ...(dateStr ? [new TextRun({ text: `\t${dateStr}`, size: 18, color: lightGray, font: "Calibri" })] : []),
            ],
            spacing: { before: idx > 0 ? 160 : 0 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: [exp.company, exp.location].filter(Boolean).join(" \u00B7 "), size: 20, color: grayHex, font: "Calibri" })],
            spacing: { after: 40 },
          }));
          if (exp.description) {
            children.push(new Paragraph({
              children: [new TextRun({ text: exp.description, size: 20, font: "Calibri" })],
              spacing: { after: 80 },
            }));
          }
        });
      }

      // Education
      if (resume.educations.length > 0) {
        children.push(sectionHeading("Education"));
        resume.educations.forEach((edu, idx) => {
          const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" \u2013 ");
          children.push(new Paragraph({
            children: [
              new TextRun({ text: [edu.degree, edu.field].filter(Boolean).join(" in ") || "Degree", bold: true, size: 22, font: "Calibri" }),
              ...(dateStr ? [new TextRun({ text: `\t${dateStr}`, size: 18, color: lightGray, font: "Calibri" })] : []),
            ],
            spacing: { before: idx > 0 ? 160 : 0 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: edu.school || "", size: 20, color: grayHex, font: "Calibri" })],
            spacing: { after: 40 },
          }));
          if (edu.description) {
            children.push(new Paragraph({
              children: [new TextRun({ text: edu.description, size: 20, font: "Calibri" })],
              spacing: { after: 80 },
            }));
          }
        });
      }

      // Skills
      if (resume.skills.length > 0) {
        children.push(sectionHeading("Skills"));
        const skillsText = resume.skills.map((s) => s.level ? `${s.name} (${s.level})` : s.name).join("   \u2022   ");
        children.push(new Paragraph({
          children: [new TextRun({ text: skillsText, size: 20, font: "Calibri" })],
          spacing: { after: 120 },
        }));
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.fullName || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setToastMsg("Failed to generate DOCX");
      setToast(true);
    }
    setDownloading(null);
  };

  const addExperience = async () => {
    const r = await fetch("/api/resume/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (r.ok) load();
  };

  const updateExperience = async (id: string, data: Partial<Experience>) => {
    await fetch(`/api/resume/experience/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteExperience = async (id: string) => {
    await fetch(`/api/resume/experience/${id}`, { method: "DELETE" });
    load();
  };

  const addEducation = async () => {
    const r = await fetch("/api/resume/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (r.ok) load();
  };

  const updateEducation = async (id: string, data: Partial<Education>) => {
    await fetch(`/api/resume/education/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteEducation = async (id: string) => {
    await fetch(`/api/resume/education/${id}`, { method: "DELETE" });
    load();
  };

  const addSkill = async () => {
    const r = await fetch("/api/resume/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (r.ok) load();
  };

  const updateSkill = async (id: string, data: Partial<Skill>) => {
    await fetch(`/api/resume/skills/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  const deleteSkill = async (id: string) => {
    await fetch(`/api/resume/skills/${id}`, { method: "DELETE" });
    load();
  };

  const update = (key: keyof ResumeData, value: string | boolean) => {
    setResume((r) => r ? { ...r, [key]: value } : r);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;
  if (!resume) return <div className="text-[var(--muted)] text-sm">{error || "Could not load resume."}</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Resume Builder</h1>
        <button
          onClick={saveInfo}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          <FiSave size={14} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Download Resume */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-8">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Download Resume</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadPDF}
            disabled={downloading === "pdf"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50 transition-colors"
          >
            <FiDownload size={14} />
            {downloading === "pdf" ? "Generating..." : "PDF"}
          </button>
          <button
            onClick={downloadDOCX}
            disabled={downloading === "docx"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50 transition-colors"
          >
            <FiDownload size={14} />
            {downloading === "docx" ? "Generating..." : "DOCX"}
          </button>
          <button
            onClick={downloadJSON}
            disabled={downloading === "json"}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50 transition-colors"
          >
            <FiDownload size={14} />
            {downloading === "json" ? "Generating..." : "JSON"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Template & Settings */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Template & Settings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => update("templateId", t.id)}
                className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                  resume.templateId === t.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]/80 cursor-pointer">
            <input
              type="checkbox"
              checked={resume.showOnPortfolio}
              onChange={(e) => update("showOnPortfolio", e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border)] accent-[var(--accent)]"
            />
            Show resume on public portfolio
          </label>
        </div>

        {/* Personal Info */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Full Name</label>
              <input className="dash-input" value={resume.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Job Title</label>
              <input className="dash-input" value={resume.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="Full Stack Developer" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Email</label>
              <input className="dash-input" value={resume.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Phone</label>
              <input className="dash-input" value={resume.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 123 4567" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Location</label>
              <input className="dash-input" value={resume.location} onChange={(e) => update("location", e.target.value)} placeholder="New York, NY" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Website</label>
              <input className="dash-input" value={resume.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-[var(--muted)] mb-1 block">Professional Summary</label>
            <textarea className="dash-input min-h-[100px]" value={resume.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Brief professional summary..." />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Experience</h2>
            <button onClick={addExperience} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]">
              <FiPlus size={12} /> Add
            </button>
          </div>
          {resume.experiences.length === 0 && (
            <p className="text-[var(--muted-foreground)] text-sm text-center py-4">No experience entries yet.</p>
          )}
          <div className="space-y-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id} className="border border-[var(--border)] rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <input className="dash-input" defaultValue={exp.position} onBlur={(e) => updateExperience(exp.id, { position: e.target.value })} placeholder="Position" />
                    <input className="dash-input" defaultValue={exp.company} onBlur={(e) => updateExperience(exp.id, { company: e.target.value })} placeholder="Company" />
                  </div>
                  <button onClick={() => deleteExperience(exp.id)} className="ml-2 p-1.5 text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input className="dash-input" defaultValue={exp.location} onBlur={(e) => updateExperience(exp.id, { location: e.target.value })} placeholder="Location" />
                  <input className="dash-input" defaultValue={exp.startDate} onBlur={(e) => updateExperience(exp.id, { startDate: e.target.value })} placeholder="Start (e.g. Jan 2022)" />
                  <input className="dash-input" defaultValue={exp.endDate} onBlur={(e) => updateExperience(exp.id, { endDate: e.target.value })} placeholder="End (or Present)" />
                </div>
                <textarea className="dash-input min-h-[60px] text-xs" defaultValue={exp.description} onBlur={(e) => updateExperience(exp.id, { description: e.target.value })} placeholder="Description of responsibilities and achievements..." />
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Education</h2>
            <button onClick={addEducation} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]">
              <FiPlus size={12} /> Add
            </button>
          </div>
          {resume.educations.length === 0 && (
            <p className="text-[var(--muted-foreground)] text-sm text-center py-4">No education entries yet.</p>
          )}
          <div className="space-y-4">
            {resume.educations.map((edu) => (
              <div key={edu.id} className="border border-[var(--border)] rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <input className="dash-input" defaultValue={edu.school} onBlur={(e) => updateEducation(edu.id, { school: e.target.value })} placeholder="School / University" />
                    <input className="dash-input" defaultValue={edu.degree} onBlur={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="Degree" />
                  </div>
                  <button onClick={() => deleteEducation(edu.id)} className="ml-2 p-1.5 text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input className="dash-input" defaultValue={edu.field} onBlur={(e) => updateEducation(edu.id, { field: e.target.value })} placeholder="Field of Study" />
                  <input className="dash-input" defaultValue={edu.startDate} onBlur={(e) => updateEducation(edu.id, { startDate: e.target.value })} placeholder="Start" />
                  <input className="dash-input" defaultValue={edu.endDate} onBlur={(e) => updateEducation(edu.id, { endDate: e.target.value })} placeholder="End" />
                </div>
                <textarea className="dash-input min-h-[60px] text-xs" defaultValue={edu.description} onBlur={(e) => updateEducation(edu.id, { description: e.target.value })} placeholder="Additional details..." />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Skills</h2>
            <button onClick={addSkill} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]">
              <FiPlus size={12} /> Add
            </button>
          </div>
          {resume.skills.length === 0 && (
            <p className="text-[var(--muted-foreground)] text-sm text-center py-4">No skills added yet.</p>
          )}
          <div className="space-y-2">
            {resume.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <input className="dash-input flex-1" defaultValue={skill.name} onBlur={(e) => updateSkill(skill.id, { name: e.target.value })} placeholder="Skill name" />
                <select className="dash-input w-32" defaultValue={skill.level} onChange={(e) => updateSkill(skill.id, { level: e.target.value })}>
                  <option value="">Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button onClick={() => deleteSkill(skill.id)} className="p-1.5 text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
