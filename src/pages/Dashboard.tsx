import React, { ChangeEvent, useRef, useState } from 'react';
import axios from 'axios';
import { ArrowRight, Globe, ImagePlus, Loader2, PencilLine, Plus, SendHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { MainColumn, PageGrid, PageScaffold, PanelCard, PanelStack, RailColumn } from '../components/PageScaffold';

const actionChips = [
  { label: 'Summarize the paper', icon: ImagePlus },
  { label: 'Explain in simple words', icon: PencilLine },
  { label: 'Focus on key findings', icon: Globe },
];

const workspaceSteps = [
  'Choose one PDF and add a short instruction if you have one.',
  'Open a saved workspace with summary, explanation, and key points.',
  'Continue with follow-up questions or a quick recap quiz.',
];

const starterNotes = [
  'Readable PDFs with selectable text usually work best.',
  'You can skip the instruction and go straight into the workspace.',
  'Every uploaded paper stays available in the sidebar recents list.',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [analysisPreference, setAnalysisPreference] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError('');
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) {
      navigate('/workspace');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (analysisPreference.trim()) {
        window.localStorage.setItem(`paper-preference:${response.data.doc_id}`, analysisPreference.trim());
      }

      navigate(`/workspace?docId=${response.data.doc_id}`);
    } catch (uploadError: any) {
      console.error('Dashboard upload failed', uploadError);
      setError(uploadError?.response?.data?.detail || 'Could not upload that PDF. Please try another readable file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageScaffold
      kicker="Workspace home"
      title="Start with one paper and keep the rest quiet."
      description="Upload a PDF, add a short instruction if you want a certain style, and move directly into a focused paper workspace."
    >
      <PageGrid variant="dashboard">
        <MainColumn>
          <PanelCard className="p-6 md:p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap items-center gap-3">
            <span className="section-badge">New analysis</span>
            {selectedFile ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-main">
                <span className="max-w-[220px] truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-soft transition-colors hover:text-main"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <span className="text-sm text-soft">No file selected yet</span>
            )}
          </div>

          <div className="mt-6 chatgpt-composer px-4 py-4 md:px-6">
            <div className="flex items-end gap-3">
              <button
                type="button"
                aria-label="Upload file"
                onClick={handleFilePick}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-[var(--text-main)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--text-strong)]"
              >
                <Plus size={22} />
              </button>

              <div className="flex-1 text-left">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-soft">Instruction</p>
                <textarea
                  value={analysisPreference}
                  onChange={(event) => setAnalysisPreference(event.target.value)}
                  placeholder="Summarize this for a beginner, keep it concise, and focus on the results."
                  className="chatgpt-textarea min-h-[84px] resize-none py-2"
                />
              </div>

              <button
                type="button"
                onClick={startAnalysis}
                disabled={isUploading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-soft">
            Use the <span className="text-main">+</span> button to choose a PDF, then press send to open its saved workspace.
          </p>

          {error && (
            <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {actionChips.map(({ label, icon: Icon }) => (
              <button key={label} type="button" onClick={() => setAnalysisPreference(label)} className="chatgpt-chip">
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          </PanelCard>
        </MainColumn>

        <RailColumn>
          <PanelStack>
          <PanelCard compact className="p-5">
            <div className="panel-header">
              <p className="panel-title">How the workspace flows</p>
              <p className="panel-copy">A minimal handoff from upload to reading, questions, and recap.</p>
            </div>
            <div className="mt-5 space-y-3">
              {workspaceSteps.map((step, index) => (
                <div key={step} className="info-row">
                  <span className="info-row-index">{index + 1}</span>
                  <p className="info-row-copy">{step}</p>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard compact className="p-5">
            <div className="panel-header">
              <p className="panel-title">Good starting prompts</p>
              <p className="panel-copy">Keep the instruction short and outcome-focused.</p>
            </div>
            <div className="mt-5 space-y-3">
              {starterNotes.map((note) => (
                <div key={note} className="surface-note">
                  {note}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="secondary-button mt-5 w-full rounded-[18px]"
            >
              Open full upload page
              <ArrowRight size={16} />
            </button>
          </PanelCard>
          </PanelStack>
        </RailColumn>
      </PageGrid>
    </PageScaffold>
  );
};

export default Dashboard;
