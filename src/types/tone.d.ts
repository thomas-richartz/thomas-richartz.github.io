declare module "tone" {
  export interface ToneAudioNode {
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
  }

  export interface BaseContext {
    currentTime: number;
    state: string;
    sampleRate?: number;
    baseLatency?: number;
    close?: () => Promise<void>;
  }

  export type Unit = {
    Time: number | string;
  };

  export class Player implements ToneAudioNode {
    constructor(options: {
      url: string;
      onload?: () => void;
      onerror?: (error: any) => void;
      reverse?: boolean;
      loop?: boolean;
      loopStart?: number;
      loopEnd?: number;
    });
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    buffer: any;
    loop: boolean;
    loopStart: number;
    loopEnd: number;
    playbackRate: number;
    volume: Signal<"decibels">;
    loaded: boolean;
    start(time?: Unit.Time, offset?: number): this;
    stop(time?: Unit.Time): this;
    load(url: string): Promise<this>;
  }

  export class Panner implements ToneAudioNode {
    constructor(pan?: number);
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    pan: Signal<"normalRange">;
  }

  export class Analyser implements ToneAudioNode {
    constructor(type: "fft" | "waveform", size: number);
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    getValue(): Float32Array;
  }

  export class Reverb implements ToneAudioNode {
    constructor(options?: { decay?: number; wet?: number });
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    generate(): Promise<this>;
    decay: Signal<"time">;
    wet: Signal<"normalRange">;
  }

  export class FeedbackDelay implements ToneAudioNode {
    constructor(delayTime?: string, feedback?: number);
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    delayTime: Signal<"time">;
    feedback: Signal<"normalRange">;
    wet: Signal<"normalRange">;
  }

  export interface Signal<T extends string> {
    value: number;
    setValueAtTime(value: number, time: number): this;
    linearRampToValueAtTime(value: number, time: number): this;
    exponentialRampToValueAtTime(value: number, time: number): this;
    cancelScheduledValues(time: number): this;
    cancelAndHoldAtTime(time: number): this;
  }

  export const Transport: {
    start(time?: Unit.Time): void;
    stop(time?: Unit.Time): void;
    pause(time?: Unit.Time): void;
    cancel(after?: Unit.Time): void;
    clear(eventId: number): void;
    schedule(callback: (time: number) => void, time: Unit.Time): number;
    scheduleRepeat(callback: (time: number) => void, interval: Unit.Time, startTime?: Unit.Time): number;
    bpm: Signal<"bpm">;
    timeSignature: number[] | number;
    state?: string;
    position?: string;
    scheduled?: any[];
  };

  export const Destination: ToneAudioNode & {
    volume: Signal<"decibels">;
  };

  export function start(): Promise<void>;
  export function getDestination(): ToneAudioNode & { volume: Signal<"decibels"> };
  export function gainToDb(gain: number): number;
  export function now(): number;
  export const context: BaseContext;
  export const version: string;
  export class Oscillator implements ToneAudioNode {
    constructor(options: { frequency: number; volume: number; type: string });
    connect(destination: ToneAudioNode): this;
    disconnect(): this;
    dispose(): this;
    toDestination(): this;
    context: BaseContext;
    start(time?: Unit.Time): this;
    stop(time?: Unit.Time): this;
  }
  export class Context implements BaseContext {
    currentTime: number;
    state: string;
    sampleRate?: number;
    baseLatency?: number;
    close?: () => Promise<void>;
  }
}
