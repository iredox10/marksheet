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
  Copy,
  Check,
  Download,
  Image as ImageIcon,
  Zap,
  Crop as CropIcon,
  Camera,
  Sparkles,
  FileDown,
  FileType,
} from "lucide-react";
import { Document, Paragraph, TextRun, Packer } from "docx";
import jsPDF from "jspdf";
import { ImageCropper } from "../components";

const PROMPT = `You are an expert OCR system. Extract ALL text from this image EXACTLY as it appears on the paper.

CRITICAL: Return ONLY a valid JSON object with PROPERLY ESCAPED strings.

Return the extracted text in this EXACT JSON format:
{
  "title": "Document title if visible (optional)",
  "content": "The full extracted text content with PRESERVED formatting",
  "type": "letter/memo/note/other",
  "date": "Date if visible (optional)",
  "from": "Sender if visible (optional)",
  "to": "Recipient if visible (optional)"
}

CRITICAL FORMATTING RULES:
- Preserve ALL original line breaks by using \\n (escaped newline) in the JSON
- Maintain original spacing and indentation (use spaces to replicate indentation)
- Keep blank lines/paragraph breaks using \\n\\n (double newline)
- Preserve bullet points, numbers, or list formatting using the original characters
- Maintain text alignment patterns using appropriate spacing
- Preserve any special characters, dashes, underscores, or symbols
- DO NOT reformat, reorganize, or "clean up" the text
- Extract text EXACTLY as a human would read it from top to bottom, left to right

CRITICAL JSON ESCAPING RULES:
- Use \\n for newlines (NOT actual line breaks in the JSON string)
- Use \\" for quotes within text
- Use \\\\ for backslashes
- Ensure all strings are properly escaped for valid JSON
- Example: "content": "Line 1\\nLine 2\\n\\nParagraph 2"

CRITICAL OUTPUT RULES:
- Return ONLY the JSON object
- NO explanatory text before or after the JSON
- NO markdown code blocks
- Start your response with { and end with }
- Ensure the JSON is valid and parseable`;

// Helper function to extract JSON from AI responses
function parseJSONFromAI(textContent: string): any {
  let jsonStr = textContent.trim();

  // Try to extract from markdown code blocks first
  const markdownMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    jsonStr = markdownMatch[1].trim();
  } else {
    // Look for JSON object pattern
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0].trim();
    }
  }

  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    console.warn("First parse failed, attempting to repair JSON...");
    console.warn("Raw JSON:", jsonStr.substring(0, 300));

    try {
      // Manual JSON repair - extract fields one by one
      const repaired: any = {};

      // Extract simple fields (title, type, date, from, to)
      const simpleFields = ['title', 'type', 'date', 'from', 'to'];
      simpleFields.forEach(field => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = jsonStr.match(regex);
        if (match) {
          repaired[field] = match[1];
        }
      });

      // Extract content field specially (it likely has unescaped newlines)
      const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*?)"\s*[,}]/);
      if (contentMatch) {
        // The content might span multiple lines - take everything until we hit ",\n" or "}\n"
        let contentStart = jsonStr.indexOf('"content"');
        if (contentStart !== -1) {
          let valueStart = jsonStr.indexOf('"', contentStart + 9);
          if (valueStart !== -1) {
            valueStart++; // Move past the opening quote

            // Find the closing quote that's followed by comma or brace
            let i = valueStart;
            let content = '';

            while (i < jsonStr.length) {
              const char = jsonStr[i];

              // Check for end of string value
              if (char === '"' && jsonStr[i - 1] !== '\\') {
                // Check if this is followed by , or }
                const nextNonWhite = jsonStr.substring(i + 1).match(/\S/);
                if (nextNonWhite && (nextNonWhite[0] === ',' || nextNonWhite[0] === '}')) {
                  break;
                }
              }

              content += char;
              i++;
            }

            repaired.content = content;
          }
        }
      }

      if (repaired.content || repaired.title) {
        return repaired;
      }

      throw new Error("Could not extract content from response");
    } catch (secondError) {
      console.error("Failed to repair JSON:", jsonStr);
      console.error("Errors:", firstError, secondError);
      throw new Error("AI returned invalid JSON. Please try again.");
    }
  }
}

