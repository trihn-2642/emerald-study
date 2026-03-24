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
      <div className="flex justify-between items-center">
        <label
          htmlFor={htmlFor}
          className="block text-[11px] uppercase tracking-widest font-semibold text-slate-400 ml-1"
        >
          {label}
        </label>
        {labelRight}
      </div>
      {children}
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}
