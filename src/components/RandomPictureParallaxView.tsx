import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture, Text } from "@react-three/drei";
import { GalleryImage } from "../types";

interface RandomPictureParallaxViewProps {
  images: GalleryImage[];
}

const ParallaxCube = ({
  image,
  title,
  position,
}: {
  image: string;
  title: string;
  position: [number, number, number];
}) => {
  const texture = useTexture(`/assets/images/${image}`);
  const meshRef = useRef<any>();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <boxGeometry args={[1.5, 1, 0.5]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="top"
        position={[0, -0.8, 0]}
      >
        {title}
      </Text>
    </group>
  );
};

export const RandomPictureParallaxView = ({
  images,
}: RandomPictureParallaxViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  const onScroll = () => {
    if (scrollRef.current) {
      setScrollY(scrollRef.current.scrollTop);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", onScroll);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ height: "100vh", overflowY: "scroll" }}>
      <div style={{ height: `${images.length * 150}px` }}></div>
      <Canvas style={{ position: "fixed", top: 0, left: 0 }}>
        <ambientLight />
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        {images.map((img, i) => {
          const z = -i * 2 + scrollY / 50;
          const x = ((i % 3) - 1) * 3;
          const y = Math.floor(i / 3) * -2.5;
          return (
            <ParallaxCube
              key={img.filename}
              image={img.filename}
              title={img.title}
              position={[x, y, z]}
            />
          );
        })}
      </Canvas>
    </div>
  );
};
