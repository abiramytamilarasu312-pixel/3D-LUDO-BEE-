
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface DiceProps {
  value: number;
  isRolling: boolean;
  position: [number, number, number];
}

/**
 * PipSet component to render patterns for each dice value
 */
const PipSet = ({ face, value }: { face: 'TOP' | 'BOTTOM' | 'FRONT' | 'BACK' | 'LEFT' | 'RIGHT'; value: number }) => {
  const pips = useMemo(() => {
    const coords: [number, number][] = [];
    const s = 0.25; // spacing

    switch (value) {
      case 1:
        coords.push([0, 0]);
        break;
      case 2:
        coords.push([-s, s], [s, -s]);
        break;
      case 3:
        coords.push([-s, s], [0, 0], [s, -s]);
        break;
      case 4:
        coords.push([-s, s], [s, s], [-s, -s], [s, -s]);
        break;
      case 5:
        coords.push([-s, s], [s, s], [0, 0], [-s, -s], [s, -s]);
        break;
      case 6:
        coords.push([-s, s], [s, s], [-s, 0], [s, 0], [-s, -s], [s, -s]);
        break;
    }

    return coords;
  }, [value]);

  const posOffset = 0.51; // Offset slightly from surface to prevent z-fighting
  
  const rotation: [number, number, number] = useMemo(() => {
    switch (face) {
      case 'TOP': return [-Math.PI / 2, 0, 0];
      case 'BOTTOM': return [Math.PI / 2, 0, 0];
      case 'FRONT': return [0, 0, 0];
      case 'BACK': return [0, Math.PI, 0];
      case 'LEFT': return [0, -Math.PI / 2, 0];
      case 'RIGHT': return [0, Math.PI / 2, 0];
      default: return [0, 0, 0];
    }
  }, [face]);

  return (
    <group rotation={rotation} position={
      face === 'TOP' ? [0, 0.5, 0] :
      face === 'BOTTOM' ? [0, -0.5, 0] :
      face === 'FRONT' ? [0, 0, 0.5] :
      face === 'BACK' ? [0, 0, -0.5] :
      face === 'LEFT' ? [-0.5, 0, 0] :
      [0.5, 0, 0] // RIGHT
    }>
      {pips.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>
      ))}
    </group>
  );
};

const Dice: React.FC<DiceProps> = ({ value, isRolling, position }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Random tumble factors to make every roll look slightly different
  const tumbleFactors = useMemo(() => ({
    x: 15 + Math.random() * 10,
    y: 12 + Math.random() * 10,
    z: 18 + Math.random() * 10,
    wobble: 0.5 + Math.random() * 0.5
  }), [isRolling]);

  /**
   * Rotation Mapping:
   * We want the "Top" face (+Y) to correspond to the rolled 'value'.
   */
  const targetRotation = useMemo(() => {
    switch (value) {
      case 1: return [0, 0, 0];
      case 2: return [-Math.PI / 2, 0, 0];
      case 3: return [0, 0, Math.PI / 2];
      case 4: return [0, 0, -Math.PI / 2];
      case 5: return [Math.PI / 2, 0, 0];
      case 6: return [Math.PI, 0, 0];
      default: return [0, 0, 0];
    }
  }, [value]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isRolling) {
        // High-energy chaotic tumbling
        meshRef.current.rotation.x += delta * tumbleFactors.x;
        meshRef.current.rotation.y += delta * tumbleFactors.y;
        meshRef.current.rotation.z += delta * tumbleFactors.z;
        
        // Dynamic bounce with varying height and speed
        const bounceTime = state.clock.elapsedTime * 18;
        const verticalOffset = Math.abs(Math.sin(bounceTime)) * 2.0;
        // Add a slight horizontal jitter to the position while rolling
        const jitter = Math.sin(state.clock.elapsedTime * 30) * 0.05;
        
        meshRef.current.position.y = position[1] + verticalOffset;
        meshRef.current.position.x = position[0] + jitter;
        meshRef.current.position.z = position[2] + jitter;
      } else {
        // Snappy interpolation to target result
        // We use different speeds for rotation and position to make it feel like it "lands"
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation[0], delta * 12);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation[1], delta * 12);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation[2], delta * 12);
        
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], delta * 15);
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], delta * 15);
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2], delta * 15);
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <RoundedBox args={[1, 1, 1]} radius={0.12} smoothness={4} castShadow>
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.05} 
          metalness={0.1} 
          envMapIntensity={1.5}
        />
      </RoundedBox>
      
      {/* Render pips for all 6 faces relative to the cube */}
      <PipSet face="TOP" value={1} />
      <PipSet face="BOTTOM" value={6} />
      <PipSet face="FRONT" value={2} />
      <PipSet face="BACK" value={5} />
      <PipSet face="RIGHT" value={3} />
      <PipSet face="LEFT" value={4} />
    </group>
  );
};

export default Dice;
