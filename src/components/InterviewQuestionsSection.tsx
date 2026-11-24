import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { InterviewQuestionItem } from '../types';

interface InterviewQuestionsSectionProps {
  questions: InterviewQuestionItem[];
}

export const InterviewQuestionsSection: React.FC<InterviewQuestionsSectionProps> = ({
  questions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Technical',
    'Scenario-Based',
    'Behavioral',
    'Job-Specific',
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory =
      selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.suggestedAnswer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopy = (q: InterviewQuestionItem) => {
    const text = `Question: ${q.question}\n\nSuggested Answer: ${q.suggestedAnswer}\n\nStrategy: ${q.whyThisQuestion}\nTip: ${q.candidateTip}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Scenario-Based':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Behavioral':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Job-Specific':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="section-interview-questions"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Tailored Interview Questions & Answers
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-tailored questions generated based on the Job Description & Resume alignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="mt-4 space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 shadow-2xs"
              >
                {/* Question Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="flex w-full items-start justify-between p-4 text-left gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${getBadgeColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                        {item.question}
                      </h4>
                    </div>
                  </div>

                  <div className="shrink-0 p-1 text-slate-400 hover:text-slate-600">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Answer Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in fade-in duration-150">
                    {/* Suggested Answer */}
                    <div className="rounded-lg bg-white p-3.5 border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span className="text-indigo-600 uppercase tracking-wider text-[11px]">
                          Model Answer
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Q&A</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {item.suggestedAnswer}
                      </p>
                    </div>

                    {/* Context & Strategy */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-indigo-50/60 p-2.5 border border-indigo-100 text-indigo-950">
                        <span className="font-bold block text-[11px] text-indigo-700 uppercase tracking-wider mb-0.5">
                          Why the interviewer asks this
                        </span>
                        <span>{item.whyThisQuestion}</span>
                      </div>
                      <div className="rounded-lg bg-amber-50/60 p-2.5 border border-amber-100 text-amber-950">
                        <span className="font-bold block text-[11px] text-amber-700 uppercase tracking-wider mb-0.5">
                          Candidate Pro-Tip
                        </span>
                        <span>{item.candidateTip}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No interview questions match your filter.
          </div>
        )}
      </div>
    </div>
  );
};
