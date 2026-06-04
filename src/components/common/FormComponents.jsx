import React from 'react'
import { AlertCircle } from 'lucide-react'

export function FormLabel({ label, required, htmlFor, children }) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-main mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export const FormInput = React.forwardRef(function FormInput(
  {
    label,
    error,
    required = false,
    type = 'text',
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500'
              : 'border-token bg-surface text-main focus:ring-primary/50'
          } ${
                disabled ? 'opacity-50 cursor-not-allowed bg-surface-alt' : ''
              } placeholder-subtle hover:border-token`}
          {...props}
        />
      </div>
      {error && (
        <div id={`${props.id}-error`} className="mt-1.5 flex items-start gap-1.5 text-red-600 text-xs font-medium" role="alert">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
})

export const FormTextarea = React.forwardRef(function FormTextarea(
  {
    label,
    error,
    required = false,
    rows = 4,
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500'
              : 'border-token bg-surface text-main focus:ring-primary/50'
          } ${
                disabled ? 'opacity-50 cursor-not-allowed bg-surface-alt' : ''
              } placeholder-subtle hover:border-token`}
          {...props}
        />
      </div>
      {error && (
        <div id={`${props.id}-error`} className="mt-1.5 flex items-start gap-1.5 text-red-600 text-xs font-medium" role="alert">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
})

export const FormSelect = React.forwardRef(function FormSelect(
  {
    label,
    error,
    required = false,
    options = [],
    disabled = false,
    placeholder = 'Select an option...',
    ...props
  },
  ref
) {
  return (
    <FormLabel label={label} required={required} htmlFor={props.id}>
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            error
              ? 'border-red-300 bg-red-50 text-red-900 focus:ring-red-500'
              : 'border-token bg-surface text-main focus:ring-primary/50'
          } ${
                disabled ? 'opacity-50 cursor-not-allowed bg-surface-alt' : ''
              } hover:border-token`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-2.5 flex items-center text-subtle">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <div id={`${props.id}-error`} className="mt-1.5 flex items-start gap-1.5 text-red-600 text-xs font-medium" role="alert">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </FormLabel>
  )
})

export const FormCheckbox = React.forwardRef(function FormCheckbox(
  {
    label,
    error,
    required = false,
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-6">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`rounded border-gray-300 text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 h-4 w-4 cursor-pointer transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } hover:border-blue-400`}
          {...props}
        />
      </div>
      <div className="ml-3 flex-1">
        <label className="text-sm text-main cursor-pointer font-medium">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
        {error && (
          <div id={`${props.id}-error`} className="mt-1 flex items-start gap-1.5 text-red-600 text-xs font-medium" role="alert">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
})

export function FormGroup({ children, className = '' }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>
}

export function FormSection({ title, children, className = '' }) {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-main mb-4">{title}</h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
