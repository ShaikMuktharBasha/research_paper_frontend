import React, { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileQuestion,
  Check,
  Loader2,
  MessageSquare,
  SendHorizontal,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000';

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

    loadSavedPaper();

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
      askQuestionAboutPaper();
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
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl items-center justify-center">
        <div className="app-surface w-full rounded-[24px] p-8 text-center">
          <p className="text-sm text-soft">No result selected yet.</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">Open a paper workspace from the home page</h1>
          <Link to="/" className="primary-button mt-6 rounded-[16px]">
            Go to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-rise">
      <section className="border-b border-[var(--border)] pb-8 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-soft">Result workspace</p>
        <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight text-[var(--text-strong)] md:text-5xl md:leading-[1.08]">
          Review the paper, ask follow-up questions, and generate a recap quiz.
        </h1>
      </section>

      {isLoadingPaper ? (
        <section className="app-surface rounded-[24px] p-6">
          <p className="text-sm text-soft">Opening saved analysis...</p>
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
      ) : error ? (
        <section className="app-surface rounded-[24px] p-6">
          <div className="flex items-start gap-3 rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-4 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        </section>
      ) : result ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="app-surface flex min-h-[720px] flex-col rounded-[24px] p-6">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.16em] text-soft">Analysis complete</p>
                    <p className="truncate text-lg font-semibold text-main">{result.filename}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-soft">
                  <span>{result.stats.total_pages} pages</span>
                  <span className="text-white/20">/</span>
                  <span>{result.stats.word_count.toLocaleString()} words</span>
                  <span className="text-white/20">/</span>
                  <span>{result.stats.reading_time_minutes} min read</span>
                </div>
              </div>

              <Link to="/" className="secondary-button shrink-0 rounded-[16px]">
                Start new analysis
              </Link>
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
              <button
                type="button"
                onClick={() => void copyInsight()}
                className="secondary-button rounded-full px-4 py-2"
              >
                {copiedState === 'insight' ? <Check size={15} /> : <Copy size={15} />}
                {copiedState === 'insight' ? 'Copied' : 'Copy section'}
              </button>
            </div>

            <div className="subtle-surface mt-5 flex min-h-0 flex-1 flex-col rounded-[20px] p-5">
              <div className="shrink-0">
                <p className="text-xs uppercase tracking-[0.16em] text-soft">{activePanel.label}</p>
              </div>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap text-sm leading-8 text-main md:text-[15px]">{activePanel.body}</p>
              </div>
            </div>

            <div className="subtle-panel mt-5 rounded-[20px] p-4">
              <p className="text-sm font-medium text-main">Preferred style</p>
              <textarea
                value={analysisPreference}
                onChange={(event) => setAnalysisPreference(event.target.value)}
                placeholder="Example: Keep it concise, use simple language, and focus on the novel contribution."
                className="input-surface mt-3 min-h-[104px] resize-none rounded-[16px]"
              />
              <p className="mt-3 text-xs text-soft">Saved locally for this paper so your notes are still here when you reopen it.</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="app-surface rounded-[24px] p-5">
              <p className="text-sm font-medium text-main">Document stats</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="subtle-panel rounded-[18px] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-soft">Pages</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{result.stats.total_pages}</p>
                </div>
                <div className="subtle-panel rounded-[18px] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-soft">Words</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{result.stats.word_count.toLocaleString()}</p>
                </div>
                <div className="subtle-panel rounded-[18px] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-soft">Reading time</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-strong)]">{result.stats.reading_time_minutes} min</p>
                </div>
              </div>
            </div>

            <div ref={chatSectionRef} className="app-surface flex min-h-0 flex-col rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[var(--accent-strong)]" />
                <h3 className="text-base font-semibold text-main">Ask the paper</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-soft">
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
                className="input-surface mt-4 min-h-[120px] resize-none rounded-[16px]"
              />

              <button
                onClick={askQuestionAboutPaper}
                disabled={isAskingQuestion || !chatQuestion.trim()}
                className="primary-button mt-4 w-full rounded-[16px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAskingQuestion ? <Loader2 className="animate-spin" size={16} /> : <SendHorizontal size={16} />}
                Ask question
              </button>

              {chatAnswer ? (
                <div className="mt-4 min-h-0 flex-1 rounded-[18px] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-soft">Answer</p>
                  <div className="mt-3 max-h-full overflow-y-auto pr-1">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-main">{chatAnswer}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-sm leading-6 text-soft">
                  Ask about the paper&apos;s contribution, method, dataset, limitations, or future work.
                </div>
              )}
            </div>

            <div ref={quizSectionRef} className="app-surface flex min-h-0 flex-col rounded-[24px] p-5">
              <div className="flex items-center gap-2">
                <FileQuestion size={18} className="text-[var(--accent-strong)]" />
                <h3 className="text-base font-semibold text-main">Quick quiz</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-soft">
                Generate a compact recap quiz without pushing the rest of the workspace around.
              </p>

              <button
                onClick={loadQuiz}
                disabled={isLoadingQuiz}
                className="secondary-button mt-4 w-full rounded-[16px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingQuiz ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Generate quiz
              </button>

              {quiz ? (
                <div className="mt-4 min-h-0 flex-1 rounded-[18px] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-soft">Quiz output</p>
                  <div className="mt-3 max-h-full overflow-y-auto pr-1">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-main">{quiz}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-sm leading-6 text-soft">
                  Great for checking whether you understood the abstract, methods, and results after a quick skim.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ResultPage;
