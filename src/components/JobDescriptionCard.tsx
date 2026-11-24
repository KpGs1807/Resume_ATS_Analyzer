import React, { useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  Edit3,
  CheckCircle2,
  FileCode,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { JobDescriptionData } from '../types';

interface JobDescriptionCardProps {
  data: JobDescriptionData;
  onChangeText: (
    text: string,
    source?: 'typed' | 'uploaded' | 'sample',
    fileName?: string,
    fileSize?: number
  ) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const JobDescriptionCard: React.FC<JobDescriptionCardProps> = ({
  data,
  onChangeText,
  onDelete,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'upload'>('type');
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = Boolean(data.text && data.text.trim().length > 0);

  // Handle file drop or selection for Job Description
  const handleFile = async (file: File) => {
    if (!file) return;

    try {
      const isTextFile =
        file.type.includes('text') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.json');

      if (isTextFile) {
        const text = await file.text();
        onChangeText(text, 'uploaded', file.name, file.size);
      } else {
        // Fallback for doc/pdf as text extraction or reading
        const text = await file.text();
        // Even if binary or complex, read available string text or notify
        onChangeText(
          text.trim() ? text : `[Uploaded Document: ${file.name}]\nPlease ensure text is readable.`,
          'uploaded',
          file.name,
          file.size
        );
      }
    } catch (err) {
      console.error('Error reading job description file:', err);
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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      id="card-job-description"
      className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Job Description
            </h2>
            <p className="text-xs text-slate-500">
              {hasContent ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 inline" />
                  {data.wordCount} words • {data.text.length} chars
                  {data.fileName ? ` • ${data.fileName}` : ''}
                </span>
              ) : (
                'Upload a file or type / paste below'
              )}
            </p>
          </div>
        </div>

        {/* Delete Job Description Button */}
        {hasContent && (
          <div className="flex items-center gap-1.5">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in duration-150">
                <span className="text-xs text-rose-700 font-medium px-1.5">
                  Confirm delete?
                </span>
                <button
                  id="btn-confirm-delete-jd"
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowConfirmDelete(false);
                  }}
                  className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  id="btn-cancel-delete-jd"
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="btn-delete-job-description"
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50"
                title="Delete Job Description"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete Job Description</span>
                <span className="sm:hidden">Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mode Switch Tabs */}
      <div className="mt-3.5 flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <button
          id="tab-jd-type"
          type="button"
          onClick={() => setActiveTab('type')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'type'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Type or Paste
        </button>
        <button
          id="tab-jd-upload"
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === 'upload'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload Document (.txt, .md, .docx)
        </button>
      </div>

      {/* Input Body */}
      <div className="mt-3 flex-1 flex flex-col">
        {activeTab === 'upload' && (
          <div
            id="dropzone-job-description"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60'
                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.text,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs text-indigo-600 border border-slate-100">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-700">
              Click to browse or drag & drop job description file
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Supports .txt, .md, .text files
            </p>

            {data.fileName && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                <FileCheck className="h-3.5 w-3.5" />
                <span>Uploaded: {data.fileName}</span>
                {data.fileSize ? (
                  <span className="text-emerald-500 text-[10px]">
                    ({formatBytes(data.fileSize)})
                  </span>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Text Area */}
        <div className="relative flex-1 flex flex-col min-h-[260px]">
          <textarea
            id="textarea-job-description"
            value={data.text}
            onChange={(e) => onChangeText(e.target.value, 'typed')}
            disabled={disabled}
            placeholder="Paste or type the full Job Description here...&#10;&#10;e.g. Job title, required technical skills, years of experience, responsibilities, qualifications, and company background."
            className="w-full flex-1 resize-none rounded-xl border border-slate-200 p-3.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed disabled:bg-slate-50"
          />

          {hasContent && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {data.source === 'uploaded' ? 'Imported from file' : 'Manually entered'}
              </span>
              <button
                id="btn-quick-clear-jd"
                type="button"
                onClick={onDelete}
                className="text-rose-500 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear text
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
