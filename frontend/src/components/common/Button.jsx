import Spinner from './Spinner';

export default function Button({ children, variant = 'primary', loading, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-danger text-white font-semibold px-6 py-3 rounded-input hover:bg-danger/90 transition-all',
  };
  return (
    <button className={`${variants[variant]} inline-flex items-center justify-center gap-2 ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
