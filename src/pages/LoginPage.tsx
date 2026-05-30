import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, Loader2, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-[#f4efe8] text-[var(--text-strong)]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-[#d97d36] via-[#ebb184] to-[#f4d4b3] lg:min-h-screen">
          <img
            src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2000&auto=format&fit=crop"
            alt="Desert dunes"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-900/30 via-transparent to-orange-950/40" />

          <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-[#17212b] backdrop-blur shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
                  <BrainCircuit size={18} />
                </span>
                Research Simplifier
              </div>

              <Link
                to="/signup"
                className="hidden rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/30 sm:inline-flex"
              >
                Join us
              </Link>
            </div>

            <div className="max-w-xl rounded-[32px] border border-white/30 bg-orange-950/20 p-6 text-white backdrop-blur-md sm:p-8 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-100">Unlock your potential</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl text-white">
                Simplify Complex Research
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-orange-50 sm:text-base">
                Discover a faster way to process, understand, and retain academic and professional papers from a single dashboard.
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/40 backdrop-blur border border-white/10 shadow-sm text-lg">💡</div>
                  <span className="text-sm font-medium text-white">Instant AI-Powered Summaries</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/40 backdrop-blur border border-white/10 shadow-sm text-lg">💬</div>
                  <span className="text-sm font-medium text-white">Interactive PDF Q&A</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/40 backdrop-blur border border-white/10 shadow-sm text-lg">🎯</div>
                  <span className="text-sm font-medium text-white">Automated Knowledge Quizzes</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#fcfaf7] px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[430px]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Secure login
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-strong)] transition-colors hover:text-[var(--accent-strong)]"
              >
                Create account
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="text-[2.45rem] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                Log in
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--text-soft)]">
                Open your saved uploads, summaries, quizzes, and research-paper drafts from one calm workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="input-surface mt-3 rounded-[18px] bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="input-surface mt-3 rounded-[18px] bg-white"
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
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Log in
              </button>
            </form>

            <div className="mt-8 rounded-[24px] border border-[var(--border)] bg-white px-5 py-5">
              <p className="text-sm font-semibold text-[var(--text-strong)]">Need an account?</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                Sign up once and keep your research flow available every time you return.
              </p>
              <Link
                to="/signup"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-strong)] transition-colors hover:text-[var(--accent-strong)]"
              >
                Go to signup
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
