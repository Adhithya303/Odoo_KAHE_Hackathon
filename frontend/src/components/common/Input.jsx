import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon, className = '', ...props }, ref) => (
  <div className={`space-y-1 ${className}`}>
    {label && <label className="block text-sm font-medium text-body">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
      <input ref={ref} className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-danger ring-danger/20' : ''}`} {...props} />
    </div>
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
