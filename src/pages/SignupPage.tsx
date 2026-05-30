import React, { useState } from 'react';
import { BrainCircuit, Loader2, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthScaffold from '../components/AuthScaffold';

const signupNotes = [
  'Keep uploads, summaries, quizzes, and created papers under one account.',
  'Return to recent documents from the sidebar without rebuilding context.',
  'Use the same workspace flow across upload, analysis, and export.',
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
      title="Set up your account and keep the whole workflow together."
      description="Create one simple sign-in to manage uploads, saved workspaces, quizzes, and paper exports from the same minimal app shell."
      notes={signupNotes}
    >
        <section className="panel-card rounded-[32px] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-strong)]">Create your account</h2>
              <p className="mt-1 text-sm text-soft">It only takes a minute to get started.</p>
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
              Sign up
            </button>
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
