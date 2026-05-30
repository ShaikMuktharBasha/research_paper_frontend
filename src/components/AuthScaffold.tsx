import React from 'react';

type AuthScaffoldProps = {
  kicker: string;
  title: string;
  description: string;
  notes: string[];
  children: React.ReactNode;
};

export default function AuthScaffold({
  kicker,
  title,
  description,
  notes,
  children,
}: AuthScaffoldProps) {
  return (
    <div className="auth-shell">
      <div className="auth-shell-grid">
        <section className="auth-hero-card flex flex-col justify-between">
          <div>
            <p className="page-kicker">{kicker}</p>
            <h1 className="page-title page-title-fluid mt-0">{title}</h1>
            <p className="page-copy max-w-xl">{description}</p>
          </div>

          <div className="mt-8 space-y-3">
            {notes.map((note) => (
              <div key={note} className="auth-point">
                {note}
              </div>
            ))}
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}
