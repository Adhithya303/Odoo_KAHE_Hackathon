export function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-indexed
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month === 10) return 'autumn';
  return 'winter';
}

export const SEASON_META = {
  summer: {
    label: 'Summer',
    emoji: '☀️',
    tagline: 'Beat the heat — head to the hills or the coast',
    gradient: 'from-amber-100 to-orange-50',
    accentColor: '#D85A30',
    months: 'March – May',
    bgPattern: 'data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1.5" fill="%23D85A30" opacity="0.15"/></svg>',
  },
  monsoon: {
    label: 'Monsoon',
    emoji: '🌧️',
    tagline: 'Rain-soaked magic — waterfalls, lush valleys & misty mornings',
    gradient: 'from-teal-100 to-emerald-50',
    accentColor: '#0F6E56',
    months: 'June – September',
    bgPattern: 'data:image/svg+xml;utf8,<svg width="20" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M10 0v20" stroke="%230F6E56" stroke-width="1" opacity="0.15"/></svg>',
  },
  autumn: {
    label: 'Autumn',
    emoji: '🍂',
    tagline: 'Golden skies & harvest festivals — perfect weather for exploration',
    gradient: 'from-amber-100 to-yellow-50',
    accentColor: '#B45309',
    months: 'October',
    bgPattern: 'data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M20 10q10 10 0 20q-10-10 0-20" fill="%23B45309" opacity="0.1"/></svg>',
  },
  winter: {
    label: 'Winter',
    emoji: '❄️',
    tagline: 'Cool nights, festive air & clear mountain views',
    gradient: 'from-blue-100 to-slate-50',
    accentColor: '#185FA5',
    months: 'November – February',
    bgPattern: 'data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M20 10v20M10 20h20M13 13l14 14M13 27l14-14" stroke="%23185FA5" stroke-width="1" opacity="0.15"/></svg>',
  },
};
