'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { ArrowRightLeft, Calculator, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TransferCalculatorProps {
  players: Player[];
}

interface PriceData {
  [playerId: string]: {
    price: number;
    lastUpdated: string;
  };
}

export function TransferCalculator({ players }: TransferCalculatorProps) {
  const [prices, setPrices] = useState<PriceData>({});
  const [playerOut, setPlayerOut] = useState<string>('');
  const [playerIn, setPlayerIn] = useState<string>('');
  const [customPriceOut, setCustomPriceOut] = useState<string>('');
  const [customPriceIn, setCustomPriceIn] = useState<string>('');
  const [showPriceEditor, setShowPriceEditor] = useState(false);

  useEffect(() => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(setPrices)
      .catch(console.error);
  }, []);

  const getPlayerPrice = (playerId: string, customPrice?: string): number => {
    if (customPrice && !isNaN(parseFloat(customPrice))) {
      return parseFloat(customPrice);
    }
    return prices[playerId]?.price || 0;
  };

  const selectedPlayerOut = players.find(p => p.id === playerOut);
  const selectedPlayerIn = players.find(p => p.id === playerIn);

  const priceOut = getPlayerPrice(playerOut, customPriceOut);
  const priceIn = getPlayerPrice(playerIn, customPriceIn);

  // Transfer fee is 1% of the purchase price of the new player
  const transferFee = priceIn * 0.01;
  const totalCost = priceIn + transferFee;
  const netChange = priceOut - totalCost;

  // Value comparison
  const valueOut = selectedPlayerOut ? selectedPlayerOut.total / (priceOut || 1) : 0;
  const valueIn = selectedPlayerIn ? selectedPlayerIn.total / (priceIn || 1) : 0;
  const valueImprovement = valueIn - valueOut;

  const updatePrice = async (playerId: string, price: number) => {
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, price }),
      });
      if (response.ok) {
        const data = await response.json();
        setPrices(data.prices);
      }
    } catch (error) {
      console.error('Failed to update price:', error);
    }
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-[var(--accent)]" />
          <h2 className="text-xl font-bold">Bytteberegner</h2>
        </div>
        <button
          onClick={() => setShowPriceEditor(!showPriceEditor)}
          className="text-sm px-3 py-1 rounded bg-[var(--card-hover)] hover:bg-[var(--border)] transition-colors"
        >
          {showPriceEditor ? 'Skjul priser' : 'Rediger priser'}
        </button>
      </div>

      <div className="mb-4 p-3 rounded bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">
            <strong>Byttegebyr:</strong> 1% af købsprisen på den nye spiller.
            Brug felterne nedenfor til at indtaste de faktiske priser fra Holdet.dk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Out */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-red-400">
            <TrendingDown className="w-5 h-5" />
            Spiller ud
          </h3>

          <select
            value={playerOut}
            onChange={(e) => {
              setPlayerOut(e.target.value);
              setCustomPriceOut('');
            }}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg"
          >
            <option value="">Vælg spiller...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.teamShort}) - {player.total} bidrag
              </option>
            ))}
          </select>

          {selectedPlayerOut && (
            <div className="p-4 rounded-lg bg-[var(--background)] border border-red-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{selectedPlayerOut.name}</span>
                <span className={`team-badge team-${selectedPlayerOut.teamShort.toLowerCase()}`}>
                  {selectedPlayerOut.teamShort}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Bidrag:</span>
                  <span className="ml-2 font-bold">{selectedPlayerOut.total}</span>
                </div>
                <div>
                  <span className="text-gray-400">Mål:</span>
                  <span className="ml-2">{selectedPlayerOut.goals}</span>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-400 block mb-1">
                  Pris (mio) - fra Holdet.dk:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customPriceOut || getPlayerPrice(playerOut)}
                  onChange={(e) => setCustomPriceOut(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded"
                  placeholder="Indtast pris..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Player In */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-green-400">
            <TrendingUp className="w-5 h-5" />
            Spiller ind
          </h3>

          <select
            value={playerIn}
            onChange={(e) => {
              setPlayerIn(e.target.value);
              setCustomPriceIn('');
            }}
            className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg"
          >
            <option value="">Vælg spiller...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.teamShort}) - {player.total} bidrag
              </option>
            ))}
          </select>

          {selectedPlayerIn && (
            <div className="p-4 rounded-lg bg-[var(--background)] border border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{selectedPlayerIn.name}</span>
                <span className={`team-badge team-${selectedPlayerIn.teamShort.toLowerCase()}`}>
                  {selectedPlayerIn.teamShort}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Bidrag:</span>
                  <span className="ml-2 font-bold">{selectedPlayerIn.total}</span>
                </div>
                <div>
                  <span className="text-gray-400">Mål:</span>
                  <span className="ml-2">{selectedPlayerIn.goals}</span>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-400 block mb-1">
                  Pris (mio) - fra Holdet.dk:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customPriceIn || getPlayerPrice(playerIn)}
                  onChange={(e) => setCustomPriceIn(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded"
                  placeholder="Indtast pris..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculation Result */}
      {(selectedPlayerOut || selectedPlayerIn) && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold">Beregning</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded bg-[var(--card)]">
              <p className="text-sm text-gray-400">Sælg for</p>
              <p className="text-xl font-bold text-red-400">{priceOut.toFixed(2)} mio</p>
            </div>
            <div className="p-3 rounded bg-[var(--card)]">
              <p className="text-sm text-gray-400">Købspris</p>
              <p className="text-xl font-bold text-green-400">{priceIn.toFixed(2)} mio</p>
            </div>
            <div className="p-3 rounded bg-[var(--card)]">
              <p className="text-sm text-gray-400">Byttegebyr (1%)</p>
              <p className="text-xl font-bold text-yellow-400">{transferFee.toFixed(3)} mio</p>
            </div>
            <div className="p-3 rounded bg-[var(--card)]">
              <p className="text-sm text-gray-400">Netto ændring</p>
              <p className={`text-xl font-bold ${netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netChange >= 0 ? '+' : ''}{netChange.toFixed(3)} mio
              </p>
            </div>
          </div>

          {selectedPlayerOut && selectedPlayerIn && (
            <div className="mt-4 p-4 rounded bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">Værdianalyse</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Ud: værdi/mio</p>
                  <p className="font-bold">{valueOut.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Ind: værdi/mio</p>
                  <p className="font-bold">{valueIn.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Forbedring</p>
                  <p className={`font-bold ${valueImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {valueImprovement >= 0 ? '+' : ''}{valueImprovement.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {valueImprovement > 0
                  ? '✅ Dette bytte giver bedre værdi for pengene!'
                  : valueImprovement < 0
                  ? '⚠️ Den nye spiller giver mindre værdi per krone'
                  : '➖ Neutral værdi-ændring'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Price Editor */}
      {showPriceEditor && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
          <h3 className="font-semibold mb-4">Opdater spillerpriser</h3>
          <p className="text-sm text-gray-400 mb-4">
            Indtast de faktiske priser fra Holdet.dk for mere præcise beregninger.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {players.map(player => (
              <div key={player.id} className="flex items-center gap-2">
                <span className="text-sm flex-1 truncate">{player.name}</span>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={prices[player.id]?.price || ''}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      updatePrice(player.id, value);
                    }
                  }}
                  className="w-20 px-2 py-1 text-sm bg-[var(--card)] border border-[var(--border)] rounded"
                  placeholder="Pris"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
