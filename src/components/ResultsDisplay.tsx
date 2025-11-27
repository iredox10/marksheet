import type { ExtractedData } from "../types";

interface ResultsDisplayProps {
  data: ExtractedData;
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Extracted Data
      </h2>

      {/* Metadata */}
      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(data.metadata).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded">
              <span className="text-sm text-gray-500">{key}</span>
              <p className="font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {data.tableHeaders.length > 0 && (
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                {data.tableHeaders.map((header) => (
                  <th key={header} className="p-2 text-center">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.tableData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  {data.tableHeaders.map((header) => (
                    <td key={header} className="p-2 text-center">
                      {row[header] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {data.summary && Object.keys(data.summary).length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div
            className={`grid gap-4`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(Object.keys(data.summary).length, 4)}, 1fr)`,
            }}
          >
            {Object.entries(data.summary).map(([key, value]) => (
              <div key={key} className="text-center">
                <span className="text-sm text-gray-500">{key}</span>
                <p className="text-xl font-bold text-blue-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remarks */}
      {data.remarks && Object.keys(data.remarks).length > 0 && (
        <div className="space-y-2">
          {Object.entries(data.remarks).map(([key, value], idx) => {
            const colors = ["yellow", "blue", "green", "purple"];
            const color = colors[idx % colors.length];
            return (
              <div
                key={key}
                className={`p-4 bg-${color}-50 rounded-lg border border-${color}-200`}
              >
                <span className={`text-sm font-medium text-${color}-700`}>
                  {key}
                </span>
                <p className="text-gray-700 mt-1">{value}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
