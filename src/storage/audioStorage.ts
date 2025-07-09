import { openDB, DBSchema } from "idb";
import { AudioRecordingDocument } from "../types/audio";

interface AudioDB extends DBSchema {
  audioFiles: {
    key: number;
    value: AudioRecordingDocument;
    indexes: { "by-name": string };
  };
}

const dbPromise = openDB<AudioDB>("audio-database", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("audioFiles")) {
      const store = db.createObjectStore("audioFiles", { keyPath: "id", autoIncrement: true });
      store.createIndex("by-name", "name");
    }
  },
});

export const audioStorage = {
  async addAudioFile(doc: Omit<AudioRecordingDocument, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const toSave: AudioRecordingDocument = {
      ...doc,
      createdAt: now,
      updatedAt: now,
    };
    const db = await dbPromise;
    return db.add("audioFiles", toSave);
  },
  async getAudioFiles() {
    const db = await dbPromise;
    return db.getAll("audioFiles");
  },
  async deleteAudioFile(id: number) {
    const db = await dbPromise;
    return db.delete("audioFiles", id);
  },
};
