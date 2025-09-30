export const DepthBlurShader = {
  uniforms: {
    tDiffuse: { value: null }, // The rendered color texture
    tDepth: { value: null }, // The depth texture
    focus: { value: 10.0 }, // Focus distance
    maxBlur: { value: 0.02 }, // Maximum blur radius
    cameraNear: { value: 1.0 },
    cameraFar: { value: 100.0 },
    resolution: { value: [1, 1] },
    vignetteRadius: { value: 0.75 },
    vignetteStrength: { value: 0.5 },
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
	uniform sampler2D tDepth;
	uniform float focus;
	uniform float maxBlur;
	uniform float cameraNear;
	uniform float cameraFar;
	uniform vec2 resolution;
	uniform float vignetteRadius;
  uniform float vignetteStrength;


	float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
		return ( near * far ) / ( ( far - near ) * invClipZ - far );
	}

	float getDepth(const in vec2 screenPosition) {
		float z = texture2D(tDepth, screenPosition).x;
		float viewZ = perspectiveDepthToViewZ(z, cameraNear, cameraFar);
		return viewZ;
	}

	void main() {
		float depth = getDepth(vUv);
		// Output depth as grayscale
    // gl_FragColor = vec4(vec3((depth - cameraNear) / (cameraFar - cameraNear)), 1.0);
    float blur = clamp(abs(depth - focus) * maxBlur, 0.0, maxBlur);

		vec4 color = vec4(0.0);
		float total = 0.0;
		// Simple blur: 9 samples in a square
		for (int x = -1; x <= 1; x++) {
			for (int y = -1; y <= 1; y++) {
				vec2 offset = vec2(float(x), float(y)) * blur / resolution;
				color += texture2D(tDiffuse, vUv + offset);
				total += 1.0;
			}
		}

		// color /= total;

		// Vignette
		// if (true) {
		// 	vec2 centeredUv = vUv - 0.5;
		// 	float dist = length(centeredUv);
		// 	float vignette = smoothstep(vignetteRadius, vignetteRadius - 0.25, dist) * vignetteStrength + (1.0 - vignetteStrength);
		// 	color.rgb *= vignette;
		// }

    // Vignette
    vec2 centeredUv = vUv - 0.5;
    float dist = length(centeredUv);
    float vignette = smoothstep(vignetteRadius, vignetteRadius - 0.25, dist) * vignetteStrength + (1.0 - vignetteStrength);
    color.rgb *= vignette;

    // Output final color
    gl_FragColor = color;

  		// Output depth as grayscale
      gl_FragColor = vec4(vec3((depth - cameraNear) / (cameraFar - cameraNear)), 1.0);



		// gl_FragColor = color / total;
		// gl_FragColor = texture2D(tDiffuse, vUv);

		// gl_FragColor = color;

		// gamma test
		// gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));

	}
	`,
};
