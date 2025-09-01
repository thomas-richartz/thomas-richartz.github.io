import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ReactThreeFiber } from "@react-three/fiber";

// Define the shader material for a warehouse floor
const WarehouseFloorMaterial = shaderMaterial(
  {
    // Uniforms
    uTexture: { value: new THREE.Texture() },
    uNormalMap: { value: new THREE.Texture() },
    uRoughness: { value: 0.8 },
    uMetalness: { value: 0.1 },
    uBumpScale: { value: 0.2 },
    uBaseColor: { value: new THREE.Color("#222222") },
    uAccentColor: { value: new THREE.Color("#333333") },
    uHighlightColor: { value: new THREE.Color("#444444") },
    uTime: { value: 0 },
    uNoiseScale: { value: 4.0 },
    uNoiseStrength: { value: 0.2 },
    uGridScale: { value: 8.0 },
    uGridWidth: { value: 0.03 },
    uStainIntensity: { value: 0.4 },
    uWearIntensity: { value: 0.6 },
    uConcreteDetail: { value: 15.0 },
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);

      // Calculate view position for lighting
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader
  `
    uniform sampler2D uTexture;
    uniform sampler2D uNormalMap;
    uniform float uRoughness;
    uniform float uMetalness;
    uniform float uBumpScale;
    uniform vec3 uBaseColor;
    uniform vec3 uAccentColor;
    uniform vec3 uHighlightColor;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform float uGridScale;
    uniform float uGridWidth;
    uniform float uStainIntensity;
    uniform float uWearIntensity;
    uniform float uConcreteDetail;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Simplex noise function for organic texturing
    // Source: https://github.com/ashima/webgl-noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
            + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
            dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Function to create concrete texture with pores and small details
    float concreteTexture(vec2 uv) {
      float noise1 = snoise(uv * uConcreteDetail);
      float noise2 = snoise(uv * uConcreteDetail * 2.0 + 10.0);
      float noise3 = snoise(uv * uConcreteDetail * 4.0 + 20.0);

      // Combine different noise scales for a more natural look
      return noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    }

    // Function to create floor grid/tiles
    float grid(vec2 uv) {
      vec2 gridUv = fract(uv * uGridScale);
      float gridX = smoothstep(0.0, uGridWidth, gridUv.x) * smoothstep(1.0, 1.0 - uGridWidth, gridUv.x);
      float gridY = smoothstep(0.0, uGridWidth, gridUv.y) * smoothstep(1.0, 1.0 - uGridWidth, gridUv.y);
      return 1.0 - min(gridX, gridY);
    }

    // Function to create random stains and dirt
    float stains(vec2 uv) {
      float stain1 = smoothstep(0.4, 0.8, snoise(uv * 2.5 + 13.4));
      float stain2 = smoothstep(0.3, 0.7, snoise(uv * 3.7 - 8.9) * snoise(uv * 2.2 + 7.1));
      return mix(stain1, stain2, 0.5) * uStainIntensity;
    }

    // Function for wear patterns on the floor
    float wearPattern(vec2 uv) {
      // Create paths/trails where people might walk
      float centerDist = length(uv - vec2(0.5, 0.5)) * 2.0;
      float pathNoise = snoise(uv * 5.0) * 0.1;
      float path = smoothstep(0.8, 0.4, centerDist + pathNoise);

      // Add random worn spots
      float spots = smoothstep(0.75, 0.85, snoise(uv * 3.5 + 5.0));

      return mix(path, spots, 0.3) * uWearIntensity;
    }

    void main() {
      // Sample the normal map
      vec3 normal = normalize(vNormal);
      vec3 normalFromMap = texture2D(uNormalMap, vUv).rgb * 2.0 - 1.0;
      normalFromMap.xy *= uBumpScale;
      normalFromMap.z = sqrt(1.0 - dot(normalFromMap.xy, normalFromMap.xy));

      // Create basis vectors for normal mapping
      vec3 q0 = dFdx(vPosition);
      vec3 q1 = dFdy(vPosition);
      vec2 st0 = dFdx(vUv);
      vec2 st1 = dFdy(vUv);
      vec3 S = normalize(q0 * st1.t - q1 * st0.t);
      vec3 T = normalize(-q0 * st1.s + q1 * st0.s);
      vec3 N = normalize(normal);
      vec3 B = normalize(cross(N, T));
      mat3 TBN = mat3(T, B, N);
      vec3 finalNormal = normalize(TBN * normalFromMap);

      // Generate noise and patterns
      float baseNoise = snoise(vUv * uNoiseScale + uTime * 0.01);
      float detailNoise = concreteTexture(vUv);
      float gridPattern = grid(vUv);
      float stainPattern = stains(vUv + baseNoise * 0.1);
      float wearFactor = wearPattern(vUv);

      // Combine patterns for the final color
      vec3 concreteColor = mix(uBaseColor, uAccentColor, detailNoise * 0.5);
      concreteColor = mix(concreteColor, uHighlightColor * 0.8, gridPattern * 0.4);
      concreteColor = mix(concreteColor, vec3(0.1, 0.09, 0.08), stainPattern);
      concreteColor = mix(concreteColor, vec3(0.35, 0.33, 0.30), wearFactor);

      // Sample texture if provided
      vec4 textureSample = texture2D(uTexture, vUv);
      if (textureSample.a > 0.0) {
        concreteColor = mix(concreteColor, textureSample.rgb, textureSample.a);
      }

      // Basic lighting
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(finalNormal, lightDir), 0.0);
      vec3 ambient = concreteColor * 0.3;
      vec3 diffuse = concreteColor * diff * 0.7;

      // Output final color
      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `,
);

// Extend the material for use in THREE.js
extend({ WarehouseFloorMaterial });

// Add types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      warehouseFloorMaterial: ReactThreeFiber.Object3DNode<typeof WarehouseFloorMaterial, typeof WarehouseFloorMaterial>;
    }
  }
}

export default WarehouseFloorMaterial;
