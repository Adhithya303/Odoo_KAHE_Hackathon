import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BLOGS } from './BlogsPage';

/* ─── Full article content keyed by slug ─────────────────────────────────── */
const ARTICLE_CONTENT = {
  'hidden-gems-southeast-asia': {
    sections: [
      {
        heading: 'The Road Less Traveled',
        body: `Southeast Asia's most iconic destinations — Bali, Phuket, Ha Long Bay — draw millions of visitors each year for good reason. They are spectacular. But for every postcard-worthy beach the guidebooks endorse, there are a dozen equally stunning alternatives that see a fraction of the crowds and a fraction of the prices.

We spent six months traveling the region specifically to find them, and what we discovered exceeded every expectation. Here are our absolute favorites.`,
      },
      {
        heading: '1. Koh Rong Samloem, Cambodia',
        body: `While Siem Reap and Phnom Penh get all the Cambodia press, the island of Koh Rong Samloem sits quietly in the Gulf of Thailand, offering pristine white sand, bioluminescent plankton that lights up the water at night, and a pace of life that feels genuinely unhurried.

Getting here requires a 45-minute ferry from Sihanoukville, and most bungalows have no Wi-Fi — which is entirely the point. Accommodation runs from $10 beachside hammock huts to $80 eco-lodges.`,
      },
      {
        heading: '2. Hsipaw, Myanmar',
        body: `Trekking in northern Myanmar remains one of the last truly off-beat experiences in Asia. Hsipaw is the gateway to multi-day treks through Shan villages where electricity arrived less than a decade ago and plastic bottles are still novel objects.

Trek with a local guide — it supports the community directly and ensures you navigate the linguistic and cultural nuances responsibly.`,
      },
      {
        heading: '3. Moc Chau, Vietnam',
        body: `Most Vietnam itineraries run Hanoi → Halong Bay → Hoi An → Ho Chi Minh City. Moc Chau, a highland plateau four hours from Hanoi, is entirely absent from that circuit — and absolutely magnificent.

The plateau blooms with white plum blossoms in January and February, followed by fields of sunflowers in summer. Motorbike rental from Son La costs roughly $8 a day. Accommodation in a local homestay is $15, including dinner and breakfast.`,
      },
      {
        heading: 'Practical Notes',
        body: `• Best time to visit SE Asia broadly: November–April for most countries.\n• Budget: $35–60/day covers accommodation, food, transport, and activities comfortably.\n• Visas: Most nationalities get 30-day visa-free or visa-on-arrival in Thailand, Cambodia, and Malaysia. Vietnam requires an e-visa ($25).\n• Health: Check typhoid, hepatitis A, and malaria recommendations with your doctor 6 weeks before departure.`,
      },
    ],
  },
  'budget-europe-backpacking': {
    sections: [
      {
        heading: 'Rethinking "Expensive" Europe',
        body: `The idea that Europe is out of reach for budget travelers is a myth that Western European tourism boards have inadvertently perpetuated. Western Europe can indeed be pricey — but Eastern and Southern Europe offer extraordinary value, and even France and Germany can be done on the cheap with the right strategies.`,
      },
      {
        heading: 'The Balkans: The New Southeast Asia of Europe',
        body: `Albania, North Macedonia, Bosnia and Herzegovina, and Kosovo have become the insider circuit for savvy backpackers. Accommodation averages €15–20 in private rooms. A sit-down restaurant meal rarely exceeds €6. Cities like Tirana, Ohrid, and Mostar are architecturally stunning, historically rich, and refreshingly tourist-light.`,
      },
      {
        heading: 'Hostels, Night Trains & Free Museums',
        body: `Your three greatest budget allies in Europe:\n\n1. **Hostels** — A quality dorm in Prague, Ljubljana, or Porto costs €12–18. Many hostels include breakfast.\n2. **Night trains** — Overnight trains between cities save on accommodation. Ljubljana to Vienna overnight is €29 in a couchette.\n3. **Free museum days** — Most major European museums are free on the first Sunday of each month. The Louvre, Prado, and Rijksmuseum all participate.`,
      },
      {
        heading: 'Sample 30-Day Budget Breakdown',
        body: `Accommodation (mix of hostels & budget hotels): ₹900/day\nFood (market lunches, local restaurants, supermarket dinners): ₹350/day\nTransport (Interrail pass amortized): ₹180/day\nActivities, entry fees, tours: ₹70/day\n\nTotal: ≈ ₹1,500/day — absolutely achievable.`,
      },
    ],
  },
  'ai-travel-planning-revolution': {
    sections: [
      {
        heading: 'The Old Way vs. the New Way',
        body: `Planning a two-week trip to Japan used to take weeks of research: cross-referencing flight prices, building day-by-day spreadsheets, manually checking hotel availability, reading dozens of blog posts. Today, AI systems can draft a fully personalized, day-by-day itinerary — with alternatives, budget estimates, and local tips — in under 90 seconds.`,
      },
      {
        heading: 'What AI Does Better Than Humans',
        body: `**Pattern recognition at scale.** An AI can ingest thousands of traveler reviews, weather records, pricing trends, and visa requirements simultaneously and synthesize them into a recommendation calibrated to your specific preferences, travel dates, and budget.

**Real-time adaptation.** Dynamic AI itinerary builders can reroute your day if a museum is unexpectedly closed, rebook accommodation if reviews drop below a threshold, or flag a public holiday that affects restaurant availability.`,
      },
      {
        heading: 'WanderIQ\'s AI Planning Suite',
        body: `WanderIQ specifically was built to solve the complexity problem. The platform's ML recommendation engine considers your past trip data, preference profile, and even the emotional tone of your queries to surface destinations you would likely love but would never have thought to Google.

The budget prediction model is trained on real traveler spending data across 400+ destinations and typically comes within 8% of actual trip costs — significantly more accurate than rule-of-thumb estimates.`,
      },
      {
        heading: 'What AI Still Cannot Replace',
        body: `The spontaneous recommendation from a taxi driver. The feeling of turning a corner and being overwhelmed by a cityscape you had not anticipated. The human judgment that decides a rainy afternoon in a tiny local café is more valuable than rushing to the next attraction on the list.

AI is a powerful planning tool. The living of the trip remains gloriously human.`,
      },
    ],
  },
  'india-road-trip-highway-guide': {
    sections: [
      {
        heading: 'Why India Is a Road Tripper\'s Paradise',
        body: `India\'s road network stretches over 6.4 million kilometres — the second-largest in the world. More importantly, it traverses terrain so varied that a single 10-day drive can take you from scorching desert to alpine meadow, from colonial-era hill station to ancient seaport. No flight can replicate what unfolds beyond a car window.`,
      },
      {
        heading: '1. Manali to Leh — The Crown Jewel',
        body: `At 479 km, the Manali–Leh Highway crosses five mountain passes, including Rohtang (3,978m) and Tanglang La (5,328m — one of the highest motorable roads on Earth). The drive takes two days minimum and rewards with landscapes that feel genuinely alien: emerald rivers cutting through rust-red gorges, Tibetan monasteries perched on impossible ledges, and skies so clear you can see stars at noon.

Best window: mid-June to mid-September. A Bolero or Innova is ideal; budget around ₹15,000–20,000 for fuel.`,
      },
      {
        heading: '2. Mumbai to Goa on NH66',
        body: `The Konkan Coast drive is India\'s answer to California\'s PCH. NH66 hugs the Western Ghats as they tumble into the Arabian Sea, passing through cashew orchards, concrete bridges spanning tidal rivers, and small fishing towns where the day\'s catch is grilled on the roadside by 6am.

Distance: ~600 km. Drive time: 10–12 hours. Stop at Chiplun for solkadhi and fish thali. Budget ₹4,500 for fuel in a mid-size car.`,
      },
      {
        heading: '3. The Spiti Circuit — For Advanced Drivers',
        body: `Spiti Valley is accessible from two sides: via Shimla (tarmac, reliable) or via Manali (partly unpaved, dramatic). The full loop — Shimla → Kalpa → Kaza → Kunzum Pass → Manali — is 1,000 km of some of the most breathtaking terrain India offers.

Fuel warning: the only petrol pump between Kaza and Gramphu is at Kaza itself. Fill up. Spare tyre is mandatory.`,
      },
      {
        heading: 'Essential Road Trip Checklist',
        body: `• RC book, insurance, and driving licence — originals, not photocopies, for Himachal and J&K checkposts.\n• Offline maps (Maps.me or downloaded Google Maps) — cellular is patchy above 3,500m.\n• First aid kit, altitude sickness tablets (Diamox), and at least 5 litres of water per person.\n• Portable tyre inflator and basic toolkit.\n• Carry enough cash — hill towns rarely have ATMs.`,
      },
    ],
  },
  'travel-photography-beginners': {
    sections: [
      {
        heading: 'The Myth of the Expensive Camera',
        body: `The single most common question new travel photographers ask is: "Which camera should I buy?" The answer, almost always, is: the one you already have. The best camera is the one in your pocket.

Modern smartphone cameras — iPhone 15, Pixel 8, Samsung S24 — produce files that professional photographers of the 1990s would have considered extraordinary. The constraint is never the sensor. It is the eye behind it.`,
      },
      {
        heading: 'Rule 1: Chase Light, Not Locations',
        body: `The difference between an average photo and a stunning one is almost always light. The golden hour — 30 to 60 minutes after sunrise and before sunset — wraps everything in warm, directional light that eliminates harsh shadows and makes colours glow.

Wake up early. Stay out late. The Eiffel Tower at 2pm looks like a postcard. At 7:15am with mist on the Seine, it looks like a painting.`,
      },
      {
        heading: 'Rule 2: The Rule of Thirds',
        body: `Divide your frame into nine equal rectangles (most phone cameras show this grid in settings). Place your subject — a person, a mountain peak, a doorway — at one of the four intersection points rather than dead centre. The result is immediately more dynamic and visually interesting.

Exception: reflections and symmetry. Centred compositions work beautifully when the subject has perfect bilateral symmetry.`,
      },
      {
        heading: 'Rule 3: Tell a Story, Not Just a Scene',
        body: `The photographs that stop people mid-scroll are those that make the viewer feel something — curiosity, longing, recognition. A wide shot of the Taj Mahal tells us where you were. A close-up of an old man selling marigolds at its gate tells us something about India.

Include people. Include hands, feet, windows, shadows. Context makes the image breathe.`,
      },
      {
        heading: 'The 3-Shot Framework for Every Location',
        body: `For each location, shoot three types of shots before moving on:\n\n1. **Wide** — Establishes the place. Sky, surroundings, scale.\n2. **Medium** — Your subject in context. A person in a market, a temple in its surroundings.\n3. **Close** — Detail. A carved door, a bowl of spices, a child\'s expression.\n\nThese three shots, edited consistently, will tell a complete visual story of every place you visit.`,
      },
    ],
  },
  'wellness-travel-retreats-2025': {
    sections: [
      {
        heading: 'Why Wellness Travel Has Exploded',
        body: `The Global Wellness Institute values the wellness tourism market at $817 billion, growing at twice the rate of conventional tourism. The reason is not surprising: burnout, digital exhaustion, and post-pandemic anxiety have created a generation of travelers who want more than sightseeing. They want restoration.`,
      },
      {
        heading: 'The Ayurvedic Retreats of Kerala',
        body: `Kerala has practiced Ayurveda for over 5,000 years. The best retreats — Somatheeram, Kalari Kovilakom, Vaidyagrama — offer personalised treatment plans developed by resident vaidyas (Ayurvedic physicians) rather than menu-style spa add-ons. A 7-day Panchakarma detox program typically costs ₹80,000–₹1,50,000 all-inclusive.

The key difference between a genuine Ayurvedic retreat and a spa that uses the word "Ayurvedic" as marketing: look for retreats where a physician consultation is mandatory before any treatment begins.`,
      },
      {
        heading: 'Bali\'s Ubud: The Global Wellness Capital',
        body: `Ubud\'s status as a wellness destination predates Eat, Pray, Love — but Elizabeth Gilbert\'s memoir accelerated it dramatically. Today, the town and its surroundings host dozens of world-class retreat centres: The Yoga Barn, Fivelements, COMO Shambhala Estate.

A week at a mid-range Ubud retreat costs $800–1,500, including accommodation, meals (almost always plant-based and organic), daily yoga, and meditation sessions.`,
      },
      {
        heading: 'How to Choose the Right Retreat',
        body: `Ask these five questions before booking:\n\n1. Is there a physician or certified practitioner on staff, or just instructors?\n2. What is the maximum group size? (Smaller is almost always better.)\n3. Are meals included, and is the food philosophy aligned with the retreat\'s approach?\n4. Is digital detox encouraged or mandatory?\n5. What is the refund policy if you need to leave early?\n\nAlso: read recent reviews specifically about the practitioners, not just the rooms.`,
      },
    ],
  },
  'visa-free-countries-india-passport': {
    sections: [
      {
        heading: 'Understanding the Henley Passport Index',
        body: `The Henley Passport Index ranks 199 passports by the number of destinations their holders can access without a prior visa. In 2025, the Indian passport ranks around 82nd, offering visa-free or visa-on-arrival access to 62 destinations — up from 52 in 2015, a steady improvement driven by bilateral agreements.`,
      },
      {
        heading: 'Top Visa-Free Destinations for Indians',
        body: `**Southeast Asia:**\n• Thailand — 30 days visa-free\n• Indonesia (Bali) — 30 days visa-free\n• Cambodia — 30 days visa-on-arrival\n• Sri Lanka — 30 days ETA (free)\n• Maldives — 30 days visa-on-arrival (free)\n\n**Africa:**\n• Mauritius — 90 days visa-free\n• Kenya — eTA required ($30)\n• Tanzania — visa-on-arrival ($50)\n\n**Pacific:**\n• Fiji — 4 months visa-free\n• Vanuatu — 30 days visa-free`,
      },
      {
        heading: 'Visa-on-Arrival vs. e-Visa vs. Visa-Free: The Difference',
        body: `These three terms are often confused:\n\n**Visa-free** — You genuinely need nothing. Walk off the plane, show your passport.\n\n**Visa-on-arrival** — You get a visa at the airport counter. May require a fee, photo, and onward ticket. Takes 20 minutes to an hour.\n\n**e-Visa** — Apply online before travel (usually 48–72 hours processing). Must be approved before you fly. Examples: Kenya, Ethiopia, Azerbaijan.`,
      },
      {
        heading: 'How to Strengthen Your Passport\'s Power',
        body: `No, you cannot change your passport\'s ranking — but you can maximise your travel freedom:\n\n• Get a US or Schengen visa. Once stamped, dozens of additional countries grant visa-free access to US/Schengen visa holders (e.g., Mexico, Albania, North Macedonia).\n• An OCI card (Overseas Citizen of India) gives you visa-free access to India and simplifies many third-country applications.\n• Travel history matters: a clean record of exits from countries you\'ve visited strengthens future visa applications.`,
      },
    ],
  },
  'wildlife-safari-africa-guide': {
    sections: [
      {
        heading: 'The Big Five — And Why That Term Is Outdated',
        body: `"Big Five" was coined by big game hunters to describe the five most dangerous animals to hunt on foot: lion, elephant, buffalo, leopard, and rhino. The term has been repurposed by tourism, but conservation-focused safari operators now speak of the "Ugly Five" (wildebeest, hyena, warthog, vulture, marabou stork) and the "Shy Five" (aardvark, porcupine, meerkat, aardwolf, bat-eared fox) — animals equally fascinating, far less photographed.`,
      },
      {
        heading: 'The Great Migration: Africa\'s Greatest Wildlife Event',
        body: `Each year, roughly 1.5 million wildebeest, 400,000 zebras, and 200,000 gazelles complete a 3,000km circular migration through Tanzania\'s Serengeti and Kenya\'s Masai Mara in pursuit of rainfall and fresh grass.

The river crossings — where herds plunge into crocodile-filled rivers — occur between July and October at the Mara River in Kenya. These are the moments photographers wait months for. Book camps near Kichwa Tembo or Serena Mara at least 12 months in advance.`,
      },
      {
        heading: 'Choosing the Right Safari Style',
        body: `**Budget camping safaris** ($150–250/day): Share a vehicle with other travelers. Tented camps. Best value for solo travelers.\n\n**Mid-range lodge safaris** ($300–500/day): Private en-suite tents or chalets. Full board. Game drives included.\n\n**Luxury private safaris** ($1,000+/day): Private vehicle, private guide, fly-in access to remote conservancies. Singita, Angama, Cottar\'s 1920s Camp.\n\nFor first-timers: a mid-range 7-day Tanzania circuit (Tarangire + Serengeti + Ngorongoro) is the gold standard.`,
      },
      {
        heading: 'Practical Planning Notes',
        body: `• **Best time**: June–October (dry season) for most parks. Wildlife concentrates at water sources.\n• **Health**: Yellow fever vaccine required for Tanzania and Kenya. Malaria prophylaxis is strongly recommended.\n• **Visa**: East Africa Tourist Visa ($100) covers Kenya, Uganda, and Rwanda in a single stamp — excellent value for multi-country trips.\n• **Tip**: A $15–20/day tip for guides and camp staff is standard and meaningful.`,
      },
    ],
  },
  'honeymoon-destinations-india-couples': {
    sections: [
      {
        heading: 'Why India for a Honeymoon?',
        body: `India offers something no island destination can replicate: the combination of dramatic natural beauty, ancient culture, world-class hospitality, and genuine culinary magic — all within a single country. A Rajasthan honeymoon feels nothing like a Kerala honeymoon, which feels nothing like a Kashmir honeymoon. The diversity is extraordinary.`,
      },
      {
        heading: 'Kerala: The Classic Romantic Escape',
        body: `Houseboats (kettuvallam) drifting through the Alleppey backwaters at sunset, Ayurvedic couples massages in cliff-top resorts, and seafood dinners on private beaches in Kovalam. Kerala remains India\'s most consistently romantic destination for very good reason.

Stay recommendation: Kumarakom Lake Resort or Coconut Lagoon for the full backwater experience. Vythiri Resort in Wayanad for couples who prefer misty hills over backwaters. Budget for Kerala honeymoon (4 nights): ₹60,000–₹1,20,000.`,
      },
      {
        heading: 'Kashmir: For the Grand Romantic Statement',
        body: `Dal Lake houseboats with carved walnut wood interiors. Meadows of wildflowers in Gulmarg. Shikara rides at dawn with the Himalayas reflecting in still water. Kashmir\'s beauty is operatic — designed, it seems, specifically for falling in love.

Best time: May–June (spring bloom) or September–October (autumn colours). Avoid peak summer (July–August) crowds. Budget: ₹80,000–₹1,50,000 for 5 nights.`,
      },
      {
        heading: 'Rajasthan: Heritage and Grandeur',
        body: `No other Indian state offers what Rajasthan does for couples who want to feel like royalty: heritage palace hotels where you sleep in the maharaja\'s chambers, candlelit dinners in fort courtyards, and Thar Desert camps under a sky full of stars.

Itinerary: Jaipur (2 nights, Samode Palace) → Jodhpur (2 nights, Umaid Bhawan) → Jaisalmer (2 nights, Suryagarh). Budget: ₹1,50,000–₹3,00,000 for 6 nights at heritage properties.`,
      },
    ],
  },
  'digital-nomad-cities-2025': {
    sections: [
      {
        heading: 'The Digital Nomad Economy in 2025',
        body: `The number of American digital nomads alone crossed 17 million in 2023. Add European, Indian, and Australian remote workers and the global figure comfortably exceeds 40 million. Cities that recognised this early — Chiang Mai, Medellín, Tbilisi — built ecosystems around them: co-working spaces, nomad visas, and Facebook groups that function like informal chambers of commerce.`,
      },
      {
        heading: '1. Chiang Mai, Thailand — The Original',
        body: `No city built the digital nomad template more explicitly than Chiang Mai. Nimman Road is lined with ergonomic co-working spaces open 24/7. A one-month co-working membership costs $60–80. Monthly rent for a furnished studio: $250–400. A full day\'s food budget if you eat Thai: $8–12.

Cons: Visa runs to neighbouring countries are required every 30–90 days. The air quality from agricultural burning (February–April) is genuinely poor.`,
      },
      {
        heading: '2. Lisbon, Portugal — The European Favourite',
        body: `Portugal introduced its Digital Nomad Visa in 2022, requiring proof of $3,500/month income. Lisbon offers what few nomad hubs do: world-class food, Atlantic beaches, a dynamic arts scene, and access to the entire Schengen Zone.

Monthly budget in Lisbon: $2,000–3,000 (significantly more than Asia, significantly less than London or Paris). Co-working spaces: Second Home, Heden, Outsite Lisbon.`,
      },
      {
        heading: '3. Tbilisi, Georgia — The Hidden Gem',
        body: `Georgia allows most nationalities to stay for 365 days without a visa. Tbilisi combines Soviet-era architecture with a booming café culture, some of the best natural wine in the world, and a cost of living that makes Southeast Asia look expensive by comparison.

Monthly budget: $800–1,200 including accommodation. The internet infrastructure is excellent — average speeds exceed 100Mbps. The downside: limited direct flight connectivity from India.`,
      },
      {
        heading: 'The Nomad Visa Landscape: 2025 Update',
        body: `Countries now offering formal digital nomad or remote work visas (mid-2025):\n• Portugal (D8 Visa) — €3,040/month income threshold\n• Spain (Digital Nomad Visa) — €2,334/month\n• Greece — €3,500/month\n• Costa Rica — $3,000/month\n• UAE — Dubai Virtual Working Programme — $5,000/month (but zero income tax)\n• Georgia — No visa, no income requirement, 365 days`,
      },
    ],
  },
  'ancient-heritage-sites-india': {
    sections: [
      {
        heading: 'India\'s Relationship With Its Own Past',
        body: `India has 42 UNESCO World Heritage Sites — more than any other Asian country. But beyond the UNESCO label, India\'s relationship with its ancient past is complex and intimate: these are not dead ruins but living sites where pilgrims still pray, artisans still practise, and festivals still mark the same dates they have for a thousand years.`,
      },
      {
        heading: '1. Hampi, Karnataka',
        body: `The capital of the Vijayanagara Empire (14th–16th century), Hampi spreads across 26 square kilometres of boulder-strewn landscape on the banks of the Tungabhadra. Over 1,600 monuments survive: bathing ghats, elephant stables, stepped tanks, and the extraordinary Vittala Temple with its famous stone chariot.

Getting there: Hospet (12km away) is the nearest railhead. Stay in the village across the river for the full atmosphere. Budget: ₹500–800/day for guesthouses, ₹40 for temple entry.`,
      },
      {
        heading: '2. Ajanta Caves, Maharashtra',
        body: `Carved between the 2nd century BCE and 6th century CE, Ajanta\'s 30 rock-cut Buddhist cave monasteries contain the finest ancient mural paintings in Asia — murals so detailed that scholars can read the textile patterns, jewellery styles, and facial expressions of people who lived 1,500 years ago.

The caves were rediscovered by a British officer hunting tigers in 1819, having been abandoned and overgrown for nearly a millennium. They remain among the most affecting artistic experiences India offers.`,
      },
      {
        heading: '3. Khajuraho, Madhya Pradesh',
        body: `The Chandela temples of Khajuraho (10th–12th century) are famous for their erotic carvings — but the sexuality represents only about 10% of the sculpture; the rest depicts scenes from daily life, celestial beings, and mythological narratives in breathtaking detail.

Scholars still debate the iconography\'s meaning. One theory: the erotic carvings appear exclusively on outer walls as a threshold between the worldly and the sacred — a reminder to leave desire outside before entering the divine space.`,
      },
      {
        heading: 'Planning a Heritage Circuit',
        body: `A 10-day "Golden Heritage Circuit" itinerary:\n• Agra (2 nights) — Taj Mahal, Agra Fort, Fatehpur Sikri\n• Jaipur (2 nights) — Amber Fort, Jantar Mantar, City Palace\n• Khajuraho (2 nights) — Western & Eastern temple groups\n• Sanchi (1 night) — Buddhist stupas, 3rd century BCE\n• Ajanta & Ellora (2 nights, base Aurangabad)\n\nBest transport: train between major cities. Budget: ₹25,000–₹40,000 for accommodation, transport, and entry fees.`,
      },
    ],
  },
  'eco-travel-sustainable-trips': {
    sections: [
      {
        heading: 'The Carbon Problem With Travel',
        body: `A single long-haul return flight generates roughly 1.5–3 tonnes of CO₂ per passenger — equivalent to two to four months of an average person\'s car driving. Aviation accounts for about 2.5% of global CO₂ emissions, but its contrail warming effect means its total climate impact is closer to 3.5%.

This does not mean you should stop flying. It means every travel decision has a climate dimension, and the cumulative effect of thoughtful choices is significant.`,
      },
      {
        heading: 'The Hierarchy of Sustainable Travel Choices',
        body: `**Highest impact decisions (in order):**\n\n1. **Fly less, go longer** — One 3-week trip has a lower footprint than three 1-week trips to the same region.\n2. **Choose direct flights** — Take-off and landing account for the highest fuel burn; connections add meaningfully to emissions.\n3. **Fly economy** — Business class seats have 3× the carbon footprint per passenger because of their larger footprint on the plane.\n4. **Take trains where possible** — The Paris–London Eurostar emits 96% less CO₂ than flying.`,
      },
      {
        heading: 'Eco-Certified Accommodation: What to Look For',
        body: `Certifications matter, but not all are equal. The most rigorous standards:\n\n• **Green Key** — Audited annually, covers 65 criteria across energy, water, waste, and community engagement.\n• **Rainforest Alliance** — Particularly relevant for Central/South America and Southeast Asia.\n• **LEED/BREEAM** — Architectural certifications for genuinely low-impact buildings.\n\nAvoid: properties that use the word "eco" or "sustainable" without any third-party certification.`,
      },
      {
        heading: 'Practical Sustainable Travel Habits',
        body: `• Carry a reusable water bottle with a filter (LifeStraw, Brita) — eliminates plastic bottle purchase entirely.\n• Pack a tote bag, solid shampoo bars, and bamboo toiletries.\n• Eat local: a meal sourced from within 100km of where you sit has a fraction of the food miles of an imported plate.\n• Offset thoughtfully: atmosfair.de and Gold Standard offsets fund genuinely additional projects, not just paper credits.\n• Tip guides, drivers, and hotel staff generously — direct economic benefit to local communities is the most impactful thing most tourists can do.`,
      },
    ],
  },
  'budget-thailand-vietnam-2025': {
    sections: [
      {
        heading: 'The Great Southeast Asia Question',
        body: `For Indian travelers in particular, Thailand and Vietnam represent the two most popular international short-haul destinations — both within 4–5 hours flying time, both offering tropical beaches, extraordinary food, ancient temples, and a cost of living that makes the rupee feel powerful. But they are very different countries, and which one is "better" depends entirely on what you\'re looking for.`,
      },
      {
        heading: 'Cost Comparison (Per Day, Budget Traveler)',
        body: `| Category | Thailand | Vietnam |\n|---|---|---|\n| Budget guesthouse | ₹800–1,200 | ₹600–900 |\n| Street food meal | ₹80–150 | ₹60–120 |\n| Sit-down restaurant | ₹300–600 | ₹200–450 |\n| Local transport | ₹100–300 | ₹80–200 |\n| Temple entry | ₹40–200 | ₹20–100 |\n| **Daily total** | **₹1,500–2,500** | **₹1,200–2,000** |\n\nVerdict on cost: Vietnam wins, but not by as much as the backpacker folklore suggests.`,
      },
      {
        heading: 'Thailand Wins On...',
        body: `**Islands:** Koh Lanta, Koh Tao, Koh Samui, the Phi Phi archipelago. Thailand\'s island infrastructure — speedboats, ferry networks, beachfront bungalows — is unmatched in Southeast Asia.\n\n**Nightlife:** From Ko San Road in Bangkok to the Full Moon Party on Koh Phangan, Thailand\'s party infrastructure is a world unto itself.\n\n**Food diversity:** Green curry, pad thai, tom kha, som tam, massaman — the variety is extraordinary. Bangkok is arguably the street food capital of the world.`,
      },
      {
        heading: 'Vietnam Wins On...',
        body: `**Scenery:** Ha Long Bay\'s karst limestone islands, the rice terraces of Sapa, the ancient town of Hoi An, the Mekong Delta — Vietnam\'s visual diversity is staggering for a country 1,650km long.\n\n**Coffee culture:** Vietnamese iced coffee (cà phê sữa đá) and egg coffee (cà phê trứng) are among the finest beverages in Asia. A cup costs ₹40–80.\n\n**History:** The Cu Chi tunnels, Hue\'s Imperial City, the DMZ, and the War Remnants Museum in Ho Chi Minh City offer a profound window into the 20th century.\n\n**Verdict:** First time in Southeast Asia? Thailand. Second time, or if you love history and scenery over beaches? Vietnam.`,
      },
    ],
  },
};

