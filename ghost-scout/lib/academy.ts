import { AcademyMatch, BenchmarkResult, PlayerInput } from './types'

type Position = PlayerInput['position']
type Foot = PlayerInput['dominant_foot']
type Rating = BenchmarkResult['overall_rating']

interface AcademyProfile {
  name: string
  country: string
  tier: 'elite' | 'top' | 'development'
  region: string
  positions: Position[]
  ageGroups: number[]
  preferLeftFoot: boolean
  regionalPipelines: string[]
  minRating: Rating
  contactEmail: string
  websiteUrl: string
  strengths: string[]
}

const RATING_ORDER: Record<Rating, number> = {
  developing: 1,
  promising: 2,
  high_potential: 3,
  exceptional: 4,
}

const COUNTRY_TO_REGION: Record<string, string> = {
  'Senegal': 'west_africa',
  'Nigeria': 'west_africa',
  'Ghana': 'west_africa',
  'Ivory Coast': 'west_africa',
  'Mali': 'west_africa',
  'Guinea': 'west_africa',
  'Gambia': 'west_africa',
  'Cameroon': 'central_africa',
  'DR Congo': 'central_africa',
  'Ethiopia': 'east_africa',
  'Kenya': 'east_africa',
  'Tanzania': 'east_africa',
  'Uganda': 'east_africa',
  'South Africa': 'southern_africa',
  'Morocco': 'north_africa',
  'Egypt': 'north_africa',
  'Algeria': 'north_africa',
  'Tunisia': 'north_africa',
  'Brazil': 'south_america',
  'Argentina': 'south_america',
  'Uruguay': 'south_america',
  'Colombia': 'south_america',
  'Chile': 'south_america',
  'Paraguay': 'south_america',
  'Peru': 'south_america',
  'Ecuador': 'south_america',
  'Venezuela': 'south_america',
  'Bolivia': 'south_america',
  'Mexico': 'central_america',
  'Honduras': 'central_america',
  'Costa Rica': 'central_america',
  'Guatemala': 'central_america',
  'Panama': 'central_america',
  'El Salvador': 'central_america',
  'Cambodia': 'southeast_asia',
  'Thailand': 'southeast_asia',
  'Vietnam': 'southeast_asia',
  'Indonesia': 'southeast_asia',
  'India': 'south_asia',
  'Japan': 'east_asia',
  'South Korea': 'east_asia',
  'China': 'east_asia',
  'France': 'western_europe',
  'Spain': 'western_europe',
  'Portugal': 'western_europe',
  'Germany': 'western_europe',
  'Netherlands': 'western_europe',
  'Belgium': 'western_europe',
  'England': 'western_europe',
  'Italy': 'western_europe',
  'Austria': 'central_europe',
  'Denmark': 'northern_europe',
  'Sweden': 'northern_europe',
  'Norway': 'northern_europe',
  'Qatar': 'middle_east',
}

