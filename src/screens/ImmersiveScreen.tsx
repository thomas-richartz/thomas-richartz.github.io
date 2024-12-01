import React, {useState, useRef} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Html, PerspectiveCamera, Text, useTexture} from '@react-three/drei';
import {useInView} from 'react-intersection-observer';
import {a, useSpring} from '@react-spring/three';

type CubeData = {
  id: number;
  image: string;
  title: string;
  category: string;
};

const cubes: CubeData[] = Array.from({length: 11}, (_, i) => ({
  id: i,
  image: `/assets/images/3-monde-2018/3-monde-${i + 1}.jpg.webp`,
  title: `Title ${i + 1}`,
  category: `Category ${i + 1}`,
}));

function Cube({image, title, visible}: { image: string; title: string; visible: boolean }) {
  const texture = useTexture(image);
  const [hovered, setHovered] = useState(false);

  const springProps = useSpring({
    scale: hovered ? [1.2, 1.2, 1.2] : [1, 1, 1],
    position: visible ? [0, 0, 0] : [0, 0, -10],
  });

  return (
    <a.group scale={springProps.scale} position={springProps.position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, 1, 1]}/>
        <meshStandardMaterial map={texture}/>
      </mesh>
      {visible && (
        <mesh position={[0, -1.2, 0]}>
          <planeGeometry args={[2, 0.5]}/>
          <meshBasicMaterial color="black" transparent opacity={0.5}/>
        </mesh>
      )}
      {visible && (
        <Text
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, -1.2, 0.1]}
        >
          {title}
        </Text>
      )}
    </a.group>
  );
}

function InfiniteScroll() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {ref, inView} = useInView({
    triggerOnce: false,
    rootMargin: '200px',
  });

  // Automatically load more cubes when reaching the bottom
  React.useEffect(() => {
    if (inView) {
      setCurrentIndex((prev) => (prev + 1) % cubes.length);
    }
  }, [inView]);

  return (
    <Canvas>
      <ambientLight/>
      <PerspectiveCamera makeDefault position={[0, 0, 5]}/>
      {cubes.slice(0, currentIndex + 1).map((cube, index) => (
        <Cube
          key={cube.id}
          image={cube.image}
          title={cube.title}
          visible={index === currentIndex}
        />
      ))}
      <Html>
        <div ref={ref} style={{height: '1px'}}/>
      </Html>
    </Canvas>
  );
}

export default function ImmersiveScreen() {
  return (
    <div style={{height: '100vh', overflowY: 'scroll'}}>
      <InfiniteScroll/>
    </div>
  );
}
