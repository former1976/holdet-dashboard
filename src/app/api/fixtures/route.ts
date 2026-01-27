import { NextResponse } from 'next/server';
import { Match, UpcomingFixture, TeamStanding } from '@/types/player';

// Team data with standings (based on actual 2025/2026 season data)
const teamStandings: TeamStanding[] = [
  { position: 1, team: 'AGF', teamShort: 'AGF', played: 18, won: 12, drawn: 4, lost: 2, goalsFor: 35, goalsAgainst: 15, goalDifference: 20, points: 40, form: ['W', 'W', 'D', 'W', 'L'], strength: 'strong' },
  { position: 2, team: 'FC Midtjylland', teamShort: 'FCM', played: 18, won: 10, drawn: 6, lost: 2, goalsFor: 40, goalsAgainst: 18, goalDifference: 22, points: 36, form: ['W', 'W', 'W', 'D', 'W'], strength: 'strong' },
  { position: 3, team: 'Brøndby', teamShort: 'BIF', played: 18, won: 9, drawn: 4, lost: 5, goalsFor: 30, goalsAgainst: 22, goalDifference: 8, points: 31, form: ['L', 'W', 'W', 'D', 'L'], strength: 'strong' },
  { position: 4, team: 'OB', teamShort: 'OB', played: 18, won: 9, drawn: 3, lost: 6, goalsFor: 34, goalsAgainst: 25, goalDifference: 9, points: 30, form: ['W', 'D', 'W', 'L', 'W'], strength: 'medium' },
  { position: 5, team: 'FC København', teamShort: 'FCK', played: 17, won: 8, drawn: 5, lost: 4, goalsFor: 28, goalsAgainst: 18, goalDifference: 10, points: 29, form: ['D', 'W', 'L', 'W', 'D'], strength: 'strong' },
  { position: 6, team: 'Silkeborg', teamShort: 'SIF', played: 18, won: 8, drawn: 4, lost: 6, goalsFor: 32, goalsAgainst: 28, goalDifference: 4, points: 28, form: ['W', 'L', 'W', 'W', 'D'], strength: 'medium' },
  { position: 7, team: 'Randers', teamShort: 'RFC', played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 24, goalsAgainst: 26, goalDifference: -2, points: 23, form: ['L', 'D', 'W', 'L', 'D'], strength: 'medium' },
  { position: 8, team: 'Viborg', teamShort: 'VFF', played: 18, won: 5, drawn: 6, lost: 7, goalsFor: 22, goalsAgainst: 28, goalDifference: -6, points: 21, form: ['D', 'L', 'D', 'W', 'L'], strength: 'medium' },
  { position: 9, team: 'FC Nordsjælland', teamShort: 'FCN', played: 18, won: 5, drawn: 5, lost: 8, goalsFor: 26, goalsAgainst: 32, goalDifference: -6, points: 20, form: ['L', 'W', 'L', 'D', 'L'], strength: 'weak' },
  { position: 10, team: 'SønderjyskE', teamShort: 'SJF', played: 18, won: 4, drawn: 6, lost: 8, goalsFor: 20, goalsAgainst: 28, goalDifference: -8, points: 18, form: ['D', 'L', 'L', 'D', 'W'], strength: 'weak' },
  { position: 11, team: 'FC Fredericia', teamShort: 'FCF', played: 18, won: 3, drawn: 5, lost: 10, goalsFor: 18, goalsAgainst: 35, goalDifference: -17, points: 14, form: ['L', 'L', 'D', 'L', 'L'], strength: 'weak' },
  { position: 12, team: 'Vejle', teamShort: 'VB', played: 18, won: 3, drawn: 4, lost: 11, goalsFor: 17, goalsAgainst: 31, goalDifference: -14, points: 13, form: ['W', 'L', 'L', 'L', 'D'], strength: 'weak' },
];

