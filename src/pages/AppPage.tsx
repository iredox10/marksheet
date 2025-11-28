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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/app"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">DocuScan</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-2">Extract Tables & Marksheets</h1>
          <p className="text-gray-400">
            Upload an image and let AI extract all the tabular data for you
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
              className="glass-card rounded-2xl p-6"
            >
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 hover:border-white/30"
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
                  <div className="grid grid-cols-3 gap-2">
                    {previews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCropImage(idx, src);
                            }}
                            className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition opacity-0 group-hover:opacity-100"
                            title="Crop image"
                          >
                            <CropIcon size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-1">
                      Drop images here or click to browse
                    </p>
                    <p className="text-xs text-gray-600">
                      Supports multiple JPG, PNG, WebP files
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
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <ImageIcon size={14} />
                    {selectedFiles.length} file(s) selected
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFiles();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition"
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
              className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-white/5 transition"
            >
              <Camera className="w-5 h-5 text-blue-400" />
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
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition flex items-center justify-center gap-2"
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
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400"
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
                className="glass-card rounded-2xl p-12 text-center"
              >
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-500" />
                <p className="text-gray-400">Analyzing document with AI...</p>
                <p className="text-sm text-gray-600 mt-1">
                  This may take a few seconds
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
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Document Info
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(extractedData.metadata).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-white/5 rounded-lg p-3"
                            >
                              <p className="text-xs text-gray-500">{key}</p>
                              <p className="font-medium truncate">{value}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Table */}
                {extractedData.tableHeaders.length > 0 && (
                  <div className="glass-card rounded-2xl p-6 overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                      Extracted Data
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            {extractedData.tableHeaders.map((header) => (
                              <th
                                key={header}
                                className="text-left py-3 px-4 text-sm font-medium text-gray-400"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.tableData.map((row, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-white/5 hover:bg-white/5"
                            >
                              {extractedData.tableHeaders.map((header) => (
                                <td key={header} className="py-3 px-4 text-sm">
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
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-4">
                        Summary
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(extractedData.summary).map(
                          ([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-xs text-gray-500 mb-1">{key}</p>
                              <p className="text-2xl font-bold text-purple-400">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Export Buttons */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">
                    Export
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleExport("excel")}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-400 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet size={18} />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport("word")}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      Word
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2"
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
                className="glass-card rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">
                  Upload a document to see extracted data here
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
