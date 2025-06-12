import { openDB, DBSchema } from "idb";
import { BrandStyle, ImageDocument } from "../types";

interface MyDB extends DBSchema {
  documents: {
    key: number;
    value: ImageDocument;
    indexes: { "by-name": string };
  };
  styles: {
    key: number;
    value: BrandStyle;
    indexes: { "by-name": string };
  };
}

const dbPromise = openDB<MyDB>("my-database", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("documents")) {
      const store = db.createObjectStore("documents", {
        keyPath: "id",
        autoIncrement: true,
      });
      store.createIndex("by-name", "name");
    }

    if (!db.objectStoreNames.contains("styles")) {
      const styleStore = db.createObjectStore("styles", {
        keyPath: "id",
        autoIncrement: true,
      });
      styleStore.createIndex("by-name", "name");
    }
  },
});

export const storageService = {
  async addDocument(document: ImageDocument) {
    const now = new Date().toISOString();
    const toSave: ImageDocument = {
      ...document,
      createdAt: document.createdAt || now,
      updatedAt: now,
    };
    const db = await dbPromise;
    return db.add("documents", toSave);
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
    const now = new Date().toISOString();
    const toSave: ImageDocument = {
      ...document,
      updatedAt: now,
    };
    const db = await dbPromise;
    return db.put("documents", toSave);
  },
  async deleteDocument(id: number) {
    const db = await dbPromise;
    return db.delete("documents", id);
  },
  async addStyle(style: BrandStyle) {
    const now = new Date().toISOString();
    const toSave: BrandStyle = {
      ...style,
      createdAt: style.createdAt || now,
      updatedAt: now,
    };
    const db = await dbPromise;
    return db.add("styles", toSave);
  },
  async getStyles() {
    const db = await dbPromise;
    return db.getAll("styles");
  },
  async getStyle(id: number): Promise<BrandStyle | undefined> {
    const db = await dbPromise;
    return db.get("styles", id);
  },
  async updateStyle(style: BrandStyle) {
    const now = new Date().toISOString();
    const toSave: BrandStyle = {
      ...style,
      updatedAt: now,
    };
    const db = await dbPromise;
    return db.put("styles", toSave);
  },
  async deleteStyle(id: number) {
    const db = await dbPromise;
    return db.delete("styles", id);
  },
};

export function saveCurrentStyleId(id: number) {
  localStorage.setItem("currentStyleId", id.toString());
}
export function loadCurrentStyleId(): number | null {
  const val = localStorage.getItem("currentStyleId");
  return val ? parseInt(val, 10) : null;
}
