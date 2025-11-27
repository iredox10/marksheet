import { FileSpreadsheet, FileText, FileDown } from "lucide-react";
import type { ExtractedData } from "../types";
import { generateExcel, generateCSV, generateWord, downloadBlob } from "../services/export";

interface ExportButtonsProps {
  data: ExtractedData;
}

export function ExportButtons({ data }: ExportButtonsProps) {
  const handleExport = async (format: "excel" | "csv" | "word") => {
    let blob: Blob;
    let filename: string;

    switch (format) {
      case "excel":
        blob = await generateExcel(data);
        filename = "extracted-data.xlsx";
        break;
      case "csv":
        blob = generateCSV(data);
        filename = "extracted-data.csv";
        break;
      case "word":
        blob = await generateWord(data);
        filename = "extracted-data.docx";
        break;
    }

    downloadBlob(blob, filename);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h3>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleExport("excel")}
          className="bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <FileSpreadsheet size={20} />
          Excel
        </button>
        <button
          onClick={() => handleExport("word")}
          className="bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 transition flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          Word
        </button>
        <button
          onClick={() => handleExport("csv")}
          className="bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
        >
          <FileDown size={20} />
          CSV
        </button>
      </div>
    </div>
  );
}
