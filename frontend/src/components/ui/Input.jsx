import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, name, error, hint, type = 'text', required = false, className = '', ...rest },
  ref
) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        aria-invalid={!!error}
        required={required}
        {...rest}
      />
      {hint && !error && <p id={`${name}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${name}-error`} className="form-error" role="alert">{error}</p>}
    </div>
  );
});

export default Input;

