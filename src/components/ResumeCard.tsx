import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  FileCheck2,
  Eye,
  EyeOff,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { ResumeData } from '../types';

interface ResumeCardProps {
  data: ResumeData | null;
  onUploadFile: (file: File) => Promise<void>;
  onPasteText: (text: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  data,
  onUploadFile,
  onPasteText,
  onDelete,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasResume = Boolean(data && (data.text || data.base64Data));

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);
      try {
        await onUploadFile(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setIsProcessing(true);
      try {
        await onUploadFile(file);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      id="card-resume-upload"
      className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Candidate Resume
            </h2>
            <p className="text-xs text-slate-500">
              {hasResume ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 inline" />
                  {data?.fileName || 'Resume loaded'} • {formatBytes(data?.fileSize)}
                </span>
              ) : (
                'Upload PDF, DOCX, or TXT resume'
              )}
            </p>
          </div>
        </div>

        {/* Delete Resume Button */}
        {hasResume && (
          <div className="flex items-center gap-1.5">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in duration-150">
                <span className="text-xs text-rose-700 font-medium px-1.5">
                  Delete resume?
                </span>
                <button
                  id="btn-confirm-delete-resume"
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowConfirmDelete(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  id="btn-cancel-delete-resume"
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="btn-delete-resume"
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50"
                title="Delete Resume"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete Resume</span>
                <span className="sm:hidden">Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="mt-3.5 flex-1 flex flex-col">
        {!hasResume ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Drag & Drop Upload Zone */}
            <div
              id="dropzone-resume"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 min-h-[220px] flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-50/60 scale-[0.99]'
                  : 'border-slate-200 bg-slate-50/50 hover:border-violet-300 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled || isProcessing}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-violet-600 border border-slate-100">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {isProcessing
                  ? 'Processing Resume...'
                  : 'Click to browse or drop your resume here'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports PDF, DOCX, TXT (up to 25MB)
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  PDF
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  DOCX
                </span>
                <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  TXT
                </span>
              </div>
            </div>

            {/* Alternative: Paste text toggle */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              {!isPasting ? (
                <button
                  id="btn-toggle-paste-resume"
                  type="button"
                  onClick={() => setIsPasting(true)}
                  className="w-full text-center text-xs font-medium text-slate-500 hover:text-indigo-600 py-1 transition-colors"
                >
                  Or click here to paste resume text directly
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    id="textarea-paste-resume"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste resume text directly here..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-violet-500 focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPasting(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-save-pasted-resume"
                      type="button"
                      onClick={() => {
                        if (manualText.trim()) {
                          onPasteText(manualText);
                          setIsPasting(false);
                          setManualText('');
                        }
                      }}
                      className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      Use Pasted Text
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Uploaded Resume Card */
          <div className="flex-1 flex flex-col justify-between">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white font-bold text-xs uppercase shadow-xs">
                    {data?.fileName.split('.').pop() || 'DOC'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {data?.fileName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatBytes(data?.fileSize)} •{' '}
                      {data?.source === 'sample' ? 'Sample Resume' : 'Uploaded'}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-toggle-resume-preview"
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>Hide Text</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-indigo-600" />
                      <span>View Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status pill */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>Ready for ATS & Interview Analysis</span>
              </div>
            </div>

            {/* Extracted Text Preview Box (Collapsible) */}
            {showPreview && (
              <div className="mt-3 flex-1 min-h-[160px] max-h-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                {data?.text ||
                  data?.extractedSnippet ||
                  '[Binary PDF document loaded - full text & layout will be parsed by Gemini AI directly]'}
              </div>
            )}

            {/* Replace or Delete shortcuts */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                id="btn-replace-resume"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload a different resume
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />

              <button
                id="btn-delete-resume-footer"
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs font-medium text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
