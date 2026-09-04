import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyState?: React.ReactNode;
  className?: string;
}
function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  className = "",
}: TableProps<T>) {
  if (data.length === 0) return emptyState;
  return (
    <table
      className={`w-full text-left text-sm text-neutral-800 rounded-lg overflow-hidden ${className}`}
    >
      <thead className="h-10 bg-blue-100 text-xs tracking-wider font-bold">
        <tr>
          {columns.map((col, index) => (
            <th
              key={index}
              scope="col"
              className={`px-4 ${col.className || ""}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200 bg-white">
        {data.map((item) => (
          <tr className="h-8" key={keyExtractor(item)}>
            {columns.map((col, index) => (
              <td
                key={index}
                className={`px-4 whitespace-nowrap ${col.className || ""}`}
              >
                {typeof col.accessor === "function"
                  ? col.accessor(item)
                  : (item[col.accessor] as React.ReactNode)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