// Upcoming fixtures (Runde 19-22)
const upcomingMatches: Match[] = [
  // Runde 19
  { id: '19-1', date: '2026-02-06', time: '19:00', homeTeam: 'AGF', homeTeamShort: 'AGF', awayTeam: 'OB', awayTeamShort: 'OB', round: 19, isCompleted: false },
  { id: '19-2', date: '2026-02-08', time: '14:00', homeTeam: 'FC Nordsjælland', homeTeamShort: 'FCN', awayTeam: 'SønderjyskE', awayTeamShort: 'SJF', round: 19, isCompleted: false },
  { id: '19-3', date: '2026-02-08', time: '14:00', homeTeam: 'Silkeborg', homeTeamShort: 'SIF', awayTeam: 'Viborg', awayTeamShort: 'VFF', round: 19, isCompleted: false },
  { id: '19-4', date: '2026-02-08', time: '16:00', homeTeam: 'FC Midtjylland', homeTeamShort: 'FCM', awayTeam: 'FC København', awayTeamShort: 'FCK', round: 19, isCompleted: false },
  { id: '19-5', date: '2026-02-08', time: '18:00', homeTeam: 'Brøndby', homeTeamShort: 'BIF', awayTeam: 'Randers', awayTeamShort: 'RFC', round: 19, isCompleted: false },
  { id: '19-6', date: '2026-02-09', time: '19:00', homeTeam: 'Vejle', homeTeamShort: 'VB', awayTeam: 'FC Fredericia', awayTeamShort: 'FCF', round: 19, isCompleted: false },
  // Runde 20
  { id: '20-1', date: '2026-02-14', time: '19:00', homeTeam: 'OB', homeTeamShort: 'OB', awayTeam: 'FC Midtjylland', awayTeamShort: 'FCM', round: 20, isCompleted: false },
  { id: '20-2', date: '2026-02-15', time: '14:00', homeTeam: 'FC København', homeTeamShort: 'FCK', awayTeam: 'Silkeborg', awayTeamShort: 'SIF', round: 20, isCompleted: false },
  { id: '20-3', date: '2026-02-15', time: '14:00', homeTeam: 'Randers', homeTeamShort: 'RFC', awayTeam: 'AGF', awayTeamShort: 'AGF', round: 20, isCompleted: false },
  { id: '20-4', date: '2026-02-15', time: '16:00', homeTeam: 'Viborg', homeTeamShort: 'VFF', awayTeam: 'Brøndby', awayTeamShort: 'BIF', round: 20, isCompleted: false },
  { id: '20-5', date: '2026-02-15', time: '18:00', homeTeam: 'SønderjyskE', homeTeamShort: 'SJF', awayTeam: 'Vejle', awayTeamShort: 'VB', round: 20, isCompleted: false },
  { id: '20-6', date: '2026-02-16', time: '19:00', homeTeam: 'FC Fredericia', homeTeamShort: 'FCF', awayTeam: 'FC Nordsjælland', awayTeamShort: 'FCN', round: 20, isCompleted: false },
  // Runde 21
  { id: '21-1', date: '2026-02-21', time: '19:00', homeTeam: 'FC Midtjylland', homeTeamShort: 'FCM', awayTeam: 'Viborg', awayTeamShort: 'VFF', round: 21, isCompleted: false },
  { id: '21-2', date: '2026-02-22', time: '14:00', homeTeam: 'AGF', homeTeamShort: 'AGF', awayTeam: 'SønderjyskE', awayTeamShort: 'SJF', round: 21, isCompleted: false },
  { id: '21-3', date: '2026-02-22', time: '14:00', homeTeam: 'Brøndby', homeTeamShort: 'BIF', awayTeam: 'FC Fredericia', awayTeamShort: 'FCF', round: 21, isCompleted: false },
  { id: '21-4', date: '2026-02-22', time: '16:00', homeTeam: 'Silkeborg', homeTeamShort: 'SIF', awayTeam: 'FC København', awayTeamShort: 'FCK', round: 21, isCompleted: false },
  { id: '21-5', date: '2026-02-22', time: '18:00', homeTeam: 'FC Nordsjælland', homeTeamShort: 'FCN', awayTeam: 'Randers', awayTeamShort: 'RFC', round: 21, isCompleted: false },
  { id: '21-6', date: '2026-02-23', time: '19:00', homeTeam: 'OB', homeTeamShort: 'OB', awayTeam: 'Vejle', awayTeamShort: 'VB', round: 21, isCompleted: false },
];

function getTeamStrength(teamShort: string): 'strong' | 'medium' | 'weak' {
  const standing = teamStandings.find(t => t.teamShort === teamShort);
  return standing?.strength || 'medium';
}

function getTeamPosition(teamShort: string): number {
  const standing = teamStandings.find(t => t.teamShort === teamShort);
  return standing?.position || 6;
}

function calculateDifficulty(opponentPosition: number, isHome: boolean): number {
  // Base difficulty from position (1-12 scaled to 1-10)
  let difficulty = Math.ceil(opponentPosition * 10 / 12);
  // Home advantage reduces difficulty by 1-2
  if (isHome) {
    difficulty = Math.max(1, difficulty - 2);
  }
  // Invert so lower position = higher difficulty
  return Math.max(1, Math.min(10, 11 - difficulty));
}

export async function GET() {
  // Generate upcoming fixtures for each team
  const fixturesByTeam: Record<string, UpcomingFixture[]> = {};

  for (const match of upcomingMatches) {
    // Home team fixture
    if (!fixturesByTeam[match.homeTeamShort]) {
      fixturesByTeam[match.homeTeamShort] = [];
    }
    const homeFixture: UpcomingFixture = {
      team: match.homeTeam,
      teamShort: match.homeTeamShort,
      opponent: match.awayTeam,
      opponentShort: match.awayTeamShort,
      isHome: true,
      opponentStrength: getTeamStrength(match.awayTeamShort),
      opponentPosition: getTeamPosition(match.awayTeamShort),
      round: match.round,
      date: match.date,
      time: match.time,
      difficultyScore: calculateDifficulty(getTeamPosition(match.awayTeamShort), true),
    };
    fixturesByTeam[match.homeTeamShort].push(homeFixture);

    // Away team fixture
    if (!fixturesByTeam[match.awayTeamShort]) {
      fixturesByTeam[match.awayTeamShort] = [];
    }
    const awayFixture: UpcomingFixture = {
      team: match.awayTeam,
      teamShort: match.awayTeamShort,
      opponent: match.homeTeam,
      opponentShort: match.homeTeamShort,
      isHome: false,
      opponentStrength: getTeamStrength(match.homeTeamShort),
      opponentPosition: getTeamPosition(match.homeTeamShort),
      round: match.round,
      date: match.date,
      time: match.time,
      difficultyScore: calculateDifficulty(getTeamPosition(match.homeTeamShort), false),
    };
    fixturesByTeam[match.awayTeamShort].push(awayFixture);
  }

  return NextResponse.json({
    matches: upcomingMatches,
    standings: teamStandings,
    fixturesByTeam,
  });
}
