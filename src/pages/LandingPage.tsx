import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  FileText,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Upload,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "AI-Powered OCR",
    description: "Extract data from any document using advanced AI vision models",
  },
  {
    icon: FileSpreadsheet,
    title: "Multiple Exports",
    description: "Download your data as Excel, Word, or CSV files instantly",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your documents are processed securely and never stored",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drop your marksheet or document image",
  },
  {
    icon: Sparkles,
    title: "Extract",
    description: "AI analyzes and extracts all data",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download in your preferred format",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" />
            <span className="font-semibold text-lg">DocuScan</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">
              How it works
            </a>
            <Link
              to="/app"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Powered by AI Vision
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Extract data from
            <br />
            <span className="gradient-text">any document</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Upload marksheets, invoices, or any tabular document. Our AI extracts
            the data and exports it to Excel, Word, or CSV in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition glow"
            >
              Start Extracting
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-medium transition"
            >
              See how it works
            </a>
          </motion.div>
        </div>

        {/* Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-5xl mx-auto mt-20"
        >
          <div className="glass-card rounded-2xl p-2 glow">
            <div className="bg-[hsl(var(--card))] rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white/5 rounded-lg p-4 h-48 flex items-center justify-center border border-white/10">
                  <div className="text-center text-gray-500">
                    <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Drop your document here</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-xs text-purple-400 mb-1">Total Score</p>
                    <p className="text-2xl font-bold">850/1000</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Subjects</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A complete solution for extracting and exporting document data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 hover:border-purple-500/50 transition"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three simple steps to extract your document data
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <step.icon className="w-8 h-8 text-purple-400" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-12 text-center glow"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Start extracting data from your documents in seconds. No signup required.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition"
            >
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span className="font-medium">DocuScan</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500">
            <p>© 2025 DocuScan. All rights reserved.</p>
            <span className="hidden md:inline">•</span>
            <p>
              Built by{" "}
              <a
                href="https://iredox.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition"
              >
                iredox.tech
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
