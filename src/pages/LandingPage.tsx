import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Zap,
  Shield,
  ArrowRight,
  ChevronRight,
  Code,
  Layers,
  Cpu
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Vision Engine",
    description: "LLaMA-powered optical character recognition with sub-second latency.",
  },
  {
    icon: FileSpreadsheet,
    title: "Structured Output",
    description: "Direct conversion to industry-standard formats (XLSX, JSON, CSV).",
  },
  {
    icon: Shield,
    title: "Client-Side Privacy",
    description: "Zero-retention processing. Your data never persists on our servers.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <div className="w-2 h-2 bg-black" />
            </div>
            <span className="font-bold tracking-tight text-lg">DOCUSCAN</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Capabilities
            </a>
            <a href="#how-it-works" className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">
              Architecture
            </a>
          </div>
          <Link
            to="/app"
            className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            Launch
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 text-neutral-400 text-xs uppercase tracking-widest mb-8"
              >
                <Cpu className="w-3 h-3" />
                <span>V2.0 Model Active</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-6xl md:text-7xl font-light tracking-tighter mb-8 leading-[0.9] text-white"
              >
                UNSTRUCTURED
                <br />
                <span className="text-neutral-500">TO STRUCTURED</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-neutral-400 mb-12 leading-relaxed font-light max-w-md"
              >
                Automate data extraction pipelines with high-fidelity OCR. 
                Transform static documents into actionable datasets instantly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/app"
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                >
                  Start Extraction
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-3 border border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Documentation
                </a>
              </motion.div>
            </div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative hidden md:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800/20 to-transparent" />
              <div className="border border-white/10 bg-[#111111] p-1 relative">
                {/* Terminal-like Header */}
                <div className="h-8 border-b border-white/10 bg-[#1a1a1a] flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-neutral-600" />
                     <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">OUTPUT_PREVIEW.json</span>
                </div>
                
                {/* Code Preview */}
                <div className="p-6 font-mono text-xs md:text-sm text-neutral-400 space-y-2">
                  <div className="flex">
                    <span className="text-neutral-600 w-8">01</span>
                    <span className="text-blue-400">{"{"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">02</span>
                    <span className="pl-4 text-neutral-300">"status"</span>: <span className="text-emerald-400">"success"</span>,
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">03</span>
                    <span className="pl-4 text-neutral-300">"confidence"</span>: <span className="text-yellow-400">0.998</span>,
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">04</span>
                    <span className="pl-4 text-neutral-300">"data"</span>: <span className="text-blue-400">{"["}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">05</span>
                    <span className="pl-8 text-neutral-300">{"{"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">06</span>
                    <span className="pl-12 text-neutral-300">"student"</span>: <span className="text-white">"Alex Chen"</span>,
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">07</span>
                    <span className="pl-12 text-neutral-300">"grade"</span>: <span className="text-white">"A+"</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">08</span>
                    <span className="pl-8 text-neutral-300">{"}"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">09</span>
                    <span className="pl-4 text-blue-400">{"]"}</span>
                  </div>
                  <div className="flex">
                    <span className="text-neutral-600 w-8">10</span>
                    <span className="text-blue-400">{"}"}</span>
                  </div>
                  <div className="h-4 w-2 bg-white animate-pulse mt-2" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 border-l-2 border-white pl-6">
            <h2 className="text-3xl font-light mb-2 text-white">
              SYSTEM CAPABILITIES
            </h2>
            <p className="text-neutral-500 text-sm uppercase tracking-widest">
              Core processing modules
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#111111] p-10 hover:bg-[#161616] transition-colors group"
              >
                <div className="mb-8 text-neutral-500 group-hover:text-white transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium mb-4 text-white">{feature.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs / How it works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <div className="mb-12">
                <h2 className="text-3xl font-light mb-6">
                  PROCESSING PIPELINE
                </h2>
                <p className="text-neutral-400 leading-relaxed font-light">
                  Our architecture leverages advanced computer vision to decompose document layouts into semantic components before extraction.
                </p>
              </div>
              
              <div className="space-y-px bg-white/10 border border-white/10">
                {[
                  { title: "Ingestion", icon: Code, desc: "Multi-format support (PDF, PNG, JPG)" },
                  { title: "Analysis", icon: Layers, desc: "Layout segmentation & text detection" },
                  { title: "Extraction", icon: Cpu, desc: "Entity recognition & structured formatting" }
                ].map((step, idx) => (
                  <div key={step.title} className="flex items-center gap-6 p-6 bg-[#111111]">
                    <div className="text-xs font-mono text-neutral-600">0{idx + 1}</div>
                    <div className="text-neutral-400"><step.icon className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-white font-medium text-sm uppercase tracking-wide mb-1">{step.title}</h3>
                      <p className="text-neutral-500 text-xs">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative flex items-center justify-center bg-[#161616] border border-white/5">
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                    {[...Array(36)].map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/5" />
                    ))}
                </div>
                <div className="relative z-10 text-center">
                    <div className="text-6xl font-bold text-white/10 font-mono">API</div>
                    <div className="text-xs text-neutral-600 uppercase tracking-widest mt-2">Ready Architecture</div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/10 bg-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8 tracking-tight text-white">
            Deploy your extraction workflow.
          </h2>
          <Link
            to="/app"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            Launch Interface
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#111111]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white" />
            <span className="font-bold text-white tracking-tight text-sm">DOCUSCAN</span>
          </div>
          <div className="flex items-center gap-8 text-xs font-medium text-neutral-500 uppercase tracking-widest">
            <span>© 2025 DocuScan</span>
            <a href="https://iredox.tech" className="hover:text-white transition-colors">
              iredox.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}