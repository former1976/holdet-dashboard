'use client';

import { Player, HotPlayer } from '@/types/player';
import { Flame, TrendingUp, Zap, Star } from 'lucide-react';

interface HotPlayersProps {
  players: Player[];
}

// Identify "hot" players based on their stats
function identifyHotPlayers(players: Player[]): HotPlayer[] {
  const hotPlayers: HotPlayer[] = [];

  for (const player of players) {
    // Calculate contributions per match
    const contributionsPerMatch = player.total / Math.max(player.matches, 1);

    // A player is "hot" if:
    // 1. High contributions per match (> 0.5)
    // 2. Very efficient (low minutes per contribution)
    // 3. Has scored recently (we simulate this based on efficiency)

    let isHot = false;
    let reason = '';
    let hotScore = 0;

    // Check for high contribution rate
    if (contributionsPerMatch >= 0.8) {
      isHot = true;
      reason = `Scorer i næsten hver kamp (${contributionsPerMatch.toFixed(2)} bidrag/kamp)`;
      hotScore = contributionsPerMatch * 100;
    }
    // Check for efficiency
    else if (player.minutesPerContribution < 80 && player.total >= 5) {
      isHot = true;
      reason = `Ekstremt effektiv - kun ${player.minutesPerContribution} min pr. bidrag`;
      hotScore = (100 - player.minutesPerContribution) + player.total * 5;
    }
    // Check for breakout potential (decent numbers, improving)
    else if (player.total >= 6 && player.minutesPerContribution < 130) {
      const potentialScore = (player.total * 10) / player.minutesPerContribution * 100;
      if (potentialScore > 50) {
        isHot = true;
        reason = `Stigende form - ${player.total} bidrag på ${player.matches} kampe`;
        hotScore = potentialScore;
      }
    }

    if (isHot) {
      // Simulate recent performance based on overall efficiency
      const simulatedRecentContributions = Math.round(
        (5 / player.minutesPerContribution) * 90 * (0.8 + Math.random() * 0.4)
      );

      hotPlayers.push({
        player,
        recentContributions: Math.min(simulatedRecentContributions, player.total),
        contributionsPerMatch,
        hotStreak: Math.floor(Math.random() * 4) + 2, // Simulated streak
        reason,
      });
    }
  }

  // Sort by contribution rate
  return hotPlayers
    .sort((a, b) => b.contributionsPerMatch - a.contributionsPerMatch)
    .slice(0, 8);
}

export function HotPlayers({ players }: HotPlayersProps) {
  const hotPlayers = identifyHotPlayers(players);

  if (hotPlayers.length === 0) {
    return null;
  }

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold">Hot spillere</h2>
        <span className="text-sm text-gray-400 ml-2">Spillere i god form</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hotPlayers.map((hot, index) => (
          <div
            key={hot.player.id}
            className={`relative p-4 rounded-lg border ${
              index === 0
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50'
                : 'bg-[var(--background)] border-[var(--border)]'
            }`}
          >
            {index === 0 && (
              <div className="absolute -top-2 -right-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-white">{hot.player.name}</p>
                <span className={`team-badge team-${hot.player.teamShort.toLowerCase()} text-xs`}>
                  {hot.player.teamShort}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {index < 3 && <Flame className="w-4 h-4 text-orange-500" />}
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bidrag/kamp</span>
                <span className={`font-bold ${
                  hot.contributionsPerMatch >= 0.8 ? 'text-green-500' :
                  hot.contributionsPerMatch >= 0.5 ? 'text-yellow-500' :
                  'text-white'
                }`}>
                  {hot.contributionsPerMatch.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="font-bold">{hot.player.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Min/bidrag</span>
                <span className={`font-bold ${
                  hot.player.minutesPerContribution < 100 ? 'text-green-500' : ''
                }`}>
                  {hot.player.minutesPerContribution}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400">{hot.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded bg-orange-500/10 border border-orange-500/30">
        <p className="text-sm text-orange-300">
          <strong>Tip:</strong> Hot spillere er baseret på bidrag pr. kamp og effektivitet.
          Overvej disse spillere hvis de har favorable kampe forude!
        </p>
      </div>
    </div>
  );
}
