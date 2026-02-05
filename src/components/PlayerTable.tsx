'use client';

import { Player } from '@/types/player';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown, ArrowUp, ArrowDown, Flame } from 'lucide-react';
import { useState } from 'react';

interface PlayerTableProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

type SortKey = 'name' | 'team' | 'matches' | 'goals' | 'assists' | 'total' | 'minutesPerContribution' | 'valuePerMillion' | 'recentGains';
type SortDirection = 'asc' | 'desc';

export function PlayerTable({ players, onPlayerSelect }: PlayerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  const teams = [...new Set(players.map(p => p.teamShort))].sort();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedPlayers = [...players]
    .filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase()) &&
      (teamFilter === '' || p.teamShort === teamFilter)
    )
    .sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      return ((aVal as number) - (bVal as number)) * multiplier;
    });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  const TrendIcon = ({ player }: { player: Player }) => {
    const { trend, recentGains, isHot } = player;

    return (
      <div className="flex items-center justify-center gap-1">
        {isHot && <span title="Hot! Stiger hurtigt"><Flame className="w-4 h-4 text-orange-500" /></span>}
        {trend === 'up' && <TrendingUp className="w-4 h-4 form-up" />}
        {trend === 'down' && <TrendingDown className="w-4 h-4 form-down" />}
        {trend === 'stable' && <Minus className="w-4 h-4 form-stable" />}
        {recentGains !== undefined && recentGains !== 0 && (
          <span className={`text-xs font-mono ${recentGains > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {recentGains > 0 ? '+' : ''}{recentGains}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="stat-card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Søg spiller..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Alle hold</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="player-table">
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Spiller <SortIcon columnKey="name" />
                </div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('team')}>
                <div className="flex items-center gap-2">
                  Hold <SortIcon columnKey="team" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('matches')}>
                <div className="flex items-center justify-center gap-2">
                  K <SortIcon columnKey="matches" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('goals')}>
                <div className="flex items-center justify-center gap-2">
                  Mål <SortIcon columnKey="goals" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('assists')}>
                <div className="flex items-center justify-center gap-2">
                  Ass <SortIcon columnKey="assists" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('total')}>
                <div className="flex items-center justify-center gap-2">
                  Total <SortIcon columnKey="total" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('minutesPerContribution')}>
                <div className="flex items-center justify-center gap-2">
                  Min/Mål <SortIcon columnKey="minutesPerContribution" />
                </div>
              </th>
              <th className="cursor-pointer text-center" onClick={() => handleSort('recentGains')}>
                <div className="flex items-center justify-center gap-2">
                  Trend <SortIcon columnKey="recentGains" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr
                key={player.id}
                className={`cursor-pointer ${player.isHot ? 'bg-orange-500/5' : ''}`}
                onClick={() => onPlayerSelect?.(player)}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] font-mono text-sm w-6">
                      {index + 1}
                    </span>
                    <span className="font-medium">{player.name}</span>
                    {player.isHot && <Flame className="w-3 h-3 text-orange-500" />}
                  </div>
                </td>
                <td>
                  <span className={`team-badge team-${player.teamShort.toLowerCase()}`}>
                    {player.teamShort}
                  </span>
                </td>
                <td className="text-center">{player.matches}</td>
                <td className="text-center font-semibold text-[var(--accent-green)]">
                  {player.goals}
                </td>
                <td className="text-center">{player.assists}</td>
                <td className="text-center font-bold text-lg">{player.total}</td>
                <td className="text-center">
                  <span className={player.minutesPerContribution < 100 ? 'text-[var(--accent-green)]' : ''}>
                    {player.minutesPerContribution}
                  </span>
                </td>
                <td className="text-center">
                  <TrendIcon player={player} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Viser {sortedPlayers.length} af {players.length} spillere
      </div>
    </div>
  );
}
