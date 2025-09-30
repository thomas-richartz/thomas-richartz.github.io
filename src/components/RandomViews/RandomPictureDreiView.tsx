import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture, Text, Html, Circle } from "@react-three/drei";
import { OrbitControls, Environment, Plane, Reflector, useHelper } from "@react-three/drei";
import { GalleryImage } from "@/types";
import CameraController from "@/components/CameraController";
import "@/materials/BlurImageMaterial";
import { useDisplayPreferences } from "@/context/DisplayPreferencesContext";
// import { DepthBlurShader } from "../../shaders/DepthBlurShader";
// import { SpotLightHelper, DirectionalLightHelper, Object3D, MeshStandardMaterial } from "three";
// import { DepthBlurPass } from "../DepthBlurPass";
// import ArtworkSpotlights from "../ArtworkSpotLights";

interface RandomPictureDreiViewProps {
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
}: {
  image: string;
  title: string;
  position: [number, number, number];
  onClick: () => void;
  selected: boolean;
}) => {
  const { resolution } = useDisplayPreferences();
  const texture = useTexture(
    {
      map: `/assets/images/${image}`,
      normalMap: "/assets/normalmaps/default.jpg",
    },
    (textures) => {
      // Configure textures after loading
      if (textures.map) {
        // This prevents the Y-flip that makes images appear upside down
        textures.map.flipY = true;
      }
      if (textures.normalMap) {
        textures.normalMap.flipY = true;
      }
    },
  );

  const meshRef = useRef<THREE.Group>(null);
  const [dimensions, setDimensions] = useState<[number, number] | null>(null);
  const [hovered, setHovered] = useState(false);
  const elapsedRef = useRef(0);
  const lastUpdateTimeRef = useRef(performance.now());

  // Handle gentle swaying animation when not selected
  // useFrame(() => {
  //   if (!meshRef.current || selected) return;

  //   const now = performance.now();
  //   const delta = (now - lastUpdateTimeRef.current) / 1000;
  //   lastUpdateTimeRef.current = now;

  //   elapsedRef.current += delta;
  //   const angle = Math.sin(elapsedRef.current * 1.5) * THREE.MathUtils.degToRad(5); // ±5°

  //   // Only animate the y-rotation, keeping the image upright
  //   meshRef.current.rotation.y = angle;
  //   meshRef.current.rotation.x = 0;
  //   meshRef.current.rotation.z = 0;
  // });

  // Update dimensions when texture loads
  useEffect(() => {
    if (texture.map?.image) {
      const { width, height } = texture.map.image;
      setDimensions([width, height]);
    }
  }, [texture]);

  const canvasDepth = 0.05;
  const baseWidth = 1.5;

  // Default geometry
  let geometryArgs: [number, number, number] = [1, 1, canvasDepth];

  // Calculate geometry based on image aspect ratio
  if (dimensions) {
    const [imgWidth, imgHeight] = dimensions;
    const aspectRatio = imgHeight / imgWidth;
    geometryArgs = [baseWidth, baseWidth * aspectRatio, canvasDepth];
  }

  return (
    <group ref={meshRef} position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <boxGeometry args={geometryArgs} />
        <meshStandardMaterial
          map={texture.map}
          normalMap={texture.normalMap}
          // uResolution={[window.innerWidth, window.innerHeight]}
          // uTime={0}
          // uLod={blur + 2.0}
        />
      </mesh>
      {selected && (
        <Text
          outlineColor="#000"
          outlineWidth={0.01}
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

// Replace the existing Floor component with this one:
const Floor = () => {
  // Optional: Load textures for enhanced realism
  const [floor, normal] = useTexture([
    "/assets/img/warehouse.jpg", // Add these textures to your public folder
    "/assets/normalmaps/default.jpg",
  ]);

  return (
    <>
      {/* Mirror surface */}
      <Reflector
        blur={[400, 100]} // Blur ground reflections (width, height), larger = more blur
        resolution={1024} // Off-buffer resolution, lower = faster blur
        args={[100, 100]} // Plane geometry arguments
        mirror={0.75} // Mirror environment, 0 = no mirror, 1 = perfect mirror
        mixBlur={12} // How much blur mixes with surface roughness
        mixStrength={1.5} // Strength of the reflections
        rotation={[-Math.PI / 2, 0, Math.PI / 2]} // Rotated to be horizontal
        position={[0, -2.8, 0]} // Slightly below the cubes
      >
        {(Material, props) => (
          <Material color="#a0a0a0" metalness={0.5} roughness={0.7} {...props} normalMap={normal} normalScale={[0.1, 0.1]} roughnessMap={floor} />
        )}
      </Reflector>

      {/* Decorative ring around the mirror */}
      {/*<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <ringGeometry args={[35, 50, 64]} />
        <meshStandardMaterial color="#444444" roughness={0.9} metalness={0.1} transparent opacity={0.7} />
      </mesh>*/}
    </>
  );
};

// Update the GalleryEnvironment component for better lighting with reflections
const GalleryEnvironment = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* Main lighting */}
      <ambientLight intensity={0.5} />

      {/* Key light */}
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      {/* Fill light */}
      <pointLight position={[-10, 8, -10]} intensity={0.5} />

      {/* Rim light */}
      <pointLight position={[0, -10, 0]} intensity={1.5} color="#666" />

      {/* Environment */}
      <Floor />
      {children}

      {/* Optional: Add fog for depth */}
      <fog attach="fog" args={["#000", 30, 100]} />
    </>
  );
};

export const RandomPictureDreiView = ({ images, loadRandomImages, setImages }: RandomPictureDreiViewProps) => {
  const galleryOverviewPos: [number, number, number] = [0, 0, 10]; // Position for gallery overview
  const initialCameraPos: [number, number, number] = [0, 0, 10]; // Initial camera position
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>(galleryOverviewPos);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [windowOffset, setWindowOffset] = useState(0);
  const windowSize = 9;
  const maxVisibleImages = 20;
  const cameraRef = useRef<any>();
  const { resolution, fullscreen } = useDisplayPreferences();

  const shiftWindow = () => {
    const nextOffset = windowOffset + windowSize;
    if (nextOffset + windowSize > images.length) {
      // Load more images if needed
      setImages((prev) => {
        const newImages = [...prev, ...loadRandomImages(windowSize)];
        return newImages;
      });
    }
    setWindowOffset(nextOffset);

    // Return to overview position after loading new images
    setSelectedIndex(null);
    setTargetPosition(galleryOverviewPos);
  };

  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        // pointerEvents: selectedIndex !== null ? "auto" : "none",
        background: "black",
      }}
      dpr={resolution === "high" ? window.devicePixelRatio : 1}
      shadows
      camera={{ position: [0, 0, 15], fov: 70 }}
      gl={{ antialias: resolution !== "low" }}
    >
      {/* Environment */}

      <GalleryEnvironment>
        <>
          {/* Fog for atmosphere */}
          {/*
	   {resolution === "low" ? <fog attach="fog" args={["#000", 20, 70]} /> : <fog attach="fog" args={["#000", 35, 150]} />}
	*/}

          {/* Main camera */}
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 10]} />

          {/* Environment HDRI for reflections      <Environment preset="warehouse" background={false} />
           */}

          <Environment preset="warehouse" background={false} />

          {/*<Environment
        // files="assets/img/warehouse.jpg"
        preset="warehouse"
        // ground={{
        //   height: 15, // Height of the camera that was used to create the env map (Default: 15)
        //   radius: 60, // Radius of the world. (Default 60)
        //   scale: 1000, // Scale of the backside projected sphere that holds the env texture (Default: 1000)
        // }}
        background={true}
      />*/}

          {images.slice(windowOffset, windowOffset + windowSize).map((img, i) => {
            // Calculate relative index based on windowOffset
            const relativeIndex = i;
            const displayIndex = windowOffset + relativeIndex;
            const z = -relativeIndex * 3; // Spacing based on relative position
            const x = ((relativeIndex % 3) - 1) * 4.5; // Wider spacing
            const y = Math.floor(relativeIndex / 3) * -3 + 2; // More vertical spacing with moderate height

            return (
              <ParallaxCube
                selected={selectedIndex === displayIndex}
                key={`${img.filename}-${displayIndex}`}
                image={img.filename}
                title={img.title}
                position={[x, y, z]}
                onClick={() => {
                  if (selectedIndex === displayIndex) {
                    // Zoom out to gallery overview position
                    setSelectedIndex(null);
                    setTargetPosition(galleryOverviewPos); // Return to gallery overview where all images are visible
                  } else {
                    // Zoom into selected cube
                    setSelectedIndex(displayIndex);
                    setTargetPosition([x, y, z + 5]); // Adjusted for the increased spacing
                  }
                }}
                // blur={selectedIndex === displayIndex ? 0.0 : 2.5}
              />
            );
          })}

          {/* Gallery floor markers */}
          {/*<Circle color="#444" position={[0, -6.95, 0]} rotation={[-Math.PI / 2, 0, 0]} size={18} />
      <Circle color="#333" position={[0, -6.94, 0]} rotation={[-Math.PI / 2, 0, 0]} size={12} />
      <Circle color="#222" position={[0, -6.93, 0]} rotation={[-Math.PI / 2, 0, 0]} size={6} />*/}

          {/* Subtle decorative elements */}
          {/*<Circle color="#333" position={[15, 2, -25]} rotation={[0, -Math.PI / 4, 0]} size={2} />
      <Circle color="#333" position={[-15, 2, -25]} rotation={[0, Math.PI / 4, 0]} size={2} />
      <Circle color="#333" position={[0, 5, -40]} rotation={[Math.PI / 2, 0, 0]} size={3} />
*/}
        </>
      </GalleryEnvironment>

      <CameraController cameraRef={cameraRef} targetPosition={targetPosition} />
      {selectedIndex !== null && <OrbitControls enableZoom enablePan={false} enableRotate target={targetPosition} />}
      {/* Navigation Button - only visible in overview mode (when no image is selected) */}
      {selectedIndex === null && (
        <Html position={[0, -3, 0]} center zIndexRange={[100, 0]}>
          <button
            style={{
              fontSize: "1.1em",
              fontFamily: "Didot, 'Times New Roman', serif",
              // fontWeight: "bold",
              letterSpacing: "2px",
              textTransform: "uppercase",
              background: "rgba(20, 20, 20, 0.8)",
              color: "red",
              // color: "#e0e0e0",
              border: "1px solid rgba(180, 170, 140, 0.1)",
              borderRadius: "2px",
              position: "fixed",
              bottom: "0px",
              left: "50%",
              // width: "7em",
              transform: "translateX(-50%)",
              padding: "12px 28px",
              cursor: "pointer",
              zIndex: 100,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              backdropFilter: "blur(5px)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(30, 30, 30, 0.9)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(20, 20, 20, 0.8)")}
            onClick={shiftWindow}
          >
            Go
            {/*Change*/}
            {/* Next Gallery Selection */}
            {/*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
              />
            </svg>*/}
          </button>
        </Html>
      )}

      {/*{selectedIndex === null && <DepthBlurPass focus={1.6} maxBlur={1.6} />}*/}

      {/*<DepthBlurPass focus={1} maxBlur={0.2} />*/}
    </Canvas>
  );
};
