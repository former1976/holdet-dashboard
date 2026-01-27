'use client';

import { Player } from '@/types/player';
import { Target, Zap, Users, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  players: Player[];
}

export function StatCards({ players }: StatCardsProps) {
  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.assists, 0);
  const avgMinPerContrib = Math.round(
    players.reduce((sum, p) => sum + p.minutesPerContribution, 0) / players.length
  );
  const topScorer = players.reduce((best, p) => p.goals > best.goals ? p : best, players[0]);

  const stats = [
    {
      label: 'Topscorer',
      value: topScorer?.name || '-',
      subValue: `${topScorer?.goals || 0} mål`,
      icon: Target,
      color: 'var(--accent-green)',
    },
    {
      label: 'Totale mål',
      value: totalGoals,
      subValue: 'i top 20',
      icon: Zap,
      color: 'var(--accent)',
    },
    {
      label: 'Totale assists',
      value: totalAssists,
      subValue: 'i top 20',
      icon: Users,
      color: 'var(--accent-yellow)',
    },
    {
      label: 'Gns. min/bidrag',
      value: avgMinPerContrib,
      subValue: 'minutter',
      icon: TrendingUp,
      color: 'var(--accent-red)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
            </div>
            <stat.icon className="w-8 h-8 opacity-20" style={{ color: stat.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
