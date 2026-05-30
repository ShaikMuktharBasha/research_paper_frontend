import React from 'react';
import clsx from 'clsx';

type PageScaffoldProps = {
  kicker: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  titleClassName?: string;
  children: React.ReactNode;
};

type PageGridProps = {
  variant?: 'dashboard' | 'workspace' | 'builder';
  children: React.ReactNode;
};

type ColumnProps = {
  children: React.ReactNode;
  className?: string;
};

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function PageScaffold({
  kicker,
  title,
  description,
  actions,
  titleClassName,
  children,
}: PageScaffoldProps) {
  return (
    <div className="page-shell animate-rise">
      <section className="page-hero">
        <div className="page-hero-row">
          <div className="min-w-0">
            <p className="page-kicker">{kicker}</p>
            <h1 className={clsx('page-title', titleClassName)}>{title}</h1>
            {description ? <p className="page-copy">{description}</p> : null}
          </div>
          {actions ? <div className="page-hero-actions">{actions}</div> : null}
        </div>
      </section>

      {children}
    </div>
  );
}

export function PageGrid({ variant = 'dashboard', children }: PageGridProps) {
  return <section className={clsx('page-grid', `page-grid--${variant}`)}>{children}</section>;
}

export function MainColumn({ children, className }: ColumnProps) {
  return <div className={clsx('page-grid-main', className)}>{children}</div>;
}

export function RailColumn({ children, className }: ColumnProps) {
  return <div className={clsx('page-grid-rail', className)}>{children}</div>;
}

export function PanelCard({ children, className, compact = false }: PanelProps) {
  return <div className={clsx('panel-card', compact && 'panel-card-compact', className)}>{children}</div>;
}

export function PanelStack({ children, className }: ColumnProps) {
  return <div className={clsx('panel-stack', className)}>{children}</div>;
}
