import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Database, Search, CheckCircle2, Play, FileCheck, ArrowRight } from 'lucide-react';
import ScrollToTop from './ScrollToTop';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const demoDocs = [
    { name: "SWIFT_Transaction_Log_2025.log", type: "Log", size: "2.4 MB" },
    { name: "NIST_800_53_Compliance_Audit.pdf", type: "Document", size: "4.1 MB" },
    { name: "Firewall_Traffic_Q3.txt", type: "Log", size: "128 KB" },
    { name: "User_Access_Review_Policy.docx", type: "Document", size: "1.2 MB" },
    { name: "PCI_DSS_Gap_Analysis_Report.pdf", type: "Document", size: "3.5 MB" },
    { name: "AWS_CloudTrail_Prod_Jan2025.json", type: "Log", size: "15.2 MB" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-gray-900 px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200">
              <img
                src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
                alt="InfoSec K2K"
                className="h-9 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
                SentraIQ
              </h1>
              <p className="text-[11px] uppercase font-semibold tracking-[0.15em] text-blue-900 opacity-90">
                Evidence Lakehouse
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-gray-700 hover:text-blue-900 transition-colors">Features</a>
            <a href="#demo" className="text-sm font-semibold text-gray-700 hover:text-blue-900 transition-colors">Demo Data</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-xs font-medium text-blue-700 tracking-wide uppercase">Live Demo Environment Available</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                    The Hybrid Evidence <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600">Lakehouse for Compliance</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed font-light">
                    Ingest logs and documents, query with natural language, and generate audit-ready assurance packs in minutes, not weeks.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/generate')}
                        className="px-8 py-4 bg-blue-900 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Launch Live Demo
                    </button>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Demo Documents Preview */}
      <section id="demo" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-16 items-center">
                <div className="flex-1 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Pre-loaded with Real-world Evidence</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Don't have data handy? Our demo environment comes pre-populated with sanitized banking logs, security policies, and audit trails so you can experience the power of SentraIQ immediately.
                    </p>
                    <ul className="space-y-5">
                        <li className="flex items-start gap-4">
                            <div className="p-1 rounded-full bg-blue-100 text-blue-700 mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-slate-900">Instant NLP Querying</span>
                                <span className="text-slate-600 text-sm">Ask questions in plain English, get technical answers.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-1 rounded-full bg-blue-100 text-blue-700 mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-slate-900">Pre-mapped Frameworks</span>
                                <span className="text-slate-600 text-sm">Automatic mapping to NIST, PCI-DSS, ISO 27001.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="p-1 rounded-full bg-blue-100 text-blue-700 mt-1">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block font-semibold text-slate-900">Assurance Packs</span>
                                <span className="text-slate-600 text-sm">One-click generation of evidence zip files.</span>
                            </div>
                        </li>
                    </ul>
                </div>
                
                {/* Floating Card Design */}
                <div className="flex-1 w-full relative">
                    {/* Decorative Blob behind card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-cyan-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    
                    <div className="relative bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.1)] border border-gray-200 ring-1 ring-slate-900/5">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <span className="block font-bold text-slate-900">Evidence Lakehouse</span>
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Preview</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {demoDocs.map((doc, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100 cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${doc.type === 'Log' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                            {doc.type === 'Log' ? <Database className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{doc.name}</div>
                                            <div className="text-xs text-slate-400 flex items-center gap-2">
                                                <span>{doc.type}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-blue-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Applications</span>
                <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Real-World Use Cases</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    From compliance audits to security investigations, SentraIQ streamlines evidence management for payment systems.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">🏦 PCI-DSS Compliance</h3>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">Audit</div>
                    </div>
                    <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                        Ingest firewall logs and access policies. Query naturally: <span className="italic text-slate-900 bg-slate-100 px-1 rounded">"Show me MFA logs for Q3 2025"</span>. Generate assurance packs for PCI-DSS 4.0 reqs 8.3 & 10.2 automatically.
                    </p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800">
                        See example report <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">🔍 Incident Investigation</h3>
                         <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase">Forensics</div>
                    </div>
                    <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                        Unusual SWIFT patterns? Upload transaction logs. Query: <span className="italic text-slate-900 bg-slate-100 px-1 rounded">"Find failed logins followed by success from IP 10.x"</span>. Build a timeline for incident response instantly.
                    </p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800">
                        View forensic timeline <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">📋 NIST 800-53 Validation</h3>
                         <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">Governance</div>
                    </div>
                    <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                        Regulator inquiry? Ingest backups and policies. Ask: <span className="italic text-slate-900 bg-slate-100 px-1 rounded">"Which controls satisfy AC-2 & AU-12?"</span>. Export a control matrix with direct evidence links.
                    </p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800">
                        Explore control matrix <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-slate-900">⚡ Rapid ISO 27001 Response</h3>
                         <div className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full uppercase">Speed</div>
                    </div>
                    <p className="text-slate-700 mb-6 text-sm leading-relaxed">
                        48-hour deadline? Don't panic. Query your lakehouse: <span className="italic text-slate-900 bg-slate-100 px-1 rounded">"Show logging procedures for A.12.4.1"</span>. Cut evidence collection time by 90%.
                    </p>
                    <a href="#" className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800">
                        See speed comparison <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Three Powerful Layers</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    SentraIQ combines ingestion, evidence management, and assurance generation into one seamless platform.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform">
                        <Database className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1. Ingestion</h3>
                    <p className="text-slate-700 leading-relaxed">
                        Upload logs and documents from any source. Our intelligent parser handles JSON, PDF, Log, and TXT formats automatically.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-sky-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-200/50 group-hover:scale-110 transition-transform">
                        <Search className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2. Evidence</h3>
                    <p className="text-slate-700 leading-relaxed">
                        Query your data with natural language. Our NLP engine understands complex compliance context and returns relevant evidence.
                    </p>
                </div>
                <div className="p-8 bg-slate-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all group">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform">
                        <FileCheck className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">3. Assurance</h3>
                    <p className="text-slate-700 leading-relaxed">
                        Generate audit-ready assurance packs. Map evidence directly to framework controls and export in one click.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        {/* Modern "Smart Blue" Background Elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[80%] rounded-full bg-blue-800/20 blur-[120px] mix-blend-screen animate-pulse"></div>
            <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen"></div>
            <div className="absolute bottom-0 left-1/3 w-[40%] h-[40%] rounded-full bg-indigo-900/40 blur-[100px] mix-blend-screen"></div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.9),rgba(15,23,42,0.95)),url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Compliance Process?</h2>
            <p className="text-xl text-blue-200 mb-10 font-light">
                Join organizations using SentraIQ to streamline evidence management and accelerate audit readiness.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/generate')}
                    className="px-8 py-4 bg-white text-blue-950 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2"
                >
                    <Play className="w-5 h-5 fill-current" />
                    Try Live Demo
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-blue-200 py-12 relative overflow-hidden">
        {/* Modern "Smart Blue" Background Elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[80%] rounded-full bg-blue-800/20 blur-[120px] mix-blend-screen animate-pulse"></div>
            <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen"></div>
            <div className="absolute bottom-0 left-1/3 w-[40%] h-[40%] rounded-full bg-indigo-900/40 blur-[100px] mix-blend-screen"></div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.9),rgba(15,23,42,0.95)),url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="bg-gray-900 px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200">
                        <img
                            src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
                            alt="InfoSec K2K"
                            className="h-9 object-contain"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-0.5">
                        <h1 className="text-2xl font-bold text-white leading-tight tracking-tight">
                            SentraIQ
                        </h1>
                        <p className="text-[11px] uppercase font-semibold tracking-[0.15em] text-cyan-300 opacity-90">
                            Evidence Lakehouse
                        </p>
                    </div>
                </div>
                <div className="flex gap-6 text-sm">
                    <a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="text-blue-200 hover:text-white transition-colors">Contact Support</a>
                </div>
                <p className="text-sm text-blue-300">© 2026 SentraIQ by InfoSec K2K. All rights reserved.</p>
            </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;