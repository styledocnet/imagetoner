import * as Tone from "tone";
import { Note } from "@/types/audio";

export class ToneNoteScheduler {
  private notes: Note[] = [];
  // @ts-ignore TS6133
  private isLooping: boolean = true;
  private synth: Tone.Synth;
  private scheduleIds: number[] = [];

  constructor(bpm: number, onStep: (step: number) => void, isLoop: boolean = true) {
    // Set initial BPM
    Tone.Transport.bpm.value = bpm;
    this.isLooping = isLoop;

    // Create synth
    this.synth = new Tone.Synth().toDestination();

    // Schedule step counter
    const stepEvent = Tone.Transport.scheduleRepeat((time) => {
      // console.log("time", time);
      time;
      const currentStep = Math.floor(Tone.Transport.progress * 32); // Assuming 32 steps per loop
      onStep(currentStep);
    }, "16n"); // 16th note intervals

    this.scheduleIds.push(stepEvent);
  }

  addNoteToScheduler(note: Note) {
    this.notes.push(note);

    // Schedule the note
    const id = Tone.Transport.schedule((time) => {
      this.synth.triggerAttackRelease(note.pitch, note.duration, time);
    }, note.time);

    this.scheduleIds.push(id);
  }

  start() {
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
  }

  pause() {
    Tone.Transport.pause();
  }

  setLoop(shouldLoop: boolean) {
    this.isLooping = shouldLoop;
    Tone.Transport.loop = shouldLoop;
    Tone.Transport.loopEnd = "2m"; // 2 measures
  }

  setBpm(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  cleanup() {
    // Clear all scheduled events
    this.scheduleIds.forEach((id) => Tone.Transport.clear(id));
    this.scheduleIds = [];
    this.notes = [];
  }
}