// Generate generic content for blogs without specific content
function generateGenericContent(blog) {
  return {
    sections: [
      {
        heading: 'Introduction',
        body: blog.excerpt + '\n\nIn this comprehensive guide, we explore everything you need to know to make the most of this experience, from planning and budgeting to the on-the-ground realities that only seasoned travelers know.',
      },
      {
        heading: 'Why This Matters',
        body: `Travel is one of the most transformative investments you can make. The experiences, perspectives, and memories generated by genuine exploration reshape how you understand the world and your place in it.

This particular topic — ${blog.title.split(':')[0]} — is one that consistently ranks among the most searched and most rewarding for travelers who actually follow through.`,
      },
      {
        heading: 'Planning Your Approach',
        body: `The key to a successful experience is preparation without over-planning. Build a framework: know your budget envelope, your non-negotiables, and your flexibility windows. Leave room for serendipity — the best travel memories rarely come from the bullet points on an itinerary.

Our recommendation: spend 60% of your research time on logistics (flights, accommodation, visa) and 40% on inspiration (neighborhoods to explore, local foods to try, cultural norms to respect).`,
      },
      {
        heading: 'Final Thoughts',
        body: `${blog.tags.join(', ')} — these are more than keywords. They represent a way of engaging with the world that, once experienced, becomes part of how you define yourself as a traveler.

The best time to start planning is now. Use WanderIQ's AI planner to build your personalized itinerary in minutes, and let the anticipation begin.`,
      },
    ],
  };
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  const blog = BLOGS.find((b) => b.slug === slug);
  const related = BLOGS.filter((b) => b.slug !== slug).slice(0, 3);

  const content = ARTICLE_CONTENT[slug] || generateGenericContent(blog);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setScrollProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <p style={{ fontSize: '56px', marginBottom: '16px' }}>📄</p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '12px' }}>
          Article Not Found
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>
          The article you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/blogs"
          style={{
            background: '#0F6E56', color: '#fff', padding: '12px 28px',
            borderRadius: '999px', fontWeight: 700, textDecoration: 'none',
          }}
        >
          ← Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5ECD7' }}>
      {/* Reading progress bar */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 999,
          height: '3px', background: '#0F6E56',
          width: `${scrollProgress}%`, transition: 'width 0.1s linear',
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 'clamp(320px, 50vh, 520px)', overflow: 'hidden' }}>
        <img
          src={blog.image}
          alt={blog.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: '820px', padding: '0 24px',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>/</span>
            <Link to="/blogs" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textDecoration: 'none' }}>Blogs</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{blog.category}</span>
          </div>

          <span
            style={{
              background: blog.categoryColor, color: '#fff',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
              textTransform: 'uppercase', padding: '5px 14px', borderRadius: '999px',
              display: 'inline-block', marginBottom: '14px',
            }}
          >
            {blog.category}
          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#fff', fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 800, lineHeight: 1.25, marginBottom: '16px',
            }}
          >
            {blog.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '24px' }}>{blog.authorAvatar}</span>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{blog.author}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{blog.authorTitle}</p>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              {blog.date} · {blog.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '48px 24px 80px',
          display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px',
        }}
      >
        {/* Article Body */}
        <article>
          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {blog.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: '#fff', border: '1.5px solid #e5d8c4',
                  color: '#6b7280', fontSize: '12px', fontWeight: 600,
                  padding: '4px 14px', borderRadius: '999px',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Intro pull quote */}
          <blockquote
            style={{
              borderLeft: '4px solid #0F6E56', paddingLeft: '24px',
              margin: '0 0 40px',
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px', fontStyle: 'italic', color: '#374151',
              lineHeight: 1.6,
            }}
          >
            "{blog.excerpt}"
          </blockquote>

          {/* Article sections */}
          {content.sections.map((section, i) => (
            <section key={i} style={{ marginBottom: '36px' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px', fontWeight: 700, color: '#1a1a18',
                  marginBottom: '14px', lineHeight: 1.3,
                }}
              >
                {section.heading}
              </h2>
              {section.body.split('\n\n').map((para, j) => (
                <p
                  key={j}
                  style={{
                    fontSize: '16px', color: '#374151', lineHeight: 1.8,
                    marginBottom: '16px',
                  }}
                >
                  {para}
                </p>
              ))}
              {i < content.sections.length - 1 && (
                <hr style={{ border: 'none', borderTop: '1px solid #e5d8c4', margin: '32px 0' }} />
              )}
            </section>
          ))}

          {/* CTA Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F6E56, #1a9e7a)',
              borderRadius: '16px', padding: '32px',
              textAlign: 'center', marginTop: '48px',
            }}
          >
            <p style={{ color: '#86efac', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Ready to go?
            </p>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '10px',
              }}
            >
              Plan This Trip with WanderIQ AI
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '24px' }}>
              Get a personalized itinerary, budget estimate, and packing list in under 2 minutes.
            </p>
            <Link
              to="/signup"
              style={{
                display: 'inline-block', background: '#fff', color: '#0F6E56',
                padding: '12px 28px', borderRadius: '999px',
                fontWeight: 800, fontSize: '15px', textDecoration: 'none',
              }}
            >
              Start Planning Free →
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside>
          {/* Author Card */}
          <div
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              border: '1px solid #f0e8d8', marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '16px' }}>
              About the Author
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: '#f0e8d8', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '28px',
                }}
              >
                {blog.authorAvatar}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a18' }}>{blog.author}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>{blog.authorTitle}</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
              A passionate travel writer with experience exploring over 40 countries, specializing in budget travel, cultural immersion, and off-beat destinations.
            </p>
          </div>

          {/* Related Articles */}
          <div
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              border: '1px solid #f0e8d8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '20px' }}>
              Related Articles
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blogs/${rel.slug}`}
                  style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                >
                  <img
                    src={rel.image}
                    alt={rel.title}
                    style={{
                      width: '72px', height: '60px', objectFit: 'cover',
                      borderRadius: '10px', flexShrink: 0,
                    }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                        textTransform: 'uppercase', color: rel.categoryColor,
                      }}
                    >
                      {rel.category}
                    </span>
                    <p
                      style={{
                        fontSize: '13px', fontWeight: 600, color: '#1a1a18',
                        lineHeight: 1.35, marginTop: '2px',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}
                    >
                      {rel.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{rel.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Link
              to="/blogs"
              style={{
                display: 'block', textAlign: 'center', marginTop: '20px',
                paddingTop: '16px', borderTop: '1px solid #f0e8d8',
                fontSize: '13px', fontWeight: 700, color: '#0F6E56', textDecoration: 'none',
              }}
            >
              View All Articles →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
