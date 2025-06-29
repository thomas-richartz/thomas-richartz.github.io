import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture, Text } from "@react-three/drei";
import { OrbitControls } from "@react-three/drei";
import { GalleryImage } from "@/types";
import CameraController from "@/components/CameraController";
import "@/materials/BlurImageMaterial";

interface RandomPictureParallaxViewProps {
  images: GalleryImage[];
  loadRandomImages: (count: number) => GalleryImage[];
  setImages: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}

const ParallaxCube = ({
  image,
  title,
  position,
  onClick,
  selected,
  blur = 0,
}: {
  image: string;
  title: string;
  position: [number, number, number];
  onClick: () => void;
  selected: boolean;
  blur?: number;
}) => {
  const texture = useTexture({
    map: `/assets/images/${image}`,
    normalMap: "/assets/normalmaps/default.jpg",
    // normalMap: "/assets/normalmaps/freiheitskampf-4.jpg_specular.png",
    // normalMap: `/assets/normalmaps/${image.replace(/\.[^.]+$/, ".png")}`,
  });

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

    if (!selected) {
      elapsedRef.current += delta;
      const angle =
        Math.sin(elapsedRef.current * 1.5) * THREE.MathUtils.degToRad(5); // ±5°
      meshRef.current.rotation.y = angle;
    }
  });

  useEffect(() => {
    if (texture.map?.image) {
      const { width, height } = texture.map.image;
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
            uTexture={texture.map}
            uResolution={[window.innerWidth, window.innerHeight]}
            uTime={0}
            uLod={blur}
            normalMap={texture.normalMap}
          />
          {/* <meshStandardMaterial map={texture} /> */}
        </mesh>
      </mesh>
      {selected && (
        <Text
          fontSize={0.1}
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
  loadRandomImages,
  setImages,
}: RandomPictureParallaxViewProps) => {
  const defaultCamTargetPos: [number, number, number] = [0, 0, 10];
  const [targetPosition, setTargetPosition] =
    useState<[number, number, number]>(defaultCamTargetPos);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [windowOffset, setWindowOffset] = useState(0);
  const windowSize = 9;
  const cameraRef = useRef<any>();

  const shiftWindow = () => {
    const nextOffset = windowOffset + 1;
    if (nextOffset + windowSize > images.length) {
      setImages((prev) => [...prev, ...loadRandomImages(5)]);
    }
    setWindowOffset(nextOffset);
  };

  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        // pointerEvents: selectedIndex !== null ? "auto" : "none",
        background: "black",
      }}
    >
      <ambientLight intensity={0.5} />
      {/* <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow /> */}
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} />

      <mesh position={[0, 0, -150]}>
        <planeGeometry args={[window.innerWidth, window.innerHeight]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {images.map((img, i) => {
        const z = -i * 2;
        const x = ((i % 3) - 1) * 3;
        const y = Math.floor(i / 3) * -1.5;
        return (
          <ParallaxCube
            selected={selectedIndex === i ? true : false}
            key={img.filename}
            image={img.filename}
            title={img.title}
            position={[x, y, z]}
            onClick={() => {
              if (selectedIndex === i) {
                // Zoom out to overview
                setSelectedIndex(null);
                setTargetPosition(defaultCamTargetPos); // TODO or a saved overview, prev pos
                // setTargetPosition([x, y, z - 4]); // zoom out
                // setTargetPosition([x, y, z - 4]); // zoom out
              } else {
                // Zoom into selected cube
                setSelectedIndex(i);
                shiftWindow();
                setTargetPosition([x, y, z + 3.3]);
              }
            }}
            blur={selectedIndex === i ? 0.0 : 2.5}
          />
        );
      })}
      <CameraController cameraRef={cameraRef} targetPosition={targetPosition} />
      {selectedIndex !== null && (
        <OrbitControls
          enableZoom
          enablePan={false}
          enableRotate
          target={targetPosition}
        />
      )}
    </Canvas>
  );
};
