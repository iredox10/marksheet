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

/* Gemini extraction function - currently unused, kept for reference
async function extractNotes(
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

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" +
      apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) throw new Error("No response from AI");

  return parseJSONFromAI(textContent);
}
*/

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
          <h1 className="text-3xl font-bold mb-2">Extract Notes & Letters</h1>
          <p className="text-gray-400">
            Upload an image of handwritten or printed text
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
                  ? "border-blue-500 bg-blue-500/10"
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

            {/* Extraction Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card rounded-2xl p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">Groq AI Extraction</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Fast and accurate text extraction with smart formatting
                  </p>
                </div>
              </div>
            </motion.div>

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
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-400">Reading your document...</p>
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
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">
                      Document Info
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {extractedData.title && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Title</p>
                          <p className="font-medium">{extractedData.title}</p>
                        </div>
                      )}
                      {extractedData.type && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium capitalize">{extractedData.type}</p>
                        </div>
                      )}
                      {extractedData.date && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-medium">{extractedData.date}</p>
                        </div>
                      )}
                      {extractedData.from && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-500">From</p>
                          <p className="font-medium">{extractedData.from}</p>
                        </div>
                      )}
                      {extractedData.to && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-gray-500">To</p>
                          <p className="font-medium">{extractedData.to}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-400">
                      Extracted Text
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
                        title="Download as TXT"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={handleExportDocx}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-xs font-medium"
                        title="Export as DOCX"
                      >
                        DOCX
                      </button>
                      <button
                        onClick={handleExportPdf}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-xs font-medium"
                        title="Export as PDF"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-300">
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
                className="glass-card rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500">
                  Upload a document to see extracted text here
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
