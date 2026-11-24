import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileText,
  FileCheck2,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Search,
  Zap,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { JobDescriptionCard } from './components/JobDescriptionCard';
import { ResumeCard } from './components/ResumeCard';
import { AtsScoreCard } from './components/AtsScoreCard';
import { KeywordMatchSection } from './components/KeywordMatchSection';
import { InterviewQuestionsSection } from './components/InterviewQuestionsSection';
import { ConfirmModal } from './components/ConfirmModal';
import { SAMPLE_JOB_DESCRIPTION, SAMPLE_RESUME_TEXT } from './sampleData';
import { JobDescriptionData, ResumeData, FullAnalysisReport } from './types';

export default function App() {
  // Job Description state
  const [jdData, setJdData] = useState<JobDescriptionData>({
    text: '',
    source: 'typed',
    wordCount: 0,
    lastUpdated: Date.now(),
  });

  // Resume state
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Analysis state
  const [report, setReport] = useState<FullAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modal state for resetting all
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Results Tab
  const [resultsTab, setResultsTab] = useState<'ats' | 'keywords' | 'questions'>('ats');

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle JD Change
  const handleJdChange = (
    text: string,
    source: 'typed' | 'uploaded' | 'sample' = 'typed',
    fileName?: string,
    fileSize?: number
  ) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setJdData({
      text,
      source,
      fileName,
      fileSize,
      wordCount: words,
      lastUpdated: Date.now(),
    });
    if (error) setError(null);
  };

  // Delete Job Description
  const handleDeleteJd = () => {
    setJdData({
      text: '',
      source: 'typed',
      wordCount: 0,
      lastUpdated: Date.now(),
    });
    setToast('Job Description has been deleted.');
    if (report) setReport(null);
  };

  // Handle Resume File Upload
  const handleResumeFileUpload = async (file: File) => {
    try {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isText =
        file.type.includes('text') ||
        file.name.toLowerCase().endsWith('.txt') ||
        file.name.toLowerCase().endsWith('.md');

      if (isPdf) {
        // Read as base64 for multimodal Gemini processing
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // strip data:...;base64,
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        setResumeData({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
          base64Data,
          source: 'uploaded',
          uploadedAt: Date.now(),
          extractedSnippet: `PDF Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        });
      } else if (isText) {
        const text = await file.text();
        setResumeData({
          text,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'text/plain',
          source: 'uploaded',
          uploadedAt: Date.now(),
          extractedSnippet: text.slice(0, 300),
        });
      } else {
        // Fallback for doc/docx/other
        const text = await file.text();
        setResumeData({
          text: text.trim() ? text : `[Document: ${file.name}]`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/octet-stream',
          source: 'uploaded',
          uploadedAt: Date.now(),
          extractedSnippet: text.slice(0, 300),
        });
      }

      setToast(`Resume "${file.name}" uploaded successfully.`);
      if (error) setError(null);
    } catch (err) {
      console.error('Resume upload error:', err);
      setError('Failed to process resume file. Please try a different format.');
    }
  };

  // Handle Pasted Resume
  const handlePasteResume = (text: string) => {
    setResumeData({
      text,
      fileName: 'Pasted_Resume.txt',
      fileSize: new Blob([text]).size,
      fileType: 'text/plain',
      source: 'pasted',
      uploadedAt: Date.now(),
      extractedSnippet: text.slice(0, 300),
    });
    setToast('Pasted resume text loaded.');
    if (error) setError(null);
  };

  // Delete Resume
  const handleDeleteResume = () => {
    setResumeData(null);
    setToast('Resume has been deleted.');
    if (report) setReport(null);
  };

  // Load Sample Data
  const handleLoadSample = () => {
    handleJdChange(SAMPLE_JOB_DESCRIPTION, 'sample');
    setResumeData({
      text: SAMPLE_RESUME_TEXT,
      fileName: 'Alex_Morgan_Senior_Engineer_Resume.txt',
      fileSize: new Blob([SAMPLE_RESUME_TEXT]).size,
      fileType: 'text/plain',
      source: 'sample',
      uploadedAt: Date.now(),
      extractedSnippet: SAMPLE_RESUME_TEXT.slice(0, 350),
    });
    setToast('Sample Job Description and Resume loaded!');
    if (error) setError(null);
  };

  // Reset All
  const handleResetAll = () => {
    setJdData({
      text: '',
      source: 'typed',
      wordCount: 0,
      lastUpdated: Date.now(),
    });
    setResumeData(null);
    setReport(null);
    setError(null);
    setShowResetModal(false);
    setToast('All job description and resume data has been deleted.');
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!jdData.text.trim()) {
      setError('Please provide a Job Description (type or upload) first.');
      return;
    }
    if (!resumeData || (!resumeData.text && !resumeData.base64Data)) {
      setError('Please upload or paste a Resume first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('Task 1/4: Extracting Job Description keywords & requirements...');

    // Progress step animations
    const step2Timer = setTimeout(() => {
      setAnalysisStep('Task 2/4: Comparing resume qualifications against requirements...');
    }, 2200);

    const step3Timer = setTimeout(() => {
      setAnalysisStep('Task 3/4: Calculating ATS match score & suitability index...');
    }, 4500);

    const step4Timer = setTimeout(() => {
      setAnalysisStep('Task 4/4: Generating tailored interview questions & model answers...');
    }, 6800);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescriptionText: jdData.text,
          resumeText: resumeData.text,
          resumeBase64: resumeData.base64Data,
          resumeMimeType: resumeData.fileType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Analysis failed. Please try again.');
      }

      setReport(data.report);
      setToast('Analysis complete! Check your ATS score and interview questions below.');

      // Trigger celebratory confetti if score is >= 70
      if (data.report?.atsScore?.score >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: unknown) {
      console.error('Error during analysis:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred during analysis.';
      setError(msg);
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Export Report as Markdown
  const handleExportReport = () => {
    if (!report) return;

    const content = `# Resume & Job Description Analysis Report
Generated: ${new Date(report.generatedAt).toLocaleString()}

## 1. ATS Score Summary
- Overall ATS Score: ${report.atsScore.score} / 100
- Match Percentage: ${report.atsScore.matchPercentage}%
- Suitability Verdict: ${report.atsScore.suitability} Suitability
- Executive Assessment: ${report.atsScore.verdict}
- Explanation: ${report.atsScore.explanation}

### Score Factor Breakdown:
- Keyword Match: ${report.atsScore.breakdown.keywordMatch}%
- Skills Alignment: ${report.atsScore.breakdown.skillsAlignment}%
- Experience Relevance: ${report.atsScore.breakdown.experienceRelevance}%
- Credentials & Education: ${report.atsScore.breakdown.educationQualifications}%

### Recommendations to Boost Score:
${report.atsScore.topRecommendations.map((r) => `- ${r}`).join('\n')}

---

## 2. Resume Match & Gaps
### Matching Skills:
${report.resumeAnalysis.matchingSkills.map((s) => `- ${s}`).join('\n')}

### Missing Keywords / Skills:
${[...report.resumeAnalysis.missingSkills, ...report.resumeAnalysis.missingKeywords]
  .map((s) => `- ${s}`)
  .join('\n')}

### Candidate Strengths:
${report.resumeAnalysis.strengthsSummary}

### Recommended Enhancements:
${report.resumeAnalysis.improvementAreas.map((a) => `- **${a.area}**: ${a.suggestion}`).join('\n')}

---

## 3. Extracted Job Requirements
- Experience Required: ${report.jobKeywords.experienceRequirements}
- Technical Skills: ${report.jobKeywords.technicalSkills.join(', ')}
- Tools & Technologies: ${report.jobKeywords.toolsAndTechnologies.join(', ')}

---

## 4. Curated Interview Questions
${report.interviewQuestions
  .map(
    (q, i) => `### ${i + 1}. [${q.category}] ${q.question}
**Suggested Answer:**
${q.suggestedAnswer}

*Interviewer Strategy:* ${q.whyThisQuestion}
*Candidate Tip:* ${q.candidateTip}
`
  )
  .join('\n---\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume_analysis_report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast('Analysis report downloaded.');
  };

  const hasContent = Boolean(jdData.text.trim() || resumeData);
  const isReadyToAnalyze = Boolean(jdData.text.trim() && resumeData);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onLoadSample={handleLoadSample}
        onClearAll={() => setShowResetModal(true)}
        hasContent={hasContent}
        isAnalyzing={isAnalyzing}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom-5 duration-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Intro Banner */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Dual Input & Deletion Controls
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Match Your Resume with Job Requirements
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Upload or type your job description and resume. Each card features an instant{' '}
                <strong className="text-slate-800 font-semibold">Delete</strong> option so you can
                clear or swap files anytime. Then run the multi-agent AI analysis to get ATS scoring,
                keyword gap analysis, and tailored interview prep.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                  jdData.text.trim()
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Job Description: {jdData.text.trim() ? 'Ready' : 'Empty'}</span>
              </div>

              <div
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border ${
                  resumeData
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>Resume: {resumeData ? 'Ready' : 'Empty'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            id="alert-error-banner"
            className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm text-rose-800 shadow-2xs"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Notice</span>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Cards Grid: Job Description & Resume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Job Description (Upload or Type + Delete Option) */}
          <JobDescriptionCard
            data={jdData}
            onChangeText={handleJdChange}
            onDelete={handleDeleteJd}
            disabled={isAnalyzing}
          />

          {/* Card 2: Candidate Resume (Upload File or Paste + Delete Option) */}
          <ResumeCard
            data={resumeData}
            onUploadFile={handleResumeFileUpload}
            onPasteText={handlePasteResume}
            onDelete={handleDeleteResume}
            disabled={isAnalyzing}
          />
        </div>

        {/* Action Trigger Bar */}
        <div
          id="action-bar-analyze"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs"
        >
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              Ready for Multi-Agent AI Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isReadyToAnalyze
                ? 'Both Job Description and Resume are ready. Click below to start.'
                : 'Please add both a Job Description and a Resume to begin.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {report && (
              <button
                id="btn-export-report"
                type="button"
                onClick={handleExportReport}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                title="Download full analysis report as Markdown"
              >
                <Download className="h-4 w-4 text-slate-600" />
                <span>Export Report</span>
              </button>
            )}

            <button
              id="btn-start-analysis"
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !isReadyToAnalyze}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all ${
                isReadyToAnalyze && !isAnalyzing
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg active:scale-[0.98]'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>{report ? 'Re-Analyze Match' : 'Analyze Resume & Job Description'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Analysis Progress Banner */}
        {isAnalyzing && (
          <div
            id="analysis-progress-indicator"
            className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 text-center animate-in fade-in duration-300"
          >
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
              <span className="text-sm font-bold text-indigo-900">{analysisStep}</span>
            </div>
            <p className="mt-2 text-xs text-indigo-700/80">
              Running multi-agent extraction, keyword matching, ATS scoring, and generating targeted
              interview questions...
            </p>
          </div>
        )}

        {/* Results Section */}
        {report && (
          <div ref={resultsRef} id="analysis-results-section" className="space-y-6 pt-4">
            {/* Top ATS Score Summary Card */}
            <AtsScoreCard data={report.atsScore} />

            {/* Navigation Tabs for Deep Dive */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                id="tab-results-ats"
                type="button"
                onClick={() => setResultsTab('ats')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  resultsTab === 'ats'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Skill Match & Gaps</span>
              </button>
              <button
                id="tab-results-questions"
                type="button"
                onClick={() => setResultsTab('questions')}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  resultsTab === 'questions'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Interview Questions ({report.interviewQuestions.length})</span>
              </button>
            </div>

            {/* Tab Views */}
            {resultsTab === 'ats' && (
              <KeywordMatchSection
                keywords={report.jobKeywords}
                analysis={report.resumeAnalysis}
              />
            )}

            {resultsTab === 'questions' && (
              <InterviewQuestionsSection questions={report.interviewQuestions} />
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Reset All */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Delete Job Description and Resume?"
        message="This action will clear both the uploaded/typed Job Description, your Resume file, and any generated ATS analysis results. You can always reload or paste new content."
        confirmText="Yes, Delete All"
        confirmVariant="danger"
        onConfirm={handleResetAll}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Resume & Job Description Analyzer • Gemini 3.8 Flash</span>
          <span>Upload or type job descriptions & resumes with full deletion control</span>
        </div>
      </footer>
    </div>
  );
}
