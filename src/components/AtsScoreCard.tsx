import React from 'react';
import {
  Award,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import { AtsScoreData } from '../types';

interface AtsScoreCardProps {
  data: AtsScoreData;
}

export const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ data }) => {
  const { score, matchPercentage, suitability, verdict, explanation, breakdown, topRecommendations } =
    data;

  // Determine color scheme based on score
  const getScoreTheme = (val: number) => {
    if (val >= 75) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        stroke: '#10b981',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
      };
    }
    if (val >= 55) {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        stroke: '#f59e0b',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
      };
    }
    return {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      stroke: '#ef4444',
      text: 'text-rose-700',
      bg: 'bg-rose-50',
    };
  };

  const theme = getScoreTheme(score);

  // SVG circular gauge math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      id="card-ats-score-overview"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
        {/* Left: Circular Gauge & Badge */}
        <div className="flex flex-col items-center justify-center lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <div className="relative flex items-center justify-center">
            <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 128 128">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress arc */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                {score}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                ATS Score
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold border ${theme.badge}`}
            >
              {suitability === 'High'
                ? 'High Suitability'
                : suitability === 'Moderate'
                ? 'Moderate Suitability'
                : 'Low Match'}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {matchPercentage}% Match
            </span>
          </div>
        </div>

        {/* Middle: Verdict & Explanation */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Executive Assessment
              </h3>
            </div>
            <p className="mt-1.5 text-base font-semibold text-slate-900 leading-snug">
              {verdict}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {explanation}
            </p>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Keywords</span>
                <span className="font-bold text-slate-900">
                  {breakdown.keywordMatch}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${breakdown.keywordMatch}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Skills</span>
                <span className="font-bold text-slate-900">
                  {breakdown.skillsAlignment}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all duration-700"
                  style={{ width: `${breakdown.skillsAlignment}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Experience</span>
                <span className="font-bold text-slate-900">
                  {breakdown.experienceRelevance}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all duration-700"
                  style={{ width: `${breakdown.experienceRelevance}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                <span>Credentials</span>
                <span className="font-bold text-slate-900">
                  {breakdown.educationQualifications}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${breakdown.educationQualifications}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations to Boost Score */}
      {topRecommendations && topRecommendations.length > 0 && (
        <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Key Recommendations to Boost Your ATS Score
            </h4>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
            {topRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
