
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GameState } from '../types';
import Board from './Board';
import Token from './Token';
import Dice from './Dice';

interface SceneProps {
  gameState: GameState;
  onTokenClick: (id: string) => void;
}

const Scene: React.FC<SceneProps> = ({ gameState, onTokenClick }) => {
  return (
    <group>
      {/* Table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2d1a12" roughness={0.8} />
      </mesh>

      {/* Main Board */}
      <Board />

      {/* Tokens */}
      {gameState.players.map((player) => (
        player.tokens.map((token, idx) => (
          <Token 
            key={token.id} 
            token={token} 
            isCurrentTurn={gameState.phase === 'WAITING_FOR_MOVE' && gameState.players[gameState.currentPlayerIndex].color === token.color}
            onClick={() => onTokenClick(token.id)}
            offsetIdx={idx}
          />
        ))
      ))}

      {/* Dice */}
      <Dice 
        value={gameState.diceValue} 
        isRolling={gameState.phase === 'ROLLING'} 
        position={[0, 0.8, 0]}
      />
    </group>
  );
};

export default Scene;
