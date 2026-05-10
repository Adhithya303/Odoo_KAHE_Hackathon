import { useParams, Link } from 'react-router-dom';

const experiencesData = {
  safari: {
    title: 'African Safari',
    subtitle: 'Witness the Wild Heart of Africa',
    heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920',
    description: "Embark on a thrilling safari to witness majestic wildlife in Africa's vast savannas. Come face to face with the Big Five: lions, elephants, Cape buffalo, leopards, and rhinoceros across iconic parks like the Serengeti and Maasai Mara.",
    highlights: [
      { icon: '🦁', title: 'The Big Five', desc: 'Spot lions, elephants, Cape buffalo, leopards, and rhinoceroses in their natural habitat.' },
      { icon: '🌅', title: 'Golden Hour Drives', desc: 'Experience sunrise and sunset game drives across sprawling savannas painted in gold.' },
      { icon: '🌿', title: 'Lush National Parks', desc: 'Explore Serengeti, Maasai Mara, Kruger, and Chobe National Parks.' },
      { icon: '📸', title: 'Wildlife Photography', desc: 'Capture breathtaking wildlife moments with expert guides leading you to the best spots.' },
    ],
    gallery: [
      { img: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600', caption: 'Lion Pride at Sunset' },
      { img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600', caption: 'Elephant Herd in Amboseli' },
      { img: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600', caption: 'Savanna at Golden Hour' },
      { img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600', caption: 'Giraffe in the Wild' },
      { img: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?w=600', caption: 'Wildebeest Migration' },
      { img: 'https://images.unsplash.com/photo-1551879400-111a9087cd86?w=600', caption: 'Cheetah on the Hunt' },
    ],
    tips: [
      'Best time to visit: June–October (dry season) for optimal wildlife viewing.',
      'Pack neutral-colored clothing — bright colors can disturb animals.',
      'Bring binoculars for spotting distant wildlife.',
      'Stay hydrated and apply sunscreen — the African sun is intense.',
      'Book lodges near waterholes for 24/7 wildlife activity.',
    ],
    places: ['Kenya', 'Tanzania', 'South Africa', 'Botswana', 'Zimbabwe'],
    color: '#C6622D',
  },
  skydiving: {
    title: 'Skydiving in Dubai',
    subtitle: 'Freefall Over the City of the Future',
    heroImage: 'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?w=1920',
    description: "Experience an adrenaline rush skydiving over Dubai's iconic Palm Jumeirah. Drop from 13,000 feet above sea level and freefall at 200 km/h while the stunning skyline, golden desert dunes, and crystal-blue Arabian Gulf unfold beneath you.",
    highlights: [
      { icon: '🪂', title: 'Tandem Skydiving', desc: 'Jump tandem with expert instructors for a safe, exhilarating freefall experience.' },
      { icon: '🌆', title: 'Palm Jumeirah Views', desc: "Soar above the world-famous man-made island and Dubai's iconic skyline." },
      { icon: '🏜️', title: 'Desert Drop Zone', desc: 'Land on a desert drop zone with golden dunes stretching to the horizon.' },
      { icon: '📹', title: 'Video & Photo Package', desc: 'Capture your jump with a GoPro camera mounted on your instructor\'s wrist.' },
    ],
    gallery: [
      { img: 'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=600', caption: 'Freefall over Dubai' },
      { img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600', caption: 'Palm Jumeirah Aerial View' },
      { img: 'https://images.unsplash.com/photo-1562280963-8a5475740a10?w=600', caption: 'Dubai Skyline from Above' },
      { img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', caption: 'Burj Khalifa View' },
      { img: 'https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=600', caption: 'Desert Drop Zone' },
      { img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', caption: 'Luxury Resort Views' },
    ],
    tips: [
      'Best time to skydive: November–April when temperatures are cooler.',
      'Wear comfortable, form-fitting clothes. Avoid loose items.',
      'No experience needed for tandem jumps — training takes just 30 minutes.',
      'Book your jump early — slots fill up fast especially in peak season.',
      'Weight limit typically applies: check with operator beforehand.',
    ],
    places: ['Palm Jumeirah', 'Dubai Marina', 'Desert Drop Zone', 'Burj Khalifa Vicinity'],
    color: '#1A73E8',
  },
  northernlights: {
    title: 'Northern Lights in Europe',
    subtitle: 'Chase the Aurora Borealis Across the Arctic',
    heroImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920',
    description: "Chase the mesmerizing Northern Lights in Europe's Arctic regions. The Aurora Borealis is one of the most breathtaking natural phenomena on Earth — dancing ribbons of green, purple, pink, and white light illuminating the night sky across Iceland, Norway, Finland, and Sweden.",
    highlights: [
      { icon: '🌌', title: 'Aurora Borealis', desc: 'Witness magical dancing lights in shades of green, violet, and pink across the Arctic sky.' },
      { icon: '🛷', title: 'Husky Sledding', desc: 'Race through snow-covered forests on a husky sled for an unforgettable Arctic adventure.' },
      { icon: '🏔️', title: 'Arctic Fjords', desc: 'Marvel at dramatic fjords, frozen lakes, and snow-draped mountains under polar light.' },
      { icon: '🏕️', title: 'Glass Igloos', desc: 'Stay in unique glass igloos and watch the Northern Lights from the warmth of your bed.' },
    ],
    gallery: [
      { img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600', caption: 'Aurora over Arctic Norway' },
      { img: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=600', caption: 'Northern Lights in Iceland' },
      { img: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=600', caption: 'Finnish Lapland Snow Forest' },
      { img: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=600', caption: 'Frozen Lake Reflection' },
      { img: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=600', caption: 'Glass Igloo in Lapland' },
      { img: 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=600', caption: 'Husky Sled at Twilight' },
    ],
    tips: [
      'Best time to see Northern Lights: September–March when nights are longest.',
      'Head away from city lights — light pollution significantly reduces visibility.',
      'Stay for at least 5–7 nights to increase your chances of a sighting.',
      'Download an aurora forecast app (e.g., My Aurora Forecast) before you go.',
      'Dress in warm layers — Arctic temperatures can drop below -20°C.',
    ],
    places: ['Norway', 'Iceland', 'Finland', 'Sweden', 'Scottish Highlands'],
    color: '#6B3FA0',
  },
};

export default function ExperienceDetailPage() {
  const { slug } = useParams();
  const exp = experiencesData[slug];

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-body mb-4">Experience Not Found</h2>
          <Link to="/" className="text-primary underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
        <img src={exp.heroImage} alt={exp.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-16 text-white w-full">
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-3 leading-tight">{exp.title}</h1>
          <p className="text-white/80 text-xl max-w-2xl">{exp.subtitle}</p>
        </div>
      </section>

      {/* Description & Highlights */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-body text-lg leading-relaxed mb-10">{exp.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {exp.highlights.map((h, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-card border border-border hover:shadow-card transition-all duration-300">
                <span className="text-3xl flex-shrink-0">{h.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-body mb-1">{h.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-sand rounded-card p-6 mb-4">
            <h3 className="font-display text-xl font-bold text-body mb-3">📍 Best Destinations</h3>
            <div className="flex flex-wrap gap-2">
              {exp.places.map((c, i) => (
                <span key={i} className="text-sm font-semibold px-4 py-1.5 rounded-full bg-white border border-border text-body">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section-padding bg-sand-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-body">Gallery</h2>
            <div className="mt-3 mx-auto w-24 h-[3px] rounded-full" style={{ background: exp.color }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {exp.gallery.map((g, i) => (
              <div key={i} className="group relative rounded-card overflow-hidden shadow-card">
                <img src={g.img} alt={g.caption} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-semibold">{g.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-body mb-8">💡 Travel Tips</h2>
          <ul className="space-y-4">
            {exp.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5" style={{ background: exp.color }}>{i + 1}</span>
                <p className="text-body text-sm leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding text-center" style={{ background: exp.color }}>
        <div className="max-w-3xl mx-auto text-white">
          <h2 className="font-display text-4xl font-bold mb-4">Ready to Experience This?</h2>
          <p className="text-white/80 text-lg mb-8">Let WanderIQ plan your perfect {exp.title} adventure with AI-powered itineraries.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="bg-white font-bold text-sm px-8 py-3.5 rounded-input hover:scale-105 hover:shadow-lg transition-all inline-block" style={{ color: exp.color }}>
              Start Planning Free →
            </Link>
            <Link to="/" className="border border-white/60 text-white font-semibold text-sm px-8 py-3.5 rounded-input hover:bg-white/10 transition-all inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
