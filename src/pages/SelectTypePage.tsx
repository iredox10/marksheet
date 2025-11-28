import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Table2,
  StickyNote,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const documentTypes = [
  {
    id: "table",
    icon: Table2,
    title: "Tables & Marksheets",
    description: "Extract structured data from marksheets, invoices, receipts, or any tabular document into Excel/CSV.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "group-hover:border-violet-500/50",
    glow: "group-hover:shadow-violet-500/20",
    link: "/app/table",
  },
  {
    id: "notes",
    icon: StickyNote,
    title: "Notes & Letters",
    description: "Extract plain text from handwritten notes, letters, memos, or documents into Word/PDF.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "group-hover:border-emerald-500/50",
    glow: "group-hover:shadow-emerald-500/20",
    link: "/app/notes",
  },
];

export function SelectTypePage() {
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
              to="/"
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

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>Select Extraction Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            What would you like to <span className="gradient-text">extract?</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Choose the specialized AI model best suited for your document type.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {documentTypes.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
            >
              <Link
                to={type.link}
                className={`block h-full glass-card rounded-3xl p-10 border border-zinc-800 hover:bg-zinc-900/50 transition-all duration-300 group hover:scale-[1.02] ${type.border} hover:shadow-2xl ${type.glow}`}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-16 h-16 ${type.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className={`w-8 h-8 ${type.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-zinc-100 group-hover:text-white transition-colors">
                    {type.title}
                  </h3>
                  
                  <p className="text-zinc-400 mb-8 leading-relaxed flex-grow">
                    {type.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50 group-hover:border-zinc-700/50 transition-colors">
                    <span className={`text-sm font-medium ${type.color}`}>
                      Launch Model
                    </span>
                    <div className={`w-8 h-8 rounded-full ${type.bg} flex items-center justify-center group-hover:translate-x-2 transition-transform`}>
                      <ArrowRight className={`w-4 h-4 ${type.color}`} />
                    </div>
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
          className="mt-16 text-center"
        >
          <div className="inline-block p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
            <p className="text-zinc-500 text-sm">
              <span className="text-zinc-300 font-medium">Pro Tip:</span> Use "Tables & Marksheets" for anything with rows and columns.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
