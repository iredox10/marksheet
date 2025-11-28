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
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast OCR",
    description: "Powered by LLaMA Vision for instant, accurate text extraction.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: FileSpreadsheet,
    title: "Smart Export",
    description: "Convert unstructured data into clean Excel, CSV, or Word formats.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Client-side processing ensures your documents never leave your control.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drag & drop any document",
  },
  {
    icon: Sparkles,
    title: "Process",
    description: "AI analyzes structure",
  },
  {
    icon: Download,
    title: "Export",
    description: "Get structured data",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden selection:bg-violet-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="hero-glow" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">DocuScan</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
              How it works
            </a>
          </div>
          <Link
            to="/app"
            className="bg-white text-zinc-950 px-5 py-2 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Gen AI Document Processing</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Turn images into
            <br />
            <span className="gradient-text">structured data</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Stop manual data entry. Instantly convert marksheets, invoices, and tables into editable Excel, Word, and CSV files with AI precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-8 py-4 rounded-full text-lg font-semibold hover:bg-zinc-200 transition-all shadow-xl shadow-white/10 group"
            >
              Start Extracting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-medium text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 backdrop-blur-sm transition-all"
            >
              View Demo
            </a>
          </motion.div>
        </div>

        {/* App Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-24 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20" />
          <div className="glass-card rounded-2xl p-2 relative overflow-hidden">
            <div className="bg-zinc-950/80 rounded-xl border border-zinc-800/50 overflow-hidden">
              {/* Mock UI Header */}
              <div className="h-12 border-b border-zinc-800/50 flex items-center px-4 gap-2 bg-zinc-900/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="ml-4 px-3 py-1 rounded-md bg-zinc-800/50 text-xs text-zinc-500 font-mono flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  docuscan-secure-session
                </div>
              </div>
              
              {/* Mock UI Body */}
              <div className="p-8 grid md:grid-cols-2 gap-8">
                {/* Left: Upload Area */}
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-zinc-900/20 min-h-[300px]">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                    <Upload className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-medium mb-2">Drop marksheet here</p>
                  <p className="text-sm text-zinc-600">Supports JPG, PNG, PDF</p>
                </div>

                {/* Right: Extraction Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-400">Extracted Data</h3>
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">98% Accuracy</span>
                  </div>
                  
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-500">
                          0{i}
                        </div>
                        <div>
                          <div className="h-2 w-24 bg-zinc-800 rounded mb-2" />
                          <div className="h-2 w-16 bg-zinc-800/50 rounded" />
                        </div>
                      </div>
                      <div className="h-2 w-12 bg-violet-500/20 rounded" />
                    </div>
                  ))}
                  
                  <div className="pt-4 flex gap-3">
                    <div className="h-10 flex-1 bg-emerald-600/20 border border-emerald-600/30 rounded-lg flex items-center justify-center text-sm text-emerald-400 font-medium">
                      Export Excel
                    </div>
                    <div className="h-10 flex-1 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-sm text-zinc-400">
                      Copy Text
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything you need
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
              Powerful features wrapped in a simple, intuitive interface.
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
                className="glass-card rounded-3xl p-8 hover:bg-white/5 transition-colors group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-100">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 border-t border-zinc-900 bg-zinc-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                From image to Excel in seconds
              </h2>
              <p className="text-zinc-400 text-lg mb-12">
                Our advanced AI vision model understands document structure just like a human would, but processes it instantly.
              </p>
              
              <div className="space-y-8">
                {steps.map((step, idx) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-violet-400 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100 mb-1">{step.title}</h3>
                      <p className="text-zinc-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl rounded-full" />
              <div className="glass-card rounded-2xl p-8 relative">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-zinc-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="glass-card rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Ready to automate?
              </h2>
              <p className="text-zinc-400 mb-10 max-w-xl mx-auto text-lg">
                Join thousands of users saving hours on data entry. No credit card required.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 bg-white text-zinc-950 px-10 py-5 rounded-full text-xl font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/10"
              >
                Launch App
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-zinc-100">DocuScan</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <p>© 2025 DocuScan</p>
            <a href="https://iredox.tech" className="hover:text-violet-400 transition-colors">
              Built by iredox.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
