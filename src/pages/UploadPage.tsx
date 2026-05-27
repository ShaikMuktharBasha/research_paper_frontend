import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle, FileText, Loader2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const uploadFlow = [
  'Extract readable text from the PDF',
  'Generate a summary, explanation, and key points',
  'Open a dedicated result workspace with Q&A and quiz tools',
];

const uploadTips = [
  'Research PDFs with selectable text usually produce the cleanest results.',
  'Saved papers keep their generated insights when reopened later.',
  'Questions and quiz output stay grounded in the uploaded document.',
];

const UploadPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTool = searchParams.get('tool');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [latestFileName, setLatestFileName] = useState('');
  const [analysisPreference, setAnalysisPreference] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) {
        return;
      }

      setError('');
      setLatestFileName(file.name);
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const nextParams = new URLSearchParams({ docId: response.data.doc_id });
        if (selectedTool) {
          nextParams.set('tool', selectedTool);
        }

        navigate(`/workspace?${nextParams.toString()}`);
      } catch (uploadError: any) {
        console.error('Upload failed', uploadError);
        setError(uploadError?.response?.data?.detail || 'Upload failed. Please try again with a readable PDF.');
      } finally {
        setIsUploading(false);
      }
    },
    [navigate, selectedTool],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-rise">
      <section className="border-b border-[var(--border)] pb-8 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-soft">Upload workspace</p>
        <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[var(--text-strong)] md:text-5xl md:leading-[1.08]">
          Upload a paper, then move into a dedicated result page.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-soft md:text-[15px]">
          Add a short instruction, choose a PDF, and we&apos;ll open a separate workspace for the finished summary, questions, and quiz.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="app-surface rounded-[24px] p-6">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
            <p className="text-base font-medium text-main">How should this paper be handled?</p>
            <p className="mt-2 text-sm leading-6 text-soft">
              Add guidance before uploading so the result page follows the style you want.
            </p>
            {selectedTool === 'chat' && (
              <p className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-soft">
                Sidebar action selected: ask questions. After upload, the result page will open and focus the Q&amp;A section.
              </p>
            )}
            {selectedTool === 'quiz' && (
              <p className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-soft">
                Sidebar action selected: generate quiz. After upload, the result page will open and focus the quiz section.
              </p>
            )}
            <textarea
              value={analysisPreference}
              onChange={(event) => setAnalysisPreference(event.target.value)}
              placeholder="Example: Summarize this for a beginner, focus on experimental results, and point out the limitations."
              className="input-surface mt-4 min-h-[112px] resize-none rounded-[18px]"
            />
          </div>

          <div
            {...getRootProps()}
            className={`mt-5 rounded-[22px] border border-dashed p-8 text-center transition-all duration-200 md:p-10 ${
              isDragActive
                ? 'border-[var(--accent)] bg-[rgba(16,163,127,0.08)] shadow-[0_18px_40px_rgba(16,163,127,0.14)]'
                : 'border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--accent)] hover:bg-[rgba(16,163,127,0.04)]'
            }`}
          >
            <input {...getInputProps()} />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              {isUploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
            </div>

            <h2 className="mt-4 text-2xl font-semibold text-[var(--text-strong)]">
              {isUploading ? 'Preparing your result page...' : 'Drop a PDF here'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-soft">
              {isUploading
                ? 'Uploading the document and opening a new workspace with the result.'
                : 'Click to browse or drag and drop. After processing, you’ll be redirected to a separate page for the paper result.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-soft">
              <span>Readable PDFs work best</span>
              <span className="text-white/20">•</span>
              <span>One file at a time</span>
              <span className="text-white/20">•</span>
              <span>Results stay saved</span>
            </div>
          </div>

          {latestFileName && (
            <div className="subtle-surface mt-4 flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm">
              <FileText size={18} className="text-soft" />
              <span className="truncate text-main">{latestFileName}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="app-surface rounded-[24px] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-strong)]">What happens next</h3>
          <div className="mt-5 space-y-3">
            {uploadFlow.map((step, index) => (
              <div key={step} className="subtle-panel rounded-[18px] px-4 py-4 text-sm leading-6 text-soft">
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[11px] font-semibold text-[var(--accent-strong)]">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-[var(--border)] pt-5">
            <p className="text-sm font-medium text-main">Best results</p>
            <div className="mt-4 space-y-3">
              {uploadTips.map((tip) => (
                <div key={tip} className="text-sm leading-6 text-soft">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UploadPage;
