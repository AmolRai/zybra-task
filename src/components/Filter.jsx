import DebouncedInput from "./DebouncedInput";

function Filter({ column, onFilterChange }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => onFilterChange(value)}
      placeholder="Search..."
      type="text"
      value={columnFilterValue || ""}
    />
  );
}

export default Filter;
