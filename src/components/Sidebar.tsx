import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  BrainCircuit,
  FileQuestion,
  FileText,
  Home,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  Moon,
  PencilLine,
  LogOut,
  Search,
  Sparkles,
  SunMedium,
  Upload,
  UserCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

type RecentUpload = {
  doc_id: string;
  filename: string;
  uploaded_at: string;
  summary_preview?: string;
  stats: {
    total_pages: number;
    word_count: number;
    reading_time_minutes: number;
  };
};

type DashboardStats = {
  papers_decoded: number;
  words_processed: number;
  pages_indexed: number;
  reading_time_minutes: number;
  estimated_time_saved_minutes: number;
};

const formatUploadDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const truncateLabel = (value: string, max = 26) =>
  value.length > max ? `${value.slice(0, max).trim()}...` : value;

const Sidebar = () => {
  const { logout, user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [recentSearch, setRecentSearch] = useState('');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('ai-simplifier-theme');
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : true;

    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadRecentUploads = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard`);

        if (!isMounted) {
          return;
        }

        setDashboardStats(response.data.stats || null);
        setRecentUploads((response.data.recent_uploads || []).slice(0, 10));
      } catch (loadError) {
        console.error('Failed to load recent papers for sidebar', loadError);
      } finally {
        if (isMounted) {
          setIsLoadingRecent(false);
        }
      }
    };

    loadRecentUploads();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      window.localStorage.setItem('ai-simplifier-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const filteredRecentUploads = useMemo(() => {
    const query = recentSearch.trim().toLowerCase();

    if (!query) {
      return recentUploads;
    }

    return recentUploads.filter((paper) => paper.filename.toLowerCase().includes(query));
  }, [recentSearch, recentUploads]);

  const latestUpload = recentUploads[0] || null;

  const primaryItems = [
    { to: '/workspace', label: 'Workspace', icon: MessageSquarePlus, primary: true },
    { to: '/', label: 'Home', icon: Home },
    { to: '/upload', label: 'Upload PDF', icon: Upload },
  ];

  const toolItems = [
    { to: '/create-paper', label: 'Create paper', icon: PencilLine },
    { to: '/upload?tool=chat', label: 'Ask paper questions', icon: MessageSquare },
    { to: '/upload?tool=quiz', label: 'Generate a quiz', icon: FileQuestion },
  ];

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white">
              <BrainCircuit size={17} />
            </div>
            <p className="text-sm font-semibold text-white">Research Paper Workspace</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-xl p-2 text-white hover:bg-white/5"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-[260px] shrink-0 overflow-hidden transition-transform duration-300 md:sticky md:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="sidebar-surface flex h-full flex-col overflow-hidden">
          <div className="shrink-0 border-b border-white/8 px-3 pb-3 pt-4">
            <div className="flex items-center gap-3 px-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white">
                  <BrainCircuit size={16} />
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Research Paper Workspace</p>
            </div>

            {user && (
              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white">
                    <UserCircle2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/50">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2 flex flex-col gap-1">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="chat-sidebar-footer-item"
              >
                {darkMode ? <SunMedium size={17} /> : <Moon size={17} />}
                <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="chat-sidebar-footer-item"
              >
                <LogOut size={17} />
                <span>Log out</span>
              </button>
            </div>
          </div>

          <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto pb-3">
            <div className="space-y-1 px-2">
              {primaryItems.map(({ to, label, icon: Icon, primary }) => (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    ['chat-sidebar-item', primary ? 'chat-sidebar-item-primary' : '', isActive ? 'is-active' : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-5 px-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/45">Document</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {latestUpload ? truncateLabel(latestUpload.filename, 30) : 'No saved paper yet'}
                    </p>
                  </div>
                  {latestUpload ? (
                    <Link
                      to={`/workspace?docId=${latestUpload.doc_id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition-transform hover:scale-[1.02]"
                      aria-label="Open latest workspace"
                    >
                      <BrainCircuit size={18} />
                    </Link>
                  ) : (
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/30">
                      <BrainCircuit size={18} />
                    </div>
                  )}
                </div>

                {dashboardStats && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/65">
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                      <p className="text-white/35">Papers</p>
                      <p className="mt-1 text-sm font-semibold text-white">{dashboardStats.papers_decoded}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                      <p className="text-white/35">Time saved</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {dashboardStats.estimated_time_saved_minutes} min
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 px-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white">Quick tools</p>
                <Sparkles size={14} className="text-white/45" />
              </div>
            </div>

            <div className="mt-2 space-y-1 px-2">
              {toolItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    ['chat-sidebar-item', isActive ? 'is-active' : ''].filter(Boolean).join(' ')
                  }
                >
                  <Icon size={17} className="shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="mt-5 px-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white">Recents</p>
            </div>

            <div className="mt-2 px-2">
              <label className="relative block">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  value={recentSearch}
                  onChange={(event) => setRecentSearch(event.target.value)}
                  placeholder="Search uploads"
                  className="w-full rounded-xl border border-white/8 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/20"
                />
              </label>
            </div>

            <div className="mt-2 px-2">
              {isLoadingRecent ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="rounded-xl px-3 py-3">
                      <div className="h-3 w-32 rounded-full bg-white/10" />
                      <div className="mt-2 h-2 w-20 rounded-full bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : filteredRecentUploads.length ? (
                <div className="space-y-1">
                  {filteredRecentUploads.map((paper) => (
                    <Link
                      key={paper.doc_id}
                      to={`/workspace?docId=${paper.doc_id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="chat-recent-item"
                    >
                      <div className="flex items-start gap-3">
                        <FileText size={15} className="mt-0.5 shrink-0 text-white/55" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">{truncateLabel(paper.filename)}</p>
                          <p className="mt-1 text-xs text-white/45">
                            {formatUploadDate(paper.uploaded_at)} - {paper.stats.total_pages} pages
                          </p>
                          {paper.summary_preview && (
                            <p className="mt-1 truncate text-xs text-white/30">{paper.summary_preview}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : recentUploads.length ? (
                <div className="rounded-xl px-3 py-4 text-sm text-white/55">
                  No uploads match "{recentSearch.trim()}".
                </div>
              ) : (
                <div className="rounded-xl px-3 py-4 text-sm text-white/55">
                  Upload your first paper and it will appear here.
                </div>
              )}

              {dashboardStats && (
                <div className="mt-3 rounded-xl px-3 py-2 text-xs text-white/45">
                  {dashboardStats.pages_indexed} pages indexed across {dashboardStats.papers_decoded} papers
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
