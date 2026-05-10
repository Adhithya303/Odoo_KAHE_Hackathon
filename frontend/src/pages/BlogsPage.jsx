import { useState } from 'react';
import { Link } from 'react-router-dom';

export const BLOGS = [
  {
    slug: 'hidden-gems-southeast-asia',
    category: 'Destinations',
    categoryColor: '#0F6E56',
    title: 'Hidden Gems of Southeast Asia You Must Visit in 2025',
    excerpt:
      'Beyond Bali and Bangkok lies a world of undiscovered wonders — misty limestone karsts, emerald rice terraces, and ancient temples that few tourists have walked.',
    author: 'Anjali Menon',
    authorAvatar: '👩‍✈️',
    authorTitle: 'Senior Travel Writer',
    date: 'May 8, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900',
    tags: ['Asia', 'Off-beat', 'Budget Travel'],
    featured: true,
  },
  {
    slug: 'budget-europe-backpacking',
    category: 'Tips & Tricks',
    categoryColor: '#C85D38',
    title: 'Backpacking Europe on ₹1,500 a Day: The Ultimate 2025 Guide',
    excerpt:
      'From Lisbon to Ljubljana, savvy travelers are discovering that Europe does not have to drain your bank account. Here is how to do it right.',
    author: 'Rohan Verma',
    authorAvatar: '🧑‍💻',
    authorTitle: 'Budget Travel Expert',
    date: 'April 30, 2025',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=900',
    tags: ['Europe', 'Budget', 'Backpacking'],
    featured: false,
  },
  {
    slug: 'ai-travel-planning-revolution',
    category: 'Technology',
    categoryColor: '#7C3AED',
    title: 'How AI Is Revolutionizing the Way We Plan Trips',
    excerpt:
      'Forget spreadsheets and endless browser tabs. AI-powered itinerary builders, dynamic budget trackers, and smart packing lists are changing travel planning forever.',
    author: 'Priya Krishnan',
    authorAvatar: '👩‍🔬',
    authorTitle: 'Tech & Travel Editor',
    date: 'April 22, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900',
    tags: ['AI', 'Technology', 'Planning'],
    featured: false,
  },
  {
    slug: 'solo-female-travel-safety',
    category: 'Safety',
    categoryColor: '#DB2777',
    title: '15 Essential Safety Tips Every Solo Female Traveler Should Know',
    excerpt:
      'Solo travel as a woman is one of the most empowering experiences imaginable — and with the right preparation, it can also be incredibly safe.',
    author: 'Meera Nair',
    authorAvatar: '👩‍🦱',
    authorTitle: 'Solo Travel Advocate',
    date: 'April 15, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900',
    tags: ['Solo Travel', 'Women', 'Safety'],
    featured: false,
  },
  {
    slug: 'best-maldives-resorts-2025',
    category: 'Luxury',
    categoryColor: '#0369A1',
    title: 'The 8 Most Breathtaking Maldives Resorts for 2025',
    excerpt:
      'Crystal-clear lagoons, overwater bungalows, and sunsets that seem painted by the gods — these are the Maldives resorts that redefine paradise.',
    author: 'Kabir Das',
    authorAvatar: '🧑‍🎨',
    authorTitle: 'Luxury Travel Curator',
    date: 'April 8, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900',
    tags: ['Maldives', 'Luxury', 'Resorts'],
    featured: false,
  },
  {
    slug: 'food-travel-india',
    category: 'Food & Culture',
    categoryColor: '#D97706',
    title: 'Eating Your Way Across India: 12 Dishes That Tell a Story',
    excerpt:
      'From the butter-drenched parathas of Amritsar to the seafood thalis of coastal Karnataka, every dish in India is a window into a living culture.',
    author: 'Divya Rao',
    authorAvatar: '👩‍🍳',
    authorTitle: 'Culinary Travel Journalist',
    date: 'March 29, 2025',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900',
    tags: ['India', 'Food', 'Culture'],
    featured: false,
  },
  {
    slug: 'northern-lights-guide',
    category: 'Experiences',
    categoryColor: '#0F6E56',
    title: "Chasing the Northern Lights: The Traveler's Complete Handbook",
    excerpt:
      'The aurora borealis is one of nature\'s greatest spectacles. Here is everything you need to know — best locations, ideal months, and photography secrets.',
    author: 'Aryan Sharma',
    authorAvatar: '🧑‍🚀',
    authorTitle: 'Adventure & Nature Writer',
    date: 'March 18, 2025',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=900',
    tags: ['Aurora', 'Norway', 'Nature'],
    featured: false,
  },
  {
    slug: 'packing-tips-long-haul',
    category: 'Tips & Tricks',
    categoryColor: '#C85D38',
    title: 'Pack Like a Pro: The One-Bag Long-Haul Travel Method',
    excerpt:
      'A seasoned traveler shares the exact packing list and folding strategy that lets her travel the world for six months with a single 40L backpack.',
    author: 'Nisha Pillai',
    authorAvatar: '🎒',
    authorTitle: 'Minimalist Travel Coach',
    date: 'March 5, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=900',
    tags: ['Packing', 'Tips', 'Minimalism'],
    featured: false,
  },
  {
    slug: 'india-road-trip-highway-guide',
    category: 'Road Trips',
    categoryColor: '#B45309',
    title: 'The 7 Greatest Road Trips in India You Must Drive Before You Die',
    excerpt:
      'From the Manali–Leh Highway snaking through Himalayan passes to the coastal splendor of NH66, India\'s roads are an adventure in themselves — no destination required.',
    author: 'Siddharth Kulkarni',
    authorAvatar: '🚗',
    authorTitle: 'Road Trip Journalist',
    date: 'February 28, 2025',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900',
    tags: ['Road Trip', 'India', 'Adventure'],
    featured: false,
  },
  {
    slug: 'travel-photography-beginners',
    category: 'Photography',
    categoryColor: '#0E7490',
    title: 'Travel Photography for Beginners: 12 Rules That Will Change Your Photos',
    excerpt:
      'You don\'t need an expensive camera to take stunning travel photos. These composition, lighting, and storytelling techniques work with any device — including your phone.',
    author: 'Lena Rao',
    authorAvatar: '📷',
    authorTitle: 'Travel Photographer',
    date: 'February 20, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=900',
    tags: ['Photography', 'Tips', 'Beginner'],
    featured: false,
  },
  {
    slug: 'wellness-travel-retreats-2025',
    category: 'Wellness',
    categoryColor: '#047857',
    title: 'The Best Wellness Retreats to Reset Your Mind, Body & Soul in 2025',
    excerpt:
      'Burnout is real — but so is recovery. These 10 wellness retreats across Bali, Kerala, and the Swiss Alps offer yoga, meditation, and detox programs that genuinely transform.',
    author: 'Ananya Krishnamurthy',
    authorAvatar: '🧘',
    authorTitle: 'Wellness & Travel Writer',
    date: 'February 12, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900',
    tags: ['Wellness', 'Retreat', 'Mindfulness'],
    featured: false,
  },
  {
    slug: 'visa-free-countries-india-passport',
    category: 'Visa & Docs',
    categoryColor: '#6D28D9',
    title: '60+ Countries Indian Passport Holders Can Visit Visa-Free in 2025',
    excerpt:
      'The Indian passport may not top the Henley Index, but it grants visa-free or visa-on-arrival access to more than 60 countries — from Thailand to Mauritius to Fiji.',
    author: 'Rajeev Menon',
    authorAvatar: '🛂',
    authorTitle: 'Travel Visa Specialist',
    date: 'February 5, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900',
    tags: ['Visa', 'India', 'Passport'],
    featured: false,
  },
  {
    slug: 'wildlife-safari-africa-guide',
    category: 'Wildlife',
    categoryColor: '#92400E',
    title: 'The Ultimate Safari Planning Guide: Africa\'s Big Five & Beyond',
    excerpt:
      'Lions at dawn, elephant herds at dusk, and the Great Migration in full swing — planning an African safari is an art form. Here is your complete field manual.',
    author: 'Tariq Hussain',
    authorAvatar: '🦁',
    authorTitle: 'Wildlife & Safari Expert',
    date: 'January 30, 2025',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900',
    tags: ['Safari', 'Africa', 'Wildlife'],
    featured: false,
  },
  {
    slug: 'honeymoon-destinations-india-couples',
    category: 'Honeymoon',
    categoryColor: '#BE185D',
    title: 'India\'s Most Romantic Honeymoon Destinations for 2025 Couples',
    excerpt:
      'Whether you dream of floating houseboats in Kerala, snow-capped peaks in Kashmir, or heritage havelis in Rajasthan — India\'s honeymoon options are endlessly romantic.',
    author: 'Pooja & Vikram Sethi',
    authorAvatar: '💑',
    authorTitle: 'Couples Travel Bloggers',
    date: 'January 22, 2025',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900',
    tags: ['Honeymoon', 'Romance', 'India'],
    featured: false,
  },
  {
    slug: 'digital-nomad-cities-2025',
    category: 'Digital Nomad',
    categoryColor: '#1D4ED8',
    title: 'The 10 Best Cities for Digital Nomads in 2025 (With Cost Breakdowns)',
    excerpt:
      'Chiang Mai, Lisbon, Medellín, Tbilisi — these cities offer high-speed internet, thriving co-working cultures, and a cost of living that makes remote work feel like a superpower.',
    author: 'Aditya Bose',
    authorAvatar: '💻',
    authorTitle: 'Remote Work & Travel Writer',
    date: 'January 15, 2025',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900',
    tags: ['Nomad', 'Remote Work', 'Tech'],
    featured: false,
  },
  {
    slug: 'ancient-heritage-sites-india',
    category: 'Heritage',
    categoryColor: '#7C2D12',
    title: '10 UNESCO Heritage Sites in India That Will Leave You Speechless',
    excerpt:
      'From the erotic carvings of Khajuraho to the sea-facing Sun Temple of Konark, India\'s UNESCO heritage sites hold stories that span millennia — every stone a sentence.',
    author: 'Dr. Kavitha Iyer',
    authorAvatar: '🏛️',
    authorTitle: 'History & Heritage Correspondent',
    date: 'January 8, 2025',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900',
    tags: ['Heritage', 'UNESCO', 'History'],
    featured: false,
  },
  {
    slug: 'eco-travel-sustainable-trips',
    category: 'Eco Travel',
    categoryColor: '#15803D',
    title: 'How to Travel Sustainably Without Giving Up Any Comfort',
    excerpt:
      'Carbon offsets, zero-waste packing, eco-certified lodges, and slow travel — sustainable tourism has matured far beyond reusing your hotel towel.',
    author: 'Nandini Ghosh',
    authorAvatar: '🌱',
    authorTitle: 'Sustainable Travel Advocate',
    date: 'December 28, 2024',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900',
    tags: ['Eco', 'Sustainable', 'Green Travel'],
    featured: false,
  },
  {
    slug: 'budget-thailand-vietnam-2025',
    category: 'Destinations',
    categoryColor: '#0F6E56',
    title: 'Thailand vs Vietnam in 2025: Which Is the Better Budget Destination?',
    excerpt:
      'Street food for ₹80, guesthouses for ₹600, and temples that take your breath away for free — both countries win, but for very different reasons. Here\'s the definitive breakdown.',
    author: 'Sameer Kapoor',
    authorAvatar: '🍜',
    authorTitle: 'Southeast Asia Correspondent',
    date: 'December 20, 2024',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900',
    tags: ['Thailand', 'Vietnam', 'Budget'],
    featured: false,
  },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(BLOGS.map((b) => b.category)))];

