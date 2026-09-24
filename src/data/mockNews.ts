import { NewsArticle, VideoNewsItem } from '../types/news';

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'art-1',
    title: 'Supreme Court Delivers Landmark Verdict on Digital Privacy & Data Governance Framework',
    summary: 'A constitutional bench ruled that digital rights and algorithmic transparency must be safeguarded with stringent independent oversight mechanisms.',
    content: `NEW DELHI — In a historic unanimous decision, the five-judge Constitutional Bench ruled today that digital personal data protection frameworks must adhere to principles of proportionality, individual autonomy, and unhindered judicial review.

The bench emphasized that in the era of artificial intelligence and automated decision-making systems, citizen sovereignty over personal data is non-negotiable. The judgment directives order all statutory regulatory authorities to institute independent grievance redressing tribunals within 90 days.

Legal experts have hailed the verdict as a monumental milestone for digital jurisprudence, balancing rapid technology advancement with constitutional civil liberties. Key industry bodies representing digital commerce and telecommunications have expressed support while preparing compliance roadmaps for the new guidelines.

Chief Justices noted: "Technological progress must elevate human dignity rather than erode it. Safeguards cannot be treated as bureaucratic hurdles, but as foundational pillars of democracy."`,
    category: 'Politics',
    categoryId: 'politics',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    author: 'Sunil Deshmukh',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    publishedAt: '12 mins ago',
    readingTimeMinutes: 4,
    isBreaking: true,
    isFeatured: true,
    viewsCount: 42350,
    source: 'Swaraj Special Bureau',
    tags: ['Supreme Court', 'Law', 'Privacy', 'Constitution'],
  },
  {
    id: 'art-2',
    title: 'Bumper Kharif Harvest Expected: Krishi Mandis Record High Cotton and Soybean Arrivals',
    summary: 'Favorable monsoon distribution across Vidarbha and Marathwada yields bumper crop returns as minimum support price procurement centers commence operations.',
    content: `NAGPUR — Farmers across Maharashtra and central India are witnessing historic crop yields following evenly spaced rainfall during the critical pod-formation stages. Agricultural Produce Market Committees (APMC) report heavy arrivals of grade-A soybean and long-staple cotton.

The state cooperative marketing federations have operationalized over 450 decentralized procurement centers with digital token queuing systems to prevent distress sales. Direct benefit transfer (DBT) mechanisms will ensure payments are deposited into farmer bank accounts within 48 hours of mandi delivery.

"Last season had erratic rainfall, but this season our yields have expanded by almost 28%," said Rameshwar Jadhav, a progressive cultivator from Akola district. Extension centers are now providing guidance on moisture testing and scientific warehouse storage techniques to optimize price realizations.`,
    category: 'Krishi & Farming',
    categoryId: 'krishi',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    author: 'Anand Shinde',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    publishedAt: '35 mins ago',
    readingTimeMinutes: 3,
    isBreaking: false,
    isTrending: true,
    trendingRank: 1,
    viewsCount: 28940,
    source: 'Krishi Varta',
    tags: ['Farming', 'Agriculture', 'MSP', 'Soybean', 'Cotton'],
  },
  {
    id: 'art-3',
    title: 'High-Speed Metro Phase 3 Underground Corridor Inaugurated: Travel Time Halved',
    summary: 'The newly commissioned 33-kilometer underground metro line connects major commercial hubs, reducing road congestion and vehicular emissions.',
    content: `MUMBAI — Urban mobility achieved another major milestone as the fully underground rapid transit corridor opened to commercial commuters this morning. Equipped with cutting-edge driverless train operation technology (GoA4) and regenerative braking systems, the corridor connects industrial and financial districts in under 42 minutes.

Commuter feedback was overwhelmingly positive during the inaugural morning rush hour. The network features platform screen doors, complete 5G network coverage inside deep tunnels, and unified QR-based ticketing compatible with existing suburban rail passes.

Urban transport specialists estimate that the line will take over 350,000 private vehicles off arterial highways daily, preventing thousands of metric tons of carbon emissions annually.`,
    category: 'State & Regional',
    categoryId: 'state',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    author: 'Pooja Kulkarni',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    publishedAt: '1 hour ago',
    readingTimeMinutes: 4,
    isBreaking: false,
    isTrending: true,
    trendingRank: 2,
    viewsCount: 36100,
    source: 'Urban Infrastructure Desk',
    tags: ['Metro', 'Infrastructure', 'Urban Transit', 'Commute'],
  },
  {
    id: 'art-4',
    title: 'Indian Tech Startups Surge in Global AI Patents: Breakthrough in Indian Language Models',
    summary: 'Consortium of indigenous engineering research labs releases bilingual large language models capable of understanding 22 scheduled regional dialects.',
    content: `BENGALURU — India’s open-source artificial intelligence ecosystem marked a significant leap forward today with the demonstration of a multi-modal foundation model trained specifically on regional cultural vernaculars and localized datasets.

The model demonstrates human-level accuracy in deciphering conversational dialects in Marathi, Hindi, Tamil, Telugu, and Bengali, making voice-based e-governance and healthcare assistance accessible to rural citizens without literacy barriers.

Industry leaders noted that native language AI infrastructure will democratize digital services across tier-2 and tier-3 towns. Several agritech and telemedicine apps have already integrated the APIs during beta trials to provide audio-first advisory services.`,
    category: 'Tech & Digital',
    categoryId: 'technology',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    author: 'Vikram Joshi',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    publishedAt: '2 hours ago',
    readingTimeMinutes: 5,
    isBreaking: false,
    isTrending: true,
    trendingRank: 3,
    viewsCount: 19820,
    source: 'TechSwaraj',
    tags: ['AI', 'Startups', 'Technology', 'Bhasha', 'Innovation'],
  },
  {
    id: 'art-5',
    title: 'Markets Hit All-Time Highs on Strong Foreign Inflows and Manufacturing Expansion',
    summary: 'Benchmark indices Nifty and Sensex rallied over 650 points driven by robust industrial output indices and infrastructure spending momentum.',
    content: `MUMBAI — Bullish momentum swept Dalal Street today as domestic and foreign institutional investors poured capital into manufacturing, energy, and banking equities. The benchmark index touched unprecedented record heights before settling firmly above psychological resistance barriers.

The rally was underpinned by macroeconomic indicators reflecting record GST collections, expanding purchasing managers indices (PMI), and stabilized commodity prices. Renewable energy companies and electrical vehicle component manufacturers led the gainers board with double-digit intraday rallies.

Market strategists maintain an optimistic long-term outlook: "India's capital expenditure cycle is firing on all cylinders. Domestic institutional liquidity combined with overseas equity flows creates resilient market fundamentals."`,
    category: 'Business',
    categoryId: 'business',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    author: 'Mahesh Patil',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    publishedAt: '3 hours ago',
    readingTimeMinutes: 3,
    isBreaking: false,
    isTrending: false,
    viewsCount: 15400,
    source: 'Swaraj Market Watch',
    tags: ['Economy', 'Sensex', 'Stock Market', 'Business', 'Finance'],
  },
  {
    id: 'art-6',
    title: 'Historic Gold Medal Win in World Archery Championship: Young Prodigy Sets Record',
    summary: '19-year-old archer from Satara clinches championship gold with consecutive bullseyes in an exhilarating tie-break shoot-off.',
    content: `GENEVA — In a gripping final at the World Archery Championship, nineteen-year-old Tanvi More etched her name into sporting history by securing gold for India in the individual compound event.

Facing stiff competition from former world champions, More maintained immaculate composure under intense wind gusts, shooting three consecutive 10s during the sudden-death shoot-off to clinch the top podium spot.

Celebrations broke out in her native village in western Maharashtra where hundreds gathered with traditional dhol-tasha drums. The sports ministry has announced a cash grant alongside upgraded training facilities to prepare her squad for upcoming international games.`,
    category: 'Sports',
    categoryId: 'sports',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    author: 'Rajesh Gaikwad',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    publishedAt: '4 hours ago',
    readingTimeMinutes: 3,
    isBreaking: false,
    isTrending: false,
    viewsCount: 22100,
    source: 'Swaraj Krida',
    tags: ['Sports', 'Archery', 'Gold Medal', 'Athletes'],
  },
  {
    id: 'art-7',
    title: 'National Award-Winning Marathi Epic Film Crosses ₹100 Crore Global Box Office',
    summary: 'A breathtaking historical drama celebrating the maritime fortresses of Chhatrapati Shivaji Maharaj sets unprecedented cinema attendance records.',
    content: `PUNE — The cinematic historical saga "Sindhudurg: The Sea Fortress" has rewritten box office history, becoming the fastest regional production to surpass the ₹100 crore milestone globally.

Critics and audiences alike have praised the film for its authentic production design, researched naval battle choreography, and thunderous musical score. The film has screened with English subtitles in over 24 countries across North America, Europe, and the Middle East to packed auditoriums.

The director expressed heartfelt gratitude to viewers: "This was a passion project dedicated to showcasing our maritime heritage and fortress architecture to the world. The love and appreciation across generations is deeply humbling."`,
    category: 'Entertainment',
    categoryId: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    author: 'Neha Sawant',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    publishedAt: '5 hours ago',
    readingTimeMinutes: 3,
    isBreaking: false,
    isTrending: false,
    viewsCount: 44200,
    source: 'Entertainment Desk',
    tags: ['Cinema', 'Box Office', 'Culture', 'Marathi Movies'],
  },
];

