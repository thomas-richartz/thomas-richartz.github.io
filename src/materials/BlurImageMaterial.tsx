import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

export const BlurImageMaterial = shaderMaterial(
  {
    uTexture: null,
    uResolution: new THREE.Vector2(),
    uTime: 0,
    uLod: 0, // blur amount
  },
  // Vertex Shader
  /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader with mip level LOD blur
  /* glsl */ `
    uniform sampler2D uTexture;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uLod;

    varying vec2 vUv;

    void main() {
      vec3 color = texture(uTexture, vUv, uLod).rgb;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ BlurImageMaterial });
