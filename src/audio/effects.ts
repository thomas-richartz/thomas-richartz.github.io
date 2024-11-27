export function createReverb(audioContext: AudioContext): ConvolverNode {
  const convolver = audioContext.createConvolver();

  const length = audioContext.sampleRate * 3; // 3-second reverb
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      // Exponentially decaying noise for impulse response
      channelData[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
  }

  convolver.buffer = impulse;
  return convolver;
}
