import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const base =
  'w-full rounded-lg px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-accent text-white shadow-sm hover:bg-accent-hover',
  secondary: 'border border-border bg-surface-2 text-text hover:bg-[#f0f0f2]',
};

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
