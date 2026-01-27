'use client';

import { useState } from 'react';
import { Player } from '@/types/player';
import { Upload, Check, Plus, Trash2 } from 'lucide-react';

interface PriceImporterProps {
  players: Player[];
  onPricesImported: (prices: Record<string, number>) => void;
}

interface ParsedPrice {
  name: string;
  price: number;
  matched: boolean;
  playerId?: string;
  team?: string;
}

export function PriceImporter({ players, onPricesImported }: PriceImporterProps) {
  const [importText, setImportText] = useState('');
  const [parsedPrices, setParsedPrices] = useState<ParsedPrice[]>([]);
  const [saved, setSaved] = useState(false);

  // Parse input - handles multiple formats:
  // 1. Simple: "Spillernavn 12" (name + price in millions)
  // 2. Holdet.dk copy-paste: tab-separated with "12.000.000" prices
  const parseInput = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').filter(line => line.trim());
    const results: ParsedPrice[] = [];

    for (const line of lines) {
      let name = '';
      let price = 0;

      // Check if line contains tab-separated data (copy-paste from holdet.dk)
      if (line.includes('\t')) {
        const parts = line.split('\t');
        // First column has player info, find the name (first line of text)
        const firstCol = parts[0].trim();
        // Extract player name: it's the first meaningful text before team info
        // Format: "Franculino Dju FC Midtjylland · Angreb Info" or similar
        const teamSeparator = firstCol.indexOf(' · ');
        if (teamSeparator > -1) {
          // Find where the team name starts (word before " · ")
          const beforeSep = firstCol.substring(0, teamSeparator);
          // Team names: FC Midtjylland, AGF, Brøndby IF, FC København, etc.
          const teamPatterns = /\s+(FC Midtjylland|FC København|FC Nordsjælland|Brøndby IF|AGF|Silkeborg IF|Randers FC|AaB|Viborg FF|OB|Lyngby BK|Vejle Boldklub|Hvidovre IF|SønderjyskE|Midtjylland|København|Nordsjælland|Brøndby|Randers|Silkeborg|Viborg|Lyngby|Vejle|Hvidovre)$/i;
          const teamMatch = beforeSep.match(teamPatterns);
          if (teamMatch) {
            name = beforeSep.substring(0, teamMatch.index).trim();
          } else {
            name = beforeSep.trim();
          }
        } else {
          name = firstCol;
        }

        // Find price in remaining columns - look for "X.XXX.XXX" pattern
        for (let i = 1; i < parts.length; i++) {
          const colText = parts[i].trim().replace(/\s/g, '');
          const bigPriceMatch = colText.match(/^(\d{1,3}(?:\.\d{3}){1,2})$/);
          if (bigPriceMatch) {
            const priceStr = bigPriceMatch[1].replace(/\./g, '');
            price = parseInt(priceStr, 10) / 1000000;
            break;
          }
        }
      } else {
        // Simple format: "Spillernavn 12" or "Spillernavn 12.5"
        const cleaned = line.replace(/mio\.?/gi, '').replace(/-/g, ' ').trim();
        const priceMatch = cleaned.match(/(\d+[.,]?\d*)\s*$/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(',', '.'));
          name = cleaned.replace(priceMatch[0], '').trim();
        }
      }

      // Remove common suffixes from name
      name = name.replace(/\s*(Info|Ny|Skadet)\s*$/i, '').trim();

      if (name && name.length > 1 && price > 0) {
        const player = findPlayer(name, players);
        results.push({
          name: player ? player.name : name,
          price,
          matched: !!player,
          playerId: player?.id,
          team: player?.teamShort,
        });
      }
    }

    setParsedPrices(results);
    setSaved(false);
  };

  // Find player by name (fuzzy matching)
  const findPlayer = (searchName: string, playerList: Player[]): Player | null => {
    const normalized = searchName.toLowerCase().trim();

    // Exact match
    let player = playerList.find(p => p.name.toLowerCase() === normalized);
    if (player) return player;

    // Partial match
    player = playerList.find(p =>
      p.name.toLowerCase().includes(normalized) ||
      normalized.includes(p.name.toLowerCase())
    );
    if (player) return player;

    // Match by last name
    const words = normalized.split(' ');
    const lastName = words[words.length - 1];
    if (lastName.length > 2) {
      player = playerList.find(p => {
        const pWords = p.name.toLowerCase().split(' ');
        return pWords[pWords.length - 1] === lastName;
      });
    }

    return player || null;
  };

  const savePrices = async () => {
    const prices: Record<string, number> = {};
    const newPlayers: { name: string; team: string; price: number }[] = [];

    for (const item of parsedPrices) {
      if (item.matched && item.playerId) {
        prices[item.playerId] = item.price;
      } else {
        // Add as new player with unknown team
        newPlayers.push({
          name: item.name,
          team: 'Ukendt',
          price: item.price,
        });
      }
    }

    // Add new players to system
    if (newPlayers.length > 0) {
      try {
        await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: newPlayers }),
        });
      } catch (e) {
        console.error('Failed to add players:', e);
      }
    }

    // Save prices
    try {
      await fetch('/api/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      });
      onPricesImported(prices);
      setSaved(true);
    } catch (e) {
      console.error('Failed to save prices:', e);
    }
  };

  const clearAll = () => {
    setImportText('');
    setParsedPrices([]);
    setSaved(false);
  };

  const removePrice = (index: number) => {
    setParsedPrices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-6 h-6 text-[var(--accent)]" />
        <h2 className="text-xl font-bold">Indtast spillerpriser</h2>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
        <p className="text-sm text-green-300 mb-2">
          <strong>Kopiér direkte fra Holdet.dk:</strong>
        </p>
        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
          <li>Gå til <a href="https://www.holdet.dk/da/super-manager-spring-2026/soccer/statistics/players" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline font-medium">Holdet.dk spillerstatistik</a></li>
          <li>Scroll ned for at loade flere spillere</li>
          <li>Markér tabellen med spillere (Ctrl+A eller marker med musen)</li>
          <li>Kopiér (Ctrl+C / Cmd+C)</li>
          <li>Indsæt herunder (Ctrl+V / Cmd+V)</li>
        </ol>
      </div>

      <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-300 mb-2">
          <strong>Eller skriv manuelt:</strong>
        </p>
        <p className="text-sm text-gray-300 mb-2">
          Skriv spillernavn og pris i millioner (én per linje):
        </p>
        <div className="p-2 rounded bg-[var(--card)] font-mono text-xs text-green-400">
          Franculino Dju 12<br/>
          Aral Simsir 7<br/>
          Tobias Bech 8
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={importText}
          onChange={(e) => {
            setImportText(e.target.value);
            setSaved(false);
          }}
          placeholder="Skriv spillernavn og pris (én per linje):&#10;&#10;Franculino Dju 12&#10;Aral Simsir 8.5&#10;Tobias Bech 7.2"
          className="w-full h-40 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
        />

        <div className="flex gap-2">
          <button
            onClick={parseInput}
            disabled={!importText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Tilføj priser
          </button>
          {parsedPrices.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Ryd
            </button>
          )}
        </div>

        {parsedPrices.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {parsedPrices.length} spillere
                </h3>
                {!saved && (
                  <button
                    onClick={savePrices}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Check className="w-4 h-4" />
                    Gem alle priser
                  </button>
                )}
                {saved && (
                  <span className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    Gemt!
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parsedPrices.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      item.matched ? 'bg-green-500/10' : 'bg-yellow-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.matched ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span className="font-medium">{item.name}</span>
                      {item.team && (
                        <span className="text-xs text-gray-400">({item.team})</span>
                      )}
                      {!item.matched && (
                        <span className="text-xs text-yellow-400">(ny spiller)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[var(--accent)]">
                        {item.price} mio
                      </span>
                      <button
                        onClick={() => removePrice(index)}
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
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> = Ny spiller (tilføjes)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
