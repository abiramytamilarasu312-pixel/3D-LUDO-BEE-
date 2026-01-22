
import React, { useState, useRef, useEffect } from 'react';
import { GameState } from '../types';
import { COLORS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  onRoll: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onRoll }) => {
  const [showToast, setShowToast] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameState.history]);

  if (!currentPlayer && gameState.phase !== 'START') return null;

  const handleInvite = () => {
    const currentParams = new URLSearchParams(window.location.search);
    let roomId = currentParams.get('room');
    if (!roomId) {
      roomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    }
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  const getLogColor = (text: string) => {
    if (text.startsWith('[Roll]')) return 'text-sky-400';
    if (text.startsWith('[Capture]')) return 'text-red-400 font-bold';
    if (text.startsWith('[Move]')) return 'text-emerald-400';
    if (text.startsWith('[Bonus]')) return 'text-amber-400 font-black';
    if (text.startsWith('[Victory]')) return 'text-white font-black bg-red-600/20 px-1';
    if (text.startsWith('[Home]')) return 'text-pink-400';
    return 'text-neutral-400';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 overflow-hidden">
      {/* Toast Notification */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 transition-all duration-500 z-[100] ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-emerald-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-bold tracking-tight uppercase text-xs">Invite Link Copied!</span>
        </div>
      </div>

      {/* Top Section: Scoreboard & Invite */}
      <div className="flex justify-between items-start w-full">
        <div className="flex gap-4 flex-wrap">
          {gameState.players.map((p, idx) => (
            <div 
              key={p.color} 
              className={`px-4 py-2 rounded-xl backdrop-blur-md border-2 transition-all duration-300 ${
                gameState.currentPlayerIndex === idx 
                  ? 'bg-white/20 border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                  : 'bg-black/40 border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[p.color] }} />
                <span className="text-white font-bold text-sm uppercase tracking-wider">{p.name}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleInvite}
          className="pointer-events-auto group relative flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl transition-all active:scale-95"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-white text-[10px] font-black uppercase tracking-widest opacity-70 group-hover:opacity-100">Invite Friend</span>
        </button>
      </div>

      {/* Side History Log */}
      <div className="absolute right-6 top-24 bottom-64 w-72 flex flex-col gap-2 pointer-events-auto">
        <div className="text-[10px] text-neutral-500 font-bold tracking-[0.3em] uppercase mb-1 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Live Feed
        </div>
        <div className="flex-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 overflow-y-auto scrollbar-hide flex flex-col gap-2 shadow-2xl">
          {gameState.history.map((log, i) => (
            <div key={i} className={`text-xs font-mono leading-relaxed tracking-tight ${getLogColor(log)}`}>
              {log}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Points Board (Bottom Horizontal) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 pointer-events-none">
        <div className="flex justify-center gap-4">
          {gameState.players.map((p, idx) => (
            <div 
              key={p.color}
              className={`flex-1 min-w-[140px] bg-black/60 backdrop-blur-xl rounded-2xl p-4 border transition-all duration-500 ${
                gameState.currentPlayerIndex === idx 
                  ? 'border-white/50 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                  : 'border-white/5 opacity-80'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-neutral-500 tracking-[0.2em] uppercase mb-1">
                  {p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black italic tracking-tighter" style={{ color: COLORS[p.color] }}>
                    {p.score}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 opacity-50 uppercase">pts</span>
                </div>
                {gameState.currentPlayerIndex === idx && (
                  <div className="mt-2 h-0.5 w-full rounded-full overflow-hidden bg-white/10">
                    <div className="h-full bg-white animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Controls & Messages */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {/* Game Messages */}
        <div className="bg-black/60 px-8 py-3 rounded-full border border-white/20 backdrop-blur-lg shadow-2xl">
          <p className="text-white font-black text-xl italic tracking-tight">
            {gameState.phase === 'WAITING_FOR_ROLL' && currentPlayer && `${currentPlayer.name.toUpperCase()}'S TURN`}
            {gameState.phase === 'WAITING_FOR_MOVE' && `SELECT A TOKEN`}
            {gameState.phase === 'ROLLING' && `DICE TUMBLING...`}
            {gameState.phase === 'FINISHED' && `GAME OVER: ${gameState.winner} WINS`}
          </p>
        </div>

        {/* Dice Roll Button */}
        <button
          onClick={onRoll}
          disabled={gameState.phase !== 'WAITING_FOR_ROLL'}
          className={`
            pointer-events-auto px-16 py-5 rounded-3xl text-3xl font-black uppercase tracking-[0.2em] transition-all duration-300
            ${gameState.phase === 'WAITING_FOR_ROLL' 
              ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.2)] cursor-pointer' 
              : 'bg-neutral-800 text-neutral-600 opacity-50 cursor-not-allowed'}
          `}
        >
          {gameState.phase === 'ROLLING' ? '...' : 'ROLL'}
        </button>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default UIOverlay;
