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
          // First file - initialize with its data
          mergedData = data;
        } else {
          // Subsequent files - merge data

          // Merge table headers (use first file's headers as base)
          if (data.tableHeaders.length > 0 && mergedData.tableHeaders.length === 0) {
            mergedData.tableHeaders = data.tableHeaders;
          }

          // Append table rows
          if (data.tableData && data.tableData.length > 0) {
            mergedData.tableData = [...mergedData.tableData, ...data.tableData];
          }

          // Merge metadata (combine with file index)
          if (data.metadata) {
            Object.entries(data.metadata).forEach(([key, value]) => {
              mergedData.metadata![`File${i + 1}_${key}`] = value;
            });
          }

          // Aggregate summaries
          if (data.summary) {
            Object.entries(data.summary).forEach(([key, value]) => {
              if (typeof value === 'number' && typeof mergedData.summary![key] === 'number') {
                mergedData.summary![key] = (mergedData.summary![key] as number) + (value as number);
              }
            });
          }

          // Merge remarks
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

    // Convert blob to File
    const croppedFile = new File(
      [croppedBlob],
      selectedFiles[cropImageIndex]?.name || "cropped.jpg",
      { type: "image/jpeg" }
    );

    // Update the file at the specific index
    setSelectedFiles(prev => prev.map((file, idx) =>
      idx === cropImageIndex ? croppedFile : file
    ));

    // Update the preview at the specific index
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-violet-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>
            <div className="w-px h-6 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-zinc-100">DocuScan</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>AI Table Extraction</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">Extract Tables & Marksheets</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Upload marksheets, invoices, or any tabular document. Our AI will extract structured data for Excel.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-3xl p-1 border border-zinc-800"
            >
              <div
                className={`rounded-[1.3rem] p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed min-h-[300px] flex flex-col items-center justify-center ${isDragging
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900/50"
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
                      <div key={idx} className="relative group aspect-[3/4]">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover rounded-xl border border-zinc-700 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCropImage(idx, src);
                            }}
                            className="bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition backdrop-blur-md border border-white/10"
                            title="Crop image"
                          >
                            <CropIcon size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500/30 transition backdrop-blur-md border border-red-500/20"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                    <div className="aspect-[3/4] rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 transition-colors">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-medium">Add More</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl">
                      <Upload className="w-8 h-8 text-zinc-500" />
                    </div>
                    <p className="text-zinc-300 font-medium mb-2 text-lg">
                      Drop images here
                    </p>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                      Support for JPG, PNG, WebP. Drag & drop or click to browse.
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
                <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/30 rounded-b-[1.3rem]">
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <ImageIcon size={14} className="text-violet-500" />
                    {selectedFiles.length} file(s) selected
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFiles();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>

            {/* Camera Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => document.getElementById("cameraInput")?.click()}
              className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-zinc-800/50 transition text-zinc-300 border border-zinc-800"
            >
              <Camera className="w-5 h-5 text-violet-500" />
              <span className="text-sm font-medium">Take Photo</span>
            </motion.button>

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

            {/* Extract Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleExtract}
              disabled={selectedFiles.length === 0 || isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20 border border-violet-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {processingStatus || "Analyzing..."}
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Extract Data
                </>
              )}
            </motion.button>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400"
              >
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-3xl border border-zinc-800 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">Analyzing Document</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  Our AI is identifying tables and extracting data...
                </p>
              </motion.div>
            )}

            {extractedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Metadata */}
                {extractedData.metadata &&
                  Object.keys(extractedData.metadata).length > 0 && (
                    <div className="glass-card rounded-2xl border border-zinc-800 p-6">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileType className="w-3 h-3" />
                        Document Metadata
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(extractedData.metadata).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800"
                            >
                              <p className="text-xs text-zinc-500 mb-1">{key}</p>
                              <p className="font-medium truncate text-zinc-200 text-sm">{value}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Table */}
                {extractedData.tableHeaders.length > 0 && (
                  <div className="glass-card rounded-3xl border border-zinc-800 p-1 overflow-hidden">
                    <div className="bg-zinc-900/50 border-b border-zinc-800 p-4 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        Extracted Table
                      </h3>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                          <tr>
                            {extractedData.tableHeaders.map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 font-medium whitespace-nowrap"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {extractedData.tableData.map((row, idx) => (
                            <tr
                              key={idx}
                              className="bg-transparent hover:bg-zinc-800/30 transition-colors"
                            >
                              {extractedData.tableHeaders.map((header) => (
                                <td key={header} className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                                  {row[header] ?? "-"}
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
                    <div className="glass-card rounded-2xl border border-zinc-800 p-6">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                        Summary
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(extractedData.summary).map(
                          ([key, value]) => (
                            <div key={key} className="text-center p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">{key}</p>
                              <p className="text-2xl font-bold text-violet-400">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Export Buttons */}
                <div className="glass-card rounded-2xl border border-zinc-800 p-6">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                    Export Data
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleExport("excel")}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 border border-emerald-500/20"
                    >
                      <FileSpreadsheet size={18} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport("word")}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 border border-blue-500/20"
                    >
                      <FileText size={18} />
                      Word
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 border border-zinc-700"
                    >
                      <FileDown size={18} />
                      CSV
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!isLoading && !extractedData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-3xl border border-zinc-800 p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-inner">
                  <FileText className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">No Content Yet</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  Upload a document and click "Extract Data" to see the results here.
                </p>
              </motion.div>
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
