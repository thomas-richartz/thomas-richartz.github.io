import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture, Text } from "@react-three/drei";
import { GalleryImage } from "@/types";
import CameraController from "@/components/CameraController";
import "@/materials/BlurImageMaterial";

interface RandomPictureParallaxViewProps {
  images: GalleryImage[];
}

const ParallaxCube = ({
  image,
  title,
  position,
  onClick,
  blur = 0,
}: {
  image: string;
  title: string;
  position: [number, number, number];
  onClick: () => void;
  blur?: number;
}) => {
  const texture = useTexture(`/assets/images/${image}`);
  // const meshRef = useRef<THREE.Mesh>(null);
  const meshRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState<[number, number] | null>(null);
  const [startTime] = useState(() => Date.now());
  const [hovered, setHovered] = useState(false);
  const elapsedRef = useRef(0);
  const lastUpdateTimeRef = useRef(performance.now());

  useFrame(() => {
    if (!meshRef.current) return;

    const now = performance.now();
    const delta = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;

    if (!hovered) {
      elapsedRef.current += delta;
      const angle =
        Math.sin(elapsedRef.current * 1.5) * THREE.MathUtils.degToRad(5); // ±5°
      meshRef.current.rotation.y = angle;
    }
  });

  useEffect(() => {
    if (texture.image) {
      const { width, height } = texture.image;
      setDimensions([width, height]);
    }
  }, [texture]);

  const canvasDepth = 0.05;
  const baseWidth = 1.5;

  let geometryArgs: [number, number, number] = [1, 1, canvasDepth];

  if (dimensions) {
    const [imgWidth, imgHeight] = dimensions;
    const aspectRatio = imgHeight / imgWidth;
    geometryArgs = [baseWidth, baseWidth * aspectRatio, canvasDepth];
  }

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <mesh>
          <boxGeometry args={geometryArgs} />
          <blurImageMaterial
            uTexture={texture}
            uResolution={[window.innerWidth, window.innerHeight]}
            uTime={0}
            uLod={blur}
          />
          {/* <meshStandardMaterial map={texture} /> */}
        </mesh>
      </mesh>
      {hovered && (
        <Text
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="top"
          position={[0, -(geometryArgs[1] / 2 + 0.2), 0]}
        >
          {title}
        </Text>
      )}
    </group>
  );
};

export const RandomPictureParallaxView = ({
  images,
}: RandomPictureParallaxViewProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number]
  >([0, 0, 10]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const cameraRef = useRef<any>();

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

  useEffect(() => {
    // scroll down = zoom out
    const depth = 10 + scrollY / 100;
    if (selectedIndex === null) {
      setTargetPosition([0, 0, depth]);
    }
  }, [scrollY, selectedIndex]);

  return (
    <div ref={scrollRef} style={{ height: "100vh", overflowY: "scroll" }}>
      <div style={{ height: `${images.length * 150}px` }}></div>
      <Canvas style={{ position: "fixed", top: 0, left: 0 }}>
        <ambientLight />
        <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} />

        <mesh position={[0, 0, -50]}>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>

        {images.map((img, i) => {
          const z = -i * 2;
          const x = ((i % 3) - 1) * 3;
          const y = Math.floor(i / 3) * -2.5;
          return (
            <ParallaxCube
              key={img.filename}
              image={img.filename}
              title={img.title}
              position={[x, y, z]}
              onClick={() => {
                if (selectedIndex === i) {
                  // Zoom out to overview
                  setSelectedIndex(null);
                  setTargetPosition([0, 0, 10]); // TODO or a saved overview, prev pos
                  // setTargetPosition([x, y, z - 4]); // zoom out
                  // setTargetPosition([x, y, z - 4]); // zoom out
                } else {
                  // Zoom into selected cube
                  setSelectedIndex(i);
                  setTargetPosition([x, y, z + 3.3]);
                }
              }}
              blur={selectedIndex === i ? 0.0 : 2.5}
            />
          );
        })}
        <CameraController
          cameraRef={cameraRef}
          targetPosition={targetPosition}
        />
      </Canvas>
    </div>
  );
};
