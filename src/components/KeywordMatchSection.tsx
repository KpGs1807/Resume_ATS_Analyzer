import React, { useState } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  Lightbulb,
  Cpu,
  Layers,
  GraduationCap,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { JdKeywords, ResumeMatchAnalysis } from '../types';

interface KeywordMatchSectionProps {
  keywords: JdKeywords;
  analysis: ResumeMatchAnalysis;
}

export const KeywordMatchSection: React.FC<KeywordMatchSectionProps> = ({
  keywords,
  analysis,
}) => {
  const [subTab, setSubTab] = useState<'match' | 'jdKeywords'>('match');

  return (
    <div
      id="section-keyword-match"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
    >
      {/* Subtab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <button
            id="tab-resume-match"
            type="button"
            onClick={() => setSubTab('match')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              subTab === 'match'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Resume Match & Skill Gaps
          </button>
          <button
            id="tab-jd-extracted-keywords"
            type="button"
            onClick={() => setSubTab('jdKeywords')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              subTab === 'jdKeywords'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Extracted Job Requirements
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {analysis.matchingSkills.length} Matching Skills • {analysis.missingSkills.length} Gaps
        </div>
      </div>

      {subTab === 'match' ? (
        <div className="mt-5 space-y-6">
          {/* Strengths Summary */}
          {analysis.strengthsSummary && (
            <div className="rounded-xl bg-indigo-50/70 p-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Candidate Core Strengths
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                {analysis.strengthsSummary}
              </p>
            </div>
          )}

          {/* 2-column skills comparison: Matching vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matching Skills */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                  Matching Skills ({analysis.matchingSkills.length})
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchingSkills.length > 0 ? (
                  analysis.matchingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100/90 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-300/60"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No matching skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Skills & Missing Keywords */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white">
                    <X className="h-3 w-3" />
                  </div>
                  Missing Skills & Keywords ({analysis.missingSkills.length + analysis.missingKeywords.length})
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...analysis.missingSkills, ...analysis.missingKeywords].slice(0, 16).map(
                  (skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-100/90 px-2.5 py-1 text-xs font-medium text-rose-800 border border-rose-300/60"
                    >
                      <X className="h-3 w-3 text-rose-500" />
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Matching Experience & Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                Matching Experience & Roles
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {analysis.matchingExperience.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2.5">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Matching Qualifications & Credentials
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {analysis.matchingQualifications.map((qual, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specific Improvement Areas */}
          {analysis.improvementAreas && analysis.improvementAreas.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-3">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                Recommended Resume Enhancements
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysis.improvementAreas.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-white p-3 border border-amber-100 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-slate-900">{item.area}</div>
                    <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {item.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Extracted Job Requirements Tab */
        <div className="mt-5 space-y-5">
          {/* Experience requirement badge */}
          {keywords.experienceRequirements && (
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-700">
                Experience Level Required:
              </span>
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {keywords.experienceRequirements}
              </span>
            </div>
          )}

          {/* Technical Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-600" />
              Technical Skills Required
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {keywords.technicalSkills.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Technologies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Tools, Frameworks & Cloud
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {keywords.toolsAndTechnologies.map((item, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Key Responsibilities */}
          {keywords.keyResponsibilities && keywords.keyResponsibilities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                Key Job Responsibilities
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {keywords.keyResponsibilities.map((resp, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-100"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
