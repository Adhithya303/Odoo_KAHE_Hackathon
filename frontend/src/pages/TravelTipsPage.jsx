import Button from '../components/common/Button';

export default function TravelTipsPage() {
  const sections = [
    {
      title: '🧳 Packing Hacks',
      tips: [
        { title: 'Roll, Don\'t Fold', desc: 'Rolling clothes saves up to 30% more space and prevents wrinkles.' },
        { title: 'Packing Cubes', desc: 'Use packing cubes to organize by category — tops, bottoms, undergarments.' },
        { title: 'Universal Adapter', desc: 'Carry a universal power adapter that works in 150+ countries.' },
        { title: 'Medication Kit', desc: 'Pack essential medications in carry-on with copies of prescriptions.' },
        { title: 'Ziplock Bags', desc: 'Keep toiletries and electronics in ziplock bags to prevent spills and damage.' },
        { title: 'Layered Clothing', desc: 'Pack versatile layers that can be mixed and matched for any weather.' },
      ]
    },
    {
      title: '🛂 Visa Information',
      tips: [
        { title: 'Apply Early', desc: 'Submit visa applications at least 3-4 weeks before travel for processing time.' },
        { title: 'E-Visa Options', desc: 'Many countries offer e-visa — check online before visiting an embassy.' },
        { title: 'Document Copies', desc: 'Keep digital copies of passport, visa, and ID in cloud storage.' },
        { title: 'Transit Visas', desc: 'Check if layover countries require transit visas for your nationality.' },
        { title: 'Validity Check', desc: 'Ensure your passport is valid for at least 6 months beyond travel dates.' },
        { title: 'Embassy Registration', desc: 'Register with your country\'s embassy when traveling to remote areas.' },
      ]
    },
    {
      title: '📷 Photography Tips',
      tips: [
        { title: 'Golden Hour Magic', desc: 'Shoot during sunrise and sunset for the most stunning lighting.' },
        { title: 'Rule of Thirds', desc: 'Place subjects at intersections of a 3x3 grid for balanced compositions.' },
        { title: 'Local Perspectives', desc: 'Ask permission before photographing people and respect local customs.' },
        { title: 'Backup Storage', desc: 'Carry extra memory cards and back up photos to cloud daily.' },
        { title: 'Drone Regulations', desc: 'Check local drone laws before flying — many places require permits.' },
        { title: 'Waterproof Case', desc: 'Protect your camera with a waterproof case for beach and water activities.' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold">Travel Tips</h1>
          <p className="text-white/70 mt-2">Expert advice for smarter, safer travel</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl font-bold text-body mb-6">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.tips.map((tip, j) => (
                <div key={j} className="bg-white rounded-card shadow-card p-6 hover:shadow-elevated hover:-translate-y-1 transition-all duration-300">
                  <h3 className="font-semibold text-body mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
