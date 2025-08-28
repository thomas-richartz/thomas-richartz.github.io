/**
 * Audio Debug Utility
 * Provides debugging tools for Tone.js and Web Audio API
 */

/**
 * Logs the current state of the Web Audio API and Tone.js
 * Helps identify issues with audio playback and connections
 */
export const logAudioState = async () => {
  try {
    // Dynamically import Tone.js to avoid errors
    const Tone = await import("tone");

    console.group("Audio Debug Information");
    console.log("Tone.js Version:", Tone.version || "Unknown");
    console.log("Audio Context State:", Tone.context.state || "Unknown");
    console.log("Sample Rate:", Tone.context.sampleRate || "Unknown");
    console.log("Base Latency:", Tone.context.baseLatency || "Not available");
    console.log("Current Time:", Tone.context.currentTime.toFixed(2));
    console.log("Transport State:", Tone.Transport.state || "Unknown");
    console.log("Transport Position:", Tone.Transport.position || "Unknown");
    console.log("BPM:", Tone.Transport.bpm.value);
    console.log("Destination Volume:", Tone.getDestination().volume.value);
    console.log("Scheduled Events:", (Tone.Transport.scheduled || []).length || 0);
    console.groupEnd();

    return {
      contextState: Tone.context.state,
      transportState: Tone.Transport.state || "unknown",
      currentTime: Tone.context.currentTime,
      outputLevel: Tone.getDestination().volume.value,
    };
  } catch (error) {
    console.error("Audio Debug Error:", error);
    return { error: String(error) };
  }
};

/**
 * Tests if audio can be played through Tone.js
 * @returns Promise resolving to true if successful, false otherwise
 */
export const testAudioPlayback = async (): Promise<boolean> => {
  try {
    const Tone = await import("tone");

    // Ensure context is running
    if (Tone.context.state !== "running") {
      await Tone.start();
    }

    // Create a simple oscillator to test playback
    const oscillator = new (Tone as any).Oscillator({
      frequency: 440,
      volume: -20,
      type: "sine",
    }).toDestination();

    // Play a brief sound
    oscillator.start();

    // Stop after 200ms
    return new Promise((resolve) => {
      setTimeout(() => {
        oscillator.stop();
        oscillator.dispose();
        console.log("Audio test completed successfully");
        resolve(true);
      }, 200);
    });
  } catch (error) {
    console.error("Audio test failed:", error);
    return false;
  }
};

/**
 * Fixes common audio issues by resetting the audio context
 */
export const resetAudioContext = async (): Promise<void> => {
  try {
    const Tone = await import("tone");

    console.log("Resetting audio context...");

    // Cancel all scheduled events
    Tone.Transport.cancel(0);
    Tone.Transport.stop();

    // Close the current context
    if (typeof Tone.context.close === "function") {
      await Tone.context.close();
    }

    // Create a new context
    // Create a new context if Context constructor is available
    Tone.context = new (Tone as any).Context();

    // Start the new context
    await Tone.start();

    console.log("Audio context reset successfully. New state:", Tone.context.state);
  } catch (error) {
    console.error("Failed to reset audio context:", error);
  }
};

/**
 * Checks if audio files can be loaded
 * @param url URL of an audio file to test
 * @returns Promise resolving to true if successful, false otherwise
 */
export const testAudioLoading = async (url: string): Promise<boolean> => {
  try {
    const Tone = await import("tone");

    console.log(`Testing audio loading for: ${url}`);

    return new Promise((resolve) => {
      const player = new Tone.Player({
        url,
        onload: () => {
          console.log("Audio file loaded successfully");
          player.dispose();
          resolve(true);
        },
        onerror: (error) => {
          console.error("Failed to load audio file:", error);
          resolve(false);
        },
      });
    });
  } catch (error) {
    console.error("Audio loading test failed:", error);
    return false;
  }
};

export default {
  logAudioState,
  testAudioPlayback,
  resetAudioContext,
  testAudioLoading,
};
