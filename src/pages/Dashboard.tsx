import React, { ChangeEvent, useRef, useState } from 'react';
import axios from 'axios';
import { Globe, ImagePlus, Loader2, PencilLine, Plus, SendHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const actionChips = [
  { label: 'Summarize the paper', icon: ImagePlus },
  { label: 'Explain in simple words', icon: PencilLine },
  { label: 'Focus on key findings', icon: Globe },
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

      navigate(`/workspace?docId=${response.data.doc_id}`);
    } catch (uploadError: any) {
      console.error('Dashboard upload failed', uploadError);
      setError(uploadError?.response?.data?.detail || 'Could not upload that PDF. Please try another readable file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <section className="w-full max-w-4xl px-4 pb-12 pt-4 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-[var(--text-strong)] md:text-5xl">
          What are you working on?
        </h1>

        <div className="mx-auto mt-10 max-w-3xl">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="chatgpt-composer px-4 py-4 md:px-6">
            <div className="flex items-end gap-3">
              <button
                type="button"
                aria-label="Upload file"
                onClick={handleFilePick}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-soft transition-colors hover:bg-white/5 hover:text-white"
              >
                <Plus size={22} />
              </button>

              <div className="flex-1 text-left">
                {selectedFile && (
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs text-white">
                    <span className="max-w-[220px] truncate">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white/60 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <textarea
                  value={analysisPreference}
                  onChange={(event) => setAnalysisPreference(event.target.value)}
                  placeholder="Ask anything"
                  className="chatgpt-textarea min-h-[52px] resize-none py-3"
                />
              </div>

              <button
                type="button"
                onClick={startAnalysis}
                disabled={isUploading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-soft">
            Use the <span className="text-white">+</span> button to choose a PDF, then press send to open its workspace with your instructions.
          </div>

          {error && (
            <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actionChips.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => setAnalysisPreference(label)}
                className="chatgpt-chip"
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
