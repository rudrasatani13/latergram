interface SoftFieldProps {
  label: string;
  placeholder: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export function SoftField({
  label,
  placeholder,
  type,
  value,
  onChange,
  disabled,
  required,
}: SoftFieldProps) {
  return (
    <div className="mt-6">
      <label
        className="block font-cute text-[var(--lg-rose)] mb-1"
        style={{ fontSize: "1.15rem" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="min-h-12 w-full bg-transparent border-0 border-b border-[var(--lg-border)] py-3 text-[var(--lg-ink)] placeholder:text-[var(--lg-cocoa)]/50 focus:outline-none focus:border-[var(--lg-rose)] transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontSize: "1rem" }}
      />
    </div>
  );
}
