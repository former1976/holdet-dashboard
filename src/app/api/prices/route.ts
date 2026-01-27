import { NextRequest, NextResponse } from 'next/server';

// Store prices in memory (in production, use a database)
// Initial prices are estimates - users can update them
let playerPrices: Record<string, { price: number; lastUpdated: string }> = {
  // FC Midtjylland
  'franculino-djú-fc-midtjylland': { price: 8.5, lastUpdated: '2026-01-26' },
  'aral-simsir-fc-midtjylland': { price: 6.2, lastUpdated: '2026-01-26' },
  'darío-osorio-fc-midtjylland': { price: 5.8, lastUpdated: '2026-01-26' },
  'valdemar-byskov-fc-midtjylland': { price: 4.5, lastUpdated: '2026-01-26' },
  'denil-castillo-fc-midtjylland': { price: 4.2, lastUpdated: '2026-01-26' },
  // AGF
  'tobias-bech-agf': { price: 5.5, lastUpdated: '2026-01-26' },
  'kristian-arnstad-agf': { price: 4.8, lastUpdated: '2026-01-26' },
  // OB
  'fiete-arp-ob': { price: 5.2, lastUpdated: '2026-01-26' },
  'noah-ganaus-ob': { price: 4.8, lastUpdated: '2026-01-26' },
  'jay-roy-grot-ob': { price: 4.5, lastUpdated: '2026-01-26' },
  // Silkeborg
  'tonni-adamsen-silkeborg': { price: 4.5, lastUpdated: '2026-01-26' },
  'callum-mccowatt-silkeborg': { price: 4.3, lastUpdated: '2026-01-26' },
  // Brøndby
  'nicolai-vallys-brøndby': { price: 5.0, lastUpdated: '2026-01-26' },
  'noah-nartey-brøndby': { price: 4.2, lastUpdated: '2026-01-26' },
  // FC Nordsjælland
  'prince-amoako-fc-nordsjælland': { price: 4.0, lastUpdated: '2026-01-26' },
  // FC København
  'mohamed-elyounoussi-fc-københavn': { price: 5.5, lastUpdated: '2026-01-26' },
  // Viborg
  'thomas-jørgensen-viborg': { price: 3.8, lastUpdated: '2026-01-26' },
  // SønderjyskE
  'kristall-máni-ingason-sønderjyske': { price: 3.5, lastUpdated: '2026-01-26' },
  // FC Fredericia
  'oscar-buch-fc-fredericia': { price: 3.2, lastUpdated: '2026-01-26' },
  // Randers
  'mohamed-touré-randers': { price: 3.8, lastUpdated: '2026-01-26' },
};

export async function GET() {
  return NextResponse.json(playerPrices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, price } = body;

    if (!playerId || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'playerId and price are required' },
        { status: 400 }
      );
    }

    playerPrices[playerId] = {
      price,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({ success: true, prices: playerPrices });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Bulk update prices
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices } = body;

    if (!prices || typeof prices !== 'object') {
      return NextResponse.json(
        { error: 'prices object is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    for (const [playerId, price] of Object.entries(prices)) {
      if (typeof price === 'number') {
        playerPrices[playerId] = { price, lastUpdated: today };
      }
    }

    return NextResponse.json({ success: true, prices: playerPrices });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