export const MOCK_VIDEOS: VideoNewsItem[] = [
  {
    id: 'vid-1',
    title: 'Ground Report: How Solar Micro-Grids are Powering Remote Farms in Drought-Prone Regions',
    category: 'Krishi & Farming',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '04:15',
    viewsCount: 18200,
    publishedAt: '2 hours ago',
    author: 'Swaraj Video Investigation',
  },
  {
    id: 'vid-2',
    title: 'Special Analysis: The New Industrial Highway Corridor Connecting Ports to Hinterlands',
    category: 'State & Regional',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '06:40',
    viewsCount: 29500,
    publishedAt: '5 hours ago',
    author: 'Swaraj Special Features',
  },
  {
    id: 'vid-3',
    title: 'Press Briefing: Finance Minister on Inflation Control and Tax Rationalization',
    category: 'Business',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '08:22',
    viewsCount: 34100,
    publishedAt: '8 hours ago',
    author: 'National Press Bureau',
  },
  {
    id: 'vid-4',
    title: 'Match Highlights: Thrilling Last Over Finish at International Cricket Stadium',
    category: 'Sports',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531415074868-036b1c5c53ec?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '03:10',
    viewsCount: 51200,
    publishedAt: '12 hours ago',
    author: 'Swaraj Sports Reel',
  },
];
