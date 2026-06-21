import React from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  colSpan?: boolean;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export const Field: React.FC<FieldProps> = ({ label, hint, value, onChange, placeholder, colSpan, error, multiline, rows }) => {
  const commonStyle = {
    border: `1px solid ${error ? 'var(--err)' : 'var(--border)'}`,
    background: 'var(--surface-2)',
    color: 'var(--text)',
    fontFamily: 'var(--ui-font)',
  };

  const commonClass = "block w-full sm:text-sm rounded-md px-3 py-2 outline-none transition-colors";

  return (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}>
        {label}
        {hint && <span className="text-xs font-normal ml-1" style={{ color: 'var(--text-3)' }}>{hint}</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${commonClass} resize-y`}
          style={commonStyle}
          placeholder={placeholder}
          rows={rows || 2}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClass}
          style={commonStyle}
          placeholder={placeholder}
        />
      )}
      {error && <p className="mt-1 text-xs font-medium" style={{ color: 'var(--err)' }}>{error}</p>}
    </div>
  );
};