async function extractWithGroq(
  file: File,
  apiKey: string
): Promise<{ title?: string; content: string; type?: string; date?: string; from?: string; to?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const base64Image = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  const mimeType = file.type || "image/jpeg";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API Error: ${error}`);
  }

  const result = await response.json();
  const textContent = result.choices?.[0]?.message?.content;

  if (!textContent) throw new Error("No response from AI");

  return parseJSONFromAI(textContent);
}

export function NotesPage() {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || "";

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<{
    title?: string;
    content: string;
    type?: string;
    date?: string;
    from?: string;
    to?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const handleFile = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (fileArray.length === 0) return;

    setSelectedFiles(prev => [...prev, ...fileArray]);

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

    if (!groqApiKey) {
      setError("Please add your Groq API key to .env file");
      return;
    }

    setError(null);
    setIsLoading(true);
    setExtractedData(null);

    try {
      let combinedContent = "";
      let lastData: any = null;

      // Process each file sequentially
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProcessingStatus(`Processing ${i + 1} of ${selectedFiles.length}: ${file.name}`);

        const data = await extractWithGroq(file, groqApiKey);
        lastData = data;

        // Concatenate content with separator
        if (i > 0) {
          combinedContent += "\n\n--- Document " + (i + 1) + " ---\n\n";
        }
        combinedContent += data.content;
      }

      // Use metadata from last file but combined content
      setExtractedData({
        ...lastData,
        content: combinedContent,
      });
      setProcessingStatus(`Completed: Extracted text from ${selectedFiles.length} document(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text");
      setProcessingStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (extractedData?.content) {
      await navigator.clipboard.writeText(extractedData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!extractedData) return;
    const text = `${extractedData.title ? `Title: ${extractedData.title}\n` : ""}${extractedData.date ? `Date: ${extractedData.date}\n` : ""}${extractedData.from ? `From: ${extractedData.from}\n` : ""}${extractedData.to ? `To: ${extractedData.to}\n` : ""}\n${extractedData.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
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

  const handleExportDocx = async () => {
    if (!extractedData) return;

    const paragraphs: Paragraph[] = [];

    // Add metadata
    if (extractedData.title) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: extractedData.title, bold: true, size: 32 })],
        })
      );
    }
    if (extractedData.date || extractedData.from || extractedData.to) {
      paragraphs.push(new Paragraph({ text: "" })); // Empty line
    }
    if (extractedData.date) {
      paragraphs.push(new Paragraph({ text: `Date: ${extractedData.date}` }));
    }
    if (extractedData.from) {
      paragraphs.push(new Paragraph({ text: `From: ${extractedData.from}` }));
    }
    if (extractedData.to) {
      paragraphs.push(new Paragraph({ text: `To: ${extractedData.to}` }));
    }

    // Add content
    paragraphs.push(new Paragraph({ text: "" })); // Empty line
    const contentLines = extractedData.content.split("\n");
    contentLines.forEach(line => {
      paragraphs.push(new Paragraph({ text: line }));
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-notes.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!extractedData) return;

    const pdf = new jsPDF();
    let yPosition = 20;

    // Add metadata
    if (extractedData.title) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(extractedData.title, 20, yPosition);
      yPosition += 10;
    }

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    if (extractedData.date) {
      pdf.text(`Date: ${extractedData.date}`, 20, yPosition);
      yPosition += 6;
    }
    if (extractedData.from) {
      pdf.text(`From: ${extractedData.from}`, 20, yPosition);
      yPosition += 6;
    }
    if (extractedData.to) {
      pdf.text(`To: ${extractedData.to}`, 20, yPosition);
      yPosition += 6;
    }

    yPosition += 4; // Extra space

    // Add content with text wrapping
    const contentLines = extractedData.content.split("\n");
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pdf.internal.pageSize.width - 2 * margin;

    contentLines.forEach(line => {
      const wrappedLines = pdf.splitTextToSize(line || " ", maxWidth);
      wrappedLines.forEach((wrappedLine: string) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(wrappedLine, margin, yPosition);
        yPosition += 6;
      });
    });

    pdf.save("extracted-notes.pdf");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[120px]" />
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
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            <span>AI Text Extraction</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-100">Extract Notes & Letters</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Upload handwritten notes or printed documents. Our AI will preserve formatting and structure.
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
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/50"
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
                    <ImageIcon size={14} className="text-emerald-500" />
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
              <Camera className="w-5 h-5 text-emerald-500" />
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
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 border border-emerald-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {processingStatus || "Extracting..."}
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Extract Text
                </>
              )}
            </motion.button>

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
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 relative z-10" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">Analyzing Document</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  Our AI is reading the text and preserving formatting...
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
                {(extractedData.title || extractedData.date || extractedData.from || extractedData.to) && (
                  <div className="glass-card rounded-2xl border border-zinc-800 p-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileType className="w-3 h-3" />
                      Document Metadata
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.title && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Title</p>
                          <p className="font-medium text-zinc-200 text-sm truncate">{extractedData.title}</p>
                        </div>
                      )}
                      {extractedData.type && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Type</p>
                          <p className="font-medium capitalize text-zinc-200 text-sm">{extractedData.type}</p>
                        </div>
                      )}
                      {extractedData.date && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Date</p>
                          <p className="font-medium text-zinc-200 text-sm">{extractedData.date}</p>
                        </div>
                      )}
                      {extractedData.from && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">From</p>
                          <p className="font-medium text-zinc-200 text-sm truncate">{extractedData.from}</p>
                        </div>
                      )}
                      {extractedData.to && (
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">To</p>
                          <p className="font-medium text-zinc-200 text-sm truncate">{extractedData.to}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="glass-card rounded-3xl border border-zinc-800 p-1 overflow-hidden">
                  <div className="bg-zinc-900/50 border-b border-zinc-800 p-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Extracted Content
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-zinc-400 hover:text-white"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-zinc-400 hover:text-white"
                        title="Download as TXT"
                      >
                        <FileDown size={16} />
                      </button>
                      <div className="w-px h-8 bg-zinc-800 mx-1" />
                      <button
                        onClick={handleExportDocx}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition text-xs font-medium"
                        title="Export as DOCX"
                      >
                        DOCX
                      </button>
                      <button
                        onClick={handleExportPdf}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition text-xs font-medium"
                        title="Export as PDF"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-zinc-950/50 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-300 leading-relaxed">
                      {extractedData.content}
                    </pre>
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
                  Upload a document and click "Extract Text" to see the results here.
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
          }}
        />
      )}
    </div>
  );
}
