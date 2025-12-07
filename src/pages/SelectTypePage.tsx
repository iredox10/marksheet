import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Table2,
  StickyNote,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from "lucide-react";

const documentTypes = [
  {
    id: "table",
    icon: Table2,
    title: "Tables & Marksheets",
    description: "Extract structured data from marksheets, invoices, and tables.",
    link: "/app/table",
  },
  {
    id: "notes",
    icon: StickyNote,
    title: "Notes & Letters",
    description: "Extract plain text from handwritten notes and letters.",
    link: "/app/notes",
  },
  {
    id: "convert",
    icon: RefreshCw,
    title: "Document Converter",
    description: "Convert between PDF and Word formats preserving layout.",
    link: "/app/convert",
  },
];

export function SelectTypePage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">DOCUSCAN</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-neutral-400 text-xs uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" />
            <span>Select Mode</span>
          </div>
          <h1 className="text-5xl font-light mb-6 tracking-tight text-white">
            Extraction Type
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl font-light">
            Select the AI model optimized for your specific document layout.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {documentTypes.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
            >
              <Link
                to={type.link}
                className="block h-full bg-[#111111] p-10 hover:bg-[#1a1a1a] transition-colors group relative overflow-hidden"
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8 text-neutral-400 group-hover:text-white transition-colors">
                    <type.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-medium mb-2 text-white">
                    {type.title}
                  </h3>
                  
                  <p className="text-neutral-500 text-sm leading-relaxed mb-12 group-hover:text-neutral-400 transition-colors">
                    {type.description}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-3 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <span>INITIATE</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <p className="text-neutral-600 text-xs uppercase tracking-widest">
            Powered by Gemini 2.0 Flash
          </p>
        </motion.div>
      </div>
    </div>
  );
}
