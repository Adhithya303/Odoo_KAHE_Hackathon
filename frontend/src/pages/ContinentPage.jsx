import { useParams, Link } from 'react-router-dom';

const continentData = {
  northamerica: {
    title: 'North America',
    subtitle: 'A diverse continent known for its stunning economic powerhouses.',
    heroImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920',
    color: '#1A73E8',
    featured: [
      { name: 'New York City', desc: 'The city that never sleeps, with iconic sights and endless energy.', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600' },
      { name: 'Niagara Falls', desc: "Feel the power of nature at North America's most famous waterfall.", img: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=600' },
      { name: 'Los Angeles', desc: 'From Hollywood to beaches, LA is a city of dreams and sunshine.', img: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600' },
    ],
    destinations: [
      { name: 'New York City, USA', desc: 'Skyscrapers shine above bustling streets. Art, culture, and diversity define every neighborhood\'s spirit.', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600' },
      { name: 'Banff National Park, Canada', desc: 'Majestic mountains surround turquoise lakes. Wildlife roams freely in this stunning alpine wilderness escape.', img: 'https://images.unsplash.com/photo-1561134643-668f9057cce4?w=600' },
      { name: 'Grand Canyon, USA', desc: 'Carved by time, its vast depths awe visitors. Sunrise paints breathtaking views across 6,000-foot deep cliffs.', img: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600' },
      { name: 'Toronto, Canada', desc: 'A modern skyline meets lakefront charm. Diverse neighborhoods reflect cultures from around the world.', img: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=600' },
      { name: 'Yosemite Park, USA', desc: 'Located in central California, Yosemite National Park was established in 1890 and draws four million annual visitors.', img: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600' },
      { name: 'Mexico City, Mexico', desc: 'A vibrant blend of ancient and modern. Explore historic sites, museums, and bustling plazas.', img: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600' },
    ],
  },
  southamerica: {
    title: 'South America',
    subtitle: 'A vibrant continent known for its diverse cultures and breathtaking landscapes.',
    heroImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1920',
    color: '#1D9E75',
    featured: [
      { name: 'Machu Picchu', desc: 'An ancient Inca citadel set high in the Andes Mountains of Peru.', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600' },
      { name: 'Rio de Janeiro', desc: 'Iconic beaches, samba rhythms, and the Christ the Redeemer statue.', img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600' },
      { name: 'Amazon Rainforest', desc: 'The world\'s largest tropical rainforest teeming with unparalleled biodiversity.', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600' },
    ],
    destinations: [
      { name: 'Machu Picchu, Peru', desc: 'Ancient Inca citadel high in the Andes. Mist-shrouded ruins reveal a civilization\'s extraordinary engineering and culture.', img: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600' },
      { name: 'Rio de Janeiro, Brazil', desc: 'Samba, Carnival, and breathtaking beaches. Christ the Redeemer watches over a city of vibrant energy and culture.', img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600' },
      { name: 'Patagonia, Argentina', desc: 'Dramatic glaciers, jagged peaks, and pristine wilderness. A paradise for hikers and nature lovers at the end of the world.', img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
      { name: 'Galapagos Islands, Ecuador', desc: 'Unique wildlife found nowhere else on Earth. Walk among giant tortoises and marine iguanas on volcanic shores.', img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600' },
      { name: 'Cartagena, Colombia', desc: 'Colorful colonial architecture meets Caribbean beaches. A city of romance, history, and vibrant street life.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600' },
      { name: 'Uyuni Salt Flats, Bolivia', desc: 'The world\'s largest salt flat creates a mirror-like surface after rain, reflecting the sky in breathtaking illusion.', img: 'https://images.unsplash.com/photo-1580654842036-8a47bb2c62b5?w=600' },
    ],
  },
  europe: {
    title: 'Europe',
    subtitle: 'A diverse continent rich in history, culture, and natural beauty.',
    heroImage: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920',
    color: '#8B2FC9',
    featured: [
      { name: 'Paris, France', desc: 'The City of Light — art, romance, and the iconic Eiffel Tower await.', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' },
      { name: 'Santorini, Greece', desc: 'White-washed villages and blue-domed churches perched above the Aegean Sea.', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600' },
      { name: 'Barcelona, Spain', desc: "Gaudí's masterpieces, Gothic quarters, and vibrant tapas culture.", img: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600' },
    ],
    destinations: [
      { name: 'Paris, France', desc: 'The City of Light enchants with world-class art, haute cuisine, and the eternal magic of the Eiffel Tower glittering at night.', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' },
      { name: 'Santorini, Greece', desc: 'White Cycladic architecture crowns volcanic cliffs above the deep blue Aegean. Sunsets here are legendary around the world.', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600' },
      { name: 'Rome, Italy', desc: 'The Eternal City where ancient history meets modern life. The Colosseum, Vatican, and Trevi Fountain tell millennia of stories.', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600' },
      { name: 'Amsterdam, Netherlands', desc: 'Picturesque canals lined with narrow houses, world-class museums, and a bicycle culture that makes every street a scene.', img: 'https://images.unsplash.com/photo-1576924542622-772281b13aa8?w=600' },
      { name: 'Prague, Czech Republic', desc: 'A fairy-tale city of Gothic spires, Baroque palaces, and cobblestone alleys preserved through centuries of European history.', img: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=600' },
      { name: 'Dubrovnik, Croatia', desc: 'The Pearl of the Adriatic — medieval city walls, terracotta rooftops, and crystal-clear turquoise waters below limestone cliffs.', img: 'https://images.unsplash.com/photo-1555990538-1e1e4bb47a02?w=600' },
    ],
  },
};

export default function ContinentPage() {
  const { slug } = useParams();
  const continent = continentData[slug];

  if (!continent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-body mb-4">Continent Not Found</h2>
          <Link to="/" className="text-primary underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
        <img src={continent.heroImage} alt={continent.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-14 text-white w-full">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-2">Explore Continent</p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-3">{continent.title}</h1>
          <p className="text-white/80 text-lg max-w-xl">{continent.subtitle}</p>
        </div>
      </section>

      {/* Featured Highlights */}
      <section className="section-padding bg-sand-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-body">Top Highlights</h2>
            <div className="mt-3 mx-auto w-24 h-[3px] rounded-full" style={{ background: continent.color }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continent.featured.map((f, i) => (
              <div key={i} className="group card cursor-pointer">
                <div className="relative h-52 overflow-hidden">
                  <img src={f.img} alt={f.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-display text-xl font-bold">{f.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Destinations */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-body">All Destinations in {continent.title}</h2>
            <p className="text-muted mt-2 max-w-xl mx-auto">Discover the most captivating places this continent has to offer.</p>
            <div className="mt-4 mx-auto w-24 h-[3px] rounded-full" style={{ background: continent.color }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {continent.destinations.map((d, i) => (
              <div key={i} className="group rounded-card overflow-hidden border border-border hover:shadow-card hover:border-primary/20 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-body mb-2">{d.name}</h3>
                  <p className="text-muted text-sm leading-relaxed">{d.desc}</p>
                  <Link
                    to="/signup"
                    className="mt-4 inline-block text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full border transition-all"
                    style={{ color: continent.color, borderColor: continent.color + '55' }}
                  >
                    Plan This Trip →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center" style={{ background: continent.color }}>
        <div className="max-w-3xl mx-auto text-white">
          <h2 className="font-display text-4xl font-bold mb-4">Explore {continent.title} with AI</h2>
          <p className="text-white/80 text-lg mb-8">WanderIQ builds smart, personalized itineraries for every destination in {continent.title}.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="bg-white font-bold text-sm px-8 py-3.5 rounded-input hover:scale-105 hover:shadow-lg transition-all inline-block" style={{ color: continent.color }}>
              Start Planning Free →
            </Link>
            <Link to="/" className="border border-white/60 text-white font-semibold text-sm px-8 py-3.5 rounded-input hover:bg-white/10 transition-all inline-block">
              ← All Continents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
