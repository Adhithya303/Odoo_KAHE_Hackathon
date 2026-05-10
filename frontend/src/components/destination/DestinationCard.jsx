import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { getDestImage } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function DestinationCard({ destination, className = '' }) {
  const { id, name, trip_scope, cost_index, avg_min_budget, avg_max_budget, vibe_tags, trip_types, cover_image_url } = destination;
  const image = cover_image_url || getDestImage(name);
  const vibes = vibe_tags ? vibe_tags.split(',').map(v => v.trim()).filter(Boolean).slice(0, 3) : [];
  const types = trip_types?.slice(0, 2) || [];

  return (
    <Link to={`/destinations/${id}`} className={`card group cursor-pointer block ${className}`}>
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-3 right-3">
          <Badge variant={trip_scope === 'International' ? 'coral' : 'green'}>{trip_scope}</Badge>
        </div>
        <div className="absolute bottom-3 left-3">
          <h3 className="text-white font-display font-semibold text-lg">{name}</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {types.map(t => <Badge key={t} variant="primary">{t}</Badge>)}
          {vibes.map(v => <Badge key={v} variant="muted">{v}</Badge>)}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            {avg_min_budget && avg_max_budget
              ? `${formatCurrency(avg_min_budget)} – ${formatCurrency(avg_max_budget)}`
              : cost_index || 'Budget varies'}
          </span>
          <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">Explore →</span>
        </div>
      </div>
    </Link>
  );
}
