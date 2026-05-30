import React, { useState } from 'react';
import { BrainCircuit, FileText, LayoutPanelTop, Loader2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';

const signupNotes = [
  'Keep uploads, summaries, quizzes, and created papers under one account.',
  'Return to recent documents from the sidebar without rebuilding context.',
  'Use the same workspace flow across upload, analysis, and export.',
];

const signupHighlights = [
  {
    title: 'Saved paper workspaces',
    description: 'Come back to uploaded papers, answers, and quizzes without starting over.',
    icon: FileText,
  },
  {
    title: 'One clean dashboard',
    description: 'Keep upload, reading, questioning, and export tools in a single structured place.',
    icon: LayoutPanelTop,
  },
  {
    title: 'Simple secure access',
    description: 'Create an account once and keep your workspace available the next time you sign in.',
    icon: ShieldCheck,
  },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await signup({ name, email, password });
      navigate('/', { replace: true });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || 'Could not create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      kicker="Create account"
      title="Create your workspace and keep every paper flow in one place."
      description="Sign up once to save uploads, reopen result pages, and keep your research workflow organized instead of restarting from scratch."
      notes={signupNotes}
    >
      <section className="panel-card rounded-[32px] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-strong)]">Create your account</h2>
              <p className="mt-1 text-sm text-soft">A lighter setup for a more organized research desk.</p>
            </div>
          </div>

          <div className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--accent-strong)] md:inline-flex">
            <Sparkles size={14} className="mr-2" />
            Free workspace
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] rounded-[18px] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">After signup</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">Upload, ask, export</p>
            </div>
            <div className="min-w-[140px] rounded-[18px] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-soft">Account setup</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-strong)]">Takes under a minute</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-main">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="input-surface mt-2"
              required
            />
          </div>

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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-main">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="input-surface mt-2"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-main">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                className="input-surface mt-2"
                required
              />
            </div>
          </div>

          <div className="grid gap-3">
            {signupHighlights.map(({ title, description, icon: Icon }) => (
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
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Create account
          </button>

          <p className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-soft">
            By continuing, you&apos;re creating a workspace for saved uploads, result pages, and paper exports.
          </p>
        </form>

        <p className="mt-5 text-sm text-soft">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--text-strong)] underline-offset-4 hover:underline">
            Log in instead
          </Link>
        </p>
      </section>
    </AuthScaffold>
  );
};

export default SignupPage;
