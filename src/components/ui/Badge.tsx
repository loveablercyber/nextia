import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | 'gradient';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'primary', size = 'sm', className }: BadgeProps) {
  const variants = {
    primary: 'bg-[#eef2ff] text-[#5B4FE9] border border-[#c7d2fe]',
    secondary: 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe]',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    gray: 'bg-gray-100 text-gray-600 border border-gray-200',
    gradient: 'bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] text-white border-0',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={clsx('inline-flex items-center font-semibold rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
