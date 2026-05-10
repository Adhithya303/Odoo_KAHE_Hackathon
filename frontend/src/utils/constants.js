export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const LEAFLET_TILE_URL = import.meta.env.VITE_LEAFLET_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const VIBES = ['Adventure', 'Beach', 'Cultural', 'Luxury', 'Nature', 'Pilgrimage', 'Relaxation', 'Wildlife'];
export const GROUP_TYPES = ['Solo', 'Couple', 'Friends', 'Family'];
export const SCOPES = ['Domestic', 'International'];
export const COST_INDEXES = ['Low', 'Medium', 'High'];
export const TRIP_STATUSES = ['planning', 'ongoing', 'completed', 'cancelled'];
export const HOTEL_TYPES = ['budget', 'mid', 'luxury'];
export const EXPENSE_CATEGORIES = ['Transport', 'Stay', 'Food', 'Activities', 'Miscellaneous'];

export const COLORS = {
  primary: '#0F6E56', primaryLight: '#1D9E75',
  sand: '#F5ECD7', coral: '#D85A30', coralHover: '#B84820',
  body: '#2C2C2A', muted: '#6B6B68', border: '#E0D8CC',
  success: '#1D9E75', warning: '#BA7517', danger: '#A32D2D',
};

export const DESTINATION_IMAGES = {
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
  'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
  'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
  'Ladakh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
  'Manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
  'Jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
  'Varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
  'Shimla': 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=800',
  'Rishikesh': 'https://images.unsplash.com/photo-1600100397608-e4b1d822dd26?w=800',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
  'Thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800',
  'Maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
  'Switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800',
  'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  'Italy': 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=800',
  'default': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
};

export const getDestImage = (name) => DESTINATION_IMAGES[name] || DESTINATION_IMAGES.default;
