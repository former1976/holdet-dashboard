import { NextRequest, NextResponse } from 'next/server';
import { Player, PlayerSnapshot } from '@/types/player';

// Player history storage - tracks changes over time
const playerHistory: Map<string, PlayerSnapshot[]> = new Map();

// Player database - starts empty, filled by imports from Holdet.dk
let allPlayers: Player[] = [];

// Save a snapshot of player stats for trend tracking
function saveSnapshot(playerId: string, goals: number, assists: number, total: number, price?: number) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const snapshots = playerHistory.get(playerId) || [];

  // Check if we already have a snapshot for today
  const todayIndex = snapshots.findIndex(s => s.date === today);

  const snapshot: PlayerSnapshot = {
    playerId,
    date: today,
    goals,
    assists,
    total,
    price,
  };

  if (todayIndex >= 0) {
    // Update today's snapshot
    snapshots[todayIndex] = snapshot;
  } else {
    // Add new snapshot
    snapshots.push(snapshot);
    // Keep only last 30 days of history
    if (snapshots.length > 30) {
      snapshots.shift();
    }
  }

  playerHistory.set(playerId, snapshots);
}

// Calculate trend based on historical data
function calculateTrend(playerId: string, currentTotal: number): { trend: 'up' | 'down' | 'stable'; recentGains: number; form: number } {
  const snapshots = playerHistory.get(playerId) || [];

  if (snapshots.length < 2) {
    return { trend: 'stable', recentGains: 0, form: 0 };
  }

  // Sort by date descending
  const sorted = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));

  // Compare current total with oldest snapshot
  const oldest = sorted[sorted.length - 1];
  const recentGains = currentTotal - oldest.total;

  // Calculate form based on gains per snapshot period
  const daysTracked = snapshots.length;
  const form = daysTracked > 0 ? recentGains / daysTracked : 0;

  // Determine trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentGains >= 2) {
    trend = 'up';
  } else if (recentGains <= -1) {
    trend = 'down';
  }

  return { trend, recentGains, form };
}

// Function to add or update a player
function addOrUpdatePlayer(newPlayer: Partial<Player> & { name: string; team: string }): Player {
  const teamShort = getTeamShort(newPlayer.team);
  const id = generatePlayerId(newPlayer.name, teamShort);

  const existingIndex = allPlayers.findIndex(p => p.id === id);

  // Also try to find by normalized name match if exact ID doesn't match
  let matchIndex = existingIndex;
  let matchedId = id;
  if (matchIndex < 0) {
    const normalizedNewName = newPlayer.name.toLowerCase().trim();
    matchIndex = allPlayers.findIndex(p => {
      const normalizedExisting = p.name.toLowerCase().trim();
      return normalizedExisting === normalizedNewName ||
             normalizedExisting.includes(normalizedNewName) ||
             normalizedNewName.includes(normalizedExisting);
    });
    if (matchIndex >= 0) {
      matchedId = allPlayers[matchIndex].id;
    }
  }

  const goals = newPlayer.goals || 0;
  const assists = newPlayer.assists || 0;
  const total = goals + assists;

  // Save snapshot for trend tracking
  saveSnapshot(matchedId, goals, assists, total, newPlayer.price);

  // Calculate trend
  const { trend, recentGains, form } = calculateTrend(matchedId, total);

  const now = new Date().toISOString();

  const player: Player = {
    id: matchedId,
    name: newPlayer.name,
    team: newPlayer.team,
    teamShort,
    position: newPlayer.position || 'Ukendt',
    matches: newPlayer.matches || 0,
    goals,
    assists,
    total,
    minutesPerContribution: newPlayer.minutesPerContribution || 0,
    price: newPlayer.price,
    trend,
    form,
    isHot: recentGains >= 3, // Mark as hot if gained 3+ contributions recently
    isImported: true,
    importedAt: now,
  };

  if (matchIndex >= 0) {
    // Update existing player - imported data from Holdet.dk always takes priority
    const existing = allPlayers[matchIndex];
    allPlayers[matchIndex] = {
      ...existing,
      // Always update these from import
      name: newPlayer.name || existing.name,
      team: newPlayer.team || existing.team,
      teamShort: teamShort || existing.teamShort,
      position: newPlayer.position || existing.position,
      price: newPlayer.price ?? existing.price,
      // Stats from Holdet.dk - always overwrite
      goals,
      assists,
      total,
      matches: newPlayer.matches ?? existing.matches,
      minutesPerContribution: newPlayer.minutesPerContribution ?? existing.minutesPerContribution,
      // Trend data
      trend,
      form,
      isHot: recentGains >= 3,
    };
    return allPlayers[matchIndex];
  } else {
    // Add new player
    allPlayers.push(player);
    return player;
  }
}

