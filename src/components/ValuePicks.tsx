'use client';

import { Player } from '@/types/player';
import { Gem, TrendingUp, AlertCircle } from 'lucide-react';

interface ValuePicksProps {
  players: Player[];
}

// Estimate player prices based on performance (since we don't have real holdet.dk prices)
function estimatePrice(player: Player): number {
  const basePrice = 2;
  const goalBonus = player.goals * 0.3;
  const assistBonus = player.assists * 0.15;
  const matchBonus = player.matches * 0.05;

  // Team premium for top teams
  const teamPremium = ['FCM', 'FCK', 'BIF'].includes(player.teamShort) ? 1.5 : 1;

  return Math.round((basePrice + goalBonus + assistBonus + matchBonus) * teamPremium * 10) / 10;
}

export function ValuePicks({ players }: ValuePicksProps) {
  // Calculate value score for each player
  const playersWithValue = players.map(player => {
    const estimatedPrice = estimatePrice(player);
    const valueScore = player.total / estimatedPrice; // Points per million
    const efficiencyScore = 100 - player.minutesPerContribution; // Higher is better

    return {
      ...player,
      estimatedPrice,
      valueScore,
      efficiencyScore,
      overallScore: (valueScore * 10) + (efficiencyScore * 0.5),
    };
  });

  // Best value picks (high score relative to price)
  const bestValue = [...playersWithValue]
    .filter(p => p.total >= 5)
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 5);

  // Hidden gems (good efficiency but lower total - potential breakouts)
  const hiddenGems = [...playersWithValue]
    .filter(p => p.total >= 3 && p.total <= 7 && p.minutesPerContribution < 150)
    .sort((a, b) => a.minutesPerContribution - b.minutesPerContribution)
    .slice(0, 5);

  // Premium picks (expensive but worth it)
  const premiumPicks = [...playersWithValue]
    .filter(p => p.total >= 10)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Gem className="w-6 h-6 text-[var(--accent)]" />
        Anbefalede spillere
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Value */}
        <div className="stat-card border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Bedste værdi</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Høj score per estimeret pris</p>
          <div className="space-y-3">
            {bestValue.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">
                    {player.teamShort} • {player.total} bidrag • ~{player.estimatedPrice} mio
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-green-500 font-bold text-lg">
                    {player.valueScore.toFixed(1)}
                  </span>
                  <p className="text-xs text-gray-400">pt/mio</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hidden Gems */}
        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 mb-4">
            <Gem className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">Skjulte perler</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Effektive spillere med potentiale</p>
          <div className="space-y-3">
            {hiddenGems.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">
                    {player.teamShort} • {player.total} bidrag
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-purple-500 font-bold">
                    {player.minutesPerContribution} min
                  </span>
                  <p className="text-xs text-gray-400">pr. bidrag</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Picks */}
        <div className="stat-card border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Premium valg</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">Dyre men produktive</p>
          <div className="space-y-3">
            {premiumPicks.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 rounded bg-[var(--background)]">
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">
                    {player.teamShort} • ~{player.estimatedPrice} mio
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-yellow-500 font-bold text-lg">
                    {player.total}
                  </span>
                  <p className="text-xs text-gray-400">bidrag</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-300">
          <strong>Tip:</strong> Priser er estimeret baseret på statistik. Tjek de faktiske priser på{' '}
          <a
            href="https://www.holdet.dk/da/fantasy/super-manager-spring-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-200"
          >
            holdet.dk
          </a>{' '}
          før du vælger spillere. Husk byttegebyr på 1% af købsprisen!
        </p>
      </div>
    </div>
  );
}
