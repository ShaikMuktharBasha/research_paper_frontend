import React, { useState } from 'react';
import { BrainCircuit, Loader2, LogIn, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';

const loginNotes = [
  'Open saved uploads, summaries, and quizzes from one place.',
  'Keep your research-paper builder and workspace behind a simple account.',
  'Return to the same desk without reconfiguring your flow every time.',
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
        <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--accent-strong)]">
            <Sparkles size={14} />
            Member access
          </div>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <BrainCircuit size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-[var(--text-strong)]">Welcome back</h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-soft">
                Sign in to continue from the same research desk, with your uploads, summaries, and paper workspaces already in place.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">Workspace</p>
              <p className="mt-2 text-base font-semibold text-[var(--text-strong)]">Saved papers and results</p>
            </div>
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">Access</p>
              <p className="mt-2 text-base font-semibold text-[var(--text-strong)]">Simple, secure sign in</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            <label className="text-sm font-medium text-main">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="input-surface mt-2"
              required
            />
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

          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
            <p className="text-sm font-medium text-[var(--text-strong)]">New to the workspace?</p>
            <p className="mt-1 text-sm leading-7 text-soft">
              Create an account once and keep your uploads, summaries, and result pages available for your next session.
            </p>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-soft">
            Need an account?{' '}
            <Link to="/signup" className="font-medium text-[var(--text-strong)] underline-offset-4 hover:underline">
              Create one here
            </Link>
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-soft">Research Simplifier</p>
        </div>
      </section>
    </AuthScaffold>
  );
};

export default LoginPage;
