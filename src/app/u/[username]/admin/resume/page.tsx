"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FiPlus, FiTrash2, FiSave, FiDownload, FiEye, FiEyeOff } from "react-icons/fi";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";
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
  photoUrl: string;
  accentColor: string;
  showSummary: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showSkills: boolean;
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
  const { data: session } = useSession();
  const hasAccess = session?.user?.isPaid || session?.user?.isFreeAccess || session?.user?.isAdmin;
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
        photoUrl: resume.photoUrl,
        accentColor: resume.accentColor,
        showSummary: resume.showSummary,
        showExperience: resume.showExperience,
        showEducation: resume.showEducation,
        showSkills: resume.showSkills,
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
      const mL = 16;
      const mR = 16;
      let y = 18;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - mL - mR;
      const lineH = 1.45;

      // Parse accent color
      const parseHex = (hex: string): {r:number;g:number;b:number} => {
        const h = hex.replace("#","");
        if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
        return { r: 45, g: 55, b: 72 };
      };
      const accent = resume.accentColor ? parseHex(resume.accentColor) : { r: 45, g: 55, b: 72 };
      const body = { r: 33, g: 33, b: 33 };
      const muted = { r: 100, g: 100, b: 100 };
      const light = { r: 150, g: 150, b: 150 };

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - 14) { doc.addPage(); y = 18; }
      };

      const drawSectionHeading = (title: string) => {
        checkPage(16);
        y += 5;
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(accent.r, accent.g, accent.b);
        doc.text(title.toUpperCase(), mL, y);
        y += 3;
        doc.setDrawColor(accent.r, accent.g, accent.b);
        doc.setLineWidth(0.35);
        doc.line(mL, y, pageWidth - mR, y);
        y += 5;
        doc.setTextColor(body.r, body.g, body.b);
      };

      // ── Header block ──
      // If photo exists, load it
      let photoLoaded = false;
      const photoX = pageWidth - mR - 28;
      if (resume.photoUrl) {
        try {
          const resp = await fetch(resume.photoUrl);
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(blob);
          });
          doc.addImage(dataUrl, "JPEG", photoX, y - 2, 28, 28);
          photoLoaded = true;
        } catch { /* skip photo if fails */ }
      }

      const nameWidth = photoLoaded ? contentWidth - 32 : contentWidth;

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(body.r, body.g, body.b);
      doc.text(resume.fullName || "Resume", mL, y);
      y += 8;

      if (resume.jobTitle) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(accent.r, accent.g, accent.b);
        doc.text(resume.jobTitle, mL, y);
        y += 6;
      }

      const contactParts = [resume.email, resume.phone, resume.location, resume.website].filter(Boolean);
      if (contactParts.length) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(light.r, light.g, light.b);
        // Wrap contact if needed
        const cText = contactParts.join("  \u2022  ");
        const cLines = doc.splitTextToSize(cText, nameWidth);
        doc.text(cLines, mL, y);
        y += cLines.length * 4.5;
      }

      if (photoLoaded) y = Math.max(y, 44); // ensure we're past photo

      y += 2;
      doc.setDrawColor(accent.r, accent.g, accent.b);
      doc.setLineWidth(0.6);
      doc.line(mL, y, pageWidth - mR, y);
      y += 8;

      // ── Summary ──
      if (resume.showSummary && resume.summary) {
        drawSectionHeading("Professional Summary");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(body.r, body.g, body.b);
        const lines = doc.splitTextToSize(resume.summary, contentWidth);
        const lhPx = 9.5 * 0.352778 * lineH;
        checkPage(lines.length * lhPx);
        doc.text(lines, mL, y, { lineHeightFactor: lineH });
        y += lines.length * lhPx + 3;
      }

      // ── Experience ──
      if (resume.showExperience && resume.experiences.length > 0) {
        drawSectionHeading("Experience");
        resume.experiences.forEach((exp, idx) => {
          checkPage(22);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(body.r, body.g, body.b);
          doc.text(exp.position || "Position", mL, y);
          const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" \u2013 ");
          if (dateStr) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(light.r, light.g, light.b);
            doc.text(dateStr, pageWidth - mR, y, { align: "right" });
          }
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(muted.r, muted.g, muted.b);
          doc.text([exp.company, exp.location].filter(Boolean).join(" \u00B7 "), mL, y);
          y += 4.5;
          if (exp.description) {
            doc.setFontSize(9);
            doc.setTextColor(body.r, body.g, body.b);
            // Convert bullet points
            const desc = exp.description.replace(/^[-*]\s+/gm, "\u2022 ");
            const dLines = doc.splitTextToSize(desc, contentWidth - 2);
            const lhPx = 9 * 0.352778 * 1.4;
            checkPage(dLines.length * lhPx);
            doc.text(dLines, mL + 2, y, { lineHeightFactor: 1.4 });
            y += dLines.length * lhPx;
          }
          y += idx < resume.experiences.length - 1 ? 5 : 2;
        });
        y += 2;
      }

      // ── Education ──
      if (resume.showEducation && resume.educations.length > 0) {
        drawSectionHeading("Education");
        resume.educations.forEach((edu, idx) => {
          checkPage(18);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(body.r, body.g, body.b);
          doc.text([edu.degree, edu.field].filter(Boolean).join(" in ") || "Degree", mL, y);
          const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" \u2013 ");
          if (dateStr) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(light.r, light.g, light.b);
            doc.text(dateStr, pageWidth - mR, y, { align: "right" });
          }
          y += 4.5;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(muted.r, muted.g, muted.b);
          doc.text(edu.school || "", mL, y);
          y += 4.5;
          if (edu.description) {
            doc.setFontSize(9);
            doc.setTextColor(body.r, body.g, body.b);
            const dLines = doc.splitTextToSize(edu.description, contentWidth - 2);
            const lhPx = 9 * 0.352778 * 1.4;
            checkPage(dLines.length * lhPx);
            doc.text(dLines, mL + 2, y, { lineHeightFactor: 1.4 });
            y += dLines.length * lhPx;
          }
          y += idx < resume.educations.length - 1 ? 5 : 2;
        });
        y += 2;
      }

      // ── Skills ──
      if (resume.showSkills && resume.skills.length > 0) {
        drawSectionHeading("Skills");
        // Group by level
        const grouped: Record<string, string[]> = {};
        resume.skills.forEach((s) => {
          const key = s.level || "Other";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(s.name);
        });
        const hasLevels = resume.skills.some((s) => s.level);
        if (hasLevels) {
          Object.entries(grouped).forEach(([level, names]) => {
            checkPage(10);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(muted.r, muted.g, muted.b);
            doc.text(`${level}:`, mL, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(body.r, body.g, body.b);
            doc.text(names.join(" \u2022 "), mL + 18, y);
            y += 5;
          });
        } else {
          doc.setFontSize(9.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(body.r, body.g, body.b);
          const skillsText = resume.skills.map((s) => s.name).join("  \u2022  ");
          const sLines = doc.splitTextToSize(skillsText, contentWidth);
          doc.text(sLines, mL, y, { lineHeightFactor: lineH });
          y += sLines.length * (9.5 * 0.352778 * lineH);
        }
      }

      doc.save(`${resume.fullName || "resume"}.pdf`);
    } catch (e) {
      console.error(e);
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
      const { Document, Packer, Paragraph, TextRun, TabStopType } = await import("docx");
      const children: InstanceType<typeof Paragraph>[] = [];

      // Use custom accent or default professional blue-gray
      const accentHex = resume.accentColor ? resume.accentColor.replace("#", "") : "2D3748";
      const grayHex = "555555";
      const lightGray = "999999";
      const pageWidthDxa = 9360; // ~6.5 inches in twips

      const sectionHeading = (title: string) => new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 20, font: "Calibri", color: accentHex, characterSpacing: 40 })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: "single" as const, size: 6, color: accentHex, space: 4 } },
      });

      // Name
      children.push(new Paragraph({
        children: [new TextRun({ text: resume.fullName || "Resume", bold: true, size: 52, font: "Calibri" })],
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
          border: { bottom: { style: "single" as const, size: 8, color: accentHex, space: 8 } },
        }));
      }

      // Summary
      if (resume.showSummary && resume.summary) {
        children.push(sectionHeading("Professional Summary"));
        children.push(new Paragraph({
          children: [new TextRun({ text: resume.summary, size: 20, font: "Calibri" })],
          spacing: { after: 100 },
        }));
      }

      // Experience
      if (resume.showExperience && resume.experiences.length > 0) {
        children.push(sectionHeading("Experience"));
        resume.experiences.forEach((exp, idx) => {
          const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" \u2013 ");
          children.push(new Paragraph({
            children: [
              new TextRun({ text: exp.position || "Position", bold: true, size: 22, font: "Calibri" }),
              ...(dateStr ? [new TextRun({ text: `\t${dateStr}`, size: 18, color: lightGray, font: "Calibri" })] : []),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: pageWidthDxa }],
            spacing: { before: idx > 0 ? 160 : 0 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: [exp.company, exp.location].filter(Boolean).join(" \u00B7 "), size: 20, color: accentHex, font: "Calibri", italics: true })],
            spacing: { after: 40 },
          }));
          if (exp.description) {
            // Render each line as a separate paragraph for better formatting
            exp.description.split("\n").filter(Boolean).forEach((line) => {
              const isBullet = /^[-*]/.test(line.trim());
              children.push(new Paragraph({
                children: [new TextRun({ text: isBullet ? line.replace(/^[-*]\s*/, "") : line, size: 20, font: "Calibri" })],
                bullet: isBullet ? { level: 0 } : undefined,
                spacing: { after: 20 },
                indent: { left: 200 },
              }));
            });
          }
          children.push(new Paragraph({ children: [], spacing: { after: 80 } }));
        });
      }

      // Education
      if (resume.showEducation && resume.educations.length > 0) {
        children.push(sectionHeading("Education"));
        resume.educations.forEach((edu, idx) => {
          const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" \u2013 ");
          children.push(new Paragraph({
            children: [
              new TextRun({ text: [edu.degree, edu.field].filter(Boolean).join(" in ") || "Degree", bold: true, size: 22, font: "Calibri" }),
              ...(dateStr ? [new TextRun({ text: `\t${dateStr}`, size: 18, color: lightGray, font: "Calibri" })] : []),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: pageWidthDxa }],
            spacing: { before: idx > 0 ? 160 : 0 },
          }));
          children.push(new Paragraph({
            children: [new TextRun({ text: edu.school || "", size: 20, color: accentHex, font: "Calibri", italics: true })],
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
      if (resume.showSkills && resume.skills.length > 0) {
        children.push(sectionHeading("Skills"));
        const hasLevels = resume.skills.some((s) => s.level);
        if (hasLevels) {
          const grouped: Record<string, string[]> = {};
          resume.skills.forEach((s) => {
            const key = s.level || "Other";
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(s.name);
          });
          Object.entries(grouped).forEach(([level, names]) => {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: `${level}: `, bold: true, size: 20, font: "Calibri", color: grayHex }),
                new TextRun({ text: names.join(" \u2022 "), size: 20, font: "Calibri" }),
              ],
              spacing: { after: 60 },
            }));
          });
        } else {
          const skillsText = resume.skills.map((s) => s.name).join("   \u2022   ");
          children.push(new Paragraph({
            children: [new TextRun({ text: skillsText, size: 20, font: "Calibri" })],
            spacing: { after: 120 },
          }));
        }
      }

      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: "Calibri", size: 20 } },
          },
        },
        sections: [{ children }],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.fullName || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
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
    <div className="w-full">
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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">Download Resume</h2>
        {!hasAccess ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/15">
            <FiDownload size={16} className="text-[var(--muted)] flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-[var(--foreground)] font-medium">Unlock Resume Downloads</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Activate your plan to download PDF, DOCX, and JSON exports.</p>
            </div>
            <a href="/pricing" className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap">
              Get Access
            </a>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadPDF} disabled={downloading === "pdf"} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:opacity-80 disabled:opacity-50 transition-colors">
              <FiDownload size={14} />
              {downloading === "pdf" ? "Generating..." : "Download PDF"}
            </button>
            <button onClick={downloadDOCX} disabled={downloading === "docx"} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:opacity-80 disabled:opacity-50 transition-colors">
              <FiDownload size={14} />
              {downloading === "docx" ? "Generating..." : "Download DOCX"}
            </button>
            <button onClick={downloadJSON} disabled={downloading === "json"} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--border)] text-[var(--foreground)] hover:opacity-80 disabled:opacity-50 transition-colors">
              <FiDownload size={14} />
              {downloading === "json" ? "Generating..." : "Export JSON"}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Template & Display Settings */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Template & Display</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
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

          {/* Accent color */}
          <div className="mb-5">
            <label className="text-xs text-[var(--muted)] mb-2 block">Accent Color <span className="text-[var(--muted)]/60">(used in headings & downloads)</span></label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={resume.accentColor || "#2D3748"}
                onChange={(e) => update("accentColor", e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-[var(--border)] bg-transparent"
              />
              <input
                className="dash-input w-32"
                value={resume.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                placeholder="#2D3748"
              />
              {resume.accentColor && (
                <button onClick={() => update("accentColor", "")} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Section visibility toggles */}
          <div className="mb-5">
            <label className="text-xs text-[var(--muted)] mb-2 block">Show / Hide Sections</label>
            <div className="flex flex-wrap gap-2">
              {([
                ["showSummary", "Summary"],
                ["showExperience", "Experience"],
                ["showEducation", "Education"],
                ["showSkills", "Skills"],
              ] as [keyof ResumeData, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => update(key, !(resume[key] as boolean))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    resume[key]
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] line-through"
                  }`}
                >
                  {resume[key] ? <FiEye size={12} /> : <FiEyeOff size={12} />}
                  {label}
                </button>
              ))}
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 mb-4">
            {/* Photo */}
            <div>
              <ImageUpload
                label="Profile Photo"
                value={resume.photoUrl}
                onChange={(url) => update("photoUrl", url)}
                maxSizeMB={2}
                maxDimensions={{ width: 800, height: 800 }}
                acceptedFormats={["JPG", "PNG", "WEBP"]}
                folder="resume-photos"
              />
            </div>
            {/* Fields */}
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
                <label className="text-xs text-[var(--muted)] mb-1 block">Website / LinkedIn</label>
                <input className="dash-input" value={resume.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
          {resume.showSummary && (
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Professional Summary <span className="text-[var(--muted)]/60">(tip: write in first person for AI tools)</span></label>
              <textarea className="dash-input min-h-[100px]" value={resume.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Results-driven developer with X years of experience in..." />
            </div>
          )}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
