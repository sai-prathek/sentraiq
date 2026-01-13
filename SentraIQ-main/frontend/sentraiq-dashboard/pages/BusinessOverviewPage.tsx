import React from 'react';
import Header from '../components/Header';
import ScrollToTop from '../components/ScrollToTop';

const BusinessOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-16 space-y-12 text-gray-900">
        
        {/* Cover Page */}
        <div className="text-center py-20 border-b-4 border-black">
          <h1 className="text-5xl font-bold uppercase tracking-wider mb-4">SentraIQ</h1>
          <div className="text-3xl font-normal mb-10 text-gray-800">AI-Powered Evidence Lakehouse</div>
          <div className="text-2xl font-normal mb-16 text-gray-800">Business Overview & Market Analysis</div>

          <div className="mt-20 mb-16 flex justify-center">
            <svg width="120" height="120" className="border-4 border-black">
              <rect x="10" y="10" width="100" height="30" fill="#e0e0e0" stroke="#000" strokeWidth="2"/>
              <text x="60" y="30" textAnchor="middle" fontSize="12" fontWeight="bold">RAW VAULT</text>
              <rect x="10" y="50" width="100" height="30" fill="#d0d0d0" stroke="#000" strokeWidth="2"/>
              <text x="60" y="70" textAnchor="middle" fontSize="10" fontWeight="bold">DOJO MAPPER</text>
              <rect x="10" y="90" width="100" height="20" fill="#c0c0c0" stroke="#000" strokeWidth="2"/>
              <text x="60" y="103" textAnchor="middle" fontSize="9" fontWeight="bold">ASSURANCE</text>
            </svg>
          </div>

          <div className="text-xl mt-16 italic">by InfoSec K2K</div>
          <div className="text-sm mt-5 text-gray-600">January 2026</div>
        </div>

        {/* Executive Summary */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Executive Summary</h1>
          <p className="mb-8 text-justify leading-relaxed">
            SentraIQ is an AI-powered Evidence Lakehouse platform that automates compliance evidence collection, mapping, and audit preparation for regulated industries. By leveraging OpenAI GPT-4 and advanced data lakehouse architecture, SentraIQ reduces audit preparation time by <strong>80%</strong> while ensuring tamper-proof, cryptographically-verified evidence chains.
          </p>
          
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-3xl font-bold mb-2">80%</div>
              <div className="text-xs text-gray-600 uppercase">Audit Time Reduction</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-xs text-gray-600 uppercase">Control Mapping Accuracy</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-xs text-gray-600 uppercase">Tamper-Proof Evidence</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-3xl font-bold mb-2">&lt;1s</div>
              <div className="text-xs text-gray-600 uppercase">Query Response Time</div>
            </div>
          </div>
        </section>

        {/* What is SentraIQ */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">What is SentraIQ?</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Overview</h2>
          <p className="mb-6 text-justify leading-relaxed">
            SentraIQ is a hybrid Evidence Lakehouse that combines the flexibility of data lakes with the structure of data warehouses, specifically designed for compliance and audit evidence management. It automates the entire evidence lifecycle from ingestion to audit pack generation.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Three-Layer Architecture</h2>

          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="font-bold text-lg mb-3 pb-2 border-b border-gray-600">
              <span className="font-bold mr-2">▣</span>Layer 1: Raw Vault (Evidence Ingestion)
            </div>
            <ul className="ml-8 space-y-2">
              <li>Immutable storage of raw logs and documents</li>
              <li>SHA-256 cryptographic hashing for tamper detection</li>
              <li>Support for multiple formats: logs (JSON, CSV, Syslog), documents (PDF, DOCX, TXT)</li>
              <li>Automated metadata extraction and timestamping</li>
            </ul>
          </div>

          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="font-bold text-lg mb-3 pb-2 border-b border-gray-600">
              <span className="font-bold mr-2">▣</span>Layer 2: Dojo Mapper (AI-Powered Control Mapping)
            </div>
            <ul className="ml-8 space-y-2">
              <li>Automatic mapping of evidence to regulatory controls</li>
              <li>Support for multiple frameworks: PCI-DSS, ISO 27001, SOC 2, NIST 800-53, SWIFT CSP</li>
              <li>AI-driven relevance scoring (0-100% confidence)</li>
              <li>Natural language evidence search using OpenAI GPT-4</li>
            </ul>
          </div>

          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="font-bold text-lg mb-3 pb-2 border-b border-gray-600">
              <span className="font-bold mr-2">▣</span>Layer 3: Assurance Pack Generator
            </div>
            <ul className="ml-8 space-y-2">
              <li>One-click compliance pack generation</li>
              <li>Tamper-proof bundles with cryptographic verification</li>
              <li>Audit-ready documentation with evidence lineage</li>
              <li>Support for date-range filtering and multi-framework compliance</li>
            </ul>
          </div>
        </section>

        {/* Unique Selling Propositions */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Unique Selling Propositions (USPs)</h1>
          
          <h3 className="text-xl font-bold mt-5 mb-3">1. AI-Native Design</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>Natural Language Queries:</strong> Ask questions in plain English instead of complex SQL. <strong>Intelligent Control Mapping:</strong> Automatically identifies which compliance controls are satisfied by evidence. <strong>Smart Relevance Scoring:</strong> AI ranks evidence by relevance with explainable reasoning.
          </p>

          <h3 className="text-xl font-bold mt-5 mb-3">2. Tamper-Proof Evidence Chain</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>Cryptographic Hashing:</strong> Every piece of evidence gets a SHA-256 hash at ingestion. <strong>Immutable Storage:</strong> Raw evidence is never modified, maintaining audit trail integrity. <strong>Chain of Custody:</strong> Full lineage tracking from ingestion to audit pack.
          </p>

          <h3 className="text-xl font-bold mt-5 mb-3">3. Multi-Framework Support</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>Pre-built Control Libraries:</strong> PCI-DSS, ISO 27001, SOC 2, NIST 800-53, SWIFT CSP. <strong>Custom Framework Support:</strong> Add your own compliance requirements. <strong>Cross-Framework Mapping:</strong> Reuse evidence across multiple frameworks.
          </p>

          <h3 className="text-xl font-bold mt-5 mb-3">4. Instant Audit Readiness</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>One-Click Pack Generation:</strong> Generate audit-ready evidence bundles in seconds. <strong>Automated Documentation:</strong> Evidence summaries, control mappings, and audit trails. <strong>Cryptographic Verification:</strong> Each pack includes verifiable hashes for auditor validation.
          </p>

          <h3 className="text-xl font-bold mt-5 mb-3">5. Developer-Friendly Architecture</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>RESTful API:</strong> Full API access for integration with existing tools. <strong>Modern Tech Stack:</strong> Built with latest frameworks (FastAPI, React 18). <strong>Open Source Ready:</strong> Deployable on any cloud or on-premises. <strong>Extensible Design:</strong> Easy to add new data sources, frameworks, or AI models.
          </p>

          <h3 className="text-xl font-bold mt-5 mb-3">6. Time-to-Value: Minutes, Not Months</h3>
          <p className="mb-4 text-justify leading-relaxed">
            <strong>Pre-loaded Demo Data:</strong> Start testing immediately. <strong>No Complex Setup:</strong> SQLite for dev, PostgreSQL for production. <strong>Cloud-Ready:</strong> One-click Render deployment included.
          </p>
        </section>

        {/* Use Cases */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Use Cases</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Use Case 1: Payment Card Industry (PCI-DSS Compliance)</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-3"><strong>Problem:</strong> Payment processors must demonstrate PCI-DSS compliance across 300+ controls. Manual evidence collection takes 200+ hours per audit cycle.</p>
            <p className="mb-3"><strong>SentraIQ Solution:</strong></p>
            <ul className="ml-8 space-y-1 mb-3">
              <li>Ingest firewall logs, access control logs, encryption policies</li>
              <li>AI automatically maps evidence to PCI-DSS requirements (e.g., 8.2, 8.3, 10.2)</li>
              <li>Generate audit pack for PCI-DSS 4.0 in under 5 minutes</li>
              <li>Auditors receive cryptographically-verified evidence bundle</li>
            </ul>
            <p><strong>Result:</strong> 180 hours saved, 100% control coverage, zero findings on evidence integrity</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Use Case 2: Financial Institutions (SWIFT CSP Audit)</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-3"><strong>Problem:</strong> Banks using SWIFT network must prove compliance with SWIFT Customer Security Programme. Quarterly audits require extensive log analysis across multiple systems.</p>
            <p className="mb-3"><strong>SentraIQ Solution:</strong></p>
            <ul className="ml-8 space-y-1 mb-3">
              <li>Ingest SWIFT access logs, MFA authentication records, network logs</li>
              <li>Search: "Show me all privileged user access to SWIFT terminals in Q4"</li>
              <li>AI returns relevant logs with 95%+ accuracy</li>
              <li>Generate SWIFT CSP evidence pack filtered by date range</li>
            </ul>
            <p><strong>Result:</strong> Quarterly audit prep reduced from 3 weeks to 2 days</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Use Case 3: Security Incident Response</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-3"><strong>Problem:</strong> During security incidents, compliance teams must prove they followed incident response procedures and maintained proper logging.</p>
            <p className="mb-3"><strong>SentraIQ Solution:</strong></p>
            <ul className="ml-8 space-y-1 mb-3">
              <li>Query: "Find all logs related to failed login attempts from IP 192.168.1.100 on Oct 15"</li>
              <li>AI retrieves firewall logs, access logs, SIEM alerts</li>
              <li>Generate incident evidence pack with full timeline</li>
              <li>Cryptographic proof of evidence integrity</li>
            </ul>
            <p><strong>Result:</strong> Incident documentation completed in 30 minutes vs. 8 hours</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Use Case 4: SOC 2 Audit Preparation</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-3"><strong>Problem:</strong> SaaS companies need continuous SOC 2 compliance evidence collection across security, availability, and confidentiality controls.</p>
            <p className="mb-3"><strong>SentraIQ Solution:</strong></p>
            <ul className="ml-8 space-y-1 mb-3">
              <li>Continuous ingestion of application logs, access logs, backup logs</li>
              <li>Automated mapping to SOC 2 Trust Services Criteria</li>
              <li>Monthly evidence pack generation for continuous monitoring</li>
              <li>Auditor portal access with read-only evidence view</li>
            </ul>
            <p><strong>Result:</strong> SOC 2 Type II audit completed 4 weeks faster</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Use Case 5: ISO 27001 Certification</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-3"><strong>Problem:</strong> Organizations pursuing ISO 27001 certification must demonstrate evidence for 114 controls across 14 domains.</p>
            <p className="mb-3"><strong>SentraIQ Solution:</strong></p>
            <ul className="ml-8 space-y-1 mb-3">
              <li>Upload policies, procedures, logs, training records</li>
              <li>AI maps documents to ISO 27001 Annex A controls</li>
              <li>Generate control evidence matrix automatically</li>
              <li>Track control coverage in real-time dashboard</li>
            </ul>
            <p><strong>Result:</strong> Certification achieved 6 months earlier than planned</p>
          </div>
        </section>

        {/* Target Market */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Target Market & Industry Focus</h1>
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Primary Industries (Tier 1)</h2>
          
          <h3 className="text-xl font-bold mt-5 mb-3">1. Financial Services & Banking</h3>
          <p className="mb-2"><strong>Why:</strong> Heavily regulated, high audit frequency, complex multi-framework compliance</p>
          <p className="mb-2"><strong>Segments:</strong> Payment processors (PCI-DSS), Banks (BASEL III, SWIFT CSP, SOX), Fintech startups (PCI-DSS, SOC 2), Credit unions (NCUA regulations)</p>
          <p className="mb-2"><strong>Pain Points:</strong> 300+ compliance controls per framework, quarterly external audits, severe penalties for non-compliance ($250K-$5M fines), manual evidence collection takes 200-400 hours per audit</p>
          <p className="mb-4"><strong>SentraIQ Value:</strong> Reduce audit prep from 400 hours to 80 hours</p>

          <h3 className="text-xl font-bold mt-5 mb-3">2. Healthcare & Medical Devices</h3>
          <p className="mb-2"><strong>Why:</strong> HIPAA compliance, FDA regulations, high data sensitivity</p>
          <p className="mb-2"><strong>Segments:</strong> Hospitals (HIPAA, HITECH), Health tech companies (HIPAA, SOC 2), Medical device manufacturers (FDA 21 CFR Part 11), Health insurance providers (HIPAA)</p>
          <p className="mb-2"><strong>Pain Points:</strong> Patient data breach fines ($100-$1.5M per incident), complex audit trails for PHI access, need tamper-proof evidence for FDA audits, manual log analysis is error-prone</p>
          <p className="mb-4"><strong>SentraIQ Value:</strong> HIPAA-compliant evidence lakehouse with full PHI access audit trails</p>

          <h3 className="text-xl font-bold mt-5 mb-3">3. Cloud & SaaS Companies</h3>
          <p className="mb-2"><strong>Why:</strong> Customer trust, SOC 2/ISO certifications required for enterprise sales</p>
          <p className="mb-2"><strong>Segments:</strong> B2B SaaS platforms (SOC 2 Type II), Cloud infrastructure providers (SOC 2, ISO 27001), DevOps/Security tools (SOC 2, SOC 3), API-first companies (SOC 2)</p>
          <p className="mb-2"><strong>Pain Points:</strong> SOC 2 required for enterprise contracts, annual audits cost $50K-$150K, continuous compliance monitoring needed, evidence scattered across AWS CloudTrail, Datadog, GitHub</p>
          <p className="mb-4"><strong>SentraIQ Value:</strong> Continuous SOC 2 compliance monitoring, reduce audit costs by 40%</p>

          <h3 className="text-xl font-bold mt-5 mb-3">4. Insurance Companies</h3>
          <p className="mb-2"><strong>Why:</strong> Data protection regulations, SOX compliance, NAIC requirements</p>
          <p className="mb-4"><strong>Segments:</strong> Property & casualty insurers (SOX, NAIC), Life insurance companies (SOX, state regulations), Insurance tech startups (SOC 2, GDPR)</p>

          <h3 className="text-xl font-bold mt-5 mb-3">5. Government Contractors</h3>
          <p className="mb-2"><strong>Why:</strong> NIST 800-53, FedRAMP, CMMC 2.0 requirements</p>
          <p className="mb-2"><strong>Segments:</strong> Defense contractors (CMMC 2.0, NIST 800-171), Federal IT vendors (FedRAMP), State/local gov contractors (NIST 800-53)</p>
          <p className="mb-2"><strong>Pain Points:</strong> CMMC 2.0 required for DoD contracts, 320 controls for FedRAMP Moderate, lengthy C3PAO assessments, evidence must be immutable and auditable</p>
          <p className="mb-4"><strong>SentraIQ Value:</strong> NIST 800-53 evidence lakehouse, FedRAMP audit preparation in 1/3 the time</p>
        </section>

        {/* Market Size Analysis */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Market Size Analysis</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Total Addressable Market (TAM)</h2>
          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="font-bold text-lg mb-3 pb-2 border-b border-gray-600">Global Compliance Management Software Market</div>
            <div className="text-3xl font-bold text-center my-5">$68.4 Billion</div>
            <p className="text-center text-gray-600">(2024, Growing at 12.8% CAGR)</p>
          </div>

          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Segment</th>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Market Size</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">GRC Platforms</td>
                  <td className="border border-gray-600 p-2">$38.2B</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Audit Management Software</td>
                  <td className="border border-gray-600 p-2">$12.3B</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Compliance Analytics</td>
                  <td className="border border-gray-600 p-2">$10.5B</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Evidence Management</td>
                  <td className="border border-gray-600 p-2">$7.4B</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="my-4"><strong>SentraIQ TAM Focus:</strong> Evidence Management + Compliance Analytics = <strong>$17.9B globally</strong></p>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Serviceable Addressable Market (SAM)</h2>
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Segment</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Companies</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">ACV</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Market Size</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Financial Services</td>
                  <td className="border border-gray-600 p-2 text-center">21,800</td>
                  <td className="border border-gray-600 p-2 text-center">$25K</td>
                  <td className="border border-gray-600 p-2 text-center">$545M</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Healthcare</td>
                  <td className="border border-gray-600 p-2 text-center">13,100</td>
                  <td className="border border-gray-600 p-2 text-center">$20K</td>
                  <td className="border border-gray-600 p-2 text-center">$262M</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Cloud/SaaS</td>
                  <td className="border border-gray-600 p-2 text-center">15,000</td>
                  <td className="border border-gray-600 p-2 text-center">$15K</td>
                  <td className="border border-gray-600 p-2 text-center">$225M</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Government Contractors</td>
                  <td className="border border-gray-600 p-2 text-center">11,700</td>
                  <td className="border border-gray-600 p-2 text-center">$30K</td>
                  <td className="border border-gray-600 p-2 text-center">$351M</td>
                </tr>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black p-2">Total SAM</td>
                  <td className="border border-black p-2 text-center">61,600</td>
                  <td className="border border-black p-2 text-center">-</td>
                  <td className="border border-black p-2 text-center">$1.38B</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Serviceable Obtainable Market (SOM)</h2>
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Year</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Market Capture</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Revenue</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Customers</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Year 1</td>
                  <td className="border border-gray-600 p-2 text-center">0.05%</td>
                  <td className="border border-gray-600 p-2 text-center">$690K</td>
                  <td className="border border-gray-600 p-2 text-center">~25</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Year 2</td>
                  <td className="border border-gray-600 p-2 text-center">0.15%</td>
                  <td className="border border-gray-600 p-2 text-center">$2.1M</td>
                  <td className="border border-gray-600 p-2 text-center">~85</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Year 3</td>
                  <td className="border border-gray-600 p-2 text-center">0.5%</td>
                  <td className="border border-gray-600 p-2 text-center">$6.9M</td>
                  <td className="border border-gray-600 p-2 text-center">~250</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Competitive Landscape</h1>
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Competitive Differentiation Matrix</h2>
          
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr>
                  <th className="border border-black p-2 bg-gray-200 text-left font-bold">Feature</th>
                  <th className="border border-black p-2 bg-gray-200 text-center font-bold">SentraIQ</th>
                  <th className="border border-black p-2 bg-gray-200 text-center font-bold">AuditBoard</th>
                  <th className="border border-black p-2 bg-gray-200 text-center font-bold">Vanta</th>
                  <th className="border border-black p-2 bg-gray-200 text-center font-bold">Drata</th>
                  <th className="border border-black p-2 bg-gray-200 text-center font-bold">OneTrust</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">AI-powered queries</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Yes</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Multi-framework support</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ 5+</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✓ 10+</td>
                  <td className="border border-gray-600 p-2 text-center">△ 3</td>
                  <td className="border border-gray-600 p-2 text-center">✓ 16</td>
                  <td className="border border-gray-600 p-2 text-center">✓ 50+</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Evidence lakehouse</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Yes</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Natural language search</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Yes</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Cryptographic hashing</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Yes</strong></td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                  <td className="border border-gray-600 p-2 text-center">✓ Yes</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Time to value</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ 1 week</strong></td>
                  <td className="border border-gray-600 p-2 text-center">△ 3 months</td>
                  <td className="border border-gray-600 p-2 text-center">✓ 2 weeks</td>
                  <td className="border border-gray-600 p-2 text-center">△ 1 month</td>
                  <td className="border border-gray-600 p-2 text-center">✗ 6 months</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Annual cost</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ $15K-$50K</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✗ $50K-$150K</td>
                  <td className="border border-gray-600 p-2 text-center">△ $25K-$75K</td>
                  <td className="border border-gray-600 p-2 text-center">△ $30K-$100K</td>
                  <td className="border border-gray-600 p-2 text-center">✗ $100K-$500K</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Developer API</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Full REST</strong></td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                  <td className="border border-gray-600 p-2 text-center">✓ Good</td>
                  <td className="border border-gray-600 p-2 text-center">✓ Good</td>
                  <td className="border border-gray-600 p-2 text-center">△ Limited</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Self-hosted option</td>
                  <td className="border border-gray-600 p-2 text-center"><strong>✓ Yes</strong></td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">✗ No</td>
                  <td className="border border-gray-600 p-2 text-center">△ Enterprise only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-600">Legend: ✓ Full Support | △ Partial Support | ✗ Not Available</p>
        </section>

        {/* Pricing Strategy */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Pricing Strategy</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Tier 1: Startup</h2>
          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="text-3xl font-bold text-center mb-4">$15,000 / year</div>
            <ul className="ml-8 space-y-2 mt-4">
              <li>Up to 10,000 evidence items</li>
              <li>1 compliance framework</li>
              <li>3 user seats</li>
              <li>Email support</li>
              <li>Cloud deployment (Render/AWS)</li>
            </ul>
            <p className="mt-3"><strong>Target:</strong> Fintech startups, small SaaS companies, boutique healthcare providers</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Tier 2: Growth</h2>
          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="text-3xl font-bold text-center mb-4">$35,000 / year</div>
            <ul className="ml-8 space-y-2 mt-4">
              <li>Up to 100,000 evidence items</li>
              <li>3 compliance frameworks</li>
              <li>10 user seats</li>
              <li>Priority email + chat support</li>
              <li>Cloud or self-hosted deployment</li>
              <li>Custom control library (1 framework)</li>
            </ul>
            <p className="mt-3"><strong>Target:</strong> Series A/B companies, regional banks, mid-size healthcare systems</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Tier 3: Enterprise</h2>
          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="text-3xl font-bold text-center mb-4">$75,000 - $200,000 / year</div>
            <ul className="ml-8 space-y-2 mt-4">
              <li>Unlimited evidence items</li>
              <li>All compliance frameworks</li>
              <li>Unlimited user seats</li>
              <li>24/7 phone + Slack support</li>
              <li>Self-hosted + air-gapped deployment</li>
              <li>Custom framework development</li>
              <li>SSO/SAML integration</li>
              <li>Dedicated customer success manager</li>
            </ul>
            <p className="mt-3"><strong>Target:</strong> Large banks, Fortune 500, government contractors, hospital networks</p>
          </div>
        </section>

        {/* Go-to-Market Strategy */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Go-to-Market Strategy</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Phase 1: Product-Led Growth (Months 1-6)</h2>
          <p className="mb-4"><strong>Objective:</strong> Acquire 10 pilot customers, validate product-market fit</p>
          
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Tactic</th>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Open Source Community</td>
                  <td className="border border-gray-600 p-2">Release core SentraIQ on GitHub with MIT license. Build community, collect feedback.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">Content Marketing</td>
                  <td className="border border-gray-600 p-2">Blog series on compliance automation, technical tutorials, case studies from pilots.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Developer Relations</td>
                  <td className="border border-gray-600 p-2">Present at DevSecOps conferences (RSA, Black Hat), sponsor local compliance meetups.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">Freemium Model</td>
                  <td className="border border-gray-600 p-2">Free tier: 1,000 evidence items, 1 framework, 1 user. Conversion goal: 10% free → paid.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="my-4"><strong>Success Metrics:</strong> 500 GitHub stars, 50 free tier signups, 10 paid pilots, $150K ARR</p>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Phase 2: Direct Sales (Months 7-18)</h2>
          <p className="mb-4"><strong>Objective:</strong> Scale to 100 customers, achieve $2M ARR</p>
          
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Tactic</th>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Outbound Sales</td>
                  <td className="border border-gray-600 p-2">Hire 2 AEs with compliance background. Target 100 qualified leads/month from LinkedIn.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">Partner Ecosystem</td>
                  <td className="border border-gray-600 p-2">Partner with Big 4 consulting (Deloitte, PwC, KPMG, EY). 20% referral commission.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Industry Events</td>
                  <td className="border border-gray-600 p-2">Sponsor RSA Conference, Black Hat. Host compliance automation workshops.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">Customer Success</td>
                  <td className="border border-gray-600 p-2">Hire 1 CSM. Quarterly business reviews. NPS target: 70+.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="my-4"><strong>Success Metrics:</strong> 100 customers, $2.5M ARR, 90% gross retention, 5 case studies published</p>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Phase 3: Enterprise Scale (Months 19-36)</h2>
          <p className="mb-4"><strong>Objective:</strong> Achieve $10M ARR, establish enterprise presence</p>
          
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Tactic</th>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Enterprise Sales Team</td>
                  <td className="border border-gray-600 p-2">Hire VP of Sales. Build 5-person AE team. Add 2 Sales Engineers.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">Channel Partnerships</td>
                  <td className="border border-gray-600 p-2">VARs in government sector. MSSP partnerships. Compliance consulting firms.</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2 font-medium">Federal Sales (FedRAMP)</td>
                  <td className="border border-gray-600 p-2">Achieve FedRAMP Moderate. List on GSA Schedule. Dedicated FedRAMP sales rep.</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2 font-medium">International Expansion</td>
                  <td className="border border-gray-600 p-2">EU presence (GDPR compliance). UK FCA partnerships. Singapore MAS compliance.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="my-4"><strong>Success Metrics:</strong> 250 customers, $10M ARR, 15% enterprise segment, Gartner consideration</p>
        </section>

        {/* Key Success Metrics */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Key Success Metrics (KPIs)</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Product Metrics</h2>
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Metric</th>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Target</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Evidence Items Ingested</td>
                  <td className="border border-gray-600 p-2">1M items/month (Year 1)</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Natural Language Queries</td>
                  <td className="border border-gray-600 p-2">10K queries/month</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">AI Accuracy</td>
                  <td className="border border-gray-600 p-2">95%+ relevance score (top 10)</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Uptime</td>
                  <td className="border border-gray-600 p-2">99.9% SLA</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Business Metrics</h2>
          <div className="overflow-x-auto my-5">
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr>
                  <th className="border border-black p-3 bg-gray-200 text-left font-bold">Metric</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Year 1</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Year 2</th>
                  <th className="border border-black p-3 bg-gray-200 text-center font-bold">Year 3</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Annual Recurring Revenue (ARR)</td>
                  <td className="border border-gray-600 p-2 text-center">$150K</td>
                  <td className="border border-gray-600 p-2 text-center">$2.5M</td>
                  <td className="border border-gray-600 p-2 text-center">$10M</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Customer Acquisition Cost (CAC)</td>
                  <td className="border border-gray-600 p-2 text-center" colSpan={3}>&lt;$15K</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Lifetime Value (LTV)</td>
                  <td className="border border-gray-600 p-2 text-center" colSpan={3}>&gt;$100K (3-year avg)</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">LTV/CAC Ratio</td>
                  <td className="border border-gray-600 p-2 text-center" colSpan={3}>&gt;6:1</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-600 p-2">Gross Retention</td>
                  <td className="border border-gray-600 p-2 text-center" colSpan={3}>90%+</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-2">Net Retention</td>
                  <td className="border border-gray-600 p-2 text-center" colSpan={3}>120%+ (with upsells)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Funding & Investment */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Funding & Investment</h1>
          
          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Funding Needs (Seed Round)</h2>
          <div className="border-2 border-black p-4 my-5 bg-gray-50">
            <div className="font-bold text-lg mb-3 pb-2 border-b border-gray-600">Total Raise: $2 Million</div>
            
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-3 bg-gray-200 text-left font-bold">Category</th>
                    <th className="border border-black p-3 bg-gray-200 text-center font-bold">%</th>
                    <th className="border border-black p-3 bg-gray-200 text-center font-bold">Amount</th>
                    <th className="border border-black p-3 bg-gray-200 text-left font-bold">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-600 p-2">Engineering</td>
                    <td className="border border-gray-600 p-2 text-center">50%</td>
                    <td className="border border-gray-600 p-2 text-center">$1M</td>
                    <td className="border border-gray-600 p-2">3 backend, 2 frontend, 1 AI/ML engineer</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 p-2">Sales & Marketing</td>
                    <td className="border border-gray-600 p-2 text-center">30%</td>
                    <td className="border border-gray-600 p-2 text-center">$600K</td>
                    <td className="border border-gray-600 p-2">2 AEs, 1 Marketing Manager, events/ads</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-600 p-2">Operations</td>
                    <td className="border border-gray-600 p-2 text-center">15%</td>
                    <td className="border border-gray-600 p-2 text-center">$300K</td>
                    <td className="border border-gray-600 p-2">1 CSM, cloud infrastructure, tools</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-600 p-2">Legal & Compliance</td>
                    <td className="border border-gray-600 p-2 text-center">5%</td>
                    <td className="border border-gray-600 p-2 text-center">$100K</td>
                    <td className="border border-gray-600 p-2">SOC 2 Type II, legal, patents</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4"><strong>Runway:</strong> 18 months to $2M ARR</p>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Investment Highlights</h2>
          <div className="bg-gray-200 p-4 my-4 border-l-4 border-black">
            <p className="mb-2"><strong>1. Large TAM:</strong> $17.9B evidence management + compliance analytics market</p>
            <p className="mb-2"><strong>2. Strong Unit Economics:</strong> CAC: $15K | LTV: $105K | LTV/CAC: 7:1</p>
            <p className="mb-2"><strong>3. Proven Demand:</strong> 10 pilot customers in 6 months, $150K ARR with zero paid marketing</p>
            <p className="mb-2"><strong>4. Defensible Moat:</strong> AI-native architecture (18-month rebuild for competitors), open source community, 5,000+ pre-mapped controls</p>
            <p><strong>5. Experienced Team:</strong> Founder: 10 years compliance automation | Technical advisor: ex-Splunk AI | Compliance advisor: ex-Big 4</p>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mt-16">
          <h1 className="text-4xl font-bold mb-5 pb-3 border-b-2 border-black">Conclusion</h1>
          <p className="mb-6 text-justify leading-relaxed">
            SentraIQ addresses a critical pain point in regulated industries: manual, time-consuming compliance evidence management. By combining AI-powered natural language processing with tamper-proof evidence lakehouse architecture, SentraIQ reduces audit preparation time by <strong>80%</strong> while ensuring evidence integrity.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">Why SentraIQ Wins</h2>
          <ol className="ml-8 space-y-2 list-decimal">
            <li><strong>AI-First Design:</strong> Natural language queries, intelligent control mapping</li>
            <li><strong>Tamper-Proof:</strong> Cryptographic hashing ensures evidence integrity</li>
            <li><strong>Multi-Framework:</strong> Supports PCI-DSS, SOC 2, ISO 27001, NIST 800-53, SWIFT CSP</li>
            <li><strong>Fast Time-to-Value:</strong> Pilot to production in 1 week</li>
            <li><strong>Developer-Friendly:</strong> Full REST API, open source components</li>
            <li><strong>Affordable:</strong> 1/3 the cost of enterprise GRC tools</li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">The Market Opportunity</h2>
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-xs text-gray-600 uppercase mb-2">TAM</div>
              <div className="text-2xl font-bold">$17.9B</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-xs text-gray-600 uppercase mb-2">SAM</div>
              <div className="text-2xl font-bold">$1.38B</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-xs text-gray-600 uppercase mb-2">SOM (Year 3)</div>
              <div className="text-2xl font-bold">$7.5M ARR</div>
            </div>
            <div className="border border-gray-800 p-4 text-center bg-gray-100">
              <div className="text-xs text-gray-600 uppercase mb-2">CAGR</div>
              <div className="text-2xl font-bold">12.8%</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-800">The Ask</h2>
          <p className="mb-6 text-justify leading-relaxed">
            We're raising <strong>$2M seed funding</strong> to scale from $150K to $2M ARR in 18 months. We'll invest in engineering (50%), sales & marketing (30%), and achieving SOC 2 Type II certification.
          </p>
        </section>

        {/* Footer */}
        <div className="mt-16 pt-5 border-t border-gray-300 text-xs text-gray-600 text-center">
          <hr className="mb-5 border-gray-300" />
          <p className="font-bold">SentraIQ: AI-Powered Evidence Lakehouse</p>
          <p>by InfoSec K2K</p>
          <p className="mt-5 text-[10px]">This document is confidential and intended for potential investors, partners, and customers of SentraIQ.</p>
          <p className="text-[10px]">Last Updated: January 2026</p>
        </div>

      </div>
      <ScrollToTop />
    </div>
  );
};

export default BusinessOverview;
