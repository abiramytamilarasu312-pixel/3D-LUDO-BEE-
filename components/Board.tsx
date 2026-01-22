
import React from 'react';
import { Box } from '@react-three/drei';
import { COLORS, SHARED_PATH, START_OFFSETS } from '../constants';

const Board: React.FC = () => {
  const OFFSET = 7;

  return (
    <group>
      {/* Main Base Plate */}
      <Box args={[15, 0.5, 15]} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </Box>

      {/* Grid squares for the path */}
      {SHARED_PATH.map((coord, i) => {
        // Determine if this is a starting tile or safe tile
        let color = "#ffffff";
        if (i === 0) color = COLORS.RED;
        if (i === 13) color = COLORS.GREEN;
        if (i === 26) color = COLORS.YELLOW;
        if (i === 39) color = COLORS.BLUE;

        return (
          <mesh key={i} position={[coord[0] - OFFSET, 0.26, coord[1] - OFFSET]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        );
      })}

      {/* Home Stretches */}
      {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as const).map(color => {
        return [1, 2, 3, 4, 5].map(step => {
          const homeCoords: Record<string, [number, number]> = {
            RED: [step, 7],
            GREEN: [7, step],
            YELLOW: [14 - step, 7],
            BLUE: [7, 14 - step],
          };
          const [hx, hz] = homeCoords[color];
          return (
            <mesh key={`${color}-${step}`} position={[hx - OFFSET, 0.26, hz - OFFSET]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.95, 0.95]} />
              <meshStandardMaterial color={COLORS[color as keyof typeof COLORS]} roughness={0.8} />
            </mesh>
          );
        });
      })}

      {/* Bases */}
      <Base color={COLORS.RED} position={[-4.5, 0.26, -4.5]} />
      <Base color={COLORS.GREEN} position={[4.5, 0.26, -4.5]} />
      <Base color={COLORS.YELLOW} position={[4.5, 0.26, 4.5]} />
      <Base color={COLORS.BLUE} position={[-4.5, 0.26, 4.5]} />

      {/* Finish Center */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.1} />
      </mesh>
      
      {/* Wood border for the board */}
      <Box args={[15.5, 0.6, 0.25]} position={[0, 0, 7.625]} castShadow receiveShadow>
        <meshStandardMaterial color="#4a2c1a" />
      </Box>
      <Box args={[15.5, 0.6, 0.25]} position={[0, 0, -7.625]} castShadow receiveShadow>
        <meshStandardMaterial color="#4a2c1a" />
      </Box>
      <Box args={[0.25, 0.6, 15.5]} position={[7.625, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#4a2c1a" />
      </Box>
      <Box args={[0.25, 0.6, 15.5]} position={[-7.625, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#4a2c1a" />
      </Box>
    </group>
  );
};

const Base: React.FC<{ color: string; position: [number, number, number] }> = ({ color, position }) => (
  <group position={position}>
    <Box args={[6, 0.1, 6]}>
      <meshStandardMaterial color={color} opacity={0.4} transparent />
    </Box>
    {/* Token start circles */}
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map((pos, i) => (
      <mesh key={i} position={[pos[0], 0.06, pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshStandardMaterial color={color} />
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </mesh>
    ))}
  </group>
);

export default Board;
