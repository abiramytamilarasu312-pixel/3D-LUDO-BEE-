
import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { GameState, Color, TokenState, Player } from './types';
import { COLORS, START_OFFSETS } from './constants';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import LoginPage from './components/LoginPage';

const INITIAL_TOKENS = (color: Color): TokenState[] => [
  { id: `${color}-1`, color, index: -1, position: [0, 0, 0] },
  { id: `${color}-2`, color, index: -1, position: [0, 0, 0] },
  { id: `${color}-3`, color, index: -1, position: [0, 0, 0] },
  { id: `${color}-4`, color, index: -1, position: [0, 0, 0] },
];

const App: React.FC = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { color: 'RED', name: 'Player 1', tokens: INITIAL_TOKENS('RED'), isHuman: true, hasFinished: false, score: 0 },
      { color: 'GREEN', name: 'Player 2', tokens: INITIAL_TOKENS('GREEN'), isHuman: true, hasFinished: false, score: 0 },
      { color: 'YELLOW', name: 'Player 3', tokens: INITIAL_TOKENS('YELLOW'), isHuman: true, hasFinished: false, score: 0 },
      { color: 'BLUE', name: 'Player 4', tokens: INITIAL_TOKENS('BLUE'), isHuman: true, hasFinished: false, score: 0 },
    ],
    currentPlayerIndex: 0,
    diceValue: 1,
    phase: 'AUTH',
    winner: null,
    history: ['[System] Welcome to Ludo 3D Premium!'],
  });

  // Handle URL Room Joining
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room) {
      setRoomId(room);
      setGameState(prev => ({
        ...prev,
        history: [...prev.history, `[System] Joining Room: ${room}`]
      }));
    }
  }, []);

  const handleLogin = (playerNames: string[]) => {
    const colors: Color[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    
    const newPlayers: Player[] = playerNames.map((name, i) => ({
      color: colors[i],
      name: name,
      tokens: INITIAL_TOKENS(colors[i]),
      isHuman: true,
      hasFinished: false,
      score: 0
    }));

    setGameState(prev => ({
      ...prev,
      players: newPlayers,
      phase: 'WAITING_FOR_ROLL',
      currentPlayerIndex: 0,
      history: [
        ...prev.history,
        `[System] Game setup complete for ${newPlayers.length} players.`,
        ...newPlayers.map(p => `[System] ${p.name} joined as ${p.color} Team.`),
        `[System] ${newPlayers[0].name} starts the match!`
      ]
    }));
  };

  const rollDice = useCallback(() => {
    if (gameState.phase !== 'WAITING_FOR_ROLL') return;

    setGameState(prev => ({ ...prev, phase: 'ROLLING' }));

    setTimeout(() => {
      const rollValue = Math.floor(Math.random() * 6) + 1;
      setGameState(prev => {
        const currentPlayer = prev.players[prev.currentPlayerIndex];
        if (!currentPlayer) return prev;

        const canMove = currentPlayer.tokens.some(token => {
          if (token.index === -1) return rollValue === 6;
          return token.index + rollValue <= 57;
        });

        const rollLog = `[Roll] ${currentPlayer.name} rolled a ${rollValue}.`;
        
        // Award points for rolling a 6
        const bonusScore = rollValue === 6 ? 10 : 0;
        const updatedPlayers = [...prev.players];
        updatedPlayers[prev.currentPlayerIndex] = {
          ...currentPlayer,
          score: currentPlayer.score + bonusScore
        };

        if (!canMove) {
          const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
          return {
            ...prev,
            players: updatedPlayers,
            diceValue: rollValue,
            phase: 'WAITING_FOR_ROLL',
            currentPlayerIndex: nextIndex,
            history: [...prev.history, rollLog, `[System] No valid moves for ${currentPlayer.name}. Next turn.`]
          };
        }

        return {
          ...prev,
          players: updatedPlayers,
          diceValue: rollValue,
          phase: 'WAITING_FOR_MOVE',
          history: [...prev.history, rollLog]
        };
      });
    }, 1000);
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.players]);

  const moveToken = useCallback((tokenId: string) => {
    if (gameState.phase !== 'WAITING_FOR_MOVE') return;

    setGameState(prev => {
      const newPlayers = [...prev.players];
      const player = newPlayers[prev.currentPlayerIndex];
      if (!player) return prev;

      const tokenIndex = player.tokens.findIndex(t => t.id === tokenId);
      const token = player.tokens[tokenIndex];

      // Validation
      if (token.index === -1 && prev.diceValue !== 6) return prev;
      let newPathIndex = token.index === -1 ? 0 : token.index + prev.diceValue;
      if (newPathIndex > 57) return prev;

      let captureOccurred = false;
      let captureLog = "";
      let totalMovePoints = prev.diceValue * 2; // 2 points per step moved

      // Move the token
      const oldIndex = token.index;
      player.tokens[tokenIndex] = { ...token, index: newPathIndex };

      // Handle Captures (Only on shared path 0-51)
      if (newPathIndex >= 0 && newPathIndex <= 51) {
        const globalTargetPos = (newPathIndex + START_OFFSETS[player.color]) % 52;
        
        const safeGlobalIndices = [0, 13, 26, 39];
        const isSafeTile = safeGlobalIndices.includes(globalTargetPos);

        if (!isSafeTile) {
          newPlayers.forEach((otherPlayer, pIdx) => {
            if (pIdx === prev.currentPlayerIndex) return; 
            
            otherPlayer.tokens.forEach((otherToken, tIdx) => {
              if (otherToken.index >= 0 && otherToken.index <= 51) {
                const otherGlobalPos = (otherToken.index + START_OFFSETS[otherPlayer.color]) % 52;
                if (otherGlobalPos === globalTargetPos) {
                  otherPlayer.tokens[tIdx] = { ...otherToken, index: -1 };
                  captureOccurred = true;
                  captureLog = `[Capture] ${player.name} captured ${otherPlayer.name}'s token! (+50 pts)`;
                  totalMovePoints += 50; // Capture bonus
                }
              }
            });
          });
        }
      }

      // Home Finish Bonus
      if (newPathIndex === 57) {
        totalMovePoints += 100; // Finish bonus
      }

      player.score += totalMovePoints;

      const moveLog = `[Move] ${player.name} moved token to ${newPathIndex === 57 ? 'Finish' : newPathIndex}.`;
      
      const allFinished = player.tokens.every(t => t.index === 57);
      if (allFinished) {
        player.score += 500; // Game winner bonus
        return { 
          ...prev, 
          players: newPlayers,
          phase: 'FINISHED', 
          winner: player.color, 
          history: [...prev.history, moveLog, `[Victory] ${player.name} HAS FINISHED ALL TOKENS! (+500 Victory Bonus)`] 
        };
      }

      const isExtraTurn = prev.diceValue === 6 || captureOccurred;
      const nextPlayerIndex = isExtraTurn ? prev.currentPlayerIndex : (prev.currentPlayerIndex + 1) % prev.players.length;
      
      const turnBonusLog = isExtraTurn ? `[Bonus] ${player.name} gets an extra turn!` : "";

      const updatedHistory = [...prev.history, moveLog];
      if (captureLog) updatedHistory.push(captureLog);
      if (turnBonusLog) updatedHistory.push(turnBonusLog);
      if (newPathIndex === 57) updatedHistory.push(`[Home] ${player.name} reached the finish line! (+100 pts)`);

      return {
        ...prev,
        players: newPlayers,
        phase: 'WAITING_FOR_ROLL',
        currentPlayerIndex: nextPlayerIndex,
        history: updatedHistory
      };
    });
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.diceValue]);

  return (
    <div className="w-full h-screen bg-neutral-900 relative overflow-hidden">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={45} />
          <OrbitControls 
            enablePan={true} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={5} 
            maxDistance={25} 
          />
          
          <Scene 
            gameState={gameState} 
            onTokenClick={moveToken} 
          />

          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        </Suspense>
      </Canvas>

      {gameState.phase === 'AUTH' && <LoginPage onLogin={handleLogin} />}
      
      <UIOverlay 
        gameState={gameState} 
        onRoll={rollDice} 
      />

      {/* Decorative Branding */}
      <div className="absolute top-4 left-4 pointer-events-none select-none">
        <h1 className="text-3xl font-black text-white italic drop-shadow-lg">LUDO <span className="text-red-500">3D</span></h1>
        <p className="text-xs text-neutral-400 font-mono">PREMIUM EDITION</p>
      </div>
      
      <div className="absolute bottom-4 left-4 text-white text-[10px] font-bold tracking-widest opacity-50 uppercase pointer-events-none">
        {roomId ? `CONNECTED TO: ${roomId}` : `LOCAL MATCH`}
      </div>
    </div>
  );
};

export default App;
