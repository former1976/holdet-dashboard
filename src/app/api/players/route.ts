import { NextRequest, NextResponse } from 'next/server';
import { Player } from '@/types/player';

// Extended player database - all known Superliga players
// This list will be expanded when users import from Holdet.dk
let allPlayers: Player[] = [
  // FC Midtjylland
  { id: 'franculino-dju-fcm', name: 'Franculino Djú', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Angriber', matches: 17, goals: 16, assists: 3, total: 19, minutesPerContribution: 64 },
  { id: 'aral-simsir-fcm', name: 'Aral Simsir', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Midtbane', matches: 17, goals: 5, assists: 11, total: 16, minutesPerContribution: 63 },
  { id: 'dario-osorio-fcm', name: 'Darío Osorio', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Midtbane', matches: 15, goals: 4, assists: 5, total: 9, minutesPerContribution: 110 },
  { id: 'valdemar-byskov-fcm', name: 'Valdemar Byskov', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Midtbane', matches: 17, goals: 5, assists: 2, total: 7, minutesPerContribution: 70 },
  { id: 'denil-castillo-fcm', name: 'Denil Castillo', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Midtbane', matches: 15, goals: 3, assists: 4, total: 7, minutesPerContribution: 148 },
  { id: 'mads-bech-sorensen-fcm', name: 'Mads Bech Sørensen', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 450 },
  { id: 'erik-sviatchenko-fcm', name: 'Erik Sviatchenko', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Forsvar', matches: 16, goals: 0, assists: 1, total: 1, minutesPerContribution: 900 },
  { id: 'oliver-sorensen-fcm', name: 'Oliver Sørensen', team: 'FC Midtjylland', teamShort: 'FCM', position: 'Keeper', matches: 17, goals: 0, assists: 0, total: 0, minutesPerContribution: 0 },

  // AGF
  { id: 'tobias-bech-agf', name: 'Tobias Bech', team: 'AGF', teamShort: 'AGF', position: 'Angriber', matches: 18, goals: 10, assists: 2, total: 12, minutesPerContribution: 123 },
  { id: 'kristian-arnstad-agf', name: 'Kristian Arnstad', team: 'AGF', teamShort: 'AGF', position: 'Midtbane', matches: 17, goals: 6, assists: 2, total: 8, minutesPerContribution: 176 },
  { id: 'felix-beijmo-agf', name: 'Felix Beijmo', team: 'AGF', teamShort: 'AGF', position: 'Forsvar', matches: 18, goals: 1, assists: 3, total: 4, minutesPerContribution: 300 },
  { id: 'patrick-mortensen-agf', name: 'Patrick Mortensen', team: 'AGF', teamShort: 'AGF', position: 'Angriber', matches: 18, goals: 4, assists: 1, total: 5, minutesPerContribution: 200 },
  { id: 'adam-daghim-agf', name: 'Adam Daghim', team: 'AGF', teamShort: 'AGF', position: 'Midtbane', matches: 15, goals: 2, assists: 2, total: 4, minutesPerContribution: 250 },

  // OB
  { id: 'fiete-arp-ob', name: 'Fiete Arp', team: 'OB', teamShort: 'OB', position: 'Angriber', matches: 17, goals: 8, assists: 3, total: 11, minutesPerContribution: 134 },
  { id: 'noah-ganaus-ob', name: 'Noah Ganaus', team: 'OB', teamShort: 'OB', position: 'Angriber', matches: 18, goals: 8, assists: 2, total: 10, minutesPerContribution: 144 },
  { id: 'jay-roy-grot-ob', name: 'Jay-Roy Grot', team: 'OB', teamShort: 'OB', position: 'Angriber', matches: 18, goals: 6, assists: 3, total: 9, minutesPerContribution: 156 },
  { id: 'nicolas-burgy-ob', name: 'Nicolas Bürgy', team: 'OB', teamShort: 'OB', position: 'Forsvar', matches: 18, goals: 1, assists: 2, total: 3, minutesPerContribution: 400 },
  { id: 'adam-sorensen-ob', name: 'Adam Sørensen', team: 'OB', teamShort: 'OB', position: 'Midtbane', matches: 16, goals: 2, assists: 1, total: 3, minutesPerContribution: 350 },

  // Silkeborg
  { id: 'tonni-adamsen-sif', name: 'Tonni Adamsen', team: 'Silkeborg', teamShort: 'SIF', position: 'Angriber', matches: 18, goals: 7, assists: 3, total: 10, minutesPerContribution: 146 },
  { id: 'callum-mccowatt-sif', name: 'Callum McCowatt', team: 'Silkeborg', teamShort: 'SIF', position: 'Angriber', matches: 18, goals: 8, assists: 2, total: 10, minutesPerContribution: 136 },
  { id: 'jens-martin-gammelby-sif', name: 'Jens Martin Gammelby', team: 'Silkeborg', teamShort: 'SIF', position: 'Forsvar', matches: 18, goals: 1, assists: 2, total: 3, minutesPerContribution: 400 },
  { id: 'nicolai-larsen-sif', name: 'Nicolai Larsen', team: 'Silkeborg', teamShort: 'SIF', position: 'Forsvar', matches: 18, goals: 0, assists: 1, total: 1, minutesPerContribution: 900 },
  { id: 'anders-klynge-sif', name: 'Anders Klynge', team: 'Silkeborg', teamShort: 'SIF', position: 'Midtbane', matches: 16, goals: 2, assists: 3, total: 5, minutesPerContribution: 220 },

  // Brøndby
  { id: 'nicolai-vallys-bif', name: 'Nicolai Vallys', team: 'Brøndby', teamShort: 'BIF', position: 'Midtbane', matches: 16, goals: 5, assists: 5, total: 10, minutesPerContribution: 131 },
  { id: 'noah-nartey-bif', name: 'Noah Nartey', team: 'Brøndby', teamShort: 'BIF', position: 'Midtbane', matches: 17, goals: 4, assists: 3, total: 7, minutesPerContribution: 165 },
  { id: 'patrick-pentz-bif', name: 'Patrick Pentz', team: 'Brøndby', teamShort: 'BIF', position: 'Keeper', matches: 18, goals: 0, assists: 0, total: 0, minutesPerContribution: 0 },
  { id: 'mathias-kvistgaarden-bif', name: 'Mathias Kvistgaarden', team: 'Brøndby', teamShort: 'BIF', position: 'Angriber', matches: 15, goals: 3, assists: 2, total: 5, minutesPerContribution: 200 },
  { id: 'yuito-suzuki-bif', name: 'Yuito Suzuki', team: 'Brøndby', teamShort: 'BIF', position: 'Midtbane', matches: 14, goals: 2, assists: 2, total: 4, minutesPerContribution: 250 },

  // FC København
  { id: 'mohamed-elyounoussi-fck', name: 'Mohamed Elyounoussi', team: 'FC København', teamShort: 'FCK', position: 'Midtbane', matches: 16, goals: 4, assists: 5, total: 9, minutesPerContribution: 138 },
  { id: 'dominik-kotarski-fck', name: 'Dominik Kotarski', team: 'FC København', teamShort: 'FCK', position: 'Keeper', matches: 18, goals: 0, assists: 0, total: 0, minutesPerContribution: 0 },
  { id: 'pantelis-hatzidiakos-fck', name: 'Pantelis Hatzidiakos', team: 'FC København', teamShort: 'FCK', position: 'Forsvar', matches: 18, goals: 2, assists: 1, total: 3, minutesPerContribution: 400 },
  { id: 'roony-bardghji-fck', name: 'Roony Bardghji', team: 'FC København', teamShort: 'FCK', position: 'Midtbane', matches: 14, goals: 3, assists: 3, total: 6, minutesPerContribution: 180 },
  { id: 'orri-oskarsson-fck', name: 'Orri Óskarsson', team: 'FC København', teamShort: 'FCK', position: 'Angriber', matches: 15, goals: 5, assists: 1, total: 6, minutesPerContribution: 170 },

  // FC Nordsjælland
  { id: 'prince-amoako-fcn', name: 'Prince Amoako', team: 'FC Nordsjælland', teamShort: 'FCN', position: 'Angriber', matches: 17, goals: 5, assists: 4, total: 9, minutesPerContribution: 145 },
  { id: 'nicklas-rojkjaer-fcn', name: 'Nicklas Røjkjær', team: 'FC Nordsjælland', teamShort: 'FCN', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 500 },
  { id: 'ernest-nuamah-fcn', name: 'Ernest Nuamah', team: 'FC Nordsjælland', teamShort: 'FCN', position: 'Angriber', matches: 15, goals: 4, assists: 2, total: 6, minutesPerContribution: 180 },
  { id: 'simon-adingra-fcn', name: 'Simon Adingra', team: 'FC Nordsjælland', teamShort: 'FCN', position: 'Midtbane', matches: 14, goals: 2, assists: 3, total: 5, minutesPerContribution: 200 },

  // Viborg
  { id: 'thomas-jorgensen-vff', name: 'Thomas Jørgensen', team: 'Viborg', teamShort: 'VFF', position: 'Midtbane', matches: 17, goals: 3, assists: 5, total: 8, minutesPerContribution: 175 },
  { id: 'stipe-radic-vff', name: 'Stipe Radic', team: 'Viborg', teamShort: 'VFF', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 500 },
  { id: 'lucas-lund-vff', name: 'Lucas Lund', team: 'Viborg', teamShort: 'VFF', position: 'Forsvar', matches: 18, goals: 0, assists: 2, total: 2, minutesPerContribution: 600 },
  { id: 'jeppe-gronning-vff', name: 'Jeppe Grønning', team: 'Viborg', teamShort: 'VFF', position: 'Midtbane', matches: 18, goals: 2, assists: 2, total: 4, minutesPerContribution: 300 },

  // SønderjyskE
  { id: 'kristall-mani-ingason-sjf', name: 'Kristall Máni Ingason', team: 'SønderjyskE', teamShort: 'SJF', position: 'Angriber', matches: 14, goals: 6, assists: 2, total: 8, minutesPerContribution: 117 },
  { id: 'magnus-riisgaard-jensen-sjf', name: 'Magnus Riisgaard Jensen', team: 'SønderjyskE', teamShort: 'SJF', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 500 },
  { id: 'andreas-oggesen-sjf', name: 'Andreas Oggesen', team: 'SønderjyskE', teamShort: 'SJF', position: 'Angriber', matches: 18, goals: 3, assists: 2, total: 5, minutesPerContribution: 250 },

  // FC Fredericia
  { id: 'oscar-buch-fcf', name: 'Oscar Buch', team: 'FC Fredericia', teamShort: 'FCF', position: 'Angriber', matches: 15, goals: 6, assists: 1, total: 7, minutesPerContribution: 161 },
  { id: 'frederik-rieper-fcf', name: 'Frederik Rieper', team: 'FC Fredericia', teamShort: 'FCF', position: 'Forsvar', matches: 18, goals: 0, assists: 1, total: 1, minutesPerContribution: 900 },

  // Randers
  { id: 'mohamed-toure-rfc', name: 'Mohamed Touré', team: 'Randers', teamShort: 'RFC', position: 'Angriber', matches: 17, goals: 4, assists: 3, total: 7, minutesPerContribution: 159 },
  { id: 'wessel-dammers-rfc', name: 'Wessel Dammers', team: 'Randers', teamShort: 'RFC', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 500 },
  { id: 'nikolas-dyhr-rfc', name: 'Nikolas Dyhr', team: 'Randers', teamShort: 'RFC', position: 'Forsvar', matches: 18, goals: 0, assists: 2, total: 2, minutesPerContribution: 600 },

  // Vejle
  { id: 'igor-vekic-vb', name: 'Igor Vekić', team: 'Vejle', teamShort: 'VB', position: 'Keeper', matches: 18, goals: 0, assists: 0, total: 0, minutesPerContribution: 0 },
  { id: 'mike-vestergaard-vb', name: 'Mike Vestergård', team: 'Vejle', teamShort: 'VB', position: 'Forsvar', matches: 18, goals: 1, assists: 1, total: 2, minutesPerContribution: 500 },

  // AaB (hvis de er i Superligaen)
  { id: 'tim-prica-aab', name: 'Tim Prica', team: 'AaB', teamShort: 'AaB', position: 'Angriber', matches: 15, goals: 3, assists: 2, total: 5, minutesPerContribution: 220 },
  { id: 'pedro-ferreira-aab', name: 'Pedro Ferreira', team: 'AaB', teamShort: 'AaB', position: 'Midtbane', matches: 16, goals: 2, assists: 3, total: 5, minutesPerContribution: 230 },
];

// Function to add or update a player
function addOrUpdatePlayer(newPlayer: Partial<Player> & { name: string; team: string }): Player {
  const teamShort = getTeamShort(newPlayer.team);
  const id = generatePlayerId(newPlayer.name, teamShort);

  const existingIndex = allPlayers.findIndex(p => p.id === id);

  const player: Player = {
    id,
    name: newPlayer.name,
    team: newPlayer.team,
    teamShort,
    position: newPlayer.position || 'Ukendt',
    matches: newPlayer.matches || 0,
    goals: newPlayer.goals || 0,
    assists: newPlayer.assists || 0,
    total: newPlayer.total || (newPlayer.goals || 0) + (newPlayer.assists || 0),
    minutesPerContribution: newPlayer.minutesPerContribution || 0,
    price: newPlayer.price,
  };

  if (existingIndex >= 0) {
    // Update existing player
    allPlayers[existingIndex] = { ...allPlayers[existingIndex], ...player };
    return allPlayers[existingIndex];
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

export async function GET() {
  // Return all players sorted by total contributions
  const sortedPlayers = [...allPlayers].sort((a, b) => b.total - a.total);
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
