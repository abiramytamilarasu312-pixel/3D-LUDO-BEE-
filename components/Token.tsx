
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { TokenState } from '../types';
import { getPosition, COLORS } from '../constants';
import { Vector3 } from 'three';

interface TokenProps {
  token: TokenState;
  isCurrentTurn: boolean;
  onClick: () => void;
  offsetIdx: number;
}

const Token: React.FC<TokenProps> = ({ token, isCurrentTurn, onClick, offsetIdx }) => {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  
  // visualIndex handles step-by-step movement animation
  const [visualIndex, setVisualIndex] = useState(token.index);
  const [isMoving, setIsMoving] = useState(false);

  // Sync visual index with game state index step-by-step
  useEffect(() => {
    if (visualIndex === token.index) {
      setIsMoving(false);
      return;
    }

    setIsMoving(true);
    const timer = setTimeout(() => {
      if (token.index === -1) {
        setVisualIndex(-1);
      } else if (visualIndex === -1) {
        setVisualIndex(0);
      } else {
        // Increment or decrement (usually increment in Ludo)
        setVisualIndex(prev => prev < token.index ? prev + 1 : prev - 1);
      }
    }, 250); // Speed of hopping from tile to tile

    return () => clearTimeout(timer);
  }, [token.index, visualIndex]);

  const targetPos = useMemo(() => {
    const p = getPosition(token.color, visualIndex);
    if (visualIndex === -1) {
      const offsets = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      return new Vector3(p[0] + offsets[offsetIdx][0], p[1], p[2] + offsets[offsetIdx][1]);
    }
    return new Vector3(...p);
  }, [token.color, visualIndex, offsetIdx]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smoothly move to current visual step
      meshRef.current.position.lerp(targetPos, delta * 15);
      
      // Hop animation while moving between tiles
      if (isMoving) {
        const hopHeight = Math.abs(Math.sin(state.clock.elapsedTime * 12)) * 0.4;
        meshRef.current.position.y += hopHeight;
      }

      // Turn animation (breathing/rotating if selectable)
      if (isCurrentTurn && !isMoving) {
        meshRef.current.position.y = targetPos.y + Math.sin(state.clock.elapsedTime * 5) * 0.15 + 0.2;
        meshRef.current.rotation.y += delta * 2;
      } else if (!isMoving) {
        meshRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => isCurrentTurn && setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (isCurrentTurn && !isMoving) onClick();
      }}
    >
      {/* Pawn shape */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 0.8, 16]} />
        <meshStandardMaterial 
          color={COLORS[token.color]} 
          emissive={hovered ? COLORS[token.color] : '#000'}
          emissiveIntensity={hovered ? 0.4 : 0}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      <mesh castShadow position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={COLORS[token.color]}
          emissive={hovered ? COLORS[token.color] : '#000'}
          emissiveIntensity={hovered ? 0.4 : 0}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Glow highlight for current turn */}
      {isCurrentTurn && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
          <ringGeometry args={[0.5, 0.65, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export default Token;
