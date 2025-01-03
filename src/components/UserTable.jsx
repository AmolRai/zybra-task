import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/fetchData";
import Filter from "./Filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const columns = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "price", header: "Price" },
];

const UserTable = () => {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    limit: 10,
    skip: 0,
  });

  const dataQuery = useQuery({
    queryKey: ["products", pagination],
    queryFn: () => fetchData(pagination),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
  });

  const table = useReactTable({
    data: dataQuery.data?.rows ?? [],
    columns,
    rowCount: dataQuery.data?.rowCount ?? 0,
    state: { columnFilters, pagination, globalFilter },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const rowValue = row.getValue(columnId);
      return (
        rowValue &&
        rowValue.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    },
  });

  if (dataQuery.error) return <h1>Error: {dataQuery.error.message}</h1>;

  return (
    <>
      <h1 className="productTable">Product Table</h1>
      <input
        type="text"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search all columns"
        className="border p-2 rounded mb-4"
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} as="th">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => header.column.toggleSorting()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[
                        header.column.getIsSorted()
                          ? header.column.getIsSorted()
                          : ""
                      ] ?? null}
                    </div>
                    {(header.column.id === "title" ||
                      header.column.id === "category" ||
                      header.column.id === "description") &&
                      header.column.getCanFilter() && (
                        <Filter
                          column={header.column}
                          onFilterChange={(value) =>
                            setColumnFilters((prev) => [
                              ...prev.filter(
                                (filter) => filter.id !== header.id
                              ),
                              { id: header.id, value },
                            ])
                          }
                        />
                      )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dataQuery.isFetching && <span className="loading">Loading...</span>}

      <div className="flex items-center gap-2 customPagination">
        <button
          className="border rounded p-1"
          onClick={() => setPagination((prev) => ({ ...prev, skip: 0 }))}
          disabled={pagination.skip === 0}
        >
          {"<<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip: Math.max(prev.skip - prev.limit, 0),
            }))
          }
          disabled={pagination.skip === 0}
        >
          {"<"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip: prev.skip + prev.limit,
            }))
          }
          disabled={
            pagination.skip + pagination.limit >= dataQuery.data?.rowCount
          }
        >
          {">"}
        </button>
        <button
          className="border rounded p-1"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              skip:
                Math.floor(dataQuery.data?.rowCount / pagination.limit) *
                pagination.limit,
            }))
          }
          disabled={
            pagination.skip + pagination.limit >= dataQuery.data?.rowCount
          }
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {Math.floor(pagination.skip / pagination.limit) + 1} of{" "}
            {Math.ceil(dataQuery.data?.rowCount || 10 / pagination.limit)}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={
              dataQuery.data?.rowCount
                ? Math.ceil(dataQuery.data?.rowCount / pagination.limit)
                : 1
            }
            defaultValue={Math.floor(pagination.skip / pagination.limit) + 1}
            onChange={(e) => {
              const page = e.target.value
                ? Math.max(0, Number(e.target.value) - 1)
                : 0;
              setPagination({ ...pagination, skip: page * pagination.limit });
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={pagination.limit}
          onChange={(e) =>
            setPagination({ ...pagination, limit: Number(e.target.value) })
          }
        >
          {[10, 20, 30, 40, 50].map((limit) => (
            <option key={limit} value={limit}>
              Show {limit}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default UserTable;
