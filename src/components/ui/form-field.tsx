interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  /** Optional element shown to the right of the label (e.g. "Quên mật khẩu?") */
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  labelRight,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="ml-1 block text-[11px] font-semibold tracking-widest text-slate-400 uppercase"
        >
          {label}
        </label>
        {labelRight}
      </div>
      {children}
      {error && <p className="ml-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
