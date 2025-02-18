import { useState } from "react";
  const initialData = [
    {
      id: "electronics",
      label: "Electronics",
      originalValue: 1500,
      children: [
        { id: "phones", label: "Phones", originalValue: 800 },
        { id: "laptops", label: "Laptops", originalValue: 700 }
      ]
    },
    {
      id: "furniture",
      label: "Furniture",
      originalValue: 1000,
      children: [
        { id: "tables", label: "Tables", originalValue: 300 },
        { id: "chairs", label: "Chairs", originalValue: 700 }
      ]
    }
  ];

const HierarchicalSalesTable = () => {
  const calculateCurrentValues = (rows) => {
    return rows.map((row) => {
      if (row.children) {
        const updatedChildren = calculateCurrentValues(row.children);
        return {
          ...row,
          children: updatedChildren,
          currentValue: updatedChildren.reduce(
            (sum, child) => sum + child.currentValue,
            0
          ),
        };
      }
      return { ...row, currentValue: row.originalValue };
    });
  };

  const [data, setData] = useState(() => calculateCurrentValues(initialData));
  const [inputValues, setInputValues] = useState({});
  const [variances, setVariances] = useState({});

  const updateValues = (rowId, newValue) => {
    const updateRow = (rows) => {
      return rows.map((row) => {
        if (row.id === rowId) {
          if (row.children) {
            const totalCurrentValue = row.children.reduce(
              (sum, child) => sum + child.currentValue,
              0
            );

            const updatedChildren = row.children.map((child) => ({
              ...child,
              currentValue: parseFloat(
                ((child.currentValue / totalCurrentValue) * newValue).toFixed(2)
              ),
            }));

            return {
              ...row,
              children: updatedChildren,
              currentValue: newValue,
            };
          }
          return { ...row, currentValue: newValue };
        }
        if (row.children) {
          const updatedChildren = updateRow(row.children);
          return {
            ...row,
            children: updatedChildren,
            currentValue: updatedChildren.reduce(
              (sum, child) => sum + child.currentValue,
              0
            ),
          };
        }
        return row;
      });
    };

    const updatedData = updateRow(data);
    setData(updatedData);
    calculateVariances(updatedData);
  };

  const calculateVariances = (rows) => {
    const newVariances = {};
    const traverse = (rows) => {
      rows.forEach((row) => {
        newVariances[row.id] =
          ((row.currentValue - row.originalValue) / row.originalValue) * 100;
        if (row.children) traverse(row.children);
      });
    };
    traverse(rows);
    setVariances(newVariances);
  };

  const handleInputChange = (rowId, value) => {
    setInputValues((prev) => ({ ...prev, [rowId]: value }));
  };

  const handleAllocationPercentage = (rowId) => {
    const inputVal = parseFloat(inputValues[rowId] || 0);
    if (isNaN(inputVal)) return;
    const row = findRowById(data, rowId);
    if (!row) return;
    const newValue = row.currentValue * (1 + inputVal / 100);
    updateValues(rowId, newValue);
  };

  const handleAllocationValue = (rowId) => {
    const inputVal = parseFloat(inputValues[rowId] || 0);
    if (isNaN(inputVal)) return;
    updateValues(rowId, inputVal);
  };

  const findRowById = (rows, id) => {
    for (const row of rows) {
      if (row.id === id) return row;
      if (row.children) {
        const found = findRowById(row.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderRows = (rows, depth = 1) => {
    return rows.flatMap((row) => {
      const rowVariance = variances[row.id] || 0;
      const rowElements = (
        <tr
          key={row.id}
          className={depth === 0 ? "bg-gray-700" : "bg-gray-800"}
        >
          <td
            className="p-2 border border-gray-600"
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            {row.label}
          </td>
          <td className="p-2 border border-gray-600 text-right">
            {row.currentValue.toFixed(2)}
          </td>
          <td className="p-2 border border-gray-600">
            <input
              type="text"
              value={inputValues[row.id] || ""}
              onChange={(e) => handleInputChange(row.id, e.target.value)}
              className="w-16 bg-gray-800 text-white text-right p-1"
            />
          </td>
          <td className="p-2 border border-gray-600 text-center">
            <button
              onClick={() => handleAllocationPercentage(row.id)}
              className="px-2 py-1 bg-blue-600 text-xs rounded"
            >
              Allocation %
            </button>
          </td>
          <td className="p-2 border border-gray-600 text-center">
            <button
              onClick={() => handleAllocationValue(row.id)}
              className="px-2 py-1 bg-green-600 text-xs rounded"
            >
              Allocation Val
            </button>
          </td>
          <td className="p-2 border border-gray-600 text-right">
            {rowVariance.toFixed(2)}%
          </td>
        </tr>
      );

      if (row.children) {
        return [rowElements, ...renderRows(row.children, depth + 1)];
      }
      return rowElements;
    });
  };

  return (
    <div className="bg-gray-900 text-white p-4 w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-600 text-left">Label</th>
            <th className="p-2 border border-gray-600 text-right">Value</th>
            <th className="p-2 border border-gray-600 text-left">Input</th>
            <th className="p-2 border border-gray-600 text-center">
              Allocation %
            </th>
            <th className="p-2 border border-gray-600 text-center">
              Allocation Val
            </th>
            <th className="p-2 border border-gray-600 text-right">
              Variance %
            </th>
          </tr>
        </thead>
        <tbody>{renderRows(data)}</tbody>
      </table>
    </div>
  );
};

export default HierarchicalSalesTable;
