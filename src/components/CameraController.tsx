import { useFrame } from "@react-three/fiber";

const CameraController = ({
  cameraRef,
  targetPosition,
}: {
  cameraRef: React.MutableRefObject<any>;
  targetPosition: [number, number, number] | null;
}) => {
  useFrame(() => {
    if (cameraRef.current && targetPosition) {
      const cam = cameraRef.current;
      cam.position.lerp(
        { x: targetPosition[0], y: targetPosition[1], z: targetPosition[2] },
        0.05,
      );
      cam.lookAt(targetPosition[0], targetPosition[1], targetPosition[2] - 5);
    }
  });
  return null;
};

export default CameraController;
