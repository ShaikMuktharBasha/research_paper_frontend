import React, { useState } from 'react';
import { BrainCircuit, Loader2, LogIn } from 'lucide-react';
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
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--brand-soft)] text-[var(--accent-strong)]">
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-strong)]">Welcome back</h2>
              <p className="mt-1 text-sm text-soft">Use your account to open the workspace.</p>
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
          </form>

          <p className="mt-5 text-sm text-soft">
            Need an account?{' '}
            <Link to="/signup" className="font-medium text-[var(--text-strong)] underline-offset-4 hover:underline">
              Create one here
            </Link>
          </p>
        </section>
    </AuthScaffold>
  );
};

export default LoginPage;
