import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface VideoProjectDocument {
  id?: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  fps: number;
  resolution: { width: number; height: number };
  tracks: VideoTrack[];
  settings: VideoProjectSettings;
}

export interface VideoTrack {
  id: string;
  type: "image" | "audio" | "video";
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  layer: number;
  enabled: boolean;
  volume?: number;
  opacity?: number;
  effects: VideoEffect[];
  keyframes: Keyframe[];
  source: VideoSource;
}

export interface VideoSource {
  type: "image" | "audio" | "video";
  blob?: Blob;
  url?: string;
  mimeType: string;
  originalName: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface VideoEffect {
  id: string;
  type: "transition" | "filter" | "transform";
  name: string;
  startTime: number;
  endTime: number;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface Keyframe {
  id: string;
  property: string;
  time: number;
  value: any;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface VideoProjectSettings {
  backgroundColor: string;
  audioFadeInDuration: number;
  audioFadeOutDuration: number;
  defaultTransitionDuration: number;
  defaultImageDuration: number;
}

interface VideoStorageDB extends DBSchema {
  videoProjects: {
    key: number;
    value: VideoProjectDocument;
    indexes: {
      "by-name": string;
      "by-created": Date;
      "by-updated": Date;
    };
  };
  videoAssets: {
    key: number;
    value: {
      id?: number;
      name: string;
      type: "image" | "audio" | "video";
      blob: Blob;
      mimeType: string;
      createdAt: Date;
      metadata?: {
        width?: number;
        height?: number;
        duration?: number;
      };
    };
    indexes: {
      "by-type": string;
      "by-name": string;
    };
  };
}

class VideoStorage {
  private dbName = "VideoStorageDB";
  private dbVersion = 1;
  private db: IDBPDatabase<VideoStorageDB> | null = null;

  async initDB(): Promise<IDBPDatabase<VideoStorageDB>> {
    if (this.db) return this.db;

    this.db = await openDB<VideoStorageDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Video projects store
        const projectStore = db.createObjectStore("videoProjects", {
          keyPath: "id",
          autoIncrement: true,
        });
        projectStore.createIndex("by-name", "name");
        projectStore.createIndex("by-created", "createdAt");
        projectStore.createIndex("by-updated", "updatedAt");

        // Video assets store
        const assetStore = db.createObjectStore("videoAssets", {
          keyPath: "id",
          autoIncrement: true,
        });
        assetStore.createIndex("by-type", "type");
        assetStore.createIndex("by-name", "name");
      },
    });

    return this.db;
  }

  // Project CRUD operations
  async createProject(project: Omit<VideoProjectDocument, "id" | "createdAt" | "updatedAt">): Promise<number> {
    const db = await this.initDB();
    const now = new Date();
    const projectWithTimestamps: Omit<VideoProjectDocument, "id"> = {
      ...project,
      createdAt: now,
      updatedAt: now,
    };
    return await db.add("videoProjects", projectWithTimestamps as VideoProjectDocument);
  }

  async getProjects(): Promise<VideoProjectDocument[]> {
    const db = await this.initDB();
    return await db.getAll("videoProjects");
  }

  async getProject(id: number): Promise<VideoProjectDocument | undefined> {
    const db = await this.initDB();
    return await db.get("videoProjects", id);
  }

  async updateProject(project: VideoProjectDocument): Promise<void> {
    const db = await this.initDB();
    const updatedProject = {
      ...project,
      updatedAt: new Date(),
    };
    await db.put("videoProjects", updatedProject);
  }

  async deleteProject(id: number): Promise<void> {
    const db = await this.initDB();
    await db.delete("videoProjects", id);
  }

  async duplicateProject(id: number, newName: string): Promise<number> {
    // @ts-ignore
    const db = await this.initDB();
    const project = await this.getProject(id);
    if (!project) throw new Error("Project not found");

    const duplicatedProject = {
      ...project,
      name: newName,
      id: undefined,
    };
    return await this.createProject(duplicatedProject);
  }

  // Asset CRUD operations
  async addAsset(asset: Omit<VideoStorageDB["videoAssets"]["value"], "id" | "createdAt">): Promise<number> {
    const db = await this.initDB();
    const assetWithTimestamp = {
      ...asset,
      createdAt: new Date(),
    };
    return await db.add("videoAssets", assetWithTimestamp);
  }

  async getAssets(type?: "image" | "audio" | "video"): Promise<VideoStorageDB["videoAssets"]["value"][]> {
    const db = await this.initDB();
    if (type) {
      return await db.getAllFromIndex("videoAssets", "by-type", type);
    }
    return await db.getAll("videoAssets");
  }

  async getAsset(id: number): Promise<VideoStorageDB["videoAssets"]["value"] | undefined> {
    const db = await this.initDB();
    return await db.get("videoAssets", id);
  }

  async deleteAsset(id: number): Promise<void> {
    const db = await this.initDB();
    await db.delete("videoAssets", id);
  }

  async updateAsset(asset: VideoStorageDB["videoAssets"]["value"]): Promise<void> {
    const db = await this.initDB();
    await db.put("videoAssets", asset);
  }

  // Utility methods
  async getProjectsByDateRange(startDate: Date, endDate: Date): Promise<VideoProjectDocument[]> {
    const db = await this.initDB();
    const tx = db.transaction("videoProjects", "readonly");
    const index = tx.objectStore("videoProjects").index("by-created");
    const range = IDBKeyRange.bound(startDate, endDate);
    return await index.getAll(range);
  }

  async searchProjectsByName(query: string): Promise<VideoProjectDocument[]> {
    const projects = await this.getProjects();
    return projects.filter(
      (project) => project.name.toLowerCase().includes(query.toLowerCase()) || project.description?.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async getStorageStats(): Promise<{
    projectCount: number;
    assetCount: number;
    totalSize: number;
    assetsByType: Record<string, number>;
  }> {
    const db = await this.initDB();
    const projects = await db.getAll("videoProjects");
    const assets = await db.getAll("videoAssets");

    let totalSize = 0;
    const assetsByType: Record<string, number> = {
      image: 0,
      audio: 0,
      video: 0,
    };

    assets.forEach((asset) => {
      totalSize += asset.blob.size;
      assetsByType[asset.type]++;
    });

    return {
      projectCount: projects.length,
      assetCount: assets.length,
      totalSize,
      assetsByType,
    };
  }

  // Create default project template
  createDefaultProject(name: string): Omit<VideoProjectDocument, "id" | "createdAt" | "updatedAt"> {
    return {
      name,
      description: "",
      duration: 30, // 30 seconds default
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      tracks: [],
      settings: {
        backgroundColor: "#000000",
        audioFadeInDuration: 1.0,
        audioFadeOutDuration: 1.0,
        defaultTransitionDuration: 0.5,
        defaultImageDuration: 3.0,
      },
    };
  }

  // Helper to create tracks from assets
  createTrackFromAsset(asset: VideoStorageDB["videoAssets"]["value"], startTime: number, layer: number, duration?: number): VideoTrack {
    const trackDuration = duration || asset.metadata?.duration || 3.0;

    return {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: asset.type,
      name: asset.name,
      startTime,
      endTime: startTime + trackDuration,
      duration: trackDuration,
      layer,
      enabled: true,
      volume: asset.type === "audio" ? 0.8 : undefined,
      opacity: asset.type === "image" ? 1.0 : undefined,
      effects: [],
      keyframes: [],
      source: {
        type: asset.type,
        blob: asset.blob,
        mimeType: asset.mimeType,
        originalName: asset.name,
        metadata: asset.metadata,
      },
    };
  }
}

export const videoStorage = new VideoStorage();
