import React, { useState } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface CRUDTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onCreate: (newItem: Partial<T>) => Promise<void>;
  onUpdate: (item: T) => Promise<void>;
  onDelete: (itemId: number) => Promise<void>;
}

export function CRUDTable<T>({
  data,
  columns,
  onCreate,
  onUpdate,
  onDelete,
}: CRUDTableProps<T>) {
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [newRow, setNewRow] = useState<Partial<T>>({});

  return (
    <div>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="border p-2">
                {col.header}
              </th>
            ))}
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="border p-2">
                  {typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessor as keyof T]}
                </td>
              ))}
              <td className="border p-2">
                <button
                  onClick={() => setEditingRow(row)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(row.id as number)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          <tr>
            {columns.map((col, colIndex) => (
              <td key={colIndex} className="border p-2">
                <input
                  type="text"
                  value={newRow[col.accessor as keyof T] || ""}
                  onChange={(e) =>
                    setNewRow({
                      ...newRow,
                      [col.accessor as keyof T]: e.target.value,
                    })
                  }
                  className="border p-1 w-full"
                />
              </td>
            ))}
            <td className="border p-2">
              <button
                onClick={() => onCreate(newRow)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Add
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