export default function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = BLOGS.find((b) => b.featured);
  const rest = BLOGS.filter((b) => !b.featured);

  const filtered = rest.filter((b) => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5ECD7' }}>
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0F6E56 0%, #1a4a3a 50%, #0d2b20 100%)',
          padding: '80px 24px 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '320px', height: '320px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '-80px', left: '10%',
            width: '200px', height: '200px',
            borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
          }}
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p
            style={{
              color: '#86efac', fontWeight: 700, fontSize: '12px',
              letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px',
            }}
          >
            ✍️ WanderIQ Travel Blog
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#fff', fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 800, lineHeight: 1.15, marginBottom: '16px',
            }}
          >
            Stories That <span style={{ color: '#C85D38' }}>Inspire</span> Journeys
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)', fontSize: '18px',
              maxWidth: '560px', lineHeight: 1.7, marginBottom: '36px',
            }}
          >
            Insider tips, hidden destinations, AI travel hacks, and real stories from travelers
            just like you — all in one place.
          </p>

          {/* Search */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '999px', padding: '8px 8px 8px 20px',
              maxWidth: '480px', backdropFilter: 'blur(10px)',
            }}
          >
            <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search articles, destinations, tips…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: '15px',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                  color: '#fff', borderRadius: '50%', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Category Chips ───────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5d8c4', position: 'sticky', top: '64px', zIndex: 30 }}>
        <div
          style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: '0 24px', display: 'flex', gap: '8px',
            overflowX: 'auto', scrollbarWidth: 'none', paddingTop: '14px', paddingBottom: '14px',
          }}
        >
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                whiteSpace: 'nowrap', padding: '7px 18px',
                borderRadius: '999px', border: '1.5px solid',
                borderColor: activeCategory === cat ? '#0F6E56' : '#d6cab4',
                background: activeCategory === cat ? '#0F6E56' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#6b7280',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Featured Post ─────────────────────────────────────── */}
        {featured && activeCategory === 'All' && !searchQuery && (
          <div style={{ marginBottom: '56px' }}>
            <p
              style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
                textTransform: 'uppercase', color: '#0F6E56', marginBottom: '16px',
              }}
            >
              ⭐ Featured Article
            </p>
            <Link to={`/blogs/${featured.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                style={{
                  borderRadius: '20px', overflow: 'hidden',
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  background: '#fff',
                }}
                className="featured-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 28px 70px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.12)';
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', minHeight: '380px' }}>
                  <img
                    src={featured.image}
                    alt={featured.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.05))',
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: '999px',
                      background: featured.categoryColor + '18', color: featured.categoryColor,
                      fontSize: '12px', fontWeight: 700, letterSpacing: '1px',
                      textTransform: 'uppercase', marginBottom: '18px', width: 'fit-content',
                    }}
                  >
                    {featured.category}
                  </span>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '30px', fontWeight: 800, color: '#1a1a18',
                      lineHeight: 1.3, marginBottom: '16px',
                    }}
                  >
                    {featured.title}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
                    {featured.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <span style={{ fontSize: '28px' }}>{featured.authorAvatar}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a18' }}>{featured.author}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>{featured.authorTitle}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>
                      {featured.date} · {featured.readTime}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      background: '#0F6E56', color: '#fff',
                      padding: '12px 24px', borderRadius: '999px',
                      fontWeight: 700, fontSize: '14px', width: 'fit-content',
                    }}
                  >
                    Read Article
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Grid of Articles ──────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
            <p style={{ fontSize: '20px', color: '#6b7280', fontWeight: 600 }}>No articles found</p>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Try a different search term or category.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
              Showing <strong style={{ color: '#1a1a18' }}>{filtered.length}</strong> articles
              {activeCategory !== 'All' && <> in <strong style={{ color: '#0F6E56' }}>{activeCategory}</strong></>}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '28px',
              }}
            >
              {filtered.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlogCard({ blog }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/blogs/${blog.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.13)' : '0 4px 20px rgba(0,0,0,0.07)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.3s ease',
          border: '1px solid #f0e8d8',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={blog.image}
            alt={blog.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          />
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)',
            }}
          />
          {/* Category badge on image */}
          <span
            style={{
              position: 'absolute', top: '14px', left: '14px',
              background: blog.categoryColor, color: '#fff',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
              textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px',
            }}
          >
            {blog.category}
          </span>
          {/* Read time */}
          <span
            style={{
              position: 'absolute', bottom: '14px', right: '14px',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              fontSize: '11px', padding: '3px 10px', borderRadius: '999px',
              backdropFilter: 'blur(4px)',
            }}
          >
            ⏱ {blog.readTime}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '19px', fontWeight: 700, color: '#1a1a18',
              lineHeight: 1.35, marginBottom: '10px',
            }}
          >
            {blog.title}
          </h3>
          <p
            style={{
              fontSize: '13.5px', color: '#6b7280', lineHeight: 1.65,
              marginBottom: '18px', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {blog.excerpt}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: '#F5ECD7', color: '#6b7280',
                  fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author & Date */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              paddingTop: '14px', borderTop: '1px solid #f0e8d8',
            }}
          >
            <span style={{ fontSize: '22px' }}>{blog.authorAvatar}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a1a18' }}>{blog.author}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af' }}>{blog.date}</p>
            </div>
            <div
              style={{
                marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '50%',
                background: hovered ? '#0F6E56' : '#f0e8d8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <svg width="14" height="14" fill="none" stroke={hovered ? '#fff' : '#0F6E56'} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
