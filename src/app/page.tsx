'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { PlayerTable } from '@/components/PlayerTable';
import { StatCards } from '@/components/StatCards';
import { TopPerformers } from '@/components/TopPerformers';
import { ValuePicks } from '@/components/ValuePicks';
import { HotPlayers } from '@/components/HotPlayers';
import { FixtureAnalysis } from '@/components/FixtureAnalysis';
import { TransferCalculator } from '@/components/TransferCalculator';
import { PlayerImporter } from '@/components/PlayerImporter';
import { RefreshCw, ExternalLink, Info, Menu, X } from 'lucide-react';

type TabType = 'overview' | 'fixtures' | 'import' | 'players';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Kunne ikke hente spillerdata. Prøv igen senere.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overblik', icon: '📊' },
    { id: 'fixtures' as TabType, label: 'Kampe', icon: '📅' },
    { id: 'import' as TabType, label: 'Importér', icon: '📥' },
    { id: 'players' as TabType, label: 'Spillere', icon: '👥' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚽</span>
              <div>
                <h1 className="text-lg font-bold text-white">Holdet.dk Dashboard</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Super Manager Forår 2026</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-[var(--card)]'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                href="https://www.holdet.dk/da/fantasy/super-manager-spring-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Holdet.dk
              </a>
              <button
                onClick={fetchPlayers}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Opdater</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[var(--card)]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[var(--border)]">
              <nav className="flex flex-col gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[var(--card)]'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Rules reminder */}
        <div className="mb-6 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-white mb-1">Super Manager regler:</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-400">
                <span><strong>Budget:</strong> 50 mio</span>
                <span><strong>Spillere:</strong> 11</span>
                <span><strong>Max/hold:</strong> 4</span>
                <span><strong>Mål:</strong> +100k</span>
                <span><strong>Gult:</strong> -20k</span>
                <span><strong>Bytte:</strong> 1%</span>
              </div>
            </div>
          </div>
        </div>

        {lastUpdate && (
          <p className="text-xs text-gray-500 mb-4">
            Sidst opdateret: {lastUpdate.toLocaleString('da-DK')}
          </p>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {loading && players.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent)]" />
            <span className="ml-3 text-gray-400">Henter spillerdata...</span>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {players.length === 0 ? (
                  <div className="stat-card text-center py-12">
                    <p className="text-xl text-gray-400 mb-4">Ingen spillere importeret endnu</p>
                    <p className="text-gray-500">
                      Gå til <button onClick={() => setActiveTab('import')} className="text-[var(--accent)] hover:underline">Importér</button> for at hente spillere fra Holdet.dk
                    </p>
                  </div>
                ) : (
                  <>
                    <StatCards players={players} />
                    <HotPlayers players={players} />
                    <ValuePicks players={players} />
                    <TopPerformers players={players} />
                  </>
                )}
              </div>
            )}

            {/* Fixtures Tab */}
            {activeTab === 'fixtures' && (
              <div className="space-y-8">
                <FixtureAnalysis players={players} />
              </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-8">
                <PlayerImporter
                  players={players}
                  onPlayersImported={fetchPlayers}
                />
                <TransferCalculator players={players} />
                {players.length > 0 && (
                  <div className="stat-card">
                    <p className="text-green-400">
                      ✓ {players.length} spillere importeret fra Holdet.dk
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="space-y-8">
                {players.length === 0 ? (
                  <div className="stat-card text-center py-12">
                    <p className="text-xl text-gray-400 mb-4">Ingen spillere endnu</p>
                    <p className="text-gray-500">
                      Gå til <button onClick={() => setActiveTab('import')} className="text-[var(--accent)] hover:underline">Importér</button> for at hente spillere fra Holdet.dk
                    </p>
                  </div>
                ) : (
                  <PlayerTable
                    players={players}
                    onPlayerSelect={setSelectedPlayer}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Player detail modal */}
        {selectedPlayer && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPlayer(null)}
          >
            <div
              className="stat-card max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedPlayer.name}</h3>
                  <span className={`team-badge team-${selectedPlayer.teamShort.toLowerCase()} mt-2`}>
                    {selectedPlayer.team}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[var(--background)] rounded p-3">
                  <p className="text-sm text-gray-400">Kampe</p>
                  <p className="text-2xl font-bold">{selectedPlayer.matches}</p>
                </div>
                <div className="bg-[var(--background)] rounded p-3">
                  <p className="text-sm text-gray-400">Mål</p>
                  <p className="text-2xl font-bold text-[var(--accent-green)]">{selectedPlayer.goals}</p>
                </div>
                <div className="bg-[var(--background)] rounded p-3">
                  <p className="text-sm text-gray-400">Assists</p>
                  <p className="text-2xl font-bold text-[var(--accent-yellow)]">{selectedPlayer.assists}</p>
                </div>
                <div className="bg-[var(--background)] rounded p-3">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-[var(--accent)]">{selectedPlayer.total}</p>
                </div>
              </div>

              <div className="bg-[var(--background)] rounded p-3">
                <p className="text-sm text-gray-400">Minutter pr. bidrag</p>
                <p className="text-xl font-bold">
                  {selectedPlayer.minutesPerContribution} minutter
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPlayer.minutesPerContribution < 100
                    ? 'Meget effektiv!'
                    : selectedPlayer.minutesPerContribution < 150
                    ? 'God effektivitet'
                    : 'Gennemsnitlig effektivitet'}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(selectedPlayer.name + ' ' + selectedPlayer.team + ' Superligaen')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  Søg efter spiller
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center text-sm text-gray-500">
          <p>
            Data fra{' '}
            <a href="https://superstats.dk" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              SuperStats.dk
            </a>
            {' '}• Spil på{' '}
            <a href="https://www.holdet.dk" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              Holdet.dk
            </a>
          </p>
          <p className="mt-2">
            Dette er et uofficielt værktøj. Tjek altid de faktiske priser på Holdet.dk.
          </p>
        </div>
      </footer>
    </div>
  );
}
