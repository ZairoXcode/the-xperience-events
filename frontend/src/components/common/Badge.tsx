import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'forest'
    | 'sage'
    | 'golden'
    | 'neutral'
    | 'danger'
    | 'warning'
    | 'success';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    forest: 'bg-[#1F3A32] text-white',
    sage: 'bg-[#A8B5A0]/30 text-[#1F3A32] border border-[#A8B5A0]/60',
    golden: 'bg-[#C8A96B]/20 text-[#6B5328] border border-[#C8A96B]/50',
    neutral: 'bg-stone-200 text-[#202020] border border-stone-300',
    danger: 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-md tracking-wide ${sizeClasses} ${variantClasses}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="danger">CRITICAL</Badge>;
    case 'HIGH':
      return <Badge variant="warning">HIGH</Badge>;
    case 'MEDIUM':
      return <Badge variant="golden">MEDIUM</Badge>;
    case 'LOW':
    default:
      return <Badge variant="sage">LOW</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'FULFILLED':
    case 'RESOLVED':
      return <Badge variant="success">{status.replace('_', ' ')}</Badge>;
    case 'IN_PROGRESS':
    case 'CONTACTED':
    case 'ACKNOWLEDGED':
      return <Badge variant="golden">{status.replace('_', ' ')}</Badge>;
    case 'BLOCKED':
    case 'UNAVAILABLE':
    case 'CANCELLED':
    case 'OVERDUE':
      return <Badge variant="danger">{status.replace('_', ' ')}</Badge>;
    case 'TODO':
    case 'PENDING':
    case 'UPCOMING':
    default:
      return <Badge variant="sage">{status.replace('_', ' ')}</Badge>;
  }
};

export const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  switch (severity) {
    case 'CRITICAL':
      return <Badge variant="danger">CRITICAL SEVERITY</Badge>;
    case 'HIGH':
      return <Badge variant="warning">HIGH SEVERITY</Badge>;
    case 'MEDIUM':
      return <Badge variant="golden">MEDIUM SEVERITY</Badge>;
    case 'LOW':
    default:
      return <Badge variant="sage">LOW SEVERITY</Badge>;
  }
};
