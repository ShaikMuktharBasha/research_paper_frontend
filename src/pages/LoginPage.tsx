import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, FolderKanban, Loader2, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';

const loginNotes = [
  'Open saved uploads, summaries, and quizzes from one place.',
  'Keep your research-paper builder and workspace behind a simple account.',
  'Return to the same desk without reconfiguring your flow every time.',
];

const loginHighlights = [
  {
    title: 'Pick up where you stopped',
    description: 'Open your saved papers, generated summaries, and active workspace without rebuilding context.',
    icon: FolderKanban,
  },
  {
    title: 'Private by default',
    description: 'Your research flow stays behind a simple account so the workspace feels personal and organized.',
    icon: ShieldCheck,
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Could not log in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      kicker="Secure access"
      title="Log in and return to your research desk."
      description="Keep uploads, paper workspaces, and export tools in one minimal place without extra setup each time."
      notes={loginNotes}
    >
      <section className="panel-card rounded-[32px] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-strong)]">Welcome back</h2>
              <p className="mt-1 text-sm text-soft">Sign in to reopen your workspace with everything in place.</p>
            </div>
          </div>

          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--accent-strong)] md:inline-flex">
            <Sparkles size={14} className="mr-2" />
            Personal workspace
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-soft">Return flow</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">Saved papers and results</p>
            <p className="mt-2 text-sm leading-7 text-soft">Jump back into uploads, generated answers, and paper building without starting again.</p>
          </div>
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-soft">Session</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">Fast, clean access</p>
            <p className="mt-2 text-sm leading-7 text-soft">A simple sign-in keeps the desk organized and ready for your next research session.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-main">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="input-surface mt-2"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-main">Password</label>
              <span className="text-xs uppercase tracking-[0.16em] text-soft">Secure login</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="input-surface mt-2"
              required
            />
          </div>

          <div className="grid gap-3">
            {loginHighlights.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex items-start gap-3 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--accent-strong)]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-strong)]">{title}</p>
                  <p className="mt-1 text-sm leading-7 text-soft">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-button mt-2 w-full rounded-[18px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            Log in
          </button>

          <p className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-soft">
            New here? Create an account once, keep your research desk saved, and come back to the same structured workflow anytime.
          </p>
        </form>

        <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-soft">
            Need an account?{' '}
            <Link to="/signup" className="font-medium text-[var(--text-strong)] underline-offset-4 hover:underline">
              Create one here
            </Link>
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-strong)] transition-colors hover:text-[var(--accent-strong)]"
          >
            Open signup
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </AuthScaffold>
  );
};

export default LoginPage;
