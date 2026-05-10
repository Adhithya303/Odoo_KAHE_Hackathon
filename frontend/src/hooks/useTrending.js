import { getCurrentSeason } from '../utils/seasonUtils';
import { TRENDING_DESTINATIONS } from '../data/trendingDestinations';

export function useTrendingDestinations(seasonOverride = null, type = 'all') {
  const season = seasonOverride || getCurrentSeason();
  const dayOfMonth = new Date().getDate();
  
  const filtered = TRENDING_DESTINATIONS
    .filter(d => d.seasons.includes(season))
    .filter(d => type === 'all' || d.type === type)
    .sort((a, b) => b.searchVolume - a.searchVolume);

  // Daily rotation: shifts the top item by day-of-month to create freshness
  const rotated = [...filtered.slice(dayOfMonth % filtered.length), ...filtered.slice(0, dayOfMonth % filtered.length)];
  
  return { data: rotated, season, isLoading: false, error: null };
}
