import * as Tone from "tone";
import { FileSoundBlock } from "./ToneMusicScene";
import { Screen } from "@/enums";

/**
 * Interface for a one-shot sound to be played when entering a scene
 */
interface OneShotSound {
  file: string;
  volume: number;
  delay?: number;
  triggerOnce?: boolean;
}

/**
 * Interface for a child scene within a parent scene
 */
interface ChildScene {
  blocksFiles: string[];
  description?: string;
  oneShots?: OneShotSound[];
  fadeDuration?: number;
  selectionStrategy?: "random" | "sequential" | "first";
  defaultPlaying?: boolean;
  preservePlaybackState?: boolean;
}

/**
 * Interface for a top-level scene
 */
interface Scene extends ChildScene {
  name?: string;
  children?: Record<string, ChildScene>;
  preservePlaybackState?: boolean;
}

/**
 * Interface for global settings
 */
interface GlobalSettings {
  defaultFadeDuration: number;
  volumeAdjustment: number;
  enableReverb: boolean;
  enableDelay: boolean;
  audioLoadStrategy: "preload" | "lazy";
  preservePlaybackOnNavigation?: boolean;
  soundEffects?: Record<string, { file: string; volume: number }>;
}

/**
 * Interface for the entire scenes configuration
 */
interface ScenesConfig {
  version: string;
  scenes: Record<string, Scene>;
  global: GlobalSettings;
  preloadScenes?: string[];
}

/**
 * SceneManager handles loading and transitioning between audio scenes
 * based on application screens and categories.
 */
export class SceneManager {
  // Static instance for singleton pattern
  private static instance: SceneManager | null = null;

  private scenesConfig: ScenesConfig | null = null;
  private currentScene: Scene | ChildScene | null = null;
  private loadedBlocks: Map<string, FileSoundBlock[]> = new Map();
  private triggeredOneShots: Set<string> = new Set();
  private oneShotPlayers: Map<string, Tone.Player> = new Map();
  private verbose: boolean = false;
  private isLoaded: boolean = false;
  private currentScreenEnum: Screen | null = null;
  private onSceneLoadCallback: ((blocks: FileSoundBlock[], preservePlayback?: boolean, defaultPlaying?: boolean, fadeDuration?: number) => void) | null = null;
  private onLoadingChangeCallback: ((isLoading: boolean) => void) | null = null;
  private currentIsPlaying: boolean = false;
  private activeTransportEvents: number[] = [];
  private _loadingFiles: Set<string> = new Set(); // Track files currently being loaded
  private _isNavigating: boolean = false; // Track if navigation is in progress
  private _navigationStartTime: number = 0; // Track when navigation started
  private _navigationTimeout: number | null = null; // Timeout to force unlock navigation

  /**
   * Creates a new SceneManager
   * @param verbose Whether to log verbose information
   */
  constructor(verbose: boolean = false) {
    // Singleton pattern - return existing instance if available
    if (SceneManager.instance) {
      console.log("[SceneManager] Returning existing instance (singleton)");
      return SceneManager.instance;
    }

    this.verbose = verbose;
    console.log("[SceneManager] Initialized with verbose mode:", verbose);

    // Store the instance
    SceneManager.instance = this;
  }