const ACADEMIES: AcademyProfile[] = [
  {
    name: 'FC Barcelona La Masia',
    country: 'Spain',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [12, 13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: true,
    regionalPipelines: ['south_america', 'west_africa', 'western_europe'],
    minRating: 'high_potential',
    contactEmail: 'youth@fcbarcelona.cat',
    websiteUrl: 'https://www.fcbarcelona.com/en/card/644461/la-masia',
    strengths: ['technical', 'positional play', 'possession-based'],
  },
  {
    name: 'Ajax Academy',
    country: 'Netherlands',
    tier: 'elite',
    region: 'western_europe',
    positions: ['defender', 'midfielder', 'winger'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'south_america', 'northern_europe', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'youth@ajax.nl',
    websiteUrl: 'https://www.ajax.nl/en/youth-academy/',
    strengths: ['tactical intelligence', 'total football', 'versatility'],
  },
  {
    name: 'Manchester City Academy',
    country: 'England',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'south_america', 'western_europe'],
    minRating: 'exceptional',
    contactEmail: 'academy@mancity.com',
    websiteUrl: 'https://www.mancity.com/academy',
    strengths: ['physical', 'technical', 'pressing', 'build-up play'],
  },
  {
    name: 'Borussia Dortmund Youth',
    country: 'Germany',
    tier: 'elite',
    region: 'western_europe',
    positions: ['midfielder', 'winger'],
    ageGroups: [14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'western_europe', 'central_europe'],
    minRating: 'promising',
    contactEmail: 'youth@bvb.de',
    websiteUrl: 'https://www.bvb.de/eng/Teams/Youth',
    strengths: ['pace', 'pressing', 'counter-attacking', 'directness'],
  },
  {
    name: 'RB Leipzig Academy',
    country: 'Germany',
    tier: 'top',
    region: 'western_europe',
    positions: ['midfielder', 'winger', 'striker'],
    ageGroups: [14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'central_europe', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@rbleipzig.com',
    websiteUrl: 'https://www.dierotenbullen.com/en/youth-development.html',
    strengths: ['pressing intensity', 'athletic development', 'rapid progression', 'Red Bull network'],
  },
  {
    name: 'Benfica Academy',
    country: 'Portugal',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['south_america', 'west_africa', 'central_africa', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@slbenfica.pt',
    websiteUrl: 'https://www.slbenfica.pt/en-us/caixa-futebol-campus',
    strengths: ['technical', 'development pathway', 'South American/African pipeline'],
  },
  {
    name: 'Red Bull Salzburg Academy',
    country: 'Austria',
    tier: 'top',
    region: 'central_europe',
    positions: ['midfielder', 'winger', 'striker'],
    ageGroups: [14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'central_africa', 'central_europe', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@redbullsalzburg.at',
    websiteUrl: 'https://www.redbullsalzburg.at/en/fc-red-bull-salzburg/academy.html',
    strengths: ['high-energy', 'pressing', 'athleticism', 'rapid development'],
  },
  {
    name: 'Olympique Lyonnais Academy',
    country: 'France',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'central_africa', 'north_africa', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@ol.fr',
    websiteUrl: 'https://www.ol.fr/en/youth-academy',
    strengths: ['French-speaking Africa pipeline', 'technical', 'well-rounded'],
  },
  {
    name: 'PSG Academy',
    country: 'France',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'central_africa', 'north_africa', 'south_america', 'western_europe'],
    minRating: 'high_potential',
    contactEmail: 'academy@psg.fr',
    websiteUrl: 'https://en.psg.fr/teams/youth',
    strengths: ['elite physical', 'technical excellence', 'global scouting network'],
  },
  {
    name: 'Right to Dream Academy',
    country: 'Ghana',
    tier: 'top',
    region: 'west_africa',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [10, 11, 12, 13, 14, 15, 16, 17, 18],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'east_africa'],
    minRating: 'developing',
    contactEmail: 'scouting@righttodream.com',
    websiteUrl: 'https://www.righttodream.com',
    strengths: ['West African specialist', 'holistic development', 'education + football', 'pathway to FC Nordsjælland'],
  },
  {
    name: 'ASPIRE Academy',
    country: 'Qatar',
    tier: 'top',
    region: 'middle_east',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [12, 13, 14, 15, 16, 17, 18],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'east_africa', 'central_africa', 'southeast_asia', 'south_asia'],
    minRating: 'developing',
    contactEmail: 'football@aspire.qa',
    websiteUrl: 'https://www.aspire.qa',
    strengths: ['African talent pipeline', 'world-class facilities', 'global scouting', 'scholarship-based'],
  },
  {
    name: 'Diambars FC Academy',
    country: 'Senegal',
    tier: 'development',
    region: 'west_africa',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [12, 13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa'],
    minRating: 'developing',
    contactEmail: 'recrutement@diambars.org',
    websiteUrl: 'https://www.diambars.org',
    strengths: ['Senegalese specialist', 'education-first', 'European club partnerships', 'community development'],
  },
  {
    name: 'AFAD Djékanou',
    country: 'Ivory Coast',
    tier: 'development',
    region: 'west_africa',
    positions: ['winger', 'striker', 'midfielder'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa'],
    minRating: 'developing',
    contactEmail: 'contact@afad.ci',
    websiteUrl: 'https://www.afad.ci',
    strengths: ['West African forwards/wingers', 'Ivorian specialist', 'pathway to European clubs'],
  },
  {
    name: 'Flamengo Academy',
    country: 'Brazil',
    tier: 'elite',
    region: 'south_america',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['south_america'],
    minRating: 'promising',
    contactEmail: 'base@flamengo.com.br',
    websiteUrl: 'https://www.flamengo.com.br/categorias-de-base',
    strengths: ['Brazilian flair', 'technical excellence', 'attacking development', 'top-tier facilities'],
  },
  {
    name: 'River Plate Academy',
    country: 'Argentina',
    tier: 'elite',
    region: 'south_america',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: true,
    regionalPipelines: ['south_america'],
    minRating: 'promising',
    contactEmail: 'inferiores@cariverplate.com.ar',
    websiteUrl: 'https://www.cariverplate.com.ar/inferiores',
    strengths: ['creative players', 'Argentine development model', 'tactical intelligence', 'La Máquina heritage'],
  },
  {
    name: 'Club Nacional Academy',
    country: 'Uruguay',
    tier: 'top',
    region: 'south_america',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['south_america'],
    minRating: 'developing',
    contactEmail: 'formativas@nacional.uy',
    websiteUrl: 'https://www.nacional.uy',
    strengths: ['technically gifted South Americans', 'competitive mentality', 'proven export pathway'],
  },
  {
    name: 'Atalanta Academy',
    country: 'Italy',
    tier: 'elite',
    region: 'western_europe',
    positions: ['defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'western_europe', 'south_america'],
    minRating: 'promising',
    contactEmail: 'settoregiovanile@atalanta.it',
    websiteUrl: 'https://www.atalanta.it/en/youth-sector/',
    strengths: ['tactical development', 'physical conditioning', 'Italian defensive schooling', 'first-team pathway'],
  },
  {
    name: 'Sporting CP Academy',
    country: 'Portugal',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [12, 13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['south_america', 'west_africa', 'central_africa', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@sporting.pt',
    websiteUrl: 'https://www.sporting.pt/en/football/youth',
    strengths: ['technical refinement', 'Portuguese development model', 'global scouting', 'Cristiano Ronaldo alma mater'],
  },
  {
    name: 'Real Madrid Cantera',
    country: 'Spain',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [12, 13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['south_america', 'west_africa', 'western_europe'],
    minRating: 'exceptional',
    contactEmail: 'cantera@realmadrid.es',
    websiteUrl: 'https://www.realmadrid.com/en/football/academy',
    strengths: ['elite standard', 'physical + technical', 'winning mentality', 'La Fábrica tradition'],
  },
  {
    name: 'Feyenoord Academy',
    country: 'Netherlands',
    tier: 'top',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'south_america', 'northern_europe', 'western_europe'],
    minRating: 'promising',
    contactEmail: 'academy@feyenoord.nl',
    websiteUrl: 'https://www.feyenoord.nl/feyenoord-academy',
    strengths: ['street football mentality', 'robust development', 'Dutch tactical schooling'],
  },
  {
    name: 'Clairefontaine INF',
    country: 'France',
    tier: 'elite',
    region: 'western_europe',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa', 'central_africa', 'north_africa', 'western_europe'],
    minRating: 'high_potential',
    contactEmail: 'inf@fff.fr',
    websiteUrl: 'https://www.fff.fr/la-fff/le-centre-technique-national',
    strengths: ['French national institute', 'elite identification', 'Henry/Mbappé pathway', 'ages 13-15 only'],
  },
  {
    name: 'Génération Foot',
    country: 'Senegal',
    tier: 'development',
    region: 'west_africa',
    positions: ['goalkeeper', 'defender', 'midfielder', 'winger', 'striker'],
    ageGroups: [13, 14, 15, 16, 17, 18, 19],
    preferLeftFoot: false,
    regionalPipelines: ['west_africa'],
    minRating: 'developing',
    contactEmail: 'contact@generationfoot.com',
    websiteUrl: 'https://www.generationfoot.com',
    strengths: ['Metz FC partnership', 'Senegalese pipeline to France', 'Sadio Mané alma mater', 'proven European pathway'],
  },
]

function getPlayerRegion(country: string): string {
  return COUNTRY_TO_REGION[country] || 'unknown'
}

function computeFitScore(
  academy: AcademyProfile,
  player: PlayerInput,
  rating: Rating
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  const playerRegion = getPlayerRegion(player.country)

  // Regional pipeline match (0-30 points)
  if (academy.regionalPipelines.includes(playerRegion)) {
    score += 30
    reasons.push(`Strong ${playerRegion.replace('_', ' ')} pipeline`)
  } else if (academy.region === playerRegion) {
    score += 25
    reasons.push('Local academy for player region')
  }

  // Position fit (0-25 points)
  if (academy.positions.includes(player.position)) {
    score += 25
    reasons.push(`accepts ${player.position}s`)
  }

  // Age group availability (0-20 points)
  if (academy.ageGroups.includes(player.age)) {
    score += 20
    reasons.push(`U${player.age} program available`)
  } else {
    const closest = academy.ageGroups.reduce((prev, curr) =>
      Math.abs(curr - player.age) < Math.abs(prev - player.age) ? curr : prev
    )
    if (Math.abs(closest - player.age) <= 1) {
      score += 10
    }
  }

  // Dominant foot preference (0-10 points)
  if (academy.preferLeftFoot && (player.dominant_foot === 'left' || player.dominant_foot === 'both')) {
    score += 10
    reasons.push('values left-footed players')
  } else if (!academy.preferLeftFoot) {
    score += 5
  }

  // Rating threshold check (0-15 points, or penalty)
  const playerRatingLevel = RATING_ORDER[rating]
  const minRatingLevel = RATING_ORDER[academy.minRating]
  if (playerRatingLevel >= minRatingLevel) {
    score += 15
    if (playerRatingLevel >= 3) {
      reasons.push('player meets elite entry standard')
    }
  } else {
    score -= 15
  }

  return { score, reasons }
}

function buildReasonString(academy: AcademyProfile, reasons: string[]): string {
  const mainStrengths = academy.strengths.slice(0, 2).join(', ')
  const topReasons = reasons.slice(0, 2).join('; ')
  return `${topReasons}. Known for: ${mainStrengths}`
}

export interface MatchAcademyInput {
  player: PlayerInput
  rating: Rating
}

export function matchAcademies(input: MatchAcademyInput): AcademyMatch[] {
  const { player, rating } = input

  const scored = ACADEMIES.map(academy => {
    const { score, reasons } = computeFitScore(academy, player, rating)
    return { academy, score, reasons }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 3).map(({ academy, score, reasons }) => ({
    name: academy.name,
    country: academy.country,
    tier: academy.tier,
    fitScore: Math.min(Math.max(Math.round((score / 100) * 100), 0), 100),
    reason: buildReasonString(academy, reasons),
    contactEmail: academy.contactEmail,
    websiteUrl: academy.websiteUrl,
  }))
}

/**
 * Legacy function — returns the top academy name as a string.
 * Kept for backward compatibility with existing tests and consumers.
 */
export function matchAcademy(position: string, dominantFoot: string, country: string): string {
  const player: PlayerInput = {
    name: '',
    age: 16,
    country,
    position: position as PlayerInput['position'],
    height_cm: 175,
    weight_kg: 68,
    dominant_foot: dominantFoot as Foot,
    skills_description: '',
    language: '',
  }
  const matches = matchAcademies({ player, rating: 'high_potential' })
  return matches[0]?.name || 'Ajax Academy'
}
