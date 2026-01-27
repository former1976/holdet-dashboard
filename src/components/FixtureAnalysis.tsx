'use client';

import { useState, useEffect } from 'react';
import { Match, TeamStanding, UpcomingFixture, Player } from '@/types/player';
import { Calendar, Home, Plane, ChevronDown, ChevronUp, Target, Shield } from 'lucide-react';

interface FixtureData {
  matches: Match[];
  standings: TeamStanding[];
  fixturesByTeam: Record<string, UpcomingFixture[]>;
}

interface FixtureAnalysisProps {
  players: Player[];
}

export function FixtureAnalysis({ players }: FixtureAnalysisProps) {
  const [data, setData] = useState<FixtureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [selectedRounds, setSelectedRounds] = useState<number>(3);

  useEffect(() => {
    fetch('/api/fixtures')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-6 bg-[var(--card-hover)] rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-[var(--card-hover)] rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate fixture difficulty for each team over selected rounds
  const teamDifficulty = Object.entries(data.fixturesByTeam).map(([teamShort, fixtures]) => {
    const relevantFixtures = fixtures.slice(0, selectedRounds);
    const avgDifficulty = relevantFixtures.reduce((sum, f) => sum + f.difficultyScore, 0) / relevantFixtures.length;
    const easyGames = relevantFixtures.filter(f => f.opponentStrength === 'weak').length;
    const homeGames = relevantFixtures.filter(f => f.isHome).length;

    // Get players from this team
    const teamPlayers = players.filter(p => p.teamShort === teamShort);

    return {
      teamShort,
      team: relevantFixtures[0]?.team || teamShort,
      fixtures: relevantFixtures,
      avgDifficulty,
      easyGames,
      homeGames,
      teamPlayers,
      standing: data.standings.find(s => s.teamShort === teamShort),
    };
  }).sort((a, b) => a.avgDifficulty - b.avgDifficulty);

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return 'text-green-500 bg-green-500/20';
    if (score <= 5) return 'text-yellow-500 bg-yellow-500/20';
    if (score <= 7) return 'text-orange-500 bg-orange-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getStrengthBadge = (strength: 'weak' | 'medium' | 'strong') => {
    const styles = {
      weak: 'bg-green-500/20 text-green-500',
      medium: 'bg-yellow-500/20 text-yellow-500',
      strong: 'bg-red-500/20 text-red-500',
    };
    const labels = {
      weak: 'Svag',
      medium: 'Medium',
      strong: 'Stærk',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${styles[strength]}`}>
        {labels[strength]}
      </span>
    );
  };

  return (
    <div className="stat-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[var(--accent)]" />
          <h2 className="text-xl font-bold">Kampanalyse</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Antal runder:</span>
          <select
            value={selectedRounds}
            onChange={(e) => setSelectedRounds(Number(e.target.value))}
            className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] rounded"
          >
            <option value={1}>1 runde</option>
            <option value={2}>2 runder</option>
            <option value={3}>3 runder</option>
          </select>
        </div>
      </div>

      <div className="mb-4 p-3 rounded bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-300">
          <strong>Tip:</strong> Hold sorteret efter lettest kampe først. Grøn = lette kampe, Rød = svære kampe.
          Vælg spillere fra hold med favorable kommende kampe!
        </p>
      </div>

      <div className="space-y-2">
        {teamDifficulty.map((team) => (
          <div key={team.teamShort} className="border border-[var(--border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedTeam(expandedTeam === team.teamShort ? null : team.teamShort)}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--card-hover)] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`team-badge team-${team.teamShort.toLowerCase()}`}>
                  {team.teamShort}
                </span>
                <div className="text-left">
                  <p className="font-medium">{team.team}</p>
                  <p className="text-xs text-gray-400">
                    {team.standing ? `${team.standing.position}. plads • ${team.standing.points} point` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {team.fixtures.map((f, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${getDifficultyColor(f.difficultyScore)}`}
                        title={`${f.opponent} (${f.isHome ? 'H' : 'U'})`}
                      >
                        {f.opponentShort.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`px-3 py-1 rounded font-bold ${getDifficultyColor(team.avgDifficulty)}`}>
                  {team.avgDifficulty.toFixed(1)}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Home className="w-4 h-4" />
                  <span>{team.homeGames}</span>
                </div>

                {expandedTeam === team.teamShort ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedTeam === team.teamShort && (
              <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Fixtures */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Kommende kampe
                    </h4>
                    <div className="space-y-2">
                      {team.fixtures.map((fixture, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded bg-[var(--card)]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">R{fixture.round}</span>
                            {fixture.isHome ? (
                              <Home className="w-4 h-4 text-green-500" />
                            ) : (
                              <Plane className="w-4 h-4 text-orange-500" />
                            )}
                            <div>
                              <p className="font-medium">
                                {fixture.isHome ? 'vs' : '@'} {fixture.opponent}
                              </p>
                              <p className="text-xs text-gray-400">
                                {fixture.date} {fixture.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStrengthBadge(fixture.opponentStrength)}
                            <span className={`px-2 py-1 rounded text-sm font-bold ${getDifficultyColor(fixture.difficultyScore)}`}>
                              {fixture.difficultyScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Players */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Spillere fra {team.teamShort}
                    </h4>
                    {team.teamPlayers.length > 0 ? (
                      <div className="space-y-2">
                        {team.teamPlayers.slice(0, 5).map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 rounded bg-[var(--card)]"
                          >
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-gray-400">
                                {player.goals} mål, {player.assists} assists
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[var(--accent)]">{player.total}</p>
                              <p className="text-xs text-gray-400">{player.minutesPerContribution} min/bid</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Ingen spillere i top 20 fra dette hold
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Best picks summary */}
      <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-green-400">Anbefalede hold de næste {selectedRounds} runder</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {teamDifficulty.slice(0, 4).map((team) => (
            <span
              key={team.teamShort}
              className={`team-badge team-${team.teamShort.toLowerCase()}`}
            >
              {team.teamShort} ({team.avgDifficulty.toFixed(1)})
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Disse hold har de letteste kampe. Overvej at have spillere fra disse hold!
        </p>
      </div>
    </div>
  );
}
