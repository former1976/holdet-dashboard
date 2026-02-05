'use client';

import { useState } from 'react';
import { Player } from '@/types/player';
import { Upload, Check, Plus, Trash2, Users } from 'lucide-react';

interface PlayerImporterProps {
  players: Player[];
  onPlayersImported: () => void;
}

interface ParsedPlayer {
  name: string;
  team: string;
  position: string;
  price: number;
  goals: number;
  assists: number;
  popularity: string;
  matched: boolean;
  existingPlayer?: Player;
  matches?: number;
  minPerContrib?: number;
}

export function PlayerImporter({ players, onPlayersImported }: PlayerImporterProps) {
  const [importText, setImportText] = useState('');
  const [parsedPlayers, setParsedPlayers] = useState<ParsedPlayer[]>([]);
  const [saved, setSaved] = useState(false);

  // Parse multiple formats:
  // 1. Superliga.dk: Navn|Hold|Kort|Kampe|Mål|Assists|Total|Min/Bidrag
  // 2. Holdet.dk: Spillernavn \n Holdnavn · Position \n Pris...
  const parseInput = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').filter(line => line.trim());
    const results: ParsedPlayer[] = [];

    // Check if this is Superliga.dk format (pipe-separated)
    if (lines[0]?.includes('|')) {
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 7) {
          const name = parts[0].trim();
          const team = parts[1].trim();
          const teamShort = parts[2].trim();
          const matches = parseInt(parts[3]) || 0;
          const goals = parseInt(parts[4]) || 0;
          const assists = parseInt(parts[5]) || 0;
          const total = parseInt(parts[6]) || 0;
          const minPerContrib = parseInt(parts[7]) || 0;

          const existingPlayer = findPlayer(name, team, players);

          results.push({
            name: existingPlayer?.name || name,
            team: existingPlayer?.team || team,
            position: existingPlayer?.position || 'Ukendt',
            price: existingPlayer?.price || 0,
            goals,
            assists,
            popularity: '',
            matched: !!existingPlayer,
            existingPlayer: existingPlayer || undefined,
            matches,
            minPerContrib,
          });
        }
      }
      setParsedPlayers(results);
      setSaved(false);
      return;
    }

    // Holdet.dk format parsing below

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      // Skip header lines
      if (line.toLowerCase().includes('navn') && line.toLowerCase().includes('pris')) {
        i++;
        continue;
      }

      // Check if this line looks like a data/price line (starts with number like "2.500.000")
      const isPriceLine = /^\d{1,3}(?:\.\d{3}){1,2}\s/.test(line);

      // Check if this line is a player name
      const isTeamLine = line.includes(' · ');
      const isInfoLine = line === 'Info';

      if (!isPriceLine && !isTeamLine && !isInfoLine && line.length > 1) {
        // This is a player name
        const playerName = line.replace(/\s*(Info|Ny|Skadet)\s*$/i, '').trim();

        // Next line should be team · position
        let team = '';
        let position = '';
        if (i + 1 < lines.length && lines[i + 1].includes(' · ')) {
          const teamLine = lines[i + 1].trim();
          const parts = teamLine.split(' · ');
          team = parts[0].trim();
          position = parts[1]?.replace(/\s*Info\s*$/i, '').trim() || 'Ukendt';
          i++;
        }

        // Skip "Info" line if present
        if (i + 1 < lines.length && lines[i + 1].trim() === 'Info') {
          i++;
        }

        // Next line should be the data line
        let price = 0;
        let goals = 0;
        let assists = 0;
        let popularity = '';

        if (i + 1 < lines.length) {
          const dataLine = lines[i + 1].trim();

          // Check if this is actually a data line (starts with price)
          if (/^\d{1,3}(?:\.\d{3}){1,2}/.test(dataLine)) {
            // Split by tabs or multiple spaces
            const dataParts = dataLine.split(/\t|\s{2,}/).map(p => p.trim()).filter(p => p);

            // Parse price (first column) - format: "2.500.000" or "12.000.000"
            if (dataParts[0]) {
              const priceStr = dataParts[0].replace(/\./g, '');
              const priceNum = parseInt(priceStr, 10);
              if (!isNaN(priceNum)) {
                price = priceNum / 1000000;
              }
            }

            // Parse goals (index 3) and assists (index 4)
            if (dataParts[3] && dataParts[3] !== '-') {
              goals = parseInt(dataParts[3], 10) || 0;
            }
            if (dataParts[4] && dataParts[4] !== '-') {
              assists = parseInt(dataParts[4], 10) || 0;
            }

            // Parse popularity (index 9) - format: "0.2 %"
            if (dataParts[9]) {
              popularity = dataParts[9].trim();
            }

            i++;
          }
        }

        if (playerName && price > 0) {
          // Try to match with existing player
          const existingPlayer = findPlayer(playerName, team, players);

          results.push({
            name: existingPlayer?.name || playerName,
            team: existingPlayer?.team || team || 'Ukendt',
            position: existingPlayer?.position || mapPosition(position),
            price,
            goals,
            assists,
            popularity,
            matched: !!existingPlayer,
            existingPlayer: existingPlayer || undefined,
          });
        }
      }

      i++;
    }

    setParsedPlayers(results);
    setSaved(false);
  };

  // Map position names from Holdet.dk to our format
  const mapPosition = (pos: string): string => {
    const posLower = pos.toLowerCase();
    if (posLower.includes('angreb') || posLower.includes('angriber')) return 'Angriber';
    if (posLower.includes('midtbane')) return 'Midtbane';
    if (posLower.includes('forsvar')) return 'Forsvar';
    if (posLower.includes('keeper') || posLower.includes('målmand')) return 'Keeper';
    return pos || 'Ukendt';
  };

  // Find player by name (fuzzy matching)
  const findPlayer = (searchName: string, searchTeam: string, playerList: Player[]): Player | null => {
    const normalizedName = searchName.toLowerCase().trim();
    const normalizedTeam = searchTeam.toLowerCase().trim();

    // Exact name match
    let player = playerList.find(p => p.name.toLowerCase() === normalizedName);
    if (player) return player;

    // Exact name match with team
    player = playerList.find(p =>
      p.name.toLowerCase() === normalizedName &&
      p.team.toLowerCase().includes(normalizedTeam)
    );
    if (player) return player;

    // Partial match
    player = playerList.find(p =>
      p.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(p.name.toLowerCase())
    );
    if (player) return player;

    // Match by last name
    const words = normalizedName.split(' ');
    const lastName = words[words.length - 1];
    if (lastName.length > 2) {
      player = playerList.find(p => {
        const pWords = p.name.toLowerCase().split(' ');
        return pWords[pWords.length - 1] === lastName;
      });
    }

    return player || null;
  };

  const savePlayers = async () => {
    const playersToSave: Array<{
      name: string;
      team: string;
      position: string;
      price?: number;
      goals: number;
      assists: number;
      matches?: number;
      minutesPerContribution?: number;
    }> = [];

    for (const item of parsedPlayers) {
      playersToSave.push({
        name: item.name,
        team: item.team,
        position: item.position,
        price: item.price || undefined,
        goals: item.goals,
        assists: item.assists,
        matches: item.matches,
        minutesPerContribution: item.minPerContrib,
      });
    }

    // Save all players to system (both new and updates)
    if (playersToSave.length > 0) {
      try {
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: playersToSave }),
        });
      } catch (e) {
        console.error('Failed to save players:', e);
      }
    }

    setSaved(true);
    onPlayersImported();
  };

  const clearAll = () => {
    setImportText('');
    setParsedPlayers([]);
    setSaved(false);
  };

  const removePlayer = (index: number) => {
    setParsedPlayers(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-[var(--accent)]" />
        <h2 className="text-xl font-bold">Importér spillere fra Holdet.dk</h2>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <p className="text-sm text-green-300 mb-2">
          <strong>Sådan importerer du spillere:</strong>
        </p>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Gå til <a href="https://www.holdet.dk/da/super-manager-spring-2026/soccer/statistics/players" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline font-medium">Holdet.dk spillerstatistik</a></li>
          <li>Scroll ned for at loade de spillere du vil have</li>
          <li>Markér spillerne med musen (eller Ctrl+A for alle)</li>
          <li>Kopiér (Ctrl+C / Cmd+C)</li>
          <li>Indsæt herunder (Ctrl+V / Cmd+V)</li>
        </ol>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-300 mb-2">
          <strong>Forventet format:</strong>
        </p>
        <div className="p-2 rounded bg-[var(--card)] font-mono text-xs text-blue-400 whitespace-pre">
{`Franculino Dju
FC Midtjylland · Angreb
12.000.000    0    0    -    -    -    -    -    -    2.8 %    -    0
Tobias Bech Kristensen
AGF · Midtbane
8.000.000    0    0    -    -    -    -    -    -    40.1 %    -    0`}
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setSaved(false);
          }}
          placeholder="Indsæt spillerdata fra Holdet.dk her..."
          className="w-full h-48 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
        />

        <div className="flex gap-2">
          <button
            onClick={parseInput}
            disabled={!importText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Analysér data
          </button>
          {parsedPlayers.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Ryd
            </button>
          )}
        </div>

        {parsedPlayers.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {parsedPlayers.length} spillere fundet
                </h3>
                {!saved && (
                  <button
                    onClick={savePlayers}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                    Gem alle spillere
                  </button>
                )}
                {saved && (
                  <span className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    Gemt!
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {parsedPlayers.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded ${
                      item.matched ? 'bg-green-500/10' : 'bg-yellow-500/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.matched ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{item.team}</span>
                        <span>·</span>
                        <span>{item.position}</span>
                        {item.popularity && (
                          <>
                            <span>·</span>
                            <span className="text-blue-400">Pop: {item.popularity}</span>
                          </>
                        )}
                        {!item.matched && (
                          <span className="text-yellow-400 ml-2">(ny spiller)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold text-[var(--accent)]">
                          {item.price} mio
                        </span>
                        {(item.goals > 0 || item.assists > 0) && (
                          <div className="text-xs text-gray-400">
                            {item.goals}G / {item.assists}A
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removePlayer(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> = Matcher eksisterende spiller
              </span>
              <span className="inline-flex items-center gap-1 ml-4">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> = Ny spiller (tilføjes til systemet)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
