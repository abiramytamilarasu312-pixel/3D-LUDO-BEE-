
import React from 'react';

interface MainMenuProps {
  onStart: (count: number) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="max-w-md w-full p-8 bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl text-center">
        <h2 className="text-5xl font-black text-white mb-2 italic">LUDO <span className="text-red-500">3D</span></h2>
        <p className="text-neutral-400 mb-8 uppercase tracking-[0.3em] text-xs">Premium Board Game</p>
        
        <div className="space-y-4">
          <p className="text-white text-sm font-semibold mb-4 opacity-70">SELECT NUMBER OF PLAYERS</p>
          <div className="grid grid-cols-3 gap-4">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => onStart(n)}
                className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all hover:scale-105"
              >
                {n} PLAYERS
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-neutral-600 text-[10px] uppercase tracking-widest">
          Standard Ludo Rules Applied
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
