import { InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, id, className = '', ...props }: FieldProps) {
  return (
    <div className="mb-[18px]">
      <label htmlFor={id} className="mb-2 block text-xs font-semibold tracking-wide text-text-muted uppercase">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none transition focus:border-accent focus:ring-[3px] focus:ring-accent-soft ${className}`}
        {...props}
      />
    </div>
  );
}
