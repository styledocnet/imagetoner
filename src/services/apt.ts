import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Generic CRUD Service
export class CollectionService<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async fetchRecords({
    page = 1,
    pageSize = 10,
    sortKey,
    sortDirection,
    filters,
  }: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, any>;
  }): Promise<{ items: T[]; totalPages: number; totalItems: number }> {
    // Build sort query
    const sortQuery = sortKey
      ? `${sortDirection === "desc" ? "-" : ""}${sortKey}`
      : "-created";

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: pageSize.toString(),
      sort: sortQuery,
    });

    // Add filters to the query string
    if (filters) {
      const filterStrings: string[] = Object.entries(filters).map(
        ([key, value]) => {
          const escapedValue = encodeURIComponent(String(value));
          return `${key}~'${escapedValue}'`;
        },
      );

      if (filterStrings.length > 0) {
        const filterQuery = filterStrings.join(" && ");
        params.append("filter", filterQuery);
      }
    }

    // Fetch records
    const response = await api.get(
      `/collections/${this.collectionName}/records`,
      {
        params,
      },
    );

    return {
      items: response.data.items as T[],
      totalPages: response.data.totalPages,
      totalItems: response.data.totalItems,
    };
  }

  async getById(id: string): Promise<T> {
    const response = await api.get(
      `/collections/${this.collectionName}/records/${id}`,
    );
    return response.data as T;
  }

  async create(data: T): Promise<T> {
    const response = await api.post(
      `/collections/${this.collectionName}/records`,
      data,
    );
    return response.data as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await api.patch(
      `/collections/${this.collectionName}/records/${id}`,
      data,
    );
    return response.data as T;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/collections/${this.collectionName}/records/${id}`);
  }

  // Analytics: Count records matching filters
  // Count records matching filters
  async count(filters: Record<string, any>): Promise<number> {
    const params = new URLSearchParams();
    const filterStrings: string[] = Object.entries(filters).map(
      ([key, value]) => {
        const escapedValue = encodeURIComponent(String(value));
        return `${key}~'${escapedValue}'`;
      },
    );

    if (filterStrings.length > 0) {
      const filterQuery = filterStrings.join(" && ");
      params.append("filter", filterQuery);
    }

    const response = await api.get(
      `/collections/${this.collectionName}/records`,
      {
        params,
      },
    );

    return response.data.totalItems; // Return total count of matching records
  }
}
