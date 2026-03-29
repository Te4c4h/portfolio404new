"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: string;
}

export interface ResumeData {
  templateId: string;
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  photoUrl?: string;
  accentColor?: string;
  showSummary?: boolean;
  showExperience?: boolean;
  showEducation?: boolean;
  showSkills?: boolean;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
}

interface ResumeSectionProps {
  resume: ResumeData;
  accent: string;
  surface: string;
}

function ClassicTemplate({ resume, accent, surface }: ResumeSectionProps) {
  const a = resume.accentColor || accent;
  const showSummary = resume.showSummary !== false;
  const showExp = resume.showExperience !== false;
  const showEdu = resume.showEducation !== false;
  const showSkills = resume.showSkills !== false;
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: surface }}>
      {/* Header */}
      <div className="p-6 sm:p-8" style={{ backgroundColor: `${a}10` }}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {resume.photoUrl && (
            <Image
              src={resume.photoUrl}
              alt={resume.fullName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover shrink-0 border-2"
              style={{ borderColor: `${a}40` }}
            />
          )}
          <div className={resume.photoUrl ? "" : "text-center w-full"}>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>
              {resume.fullName}
            </h2>
            {resume.jobTitle && (
              <p className="text-sm font-medium mb-3" style={{ color: a }}>{resume.jobTitle}</p>
            )}
            <div className={`flex flex-wrap gap-3 text-xs ${resume.photoUrl ? "" : "justify-center"}`} style={{ color: "var(--text)", opacity: 0.6 }}>
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
              {resume.location && <span>{resume.location}</span>}
              {resume.website && <a href={resume.website} target="_blank" rel="noopener noreferrer" className="underline">{resume.website}</a>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        {showSummary && resume.summary && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: a }}>Summary</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.8 }}>{resume.summary}</p>
          </div>
        )}

        {showExp && resume.experiences.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: a }}>Experience</h3>
            <div className="space-y-5">
              {resume.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between mb-1 gap-3">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{exp.position}</p>
                      <p className="text-xs" style={{ color: a }}>{exp.company}{exp.location ? ` — ${exp.location}` : ""}</p>
                    </div>
                    <p className="text-xs shrink-0" style={{ color: "var(--text)", opacity: 0.5 }}>
                      {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ""}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="text-xs leading-relaxed mt-1 whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.7 }}>{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showEdu && resume.educations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: a }}>Education</h3>
            <div className="space-y-4">
              {resume.educations.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-start justify-between mb-1 gap-3">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                      <p className="text-xs" style={{ color: a }}>{edu.school}</p>
                    </div>
                    <p className="text-xs shrink-0" style={{ color: "var(--text)", opacity: 0.5 }}>
                      {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                    </p>
                  </div>
                  {edu.description && (
                    <p className="text-xs leading-relaxed mt-1 whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.7 }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showSkills && resume.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: a }}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${a}15`, color: a }}>
                  {skill.name}{skill.level ? ` · ${skill.level}` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModernTemplate({ resume, accent, surface }: ResumeSectionProps) {
  const a = resume.accentColor || accent;
  const showSummary = resume.showSummary !== false;
  const showExp = resume.showExperience !== false;
  const showEdu = resume.showEducation !== false;
  const showSkills = resume.showSkills !== false;
  return (
    <div className="rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-[220px_1fr]" style={{ backgroundColor: surface }}>
      {/* Sidebar */}
      <div className="p-6 space-y-6" style={{ backgroundColor: `${a}10` }}>
        {resume.photoUrl && (
          <Image src={resume.photoUrl} alt={resume.fullName} width={80} height={80} className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: `${a}50` }} />
        )}
        <div>
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>{resume.fullName}</h2>
          {resume.jobTitle && <p className="text-xs font-medium" style={{ color: a }}>{resume.jobTitle}</p>}
        </div>
        <div className="space-y-1.5 text-xs" style={{ color: "var(--text)", opacity: 0.7 }}>
          {resume.email && <p className="break-all">{resume.email}</p>}
          {resume.phone && <p>{resume.phone}</p>}
          {resume.location && <p>{resume.location}</p>}
          {resume.website && <a href={resume.website} target="_blank" rel="noopener noreferrer" className="underline block break-all">{resume.website}</a>}
        </div>

        {showSkills && resume.skills.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: a }}>Skills</h3>
            <div className="space-y-2">
              {resume.skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--text)" }}>{skill.name}</span>
                    {skill.level && <span style={{ color: "var(--text)", opacity: 0.5 }}>{skill.level}</span>}
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: `${a}20` }}>
                    <div className="h-full rounded-full" style={{ backgroundColor: a, width: skill.level === "Expert" ? "100%" : skill.level === "Advanced" ? "80%" : skill.level === "Intermediate" ? "60%" : "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-6 space-y-6">
        {showSummary && resume.summary && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: a }}>About</h3>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.8 }}>{resume.summary}</p>
          </div>
        )}

        {showExp && resume.experiences.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: a }}>Experience</h3>
            <div className="space-y-5 border-l-2 pl-4" style={{ borderColor: `${a}30` }}>
              {resume.experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a }} />
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{exp.position}</p>
                  <p className="text-xs mb-1" style={{ color: a }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                  <p className="text-[10px] mb-1" style={{ color: "var(--text)", opacity: 0.5 }}>{exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ""}</p>
                  {exp.description && <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.7 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {showEdu && resume.educations.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: a }}>Education</h3>
            <div className="space-y-4">
              {resume.educations.map((edu) => (
                <div key={edu.id}>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                  <p className="text-xs" style={{ color: a }}>{edu.school}</p>
                  <p className="text-[10px]" style={{ color: "var(--text)", opacity: 0.5 }}>{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</p>
                  {edu.description && <p className="text-xs leading-relaxed mt-1 whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.7 }}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalTemplate({ resume, accent }: ResumeSectionProps) {
  const a = resume.accentColor || accent;
  const showSummary = resume.showSummary !== false;
  const showExp = resume.showExperience !== false;
  const showEdu = resume.showEducation !== false;
  const showSkills = resume.showSkills !== false;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-5 mb-7">
        {resume.photoUrl && (
          <Image src={resume.photoUrl} alt={resume.fullName} width={64} height={64} className="w-16 h-16 rounded-full object-cover shrink-0 border" style={{ borderColor: `${a}40` }} />
        )}
        <div>
          <h2 className="text-2xl font-bold mb-0.5" style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}>{resume.fullName}</h2>
          {resume.jobTitle && <p className="text-sm mb-1" style={{ color: a }}>{resume.jobTitle}</p>}
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text)", opacity: 0.5 }}>
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {resume.location && <span>{resume.location}</span>}
            {resume.website && <a href={resume.website} target="_blank" rel="noopener noreferrer" className="underline">{resume.website}</a>}
          </div>
        </div>
      </div>

      {showSummary && resume.summary && (
        <p className="text-sm leading-relaxed mb-7 whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.8 }}>{resume.summary}</p>
      )}

      {showExp && resume.experiences.length > 0 && (
        <div className="mb-7">
          <div className="border-b mb-4 pb-1" style={{ borderColor: `${a}30` }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: a }}>Experience</h3>
          </div>
          <div className="space-y-4">
            {resume.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{exp.position} <span style={{ opacity: 0.5, fontWeight: 400 }}>at {exp.company}</span></p>
                  <p className="text-[10px] shrink-0" style={{ color: "var(--text)", opacity: 0.4 }}>{exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : " — Present"}</p>
                </div>
                {exp.description && <p className="text-xs leading-relaxed mt-1 whitespace-pre-line" style={{ color: "var(--text)", opacity: 0.6 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showEdu && resume.educations.length > 0 && (
        <div className="mb-7">
          <div className="border-b mb-4 pb-1" style={{ borderColor: `${a}30` }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: a }}>Education</h3>
          </div>
          <div className="space-y-3">
            {resume.educations.map((edu) => (
              <div key={edu.id} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5">
                <p className="text-sm" style={{ color: "var(--text)" }}>
                  <span className="font-semibold">{edu.degree}</span>
                  {edu.field ? `, ${edu.field}` : ""}{edu.school ? ` — ${edu.school}` : ""}
                </p>
                <p className="text-[10px] shrink-0" style={{ color: "var(--text)", opacity: 0.4 }}>{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSkills && resume.skills.length > 0 && (
        <div>
          <div className="border-b mb-4 pb-1" style={{ borderColor: `${a}30` }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: a }}>Skills</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text)", opacity: 0.7 }}>
            {resume.skills.map((s) => s.level ? `${s.name} (${s.level})` : s.name).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ResumeSection({ resume, accent, surface }: ResumeSectionProps) {
  const hasContent = resume.fullName || resume.summary || resume.experiences.length > 0 || resume.educations.length > 0 || resume.skills.length > 0;
  if (!hasContent) return null;

  return (
    <section id="resume" className="py-24 px-6" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] font-semibold mb-2"
          style={{ color: accent }}
        >
          Resume
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold mb-10"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text)" }}
        >
          My Resume
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          {resume.templateId === "modern" && <ModernTemplate resume={resume} accent={accent} surface={surface} />}
          {resume.templateId === "minimal" && <MinimalTemplate resume={resume} accent={accent} surface={surface} />}
          {(resume.templateId === "classic" || (!resume.templateId)) && <ClassicTemplate resume={resume} accent={accent} surface={surface} />}
        </motion.div>
      </div>
    </section>
  );
}
