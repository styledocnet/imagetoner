import { openDB, DBSchema } from "idb";
import { ImageDocument } from "../types";

interface MyDB extends DBSchema {
  documents: {
    key: number;
    value: ImageDocument;
    indexes: { "by-name": string };
  };
}

const dbPromise = openDB<MyDB>("my-database", 1, {
  upgrade(db) {
    const store = db.createObjectStore("documents", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("by-name", "name");
  },
});

export const storageService = {
  async addDocument(document: ImageDocument) {
    const db = await dbPromise;
    return db.add("documents", document);
  },
  async getDocuments() {
    const db = await dbPromise;
    return db.getAll("documents");
  },
  async getDocument(id: number) {
    const db = await dbPromise;
    return db.get("documents", id);
  },
  async updateDocument(document: ImageDocument) {
    const db = await dbPromise;
    return db.put("documents", document);
  },
  async deleteDocument(id: number) {
    const db = await dbPromise;
    return db.delete("documents", id);
  },
};