  /**
   * Loads the scenes configuration from a JSON file
   * @param configUrl URL to the scenes.json file
   */
  public async loadConfig(configUrl: string = "assets/soundblocks/scenes.json"): Promise<void> {
    // Skip reloading if we already have config loaded
    if (this.scenesConfig) {
      console.log(`[SceneManager] Config already loaded, skipping duplicate load from ${configUrl}`);
      return;
    }

    if (this.verbose) console.log(`[SceneManager] Loading scenes config from ${configUrl}`);

    try {
      // Try both with and without leading slash
      let response;
      try {
        response = await fetch(configUrl);
        if (!response.ok && !configUrl.startsWith("/")) {
          // Try with leading slash
          const altUrl = "/" + configUrl;
          console.log(`[SceneManager] Retrying with alternate path: ${altUrl}`);
          response = await fetch(altUrl);
        }
      } catch (fetchError) {
        // If that fails, try with leading slash
        if (!configUrl.startsWith("/")) {
          const altUrl = "/" + configUrl;
          console.log(`[SceneManager] Fetch failed, trying alternate path: ${altUrl}`);
          response = await fetch(altUrl);
        } else {
          throw fetchError;
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch scenes config: ${response.status}`);
      }

      const configData = await response.json();
      this.scenesConfig = configData;

      console.log(`[SceneManager] Loaded scenes config:`, {
        version: this.scenesConfig?.version,
        sceneCount: Object.keys(this.scenesConfig?.scenes || {}).length,
        sceneKeys: Object.keys(this.scenesConfig?.scenes || {}),
      });

      // Ensure Tone.js is ready
      try {
        if (Tone.context.state !== "running") {
          // Don't await here to avoid blocking if user interaction is needed
          Tone.start().catch((err) => console.warn("[SceneManager] Tone.js couldn't start yet:", err));
        }
      } catch (error) {
        console.warn("[SceneManager] Error initializing Tone.js:", error);
      }

      // Preload scenes if configured
      if (this.scenesConfig?.preloadScenes && this.scenesConfig.preloadScenes.length > 0) {
        await this.preloadScenes(this.scenesConfig.preloadScenes);
      }

      this.isLoaded = true;
    } catch (error) {
      console.error("[SceneManager] Failed to load scenes config:", error);
      throw error;
    }
  }

  /**
   * Sets a callback to be called when a scene is loaded
   * @param callback The callback function
   */
  public setOnSceneLoadCallback(
    callback: (blocks: FileSoundBlock[], preservePlayback?: boolean, defaultPlaying?: boolean, fadeDuration?: number) => void,
  ): void {
    this.onSceneLoadCallback = callback;
  }

  /**
   * Updates the current playback state
   * @param isPlaying Whether audio is currently playing
   */
  public updatePlaybackState(isPlaying: boolean): void {
    this.currentIsPlaying = isPlaying;
    if (this.verbose) console.log(`[SceneManager] Updated playback state: ${isPlaying}`);
  }

  /**
   * Sets a callback to be called when loading state changes
   * @param callback The callback function
   */
  public setOnLoadingChangeCallback(callback: (isLoading: boolean) => void): void {
    this.onLoadingChangeCallback = callback;
  }

  /**
   * Preloads scenes for faster switching
   * @param sceneNames Names of scenes to preload
   */
  private async preloadScenes(sceneNames: string[]): Promise<void> {
    if (!this.scenesConfig) return;

    for (const sceneName of sceneNames) {
      try {
        const scene = this.getSceneByName(sceneName);
        if (scene && scene.blocksFiles.length > 0) {
          const blocksFile = this.selectBlocksFile(scene.blocksFiles, scene.selectionStrategy);
          if (blocksFile) {
            await this.loadBlocksFromFile(blocksFile);
            if (this.verbose) console.log(`[SceneManager] Preloaded scene: ${sceneName}`);
          }
        }
      } catch (error) {
        console.warn(`[SceneManager] Failed to preload scene ${sceneName}:`, error);
      }
    }
  }

  /**
   * Selects a blocks file from the available options using the specified strategy
   * @param blocksFiles Array of available blocks files
   * @param strategy Selection strategy (random, sequential, first)
   * @returns Selected blocks file URL
   */
  private selectBlocksFile(blocksFiles: string[], strategy: string = "first"): string | null {
    if (!blocksFiles || blocksFiles.length === 0) {
      return null;
    }

    switch (strategy) {
      case "random":
        const randomIndex = Math.floor(Math.random() * blocksFiles.length);
        return blocksFiles[randomIndex];
      case "sequential":
        // Simple implementation of sequential - in a full implementation,
        // you would track the last index used for each scene
        return blocksFiles[0];
      case "first":
      default:
        return blocksFiles[0];
    }
  }

  /**
   * Loads blocks from a file, with caching
   * @param url URL of the blocks file
   * @returns Array of loaded blocks
   */
  private async loadBlocksFromFile(url: string): Promise<FileSoundBlock[]> {
    // Check if we already have these blocks cached
    if (this.loadedBlocks.has(url)) {
      if (this.verbose) console.log(`[SceneManager] Using cached blocks for ${url}`);
      return this.loadedBlocks.get(url)!;
    }

    if (this.verbose) console.log(`[SceneManager] Loading blocks from ${url}`);

    try {
      // Try both with and without leading slash
      let response;
      try {
        response = await fetch(url);
        if (!response.ok && !url.startsWith("/")) {
          // Try with leading slash
          const altUrl = "/" + url;
          response = await fetch(altUrl);
        }
      } catch (fetchError) {
        // If that fails, try with leading slash
        if (!url.startsWith("/")) {
          const altUrl = "/" + url;
          response = await fetch(altUrl);
        } else {
          throw fetchError;
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch blocks file: ${response.status}`);
      }

      const blocksData = await response.json();
      this.loadedBlocks.set(url, blocksData);

      if (this.verbose) console.log(`[SceneManager] Loaded ${blocksData.length} blocks from ${url}`);
      return blocksData;
    } catch (error) {
      console.error(`[SceneManager] Error loading blocks from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Gets a scene configuration by name
   * @param name Name of the scene to find
   * @returns Scene configuration or null if not found
   */
  public getSceneByName(name: string): Scene | null {
    if (!this.scenesConfig) return null;

    // First, try exact match on the scene key
    if (this.scenesConfig.scenes[name]) {
      return this.scenesConfig.scenes[name];
    }

    // Next, try to match by name field
    for (const [key, scene] of Object.entries(this.scenesConfig.scenes)) {
      if (scene.name === name) {
        return scene;
      }
    }

    // Finally, try case-insensitive match
    const nameLower = name.toLowerCase();
    for (const [key, scene] of Object.entries(this.scenesConfig.scenes)) {
      if (key.toLowerCase() === nameLower || (scene.name && scene.name.toLowerCase() === nameLower)) {
        return scene;
      }
    }

    return null;
  }

  /**
   * Handles navigation to a new scene
   * @param screen Screen or scene name
   * @param category Optional category within the scene
   * @param forceReload Whether to force reload even if the scene hasn't changed
   */
  public async handleNavigation(screen: Screen | string, category?: string, forceReload: boolean = false, currentlyPlaying?: boolean): Promise<void> {
    // Make sure we're using the singleton instance
    if (SceneManager.instance !== this) {
      console.warn("[SceneManager] Navigation called on non-current instance, redirecting to singleton");
      if (SceneManager.instance) {
        // Always pass true for currentlyPlaying to ensure smooth transitions
        return SceneManager.instance.handleNavigation(screen, category, forceReload, true);
      }
    }

    // If already navigating, don't block subsequent navigation requests for too long
    // Allow the new navigation if previous one has been stuck for more than 3 seconds
    if (this._isNavigating) {
      const navigationStartTime = this._navigationStartTime || Date.now();
      const timeInNavigation = Date.now() - navigationStartTime;

      if (timeInNavigation < 3000) {
        // 3 seconds max wait time
        console.warn(`[SceneManager] Navigation to ${screen} ignored - navigation already in progress for ${timeInNavigation}ms`);
        return;
      } else {
        console.warn(`[SceneManager] Force proceeding with navigation to ${screen} - previous navigation stuck for ${timeInNavigation}ms`);
      }
    }

    // Set navigating flag to prevent concurrent navigations
    this._isNavigating = true;
    this._navigationStartTime = Date.now();

    // Stop all previous one-shot sounds and clean up transport events
    // but maintain the main audio playback
    this.stopAllOneShots();
    this.clearTransportEvents();

    console.log(`[SceneManager] Navigation to ${screen} with current playback: ${currentlyPlaying}`);

    // Always set currentIsPlaying to true during navigation to ensure audio preservation
    // This ensures continuous playback between scenes
    this.currentIsPlaying = true;
    console.log(`[SceneManager] Forcing internal playback state to: ${this.currentIsPlaying} for smooth transitions`);

    if (this.onLoadingChangeCallback) this.onLoadingChangeCallback(true);

    try {
      // Handle string scene names directly
      if (typeof screen === "string") {
        console.log(`[SceneManager] Navigation request by name: Screen=${screen}, Category=${category || "none"}`);
        const sceneConfig = this.getSceneByName(screen);
        if (sceneConfig) {
          await this.processScene(sceneConfig, category, forceReload);
        } else {
          console.error(`[SceneManager] Cannot navigate: no scene found with name "${screen}"`);
        }
      } else {
        // For enum-based navigation
        console.log(`[SceneManager] Navigation request: Screen=${Screen[screen]}, Category=${category || "none"}`);
        this.currentScreenEnum = screen;

        const sceneConfig = this.getSceneByName(Screen[screen]);
        if (sceneConfig) {
          await this.processScene(sceneConfig, category, forceReload);
        } else {
          console.error(`[SceneManager] Cannot navigate: no scene found for Screen.${Screen[screen]}`);
        }
      }
    } catch (error) {
      console.error(`[SceneManager] Error handling navigation:`, error);
    } finally {
      if (this.onLoadingChangeCallback) this.onLoadingChangeCallback(false);

      // Clear any existing navigation timeout
      if (this._navigationTimeout) {
        clearTimeout(this._navigationTimeout);
        this._navigationTimeout = null;
      }

      // Always reset the navigating flag when done
      this._isNavigating = false;
      this._navigationStartTime = 0;

      // Set a failsafe timeout to unlock navigation in case something goes wrong
      this._navigationTimeout = window.setTimeout(() => {
        if (this._isNavigating) {
          console.warn("[SceneManager] Forcing navigation unlock after timeout");
          this._isNavigating = false;
          this._navigationStartTime = 0;
          this._navigationTimeout = null;
        }
      }, 5000); // 5 second failsafe
    }
  }

  /**
   * Process a scene after navigation
   * @param sceneConfig The scene configuration
   * @param category Optional category
   * @param forceReload Whether to force reload
   */
  private async processScene(sceneConfig: Scene | ChildScene, category?: string, forceReload: boolean = false): Promise<void> {
    // Store the current scene
    this.currentScene = sceneConfig;

    // Make sure Tone.js context is running
    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
        console.log("[SceneManager] Started Tone.js context");
      }
    } catch (error) {
      console.warn("[SceneManager] Error starting Tone.js context:", error);
    }

    try {
      // If category is provided and scene has children, look for matching child scene
      let effectiveScene = sceneConfig;
      if (category && (sceneConfig as Scene).children && (sceneConfig as Scene).children![category]) {
        effectiveScene = (sceneConfig as Scene).children![category];
        if (this.verbose) console.log(`[SceneManager] Using child scene for category: ${category}`);
      }

      console.log(`[SceneManager] Processing scene:`, {
        blocksFilesCount: effectiveScene.blocksFiles.length,
        hasOneShots: !!effectiveScene.oneShots,
        selectionStrategy: effectiveScene.selectionStrategy || "first",
        preservePlaybackState: effectiveScene.preservePlaybackState,
        globalPreservePlayback: this.scenesConfig?.global.preservePlaybackOnNavigation,
      });

      // Select blocks file
      const blocksFile = this.selectBlocksFile(effectiveScene.blocksFiles, effectiveScene.selectionStrategy);

      if (!blocksFile) {
        console.warn(`[SceneManager] No blocks file found for scene, category: ${category || "none"}`);
        return;
      }

      console.log(`[SceneManager] Selected blocks file: ${blocksFile}`);

      // Load the blocks - store a local copy to prevent race conditions
      const blocks = await this.loadBlocksFromFile(blocksFile);

      // Safety check - make sure blocks were loaded
      if (!blocks || blocks.length === 0) {
        console.warn(`[SceneManager] No blocks loaded from ${blocksFile}`);
        return;
      }

      // Make a deep copy to prevent race conditions
      const blocksCopy = JSON.parse(JSON.stringify(blocks));

      // Notify the callback about the new blocks - don't notify if the callback isn't set
      // to avoid triggering unnecessary scene changes in other components
      if (this.onSceneLoadCallback) {
        // Always preserve playback during navigation regardless of scene configuration
        // This ensures continuous audio between scenes
        const scenePreservePlayback = effectiveScene.preservePlaybackState === true;
        const globalPreservePlayback = this.scenesConfig?.global.preservePlaybackOnNavigation === true;
        // Always use true for preservePlayback to enable smooth transitions
        const preservePlayback = true;

        console.log(
          `[SceneManager] Calling onSceneLoadCallback with ${blocksCopy.length} blocks, preservePlayback: true, currentIsPlaying: ${this.currentIsPlaying}`,
        );
        console.log(
          `[SceneManager] Always preserving playback for smooth transitions (ignoring scene=${scenePreservePlayback}, global=${globalPreservePlayback})`,
        );

        // Execute immediately instead of using setTimeout to prevent race conditions
        const defaultPlaying = (effectiveScene as any).defaultPlaying === true;
        const fadeDuration = (effectiveScene as any).fadeDuration ?? this.scenesConfig?.global.defaultFadeDuration ?? 1.5;

        // Log the specific blocks that will be played before the callback
        console.log(`[SceneManager] Playing blocks for scene: ${(effectiveScene as Scene).name || "unnamed"}, file: ${blocksFile}`);

        // Always pass true for preservePlayback to ensure smooth transitions between all scenes
        // This prevents audio from stopping during navigation
        // Pass the deep copy to prevent race conditions
        this.onSceneLoadCallback!(blocksCopy, true, defaultPlaying, fadeDuration);
      } else {
        console.warn(`[SceneManager] No onSceneLoadCallback registered to receive blocks`);
      }

      // Play one-shot sounds if present - do this before the callbacks
      // so one-shots play even if scene changes take time
      if (effectiveScene.oneShots && effectiveScene.oneShots.length > 0) {
        // Use a small timeout to ensure Transport is initialized properly
        setTimeout(() => {
          if (effectiveScene.oneShots) {
            this.playOneShots(effectiveScene.oneShots, category);
          }
        }, 100);
      }

      if (this.verbose) {
        const sceneName = (sceneConfig as Scene).name ? (sceneConfig as Scene).name : "unnamed scene";
        console.log(`[SceneManager] Handled navigation to ${sceneName}${category ? ` (${category})` : ""} with ${blocks.length} blocks`);
      }
    } catch (error) {
      console.error(`[SceneManager] Error processing scene:`, error);
      throw error;
    }
  }

  /**
   * Plays one-shot sounds associated with a scene
   * @param oneShots Array of one-shot sounds to play
   * @param context Optional context string (e.g. category)
   */
  private playOneShots(oneShots: OneShotSound[], context?: string): void {
    // Get the current time as a reference point
    const now = Tone.now();

    oneShots.forEach((oneShot) => {
      // Skip if this is a triggerOnce sound that's already been triggered
      const triggerKey = `${oneShot.file}-${context || ""}`;
      if (oneShot.triggerOnce && this.triggeredOneShots.has(triggerKey)) {
        if (this.verbose) console.log(`[SceneManager] Skipping already triggered one-shot: ${oneShot.file}`);
        return;
      }

      // Calculate playback time
      const playTime = oneShot.delay ? now + oneShot.delay : now;

      // Create or reuse player
      let player = this.oneShotPlayers.get(oneShot.file);

      if (!player) {
        player = new Tone.Player({
          url: oneShot.file,
          onload: () => {
            if (this.verbose) console.log(`[SceneManager] Loaded one-shot sound: ${oneShot.file}`);
          },
        }).toDestination();

        this.oneShotPlayers.set(oneShot.file, player);
      }

      // Set volume
      player.volume.value = Tone.gainToDb(oneShot.volume);

      // Use immediate playback for one-shots instead of Transport scheduling
      // to avoid timing issues during scene transitions
      try {
        player.start(playTime);
        if (this.verbose) console.log(`[SceneManager] Playing one-shot sound: ${oneShot.file}`);

        // Mark as triggered if it's a triggerOnce sound
        if (oneShot.triggerOnce) {
          this.triggeredOneShots.add(triggerKey);
        }

        // Generate a unique ID for tracking this sound
        const eventId = Math.random(); // Just need a unique ID
        this.activeTransportEvents.push(eventId);
      } catch (error) {
        console.warn(`[SceneManager] Error playing one-shot sound: ${oneShot.file}`, error);
      }

      // Make sure Transport is running for timing references
      try {
        if (Tone.Transport.state !== "started") {
          Tone.Transport.start();
        }
      } catch (error) {
        console.warn("[SceneManager] Error starting Tone.js Transport:", error);
      }
    });
  }

  /**
   * Stops all currently playing one-shot sounds
   */
  private stopAllOneShots(): void {
    try {
      this.oneShotPlayers.forEach((player) => {
        try {
          // Try to stop the player regardless of state
          try {
            player.stop();
          } catch (e) {
            // Ignore errors during stopping
          }
        } catch (e) {
          // Ignore errors during stopping
        }
      });
    } catch (error) {
      console.warn("[SceneManager] Error stopping one-shot sounds:", error);
    }
  }

  /**
   * Clears all scheduled transport events
   */
  private clearTransportEvents(): void {
    this.activeTransportEvents.forEach((id) => {
      Tone.Transport.clear(id);
    });
    this.activeTransportEvents = [];
  }

  /**
   * Gets the current fade duration from the scene config
   * @returns Fade duration in seconds
   */
  public getCurrentFadeDuration(): number {
    if (!this.scenesConfig) return 1.5;

    if (this.currentScene && this.currentScene.fadeDuration !== undefined) {
      return this.currentScene.fadeDuration;
    }

    return this.scenesConfig.global.defaultFadeDuration;
  }

  /**
   * Gets the global settings from the config
   * @returns Global settings
   */
  public getGlobalSettings(): GlobalSettings | null {
    if (!this.scenesConfig) return null;
    return this.scenesConfig.global;
  }

  /**
   * Determines if audio should play by default for the current scene
   * @returns True if audio should play by default
   */
  public shouldPlayByDefault(): boolean {
    if (!this.currentScene) return false;
    return this.currentScene.defaultPlaying === true;
  }

  /**
   * Gets a sound effect from the global configuration
   * @param name Name of the sound effect
   * @returns Sound effect config or null if not found
   */
  public getSoundEffect(name: string): { file: string; volume: number } | null {
    if (!this.scenesConfig || !this.scenesConfig.global.soundEffects) {
      return null;
    }
    return this.scenesConfig.global.soundEffects[name] || null;
  }

  /**
   * Disposes all resources and cleans up
   */
  public dispose(): void {
    try {
      // Clear the singleton instance
      if (SceneManager.instance === this) {
        SceneManager.instance = null;
      }

      // Clean up scheduled events
      this.clearTransportEvents();

      // Dispose all one-shot players
      this.oneShotPlayers.forEach((player) => {
        try {
          try {
            player.stop();
          } catch (e) {
            // Ignore errors during stopping
          }
          player.disconnect();
          player.dispose();
        } catch (e) {
          // Ignore dispose errors
        }
      });
      this.oneShotPlayers.clear();
      this.triggeredOneShots.clear();

      // Clear all cached blocks
      this.loadedBlocks.clear();

      // Reset state
      this.currentScene = null;
      this.currentScreenEnum = null;
      this.isLoaded = false;

      if (this.verbose) {
        console.log("[SceneManager] Disposed resources and cleared caches");
      }
    } catch (e) {
      console.error("[SceneManager] Error during disposal:", e);
    }
  }
}
