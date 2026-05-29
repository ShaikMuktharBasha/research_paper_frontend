import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  FileQuestion,
  Loader2,
  MessageSquare,
  SendHorizontal,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

type UploadResult = {
  doc_id: string;
  filename: string;
  uploaded_at: string;
  stats: {
    total_pages: number;
    word_count: number;
    reading_time_minutes: number;
  };
  insights: {
    summary: string;
    explanation: string;
    key_points: string;
  };
};

type ResultTab = 'summary' | 'explanation' | 'key_points';

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const docId = searchParams.get('docId');
  const selectedTool = searchParams.get('tool');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState('');
  const [isLoadingPaper, setIsLoadingPaper] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [quiz, setQuiz] = useState('');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('summary');
  const [analysisPreference, setAnalysisPreference] = useState('');
  const [copiedState, setCopiedState] = useState<'idle' | 'insight'>('idle');
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const quizSectionRef = useRef<HTMLDivElement | null>(null);
  const autoOpenedToolRef = useRef('');

  const quickQuestions = useMemo(
    () => [
      'What problem does this paper solve?',
      'What are the main limitations?',
      'How would you explain the method to a beginner?',
    ],
    [],
  );

  useEffect(() => {
    if (!docId) {
      return;
    }

    let isMounted = true;

    const loadSavedPaper = async () => {
      setIsLoadingPaper(true);
      setError('');
      setChatAnswer('');
      setChatQuestion('');
      setQuiz('');
      setActiveTab('summary');

      try {
        const response = await axios.get(`${API_BASE_URL}/api/papers/${docId}`);
        if (!isMounted) {
          return;
        }
        setResult(response.data);
      } catch (loadError: any) {
        console.error('Failed to load saved paper', loadError);
        if (isMounted) {
          setError(loadError?.response?.data?.detail || 'Could not load the saved paper.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingPaper(false);
        }
      }
    };

    void loadSavedPaper();

    return () => {
      isMounted = false;
    };
  }, [docId]);

  useEffect(() => {
    if (!docId) {
      setAnalysisPreference('');
      return;
    }

    const savedPreference = window.localStorage.getItem(`paper-preference:${docId}`) || '';
    setAnalysisPreference(savedPreference);
  }, [docId]);

  useEffect(() => {
    if (!docId) {
      return;
    }

    window.localStorage.setItem(`paper-preference:${docId}`, analysisPreference);
  }, [analysisPreference, docId]);

  const askQuestionAboutPaper = async () => {
    if (!result?.doc_id || !chatQuestion.trim()) {
      return;
    }

    setIsAskingQuestion(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        doc_id: result.doc_id,
        message: chatQuestion,
      });
      setChatAnswer(response.data.answer || '');
    } catch (askError: any) {
      console.error('Question failed', askError);
      setChatAnswer(askError?.response?.data?.detail || 'Could not generate an answer for that question.');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleQuestionKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void askQuestionAboutPaper();
    }
  };

  const loadQuiz = useCallback(async () => {
    if (!result?.doc_id) {
      return;
    }

    setIsLoadingQuiz(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/quiz/${result.doc_id}`);
      setQuiz(response.data.quiz || '');
    } catch (quizError: any) {
      console.error('Quiz failed', quizError);
      setQuiz(quizError?.response?.data?.detail || 'Could not generate a quiz right now.');
    } finally {
      setIsLoadingQuiz(false);
    }
  }, [result?.doc_id]);

  useEffect(() => {
    if (!result?.doc_id || !selectedTool) {
      return;
    }

    const toolSessionKey = `${result.doc_id}:${selectedTool}`;
    if (autoOpenedToolRef.current === toolSessionKey) {
      return;
    }

    autoOpenedToolRef.current = toolSessionKey;

    if (selectedTool === 'chat') {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        chatTextareaRef.current?.focus();
      }, 250);
      return;
    }

    if (selectedTool === 'quiz') {
      quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!quiz && !isLoadingQuiz) {
        void loadQuiz();
      }
    }
  }, [isLoadingQuiz, loadQuiz, quiz, result?.doc_id, selectedTool]);

  const resultTabs = useMemo(
    () => [
      { id: 'summary' as ResultTab, label: 'Summary', body: result?.insights.summary || '' },
      { id: 'explanation' as ResultTab, label: 'Explanation', body: result?.insights.explanation || '' },
      { id: 'key_points' as ResultTab, label: 'Key points', body: result?.insights.key_points || '' },
    ],
    [result],
  );

  const activePanel = resultTabs.find((tab) => tab.id === activeTab) || resultTabs[0];

  const copyInsight = async () => {
    if (!activePanel.body) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activePanel.body);
      setCopiedState('insight');
      window.setTimeout(() => setCopiedState('idle'), 1800);
    } catch (copyError) {
      console.error('Copy failed', copyError);
    }
  };

  if (!docId) {
    return (
      <div className="page-shell animate-rise">
        <div className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center justify-center">
          <div className="panel-card w-full p-8 text-center">
            <p className="page-kicker">No paper selected</p>
            <h1 className="mt-4 text-2xl font-semibold text-[var(--text-strong)]">Open a saved paper workspace from the home page.</h1>
            <Link to="/" className="primary-button mt-6 rounded-[18px]">
              Go to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingPaper) {
    return (
      <div className="page-shell animate-rise">
        <section className="page-hero">
          <p className="page-kicker">Paper workspace</p>
          <h1 className="page-title">Opening your saved analysis.</h1>
        </section>
        <section className="panel-card p-6">
          <p className="panel-copy">Loading summary, explanation, and study tools.</p>
          <div className="mt-5 grid gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="subtle-panel rounded-[20px] p-5">
                <div className="h-3 w-28 rounded-full bg-slate-900/10 dark:bg-white/10" />
                <div className="mt-4 space-y-2">
                  <div className="h-2 rounded-full bg-slate-900/10 dark:bg-white/10" />
                  <div className="h-2 w-11/12 rounded-full bg-slate-900/10 dark:bg-white/10" />
                  <div className="h-2 w-9/12 rounded-full bg-slate-900/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell animate-rise">
        <section className="page-hero">
          <p className="page-kicker">Paper workspace</p>
          <h1 className="page-title">This paper could not be opened right now.</h1>
        </section>
        <section className="panel-card p-6">
          <div className="flex items-start gap-3 rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </section>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="page-shell animate-rise">
      <section className="page-hero">
        <p className="page-kicker">Paper workspace</p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="page-title page-title-document">{result.filename}</h1>
            <p className="page-copy">
              Review the summary, switch between explanation modes, ask focused questions, and generate a compact recap quiz without leaving the same workspace.
            </p>
          </div>
          <Link to="/" className="secondary-button shrink-0 rounded-[18px]">
            Start new analysis
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="stat-chip">{result.stats.total_pages} pages</span>
          <span className="stat-chip">{result.stats.word_count.toLocaleString()} words</span>
          <span className="stat-chip">{result.stats.reading_time_minutes} min read</span>
        </div>
      </section>

      <section className="page-grid page-grid--workspace">
        <div className="page-grid-main panel-card flex flex-col p-6 md:p-8">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="page-kicker">Analysis complete</p>
                <p className="mt-1 text-base font-semibold text-main">Switch between the main output views below.</p>
              </div>
            </div>

            <button type="button" onClick={() => void copyInsight()} className="secondary-button rounded-full px-4 py-2">
              {copiedState === 'insight' ? <Check size={15} /> : <Copy size={15} />}
              {copiedState === 'insight' ? 'Copied' : 'Copy section'}
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {resultTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--text-strong)] text-[var(--bg)] shadow-[0_14px_30px_rgba(0,0,0,0.16)] dark:bg-white dark:text-slate-950'
                    : 'border border-[var(--border)] bg-[var(--surface-subtle)] text-soft hover:border-[var(--border-strong)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="subtle-surface mt-5 flex min-h-[420px] flex-1 flex-col rounded-[24px] p-5 md:p-6">
            <p className="page-kicker">{activePanel.label}</p>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <p className="whitespace-pre-wrap text-sm leading-8 text-main md:text-[15px]">{activePanel.body}</p>
            </div>
          </div>

          <div className="subtle-panel mt-5 rounded-[24px] p-5">
            <p className="panel-title">Preferred style</p>
            <p className="panel-copy mt-2">Keep a note for how you want this paper explained the next time you open it.</p>
            <textarea
              value={analysisPreference}
              onChange={(event) => setAnalysisPreference(event.target.value)}
              placeholder="Keep it concise, use simple language, and focus on the novel contribution."
              className="input-surface mt-4 min-h-[112px] resize-none rounded-[18px]"
            />
          </div>
        </div>

        <div className="page-grid-rail panel-stack">
          <div className="panel-card panel-card-compact p-5">
            <div className="panel-header">
              <p className="panel-title">Document snapshot</p>
              <p className="panel-copy">A quick read on the size and pace of this paper.</p>
            </div>
            <div className="mt-5 grid gap-3">
              <div className="info-row">
                <span className="info-row-index">P</span>
                <div>
                  <p className="text-sm font-semibold text-main">{result.stats.total_pages} pages</p>
                  <p className="info-row-copy">Total pages in the uploaded paper.</p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-row-index">W</span>
                <div>
                  <p className="text-sm font-semibold text-main">{result.stats.word_count.toLocaleString()} words</p>
                  <p className="info-row-copy">Approximate extracted word count.</p>
                </div>
              </div>
              <div className="info-row">
                <span className="info-row-index">R</span>
                <div>
                  <p className="text-sm font-semibold text-main">{result.stats.reading_time_minutes} min read</p>
                  <p className="info-row-copy">Estimated reading time from the extracted text.</p>
                </div>
              </div>
            </div>
          </div>

          <div ref={chatSectionRef} className="panel-card panel-card-compact p-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[var(--accent-strong)]" />
              <h3 className="panel-title">Ask the paper</h3>
            </div>
            <p className="panel-copy mt-2">
              Write one focused question. Use <span className="text-mono">Ctrl + Enter</span> to send it faster.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickQuestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatQuestion(prompt)}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-soft transition-colors hover:border-[var(--border-strong)] hover:text-main"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              ref={chatTextareaRef}
              value={chatQuestion}
              onChange={(event) => setChatQuestion(event.target.value)}
              onKeyDown={handleQuestionKeyDown}
              placeholder="What is the main contribution of this paper?"
              className="input-surface mt-4 min-h-[128px] resize-none rounded-[18px]"
            />

            <button
              onClick={() => void askQuestionAboutPaper()}
              disabled={isAskingQuestion || !chatQuestion.trim()}
              className="primary-button mt-4 w-full rounded-[18px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAskingQuestion ? <Loader2 className="animate-spin" size={16} /> : <SendHorizontal size={16} />}
              Ask question
            </button>

            {chatAnswer ? (
              <div className="subtle-surface mt-4 rounded-[20px] p-4">
                <p className="page-kicker">Answer</p>
                <div className="mt-3 max-h-[260px] overflow-y-auto pr-1">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-main">{chatAnswer}</p>
                </div>
              </div>
            ) : (
              <div className="surface-note mt-4">
                Ask about the paper&apos;s contribution, method, dataset, limitations, or future work.
              </div>
            )}
          </div>

          <div ref={quizSectionRef} className="panel-card panel-card-compact p-5">
            <div className="flex items-center gap-2">
              <FileQuestion size={18} className="text-[var(--accent-strong)]" />
              <h3 className="panel-title">Quick quiz</h3>
            </div>
            <p className="panel-copy mt-2">Generate a compact recap quiz after your first skim.</p>

            <button
              onClick={() => void loadQuiz()}
              disabled={isLoadingQuiz}
              className="secondary-button mt-4 w-full rounded-[18px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingQuiz ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Generate quiz
            </button>

            {quiz ? (
              <div className="subtle-surface mt-4 rounded-[20px] p-4">
                <p className="page-kicker">Quiz output</p>
                <div className="mt-3 max-h-[260px] overflow-y-auto pr-1">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-main">{quiz}</p>
                </div>
              </div>
            ) : (
              <div className="surface-note mt-4">
                Great for checking whether you understood the abstract, methods, and results after a quick skim.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultPage;
