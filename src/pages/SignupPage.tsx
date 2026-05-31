import React, { useState } from 'react';
import { BrainCircuit, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="h-screen w-full overflow-hidden bg-[#f4efe8] text-[var(--text-strong)]">
      <div className="grid h-full lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden h-full overflow-hidden bg-gradient-to-br from-[#d97d36] via-[#ebb184] to-[#f4d4b3] lg:block">
          <img
            src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2000&auto=format&fit=crop"
            alt="Desert dunes"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-900/30 via-transparent to-orange-950/40" />

          <div className="relative z-10 flex h-full items-center justify-center p-6 sm:p-8 lg:p-10">
            <div className="w-full max-w-xl rounded-[32px] border border-white/30 bg-orange-950/20 p-6 text-white backdrop-blur-md sm:p-8 shadow-xl">
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

        <section className="flex h-full flex-col justify-center overflow-y-auto bg-[#fcfaf7] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[430px]">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Create account
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
              >
                Go to login
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="text-[2.45rem] font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                Sign up
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--text-soft)]">
                Create your workspace and keep every paper flow in one place without starting from scratch.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="input-surface mt-3 rounded-[18px] bg-white w-full"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="input-surface mt-3 rounded-[18px] bg-white w-full"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 chars"
                    className="input-surface mt-3 rounded-[18px] bg-white w-full"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirm password"
                    className="input-surface mt-3 rounded-[18px] bg-white w-full"
                    required
                  />
                </div>
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
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Create account
              </button>
            </form>
            
            <p className="mt-8 text-center text-[13px] leading-6 text-[var(--text-soft)]">
              By continuing, you're creating a secure workspace for saved <br className="hidden sm:block" />uploads, result pages, and paper exports.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignupPage;
