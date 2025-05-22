import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture, Text } from "@react-three/drei";
import { GalleryImage } from "../../../types";
import CameraController from "../../CameraController";
import "../../../materials/BlurImageMaterial";

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
  const meshRef = useRef<any>();
  // const meshRef = useRef<THREE.Group>(null);
  const [dimensions, setDimensions] = useState<[number, number] | null>(null);
  const [startTime] = useState(() => Date.now());

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = (Date.now() - startTime) / 1000; // in seconds
    const angle = Math.sin(elapsed) * (Math.PI / 180) * 5; // ±5 degrees

    // Apply to Y-axis rotation
    meshRef.current.rotation.y = angle;
  });

  useEffect(() => {
    const img = new Image();
    img.src = `/assets/images/${image}`;
    img.onload = () => {
      setDimensions([img.width, img.height]);
    };
  }, [image]);

  const canvasDepth = 0.05;
  const baseWidth = 1.5;

  let geometryArgs: [number, number, number] = [1, 1, canvasDepth]; // fallback

  if (dimensions) {
    const [imgWidth, imgHeight] = dimensions;
    const aspectRatio = imgHeight / imgWidth;
    geometryArgs = [baseWidth, baseWidth * aspectRatio, canvasDepth];
  }

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      <mesh>
        <mesh>
          <boxGeometry args={geometryArgs} />
          <blurImageMaterial
            uTexture={texture}
            uResolution={[1024, 1024]}
            uTime={0}
            uLod={blur}
          />
          {/* <meshStandardMaterial map={texture} /> */}
        </mesh>
      </mesh>
      <Text
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="top"
        position={[0, -(geometryArgs[1] / 2 + 0.2), 0]}
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
          const z = -i * 2 + scrollY / 50;
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
                } else {
                  // Zoom into selected cube
                  setSelectedIndex(i);
                  setTargetPosition([x, y, z + 2]);
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
