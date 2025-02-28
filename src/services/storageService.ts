import { openDB, DBSchema } from "idb";

interface Layer {
  name: string;
  index: number;
  image: string | null;
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface Document {
  id?: number;
  name: string;
  layers: Layer[];
}

interface MyDB extends DBSchema {
  documents: {
    key: number;
    value: Document;
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
  async addDocument(document: Document) {
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
  async updateDocument(document: Document) {
    const db = await dbPromise;
    return db.put("documents", document);
  },
  async deleteDocument(id: number) {
    const db = await dbPromise;
    return db.delete("documents", id);
  },
};
