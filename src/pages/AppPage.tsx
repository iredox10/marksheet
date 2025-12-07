import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Wand2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Upload,
  X,
  FileSpreadsheet,
  FileDown,
  Image as ImageIcon,
  Crop as CropIcon,
  Camera,
  Sparkles,
  FileType,
} from "lucide-react";
import { extractData } from "../services/ai-ocr";
import {
  generateExcel,
  generateCSV,
  generateWord,
  downloadBlob,
} from "../services/export";
import type { ExtractedData, Provider } from "../types";
import { ImageCropper } from "../components";

export function AppPage() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
  const provider: Provider = "groq";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const handleFile = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (fileArray.length === 0) return;

    setSelectedFiles(prev => [...prev, ...fileArray]);

    // Create previews for new files
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setExtractedData(null);
    setProcessingStatus("");
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image");
      return;
    }
    if (!apiKey) {
      setError("Please enter your API key");
      return;
    }

    setError(null);
    setIsLoading(true);
    setExtractedData(null);

    try {
      let mergedData: ExtractedData = {
        tableHeaders: [],
        tableData: [],
        metadata: {},
        summary: {},
        remarks: {},
      };

      // Process each file sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProcessingStatus(`Processing ${i + 1} of ${selectedFiles.length}: ${file.name}`);

        const data = await extractData(file, apiKey, provider);

        if (i === 0) {
          mergedData = data;
        } else {
          if (data.tableHeaders.length > 0 && mergedData.tableHeaders.length === 0) {
            mergedData.tableHeaders = data.tableHeaders;
          }
          if (data.tableData && data.tableData.length > 0) {
            mergedData.tableData = [...mergedData.tableData, ...data.tableData];
          }
          if (data.metadata) {
            Object.entries(data.metadata).forEach(([key, value]) => {
              mergedData.metadata![`File${i + 1}_${key}`] = value;
            });
          }
          if (data.summary) {
            Object.entries(data.summary).forEach(([key, value]) => {
              if (typeof value === 'number' && typeof mergedData.summary![key] === 'number') {
                mergedData.summary![key] = (mergedData.summary![key] as number) + (value as number);
              }
            });
          }
          if (data.remarks) {
            mergedData.remarks = { ...mergedData.remarks, ...data.remarks };
          }
        }
      }

      setExtractedData(mergedData);
      setProcessingStatus(`Completed: Extracted data from ${selectedFiles.length} document(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract data");
      setProcessingStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: "excel" | "csv" | "word") => {
    if (!extractedData) return;
    let blob: Blob;
    let filename: string;

    switch (format) {
      case "excel":
        blob = await generateExcel(extractedData);
        filename = "extracted-data.xlsx";
        break;
      case "csv":
        blob = generateCSV(extractedData);
        filename = "extracted-data.csv";
        break;
      case "word":
        blob = await generateWord(extractedData);
        filename = "extracted-data.docx";
        break;
    }

    downloadBlob(blob, filename);
  };

  const handleCropImage = (index: number, preview: string) => {
    setCropImageIndex(index);
    setCropImageSrc(preview);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (cropImageIndex === null) return;

    const croppedFile = new File(
      [croppedBlob],
      selectedFiles[cropImageIndex]?.name || "cropped.jpg",
      { type: "image/jpeg" }
    );

    setSelectedFiles(prev => prev.map((file, idx) =>
      idx === cropImageIndex ? croppedFile : file
    ));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews(prev => prev.map((preview, idx) =>
        idx === cropImageIndex ? (e.target?.result as string) : preview
      ));
    };
    reader.readAsDataURL(croppedFile);

    setShowCropper(false);
    setCropImageSrc(null);
    setCropImageIndex(null);
  };

  const handleCellChange = (rowIndex: number, header: string, value: string) => {
    if (!extractedData) return;
    const newData = [...extractedData.tableData];
    newData[rowIndex] = { ...newData[rowIndex], [header]: value };
    setExtractedData({ ...extractedData, tableData: newData });
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </Link>
            <div className="w-px h-4 bg-white/20" />
            <span className="font-bold text-white text-sm tracking-tight">DOCUSCAN <span className="text-neutral-500">/</span> TABLE</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-l-2 border-white pl-6"
        >
          <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Structured Data Model</span>
          </div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">DATA EXTRACTION</h1>
          <p className="text-neutral-500 font-light">
            Upload marksheets or tabular data for structured processing.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {/* Left Column - Upload */}
          <div className="bg-[#111111] p-8">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div
                className={`relative p-8 text-center cursor-pointer transition-all duration-300 border border-dashed min-h-[300px] flex flex-col items-center justify-center ${isDragging
                  ? "border-white bg-white/5"
                  : "border-neutral-800 hover:border-neutral-600 hover:bg-[#161616]"
                  }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files);
                  }
                }}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                {previews.length > 0 ? (
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-[3/4] border border-white/10 bg-[#161616]">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCropImage(idx, src);
                            }}
                            className="p-2 bg-black/50 hover:bg-black text-white backdrop-blur-sm border border-white/10 transition"
                            title="Crop"
                          >
                            <CropIcon size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-sm border border-red-500/20 transition"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-black/80 px-1 border border-white/10">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </div>
                      </div>
                    ))}
                    <div className="aspect-[3/4] border border-white/10 bg-[#161616] flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-white transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-[10px] uppercase tracking-widest">Add</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-6 bg-[#161616]">
                      <Upload className="w-5 h-5 text-neutral-400" />
                    </div>
                    <p className="text-white text-sm uppercase tracking-widest mb-2">
                      Upload Multiple Files (Batch)
                    </p>
                    <p className="text-xs text-neutral-600 font-mono">
                      JPG, PNG, WEBP SUPPORTED
                    </p>
                  </>
                )}
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFile(e.target.files);
                    }
                  }}
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="px-4 py-3 border-x border-b border-white/10 flex items-center justify-between bg-[#161616]">
                  <p className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
                    <ImageIcon size={12} />
                    {selectedFiles.length} FILES SELECTED
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFiles();
                    }}
                    className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 transition"
                  >
                    Clear
                  </button>
                </div>
              )}
            </motion.div>

            {/* Controls */}
            <div className="flex gap-3">
                <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => document.getElementById("cameraInput")?.click()}
                className="flex-1 border border-white/10 p-4 flex items-center justify-center gap-2 hover:bg-white/5 transition text-neutral-300 uppercase text-xs tracking-widest"
                >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
                </motion.button>

                <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleExtract}
                disabled={selectedFiles.length === 0 || isLoading}
                className="flex-[2] bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed py-4 font-bold uppercase text-xs tracking-widest transition flex items-center justify-center gap-2"
                >
                {isLoading ? (
                    <>
                    <Loader2 className="animate-spin" size={14} />
                    {processingStatus || "PROCESSING..."}
                    </>
                ) : (
                    <>
                    <Wand2 size={14} />
                    INITIATE EXTRACTION
                    </>
                )}
                </motion.button>
            </div>
             <input
              type="file"
              id="cameraInput"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFile(e.target.files);
                }
              }}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-400"
              >
                <AlertCircle size={16} />
                <span className="text-xs font-mono">{error}</span>
              </motion.div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="bg-[#111111] p-8 min-h-[600px] flex flex-col">
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">ANALYZING</h3>
                <p className="text-xs text-neutral-500 font-mono">DETECTING LAYOUT STRUCTURE...</p>
              </div>
            )}

            {extractedData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 h-full flex flex-col"
              >
                {/* Metadata */}
                {extractedData.metadata &&
                  Object.keys(extractedData.metadata).length > 0 && (
                    <div className="border border-white/10 p-6">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileType className="w-3 h-3" />
                        Metadata
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(extractedData.metadata).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="border-b border-white/5 pb-2"
                            >
                              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{key}</p>
                              <p className="font-mono text-sm text-white truncate">{value}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Table */}
                {extractedData.tableHeaders.length > 0 && (
                  <div className="border border-white/10 flex-1 flex flex-col">
                    <div className="border-b border-white/10 p-4 bg-[#161616] flex justify-between items-center">
                      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <FileSpreadsheet className="w-3 h-3" />
                        Table Data
                      </h3>
                    </div>
                    <div className="overflow-x-auto flex-1 custom-scrollbar p-4">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[10px] text-neutral-500 uppercase font-mono border-b border-white/10">
                          <tr>
                            {extractedData.tableHeaders.map((header) => (
                              <th
                                key={header}
                                className="px-4 py-3 font-normal whitespace-nowrap border-r border-white/5 last:border-r-0 bg-[#161616]"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                          {extractedData.tableData.map((row, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              {extractedData.tableHeaders.map((header) => (
                                <td key={header} className="px-4 py-3 text-neutral-300 whitespace-nowrap border-r border-white/5 last:border-r-0 p-0">
                                  <input
                                    type="text"
                                    value={row[header] ?? ""}
                                    onChange={(e) => handleCellChange(idx, header, e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-neutral-300 focus:text-white focus:bg-white/10 px-1 py-0.5 transition-colors"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {extractedData.summary &&
                  Object.keys(extractedData.summary).length > 0 && (
                    <div className="border border-white/10 p-6 bg-[#161616]">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
                        Summary
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(extractedData.summary).map(
                          ([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{key}</p>
                              <p className="text-xl font-light text-white">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Export Buttons */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                    <button
                      onClick={() => handleExport("excel")}
                      className="border border-white/10 hover:bg-white hover:text-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet size={14} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport("word")}
                      className="border border-white/10 hover:bg-white hover:text-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <FileText size={14} />
                      Word
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="border border-white/10 hover:bg-white hover:text-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      <FileDown size={14} />
                      CSV
                    </button>
                  </div>
              </motion.div>
            )}

            {!isLoading && !extractedData && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <div className="w-16 h-16 border border-white/20 flex items-center justify-center mb-6">
                    <div className="w-8 h-8 border border-dashed border-white/50" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">AWAITING INPUT</h3>
                <p className="text-xs text-neutral-500 font-mono max-w-xs mx-auto">
                  UPLOAD A DOCUMENT TO BEGIN EXTRACTION
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setCropImageSrc(null);
            setCropImageIndex(null);
          }}
        />
      )}
    </div>
  );
}
