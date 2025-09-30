export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.7 },
    radius: { value: 0.75 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform float radius;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 centeredUv = vUv - 0.5;
      float dist = length(centeredUv);
      float vignette = smoothstep(radius, radius - 0.25, dist) * strength + (1.0 - strength);
      color.rgb *= vignette;
      gl_FragColor = color;
    }
  `
};
