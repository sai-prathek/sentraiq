import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Database, Search, CheckCircle2, Play, FileCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SentraIQ</span>
          </div>
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-300">
            <div className="bg-gray-900 px-3 py-1.5 rounded-lg">
              <img
                src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
                alt="InfoSec K2K"
                className="h-7 object-contain"
              />
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-purple-600">Features</a>
            <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-purple-600">Demo Data</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-purple-600">Documentation</a>
        </div>
        <button
            onClick={() => navigate('/dashboard/ingest')}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
            Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide mb-8">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    v2.0 Now Available
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                    The Hybrid Evidence <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Lakehouse for Compliance</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                    Ingest logs and documents, query with natural language, and generate audit-ready assurance packs in minutes, not weeks.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/ingest')}
                        className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        Launch Live Demo
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/ingest')}
                        className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                    >
                        Enter Workspace
                    </button>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Demo Documents Preview */}
      <section id="demo" className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">Pre-loaded with Real-world Evidence</h2>
                    <p className="text-lg text-gray-600">
                        Don't have data handy? Our demo environment comes pre-populated with sanitized banking logs, security policies, and audit trails so you can experience the power of SentraIQ immediately.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                            <span className="text-gray-700">Instant NLP Querying capability</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                            <span className="text-gray-700">Pre-mapped to NIST, PCI-DSS, ISO 27001</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                            <span className="text-gray-700">Generate downloadable Assurance Packs</span>
                        </li>
                    </ul>
                </div>
                <div className="flex-1">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <span className="font-bold text-gray-900">Sample Documents</span>
                        </div>
                        <div className="space-y-2">
                            {demoDocs.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                                            <FileCheck className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                            <div className="text-xs text-gray-500">{doc.type}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{doc.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Real-World Use Cases</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    From compliance audits to security investigations, SentraIQ streamlines evidence management for payment systems and financial institutions.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">🏦 PCI-DSS Compliance Audits</h3>
                    <p className="text-gray-700 mb-4">
                        <strong>Scenario:</strong> Your payment processor needs to demonstrate PCI-DSS 4.0 compliance during annual audit.
                    </p>
                    <p className="text-gray-600 text-sm">
                        <strong>Solution:</strong> Ingest firewall logs, access control policies, and encryption documentation. Ask in natural language: "Show me all MFA authentication logs for privileged users in Q3 2025". Generate audit-ready assurance packs mapped to PCI-DSS requirements 8.3, 10.2, and 12.3.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">🔍 Security Incident Investigation</h3>
                    <p className="text-gray-700 mb-4">
                        <strong>Scenario:</strong> Unusual SWIFT transaction patterns detected requiring immediate forensic analysis.
                    </p>
                    <p className="text-gray-600 text-sm">
                        <strong>Solution:</strong> Upload SWIFT access logs and transaction records. Query: "Find all failed authentication attempts followed by successful logins from same IP". Get chronological evidence timeline with source attribution for incident response teams.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">📋 NIST 800-53 Control Validation</h3>
                    <p className="text-gray-700 mb-4">
                        <strong>Scenario:</strong> Federal banking regulator requires evidence of NIST 800-53 rev 5 control implementation.
                    </p>
                    <p className="text-gray-600 text-sm">
                        <strong>Solution:</strong> Ingest audit logs, configuration backups, and policy documents. Ask: "Which controls have evidence for AC-2 (Account Management) and AU-12 (Audit Generation)?". Export comprehensive control family mappings.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">⚡ Rapid Audit Response</h3>
                    <p className="text-gray-700 mb-4">
                        <strong>Scenario:</strong> Auditor requests evidence for ISO 27001 controls A.9.4.1 and A.12.4.1 with 48-hour deadline.
                    </p>
                    <p className="text-gray-600 text-sm">
                        <strong>Solution:</strong> Query existing lakehouse: "Show me information system access restrictions and logging procedures". Generate ISO 27001-mapped assurance pack with evidence attribution in minutes instead of weeks of manual collection.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Three Powerful Layers</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    SentraIQ combines ingestion, evidence management, and assurance generation into one seamless platform.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Layer 1: Ingestion</h3>
                    <p className="text-gray-600">
                        Upload logs and documents from any source. Our intelligent parser handles various formats automatically.
                    </p>
                </div>
                <div className="p-8 border border-gray-200 rounded-2xl hover:border-pink-300 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Layer 2: Evidence</h3>
                    <p className="text-gray-600">
                        Query your data with natural language. Our NLP engine understands compliance questions and returns relevant evidence.
                    </p>
                </div>
                <div className="p-8 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Layer 3: Assurance</h3>
                    <p className="text-gray-600">
                        Generate audit-ready assurance packs mapped to frameworks like NIST 800-53, PCI-DSS, and ISO 27001.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Compliance Process?</h2>
            <p className="text-xl text-purple-100 mb-10">
                Join organizations using SentraIQ to streamline evidence management and accelerate audit readiness.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/ingest')}
                    className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
                >
                    <Play className="w-5 h-5 fill-current" />
                    Try Live Demo
                </button>
                <button
                    onClick={() => navigate('/dashboard/ingest')}
                    className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-all"
                >
                    Start Building
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-tr from-purple-600 to-pink-600 p-2 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">SentraIQ</span>
                    </div>
                    <div className="pl-4 border-l border-gray-700">
                        <div className="bg-white/10 px-3 py-1.5 rounded-lg">
                          <img
                            src="https://www.infoseck2k.com/wp-content/themes/infoseck/images/infosec-logo.png"
                            alt="InfoSec K2K"
                            className="h-6 object-contain"
                          />
                        </div>
                    </div>
                </div>
                <p className="text-sm">2025 SentraIQ by InfoSec K2K. Hybrid Evidence Lakehouse Platform.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
