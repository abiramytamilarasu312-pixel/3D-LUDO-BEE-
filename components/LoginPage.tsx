
import React, { useState } from 'react';
import { COLORS } from '../constants';
import { Color } from '../types';

interface LoginPageProps {
  onLogin: (playerNames: string[]) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [names, setNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = names.slice(0, playerCount).map(n => n.trim() || `Player`);
    onLogin(finalNames);
  };

  const playerColors: Color[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[60] overflow-y-auto p-4">
      <div className="max-w-xl w-full p-8 md:p-12 bg-neutral-900 border border-white/10 rounded-[2.5rem] shadow-2xl text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter">
            LUDO <span className="text-red-500">3D</span>
          </h2>
          <p className="text-neutral-500 uppercase tracking-[0.4em] text-[10px] mt-2 font-bold">The Premium Experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Player Count Selection */}
          <div className="space-y-3">
            <p className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold">Number of Players</p>
            <div className="flex justify-center gap-4">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlayerCount(num)}
                  className={`w-16 h-12 rounded-xl border font-black transition-all ${
                    playerCount === num 
                      ? 'bg-white text-black border-white scale-110 shadow-lg' 
                      : 'bg-white/5 text-neutral-500 border-white/10 hover:border-white/30'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Player Name Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerColors.slice(0, playerCount).map((color, idx) => (
              <div key={color} className="relative group">
                <div 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                  style={{ backgroundColor: COLORS[color] }}
                />
                <input
                  type="text"
                  value={names[idx]}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1}`}
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-neutral-600 focus:outline-none transition-all text-sm font-bold"
                  style={{ 
                    borderColor: playerCount > idx ? `${COLORS[color]}44` : undefined,
                  }}
                />
                <div className="absolute -top-2 left-4 px-2 bg-neutral-900 text-[8px] font-black uppercase tracking-widest text-neutral-500">
                  {color} TEAM
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-red-900/20 uppercase tracking-[0.2em] text-sm mt-4"
          >
            Start Battle
          </button>
        </form>

        <p className="mt-8 text-neutral-600 text-[10px] uppercase tracking-widest font-bold">
          Step into the board. Claim your victory.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
