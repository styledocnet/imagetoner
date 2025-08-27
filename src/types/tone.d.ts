declare namespace Tone {
  interface Player {
    connect(destination: any): this;
    toDestination(): this;
    start(time?: number | string, offset?: number, duration?: number): this;
    stop(time?: number | string): this;
    state: "started" | "stopped";
    onstop?: () => void;
    buffer: AudioBuffer;
  }

  interface Analyser {
    getValue(): Float32Array;
    size: number;
    type: string;
    connect(destination: any): this;
    toDestination(): this;
  }

  interface BaseContext {
    decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer>;
    rawContext: AudioContext;
    resume(): Promise<void>;
    state: string;
    currentTime: number;
  }

  const context: BaseContext;

  function now(): number;
  function start(): Promise<void>;
  const Transport: {
    start(time?: number | string): this;
    stop(time?: number | string): this;
    bpm: {
      value: number;
    };
    position: string | number;
    seconds: number;
    loop: boolean;
    loopStart: number;
    loopEnd: number;
    timeSignature: number | number[];
    cancel(time?: number): this;
    clear(id?: number): this;
    pause(): this;
    schedule(callback: (time: number) => void, time: number | string): number;
    scheduleRepeat(callback: (time: number) => void, interval: number | string, startTime?: number | string, duration?: number | string): number;
    scheduleOnce(callback: (time: number) => void, time: number | string): number;
    state: "started" | "stopped";
  };

  class Player {
    constructor(url: string | AudioBuffer);
    connect(destination: any): this;
    toDestination(): this;
    start(time?: number | string, offset?: number, duration?: number): this;
    stop(time?: number | string): this;
    state: "started" | "stopped";
    onstop?: () => void;
    buffer: AudioBuffer;
    loop: boolean;
    loopStart: number;
    loopEnd: number;
    playbackRate: number;
    volume: number;
  }

  class Analyser {
    constructor(type: string, size: number);
    getValue(): Float32Array;
    size: number;
    type: string;
    connect(destination: any): this;
    toDestination(): this;
  }

  class Synth {
    constructor(options?: any);
    connect(destination: any): this;
    toDestination(): this;
    triggerAttackRelease(note: string | number, duration: number | string, time?: number | string, velocity?: number): this;
    triggerAttack(note: string | number, time?: number | string, velocity?: number): this;
    triggerRelease(note: string | number, time?: number | string): this;
    volume: number;
    detune: number;
  }

  class PolySynth {
    constructor(options?: any);
    connect(destination: any): this;
    toDestination(): this;
    triggerAttackRelease(note: string | number, duration: number | string, time?: number | string, velocity?: number): this;
    triggerAttack(note: string | number, time?: number | string, velocity?: number): this;
    triggerRelease(note: string | number, time?: number | string): this;
    volume: number;
    detune: number;
  }

  class Oscillator {
    constructor(frequency?: number | string, type?: string);
    connect(destination: any): this;
    toDestination(): this;
    start(time?: number | string): this;
    stop(time?: number | string): this;
    frequency: Signal;
    type: string;
    volume: number;
    state: "started" | "stopped";
  }

  class Signal<T = number> {
    constructor(value?: T);
    value: T;
    connect(destination: any): this;
    rampTo(value: T, rampTime: number | string): this;
    setValueAtTime(value: T, time: number | string): this;
    linearRampToValueAtTime(value: T, time: number | string): this;
    exponentialRampToValueAtTime(value: T, time: number | string): this;
  }

  class AmplitudeEnvelope {
    constructor(options?: any);
    connect(destination: any): this;
    toDestination(): this;
    triggerAttack(time?: number | string, velocity?: number): this;
    triggerRelease(time?: number | string): this;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }
}

declare module "tone" {
  export = Tone;
  export as namespace Tone;
}
