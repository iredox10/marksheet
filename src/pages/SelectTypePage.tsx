import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Table2,
  StickyNote,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const documentTypes = [
  {
    id: "table",
    icon: Table2,
    title: "Tables & Marksheets",
    description: "Extract data from marksheets, invoices, receipts, or any tabular document",
    color: "purple",
    link: "/app/table",
  },
  {
    id: "notes",
    icon: StickyNote,
    title: "Notes & Letters",
    description: "Extract text from handwritten notes, letters, memos, or plain documents",
    color: "blue",
    link: "/app/notes",
  },
];

export function SelectTypePage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
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

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">What would you like to extract?</h1>
          <p className="text-gray-400 text-lg">
            Choose the type of document you want to process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {documentTypes.map((type, idx) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={type.link}
                className={`block glass-card rounded-2xl p-8 hover:border-${type.color}-500/50 transition group`}
              >
                <div className={`w-14 h-14 bg-${type.color}-500/20 rounded-2xl flex items-center justify-center mb-6`}>
                  <type.icon className={`w-7 h-7 text-${type.color}-400`} />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{type.title}</h3>
                <p className="text-gray-400 mb-6">{type.description}</p>
                <div className={`inline-flex items-center gap-2 text-${type.color}-400 group-hover:gap-3 transition-all`}>
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            Not sure which to choose?{" "}
            <span className="text-gray-400">
              Tables & Marksheets is best for structured data, Notes & Letters for plain text.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
