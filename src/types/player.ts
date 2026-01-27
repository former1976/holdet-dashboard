// Player data types for the Holdet.dk dashboard

export interface Player {
  id: string;
  name: string;
  team: string;
  teamShort: string;
  position: string;
  matches: number;
  goals: number;
  assists: number;
  total: number; // goals + assists
  minutesPerContribution: number; // minutes per goal+assist
  price?: number; // price in millions (from holdet.dk)
  priceChange?: number; // price change from last round
  valuePerMillion?: number; // total / price
  form?: number; // recent form score (last 5 matches)
  trend?: 'up' | 'down' | 'stable';
  recentGoals?: number; // goals in last 5 matches
  recentAssists?: number; // assists in last 5 matches
  isHot?: boolean; // trending player
}

export interface Match {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  homeTeamShort: string;
  awayTeam: string;
  awayTeamShort: string;
  homeScore?: number;
  awayScore?: number;
  round: number;
  isCompleted: boolean;
}

export interface TeamStanding {
  position: number;
  team: string;
  teamShort: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[]; // last 5 results
  strength: 'strong' | 'medium' | 'weak';
}

export interface UpcomingFixture {
  team: string;
  teamShort: string;
  opponent: string;
  opponentShort: string;
  isHome: boolean;
  opponentStrength: 'weak' | 'medium' | 'strong';
  opponentPosition: number;
  round: number;
  date: string;
  time: string;
  difficultyScore: number; // 1-10, lower is easier
}

export interface PlayerRecommendation {
  player: Player;
  reason: string;
  score: number; // recommendation score 0-100
  fixtures: UpcomingFixture[];
}

export interface TransferCalculation {
  playerOut: Player | null;
  playerIn: Player | null;
  transferFee: number;
  netCost: number;
  valueDifference: number;
}

export interface HotPlayer {
  player: Player;
  recentContributions: number;
  contributionsPerMatch: number;
  hotStreak: number; // consecutive matches with contributions
  reason: string;
}
