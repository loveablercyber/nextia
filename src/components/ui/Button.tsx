import { type ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variants = {
      primary: 'bg-[#5B4FE9] text-white hover:bg-[#4338CA] focus-visible:ring-[#5B4FE9] shadow-md hover:shadow-lg hover:-translate-y-0.5',
      secondary: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] focus-visible:ring-[#7c3aed] shadow-md hover:shadow-lg hover:-translate-y-0.5',
      outline: 'border-2 border-[#5B4FE9] text-[#5B4FE9] bg-transparent hover:bg-[#5B4FE9] hover:text-white focus-visible:ring-[#5B4FE9]',
      ghost: 'text-[#5B4FE9] bg-transparent hover:bg-[#eef2ff] focus-visible:ring-[#5B4FE9]',
      gradient: 'bg-gradient-to-r from-[#5B4FE9] to-[#7c3aed] text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg hover:shadow-xl focus-visible:ring-[#5B4FE9]',
      white: 'bg-white text-[#5B4FE9] hover:bg-gray-50 focus-visible:ring-white shadow-md hover:shadow-lg hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
