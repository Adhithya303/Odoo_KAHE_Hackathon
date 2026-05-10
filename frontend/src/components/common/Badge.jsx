export default function Badge({ children, variant = 'green', className = '' }) {
  const variants = {
    green: 'bg-success/10 text-success',
    coral: 'bg-coral/10 text-coral',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    muted: 'bg-gray-100 text-muted',
    primary: 'bg-primary/10 text-primary',
  };
  return (
    <span className={`badge ${variants[variant] || variants.green} ${className}`}>
      {children}
    </span>
  );
}
