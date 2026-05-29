import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AlertCircle, FileText, Loader2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const uploadFlow = [
  'Extract readable text from the PDF.',
  'Generate summary, explanation, and key points.',
  'Open a saved workspace with Q&A and quiz tools ready.',
];

const uploadTips = [
  'Research PDFs with selectable text usually produce the cleanest output.',
  'If you came from a sidebar tool, the workspace will open with that section in focus.',
  'Your latest uploads stay accessible from the sidebar recents list.',
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

        if (analysisPreference.trim()) {
          window.localStorage.setItem(`paper-preference:${response.data.doc_id}`, analysisPreference.trim());
        }

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
    [analysisPreference, navigate, selectedTool],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const selectedToolMessage =
    selectedTool === 'chat'
      ? 'The workspace will open and focus the paper Q&A section.'
      : selectedTool === 'quiz'
        ? 'The workspace will open and focus the quiz section.'
        : '';

  return (
    <div className="page-shell animate-rise">
      <section className="page-hero">
        <p className="page-kicker">Upload flow</p>
        <h1 className="page-title">Upload once and move into a cleaner reading workspace.</h1>
        <p className="page-copy">
          Add a quick instruction, choose a PDF, and let the app open a dedicated result page for the finished analysis.
        </p>
      </section>

      <section className="page-grid page-grid--dashboard">
        <div className="page-grid-main panel-card p-6 md:p-8">
          <div className="panel-header">
            <div className="flex flex-wrap items-center gap-3">
              <span className="section-badge">Upload paper</span>
              {latestFileName ? <span className="text-sm text-soft">{latestFileName}</span> : null}
            </div>
            <p className="panel-copy">
              Keep the instruction simple. It will be saved for this paper and shown again inside the result workspace.
            </p>
          </div>

          {selectedToolMessage ? <div className="surface-note mt-5">{selectedToolMessage}</div> : null}

          <textarea
            value={analysisPreference}
            onChange={(event) => setAnalysisPreference(event.target.value)}
            placeholder="Example: Summarize for a beginner, focus on experimental results, and call out the limitations."
            className="input-surface mt-5 min-h-[128px] resize-none rounded-[20px]"
          />

          <div
            {...getRootProps()}
            className={`mt-5 rounded-[26px] border border-dashed p-8 text-center transition-all duration-200 md:p-10 ${
              isDragActive
                ? 'border-[var(--accent)] bg-[var(--brand-soft)] shadow-[0_18px_40px_var(--accent-glow)]'
                : 'border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--accent)] hover:bg-[var(--brand-soft)]'
            }`}
          >
            <input {...getInputProps()} />

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              {isUploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[var(--text-strong)]">
              {isUploading ? 'Preparing your workspace...' : 'Drop a PDF here'}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-soft">
              {isUploading
                ? 'Uploading the document and opening the result workspace.'
                : 'Click to browse or drag and drop a single PDF. The paper will open in a dedicated workspace after processing.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="stat-chip">Readable PDFs work best</span>
              <span className="stat-chip">One file at a time</span>
              <span className="stat-chip">Saved for later</span>
            </div>
          </div>

          {latestFileName ? (
            <div className="subtle-surface mt-4 flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm">
              <FileText size={18} className="text-soft" />
              <span className="truncate text-main">{latestFileName}</span>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <div className="page-grid-rail panel-stack">
          <div className="panel-card panel-card-compact p-5">
            <div className="panel-header">
              <p className="panel-title">What happens next</p>
              <p className="panel-copy">A short, predictable flow from upload to analysis.</p>
            </div>
            <div className="mt-5 space-y-3">
              {uploadFlow.map((step, index) => (
                <div key={step} className="info-row">
                  <span className="info-row-index">{index + 1}</span>
                  <p className="info-row-copy">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card panel-card-compact p-5">
            <div className="panel-header">
              <p className="panel-title">Best results</p>
              <p className="panel-copy">A few small habits keep the output cleaner.</p>
            </div>
            <div className="mt-5 space-y-3">
              {uploadTips.map((tip) => (
                <div key={tip} className="surface-note">
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
