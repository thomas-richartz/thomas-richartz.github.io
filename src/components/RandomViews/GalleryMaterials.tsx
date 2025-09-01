import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Simplified concrete material for walls and floors
const ConcreteMaterial = shaderMaterial(
  {
    uColor: { value: new THREE.Color('#333333') },
    uSecondaryColor: { value: new THREE.Color('#222222') },
    uTime: { value: 0 },
    uNoiseScale: { value: 10.0 },
    uNoiseStrength: { value: 0.2 },
    uRoughness: { value: 0.8 },
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 uColor;
    uniform vec3 uSecondaryColor;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform float uRoughness;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Simplex noise function
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

    void main() {
      // Generate noise
      float noise = snoise(vUv * uNoiseScale + uTime * 0.05) * uNoiseStrength;

      // Create the base color with noise variation
      vec3 baseColor = mix(uColor, uSecondaryColor, noise);

      // Simple lighting
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = baseColor * diff;
      vec3 ambient = baseColor * 0.3;

      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `
);

// Concrete wall material (darker)
const WallMaterial = shaderMaterial(
  {
    uColor: { value: new THREE.Color('#1a1a1a') },
    uSecondaryColor: { value: new THREE.Color('#141414') },
    uTime: { value: 0 },
    uNoiseScale: { value: 8.0 },
    uNoiseStrength: { value: 0.15 },
    uDirtiness: { value: 0.3 },
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 uColor;
    uniform vec3 uSecondaryColor;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    uniform float uDirtiness;

    varying vec2 vUv;
    varying vec3 vNormal;

    // Simplex noise function
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

    void main() {
      // Generate noise pattern
      float noise = snoise(vUv * uNoiseScale + uTime * 0.01) * uNoiseStrength;
      float detailNoise = snoise(vUv * uNoiseScale * 4.0 + 10.0) * uNoiseStrength * 0.5;

      // Create dirt pattern
      float dirt = snoise(vUv * 20.0) * uDirtiness;

      // Create the base color with noise variation
      vec3 baseColor = mix(uColor, uSecondaryColor, noise);
      baseColor = mix(baseColor, vec3(0.1, 0.09, 0.08), dirt);

      // Edge darkening
      float edgeX = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
      float edgeY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
      float edge = edgeX * edgeY;
      baseColor = mix(baseColor * 0.7, baseColor, edge);

      // Simple lighting
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = baseColor * diff;
      vec3 ambient = baseColor * 0.3;

      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `
);

// Floor material with grid
const FloorMaterial = shaderMaterial(
  {
    uColor: { value: new THREE.Color('#111111') },
    uSecondaryColor: { value: new THREE.Color('#222222') },
    uGridColor: { value: new THREE.Color('#333333') },
    uTime: { value: 0 },
    uNoiseScale: { value: 4.0 },
    uGridScale: { value: 8.0 },
    uGridWidth: { value: 0.02 },
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform vec3 uColor;
    uniform vec3 uSecondaryColor;
    uniform vec3 uGridColor;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uGridScale;
    uniform float uGridWidth;

    varying vec2 vUv;
    varying vec3 vNormal;

    // Simplex noise function
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

    // Function to create floor grid
    float grid(vec2 uv) {
      vec2 gridUv = fract(uv * uGridScale);
      float gridX = smoothstep(0.0, uGridWidth, gridUv.x) * smoothstep(1.0, 1.0 - uGridWidth, gridUv.x);
      float gridY = smoothstep(0.0, uGridWidth, gridUv.y) * smoothstep(1.0, 1.0 - uGridWidth, gridUv.y);
      return 1.0 - min(gridX, gridY);
    }

    void main() {
      // Generate noise pattern
      float noise = snoise(vUv * uNoiseScale + uTime * 0.01);

      // Generate grid pattern
      float gridPattern = grid(vUv);

      // Combine patterns for the final color
      vec3 baseColor = mix(uColor, uSecondaryColor, noise * 0.3);
      baseColor = mix(baseColor, uGridColor, gridPattern * 0.4);

      // Add some wear at edges
      float edgeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
      float edgeY = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
      float edge = edgeX * edgeY;
      baseColor = mix(baseColor * 0.8, baseColor, edge);

      // Simple lighting
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      vec3 diffuse = baseColor * diff;
      vec3 ambient = baseColor * 0.3;

      gl_FragColor = vec4(ambient + diffuse, 1.0);
    }
  `
);

// Extend the materials for use in THREE.js
extend({ ConcreteMaterial, WallMaterial, FloorMaterial });

// Add types for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      concreteMaterial: any;
      wallMaterial: any;
      floorMaterial: any;
    }
  }
}

export { ConcreteMaterial, WallMaterial, FloorMaterial };
