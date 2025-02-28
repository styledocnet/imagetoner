import React, { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import DetailView from "./DetailView";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
}

interface TableViewProps<T> {
  fetchData: (params: {
    page: number;
    pageSize: number;
    sortKey?: keyof T;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, any>;
  }) => Promise<{ items: T[]; totalItems: number }>;
  columns: Column<T>[];
  pageSize?: number;
}

export function TableView<T>({
  fetchData,
  columns,
  pageSize = 10,
}: TableViewProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | undefined
  >(undefined);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const fetchTableData = async () => {
    setLoading(true);
    const response = await fetchData({
      page: currentPage,
      pageSize,
      sortKey,
      sortDirection,
      filters,
    });
    setData(response.items);
    setTotal(response.totalItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchTableData();
  }, [currentPage, sortKey, sortDirection, filters]);

  const handleSort = (key: keyof T) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleRowClick = (row: T) => {
    setSelectedItem(row);
    setSidebarOpen(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="relative flex">
      {/* Sidebar */}
      <DetailView
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedItem={selectedItem}
      />

      {/* Main Content */}
      <div className="flex-grow">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {columns
            .filter((col) => col.filterable)
            .map((col, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Filter by ${col.header}`}
                onChange={(e) =>
                  col.accessor &&
                  setFilters((prev) => ({
                    ...prev,
                    [col.accessor as string]: e.target.value,
                  }))
                }
                className="border p-2 rounded"
              />
            ))}
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead className="text-gray-700">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={index}
                      className={`p-3 border-b border-gray-300 font-semibold text-left ${
                        col.sortable ? "cursor-pointer" : ""
                      } truncate`}
                      style={{ maxWidth: "150px" }}
                      onClick={() =>
                        col.sortable && typeof col.accessor === "string"
                          ? handleSort(col.accessor)
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span>{col.header}</span>
                        {col.sortable && sortKey === col.accessor && (
                          <span>
                            {sortDirection === "asc" ? (
                              <ArrowUpIcon className="w-4 h-4" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="p-3 border-b border-gray-200 text-gray-600 truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(row)
                          : (row[col.accessor as keyof T] ?? "").toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
