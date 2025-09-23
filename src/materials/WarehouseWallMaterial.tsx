import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ReactThreeFiber } from "@react-three/fiber";

// Define the shader material for warehouse walls
const WarehouseWallMaterial = shaderMaterial(
  {
    // Uniforms
    uTexture: new THREE.Texture(),
    uNormalMap: new THREE.Texture(),
    uRoughness: 0.9,
    uMetalness: 0.05,
    uBumpScale: 0.2,
    uColor: new THREE.Color("#333333"),
    uSecondaryColor: new THREE.Color("#222222"),
    uTime: 0,
    uNoiseScale: 10.0,
    uNoiseStrength: 0.1,
    uDirtiness: 0.3,
    uWornEdges: 0.4,
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
    uniform vec3 uColor;
    uniform vec3 uSecondaryColor;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform float uDirtiness;
    uniform float uWornEdges;

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

    // Function for creating cracks
    float crack(vec2 uv, float seed) {
      float noise1 = snoise((uv + seed) * uNoiseScale);
      float noise2 = snoise((uv * 2.5 + seed + 10.0) * uNoiseScale);
      float crack = smoothstep(0.7, 0.9, noise1 * noise2);
      return crack;
    }

    // Function for creating a dusty, worn look
    float dust(vec2 uv) {
      float noise = snoise(uv * 30.0);
      float smallNoise = snoise(uv * 100.0);
      return mix(noise, smallNoise, 0.3) * uDirtiness;
    }

    // Edge wear effect
    float edgeWear(vec2 uv) {
      // Make edges more worn
      float edgeX = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.95, uv.x);
      float edgeY = smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
      return edgeX * edgeY;
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

      // Generate noise for texture variation
      float mainNoise = snoise(vUv * uNoiseScale + uTime * 0.05);
      float detailNoise = snoise(vUv * uNoiseScale * 4.0 + mainNoise);
      float combinedNoise = mix(mainNoise, detailNoise, 0.3) * uNoiseStrength;

      // Generate cracks
      float crackPattern = crack(vUv, 0.0) * crack(vUv * 2.0, 10.0);

      // Calculate dustiness
      float dustFactor = dust(vUv);

      // Edge wear
      float wearFactor = edgeWear(vUv) * uWornEdges;

      // Combine all effects
      vec3 baseColor = mix(uColor, uSecondaryColor, combinedNoise);
      baseColor = mix(baseColor, vec3(0.2, 0.2, 0.2), crackPattern * 0.5);
      baseColor = mix(baseColor, vec3(0.5, 0.48, 0.45), dustFactor);
      baseColor = mix(baseColor, vec3(0.7, 0.68, 0.65), 1.0 - wearFactor);

      // Sample texture if provided
      vec4 textureSample = texture2D(uTexture, vUv);
      if (textureSample.a > 0.0) {
        baseColor = mix(baseColor, textureSample.rgb, textureSample.a);
      }

      // Basic lighting
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(finalNormal, lightDir), 0.0);
      vec3 ambient = baseColor * 0.3;
      vec3 diffuse = baseColor * diff * 0.7;

      // Output final color
      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `,
);

// Extend the material for use in THREE.js
extend({ WarehouseWallMaterial });

// Add types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      warehouseWallMaterial: ReactThreeFiber.Object3DNode<typeof WarehouseWallMaterial, typeof WarehouseWallMaterial>;
    }
  }
}

export default WarehouseWallMaterial;
