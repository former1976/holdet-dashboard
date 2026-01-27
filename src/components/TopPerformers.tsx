'use client';

import { Player } from '@/types/player';
import { Trophy, Zap, Clock } from 'lucide-react';

interface TopPerformersProps {
  players: Player[];
}

export function TopPerformers({ players }: TopPerformersProps) {
  // Top scorers
  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);

  // Best efficiency (lowest minutes per contribution)
  const mostEfficient = [...players]
    .filter(p => p.total >= 5) // At least 5 contributions
    .sort((a, b) => a.minutesPerContribution - b.minutesPerContribution)
    .slice(0, 5);

  // Best assist makers
  const topAssists = [...players].sort((a, b) => b.assists - a.assists).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top Scorers */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[var(--accent-yellow)]" />
          <h3 className="font-semibold">Topscorere</h3>
        </div>
        <div className="space-y-3">
          {topScorers.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-[var(--card-hover)]'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.teamShort}</p>
                </div>
              </div>
              <span className="font-bold text-[var(--accent-green)]">{player.goals}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Efficient */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Mest effektive</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">Færrest minutter pr. mål+assist (min. 5 bidrag)</p>
        <div className="space-y-3">
          {mostEfficient.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-blue-500 text-white' : 'bg-[var(--card-hover)]'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.teamShort} • {player.total} bidrag</p>
                </div>
              </div>
              <span className="font-bold text-[var(--accent)]">{player.minutesPerContribution} min</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Assists */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[var(--accent-yellow)]" />
          <h3 className="font-semibold">Flest assists</h3>
        </div>
        <div className="space-y-3">
          {topAssists.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' : 'bg-[var(--card-hover)]'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{player.name}</p>
                  <p className="text-xs text-gray-400">{player.teamShort}</p>
                </div>
              </div>
              <span className="font-bold text-[var(--accent-yellow)]">{player.assists}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
