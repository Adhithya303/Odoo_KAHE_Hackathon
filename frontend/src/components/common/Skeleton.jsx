export default function Skeleton({ className = '', count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`skeleton ${className}`}>&nbsp;</div>
  ));
}

export function DestinationCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-badge" />
          <div className="skeleton h-6 w-20 rounded-badge" />
        </div>
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}