function generatePlayerId(name: string, teamShort: string): string {
  return `${name.toLowerCase().replace(/[^a-zæøå0-9]/g, '-').replace(/-+/g, '-')}-${teamShort.toLowerCase()}`;
}

function getTeamShort(team: string): string {
  const teamMap: Record<string, string> = {
    'fc midtjylland': 'FCM',
    'midtjylland': 'FCM',
    'fcm': 'FCM',
    'fc københavn': 'FCK',
    'fc kobenhavn': 'FCK',
    'copenhagen': 'FCK',
    'fck': 'FCK',
    'brøndby': 'BIF',
    'brondby': 'BIF',
    'brøndby if': 'BIF',
    'bif': 'BIF',
    'agf': 'AGF',
    'aarhus': 'AGF',
    'ob': 'OB',
    'odense': 'OB',
    'odense boldklub': 'OB',
    'fc nordsjælland': 'FCN',
    'fc nordsjaelland': 'FCN',
    'nordsjælland': 'FCN',
    'fcn': 'FCN',
    'aab': 'AaB',
    'aalborg': 'AaB',
    'silkeborg': 'SIF',
    'silkeborg if': 'SIF',
    'sif': 'SIF',
    'viborg': 'VFF',
    'viborg ff': 'VFF',
    'vff': 'VFF',
    'randers': 'RFC',
    'randers fc': 'RFC',
    'rfc': 'RFC',
    'vejle': 'VB',
    'vejle boldklub': 'VB',
    'vb': 'VB',
    'lyngby': 'LBK',
    'lyngby bk': 'LBK',
    'lbk': 'LBK',
    'sønderjyske': 'SJF',
    'sonderjyske': 'SJF',
    'sjf': 'SJF',
    'fc fredericia': 'FCF',
    'fredericia': 'FCF',
    'fcf': 'FCF',
    'horsens': 'ACH',
    'ac horsens': 'ACH',
  };

  const normalized = team.toLowerCase().trim();
  return teamMap[normalized] || team.substring(0, 3).toUpperCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('id');
  const historyOnly = searchParams.get('history');

  // If requesting history for a specific player
  if (playerId && historyOnly) {
    const snapshots = playerHistory.get(playerId) || [];
    return NextResponse.json({ playerId, snapshots });
  }

  // Return all players sorted by total contributions, with trend data
  const sortedPlayers = [...allPlayers]
    .map(player => {
      const snapshots = playerHistory.get(player.id) || [];
      const { trend, recentGains, form } = snapshots.length >= 2
        ? calculateTrend(player.id, player.total)
        : { trend: player.trend || 'stable' as const, recentGains: 0, form: 0 };

      return {
        ...player,
        trend,
        form,
        isHot: recentGains >= 3,
        recentGains,
        historyCount: snapshots.length,
      };
    })
    .sort((a, b) => b.total - a.total);

  return NextResponse.json(sortedPlayers);
}

// POST - Add or update players (used by import)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { players: newPlayers } = body;

    if (!Array.isArray(newPlayers)) {
      return NextResponse.json({ error: 'players array required' }, { status: 400 });
    }

    const addedPlayers: Player[] = [];

    for (const playerData of newPlayers) {
      if (playerData.name && playerData.team) {
        const player = addOrUpdatePlayer(playerData);
        addedPlayers.push(player);
      }
    }

    return NextResponse.json({
      success: true,
      added: addedPlayers.length,
      players: addedPlayers
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
