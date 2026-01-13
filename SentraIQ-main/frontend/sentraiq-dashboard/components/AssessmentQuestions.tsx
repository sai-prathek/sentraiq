import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, FileCheck, Sparkles, Clock, FileX } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { EvidenceItem } from '../types';

export interface AssessmentAnswer {
  questionId: string;
  question: string;
  answer: 'yes' | 'no' | 'partial' | null;
  evidence: EvidenceItem[];
  evidenceIds: string[];
  notes: string;
  reason: string;
  gapType?: 'outdated' | 'missing' | 'insufficient' | null;
  gapReason?: string;
  autoAnswered?: boolean;
}

interface AssessmentQuestionsProps {
  framework: string;
  onComplete: (answers: AssessmentAnswer[]) => void;
  onBack: () => void;
}

const SWIFT_QUESTIONS = [
  {
    "id": "1.1.a.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately defined and documented design goals for implementing environment separation?",
    "guideline": "a"
  },
  {
    "id": "1.1.a.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "1.1.b.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately defined and implemented the scope for the secure zone?",
    "guideline": "b"
  },
  {
    "id": "1.1.b.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "b"
  },
  {
    "id": "1.1.c.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately implemented boundary protections for the secure zone?",
    "guideline": "c"
  },
  {
    "id": "1.1.c.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "c"
  },
  {
    "id": "1.1.d.1.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately controlled local operator (end user and administrator) access to the secure zone?",
    "guideline": "d.1"
  },
  {
    "id": "1.1.d.1.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "d.1"
  },
  {
    "id": "1.1.d.2.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately controlled remote operator (teleworker, \"on-call\" staff, remote administrator) access to the secure zone?",
    "guideline": "d.2"
  },
  {
    "id": "1.1.d.2.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "d.2"
  },
  {
    "id": "1.1.e.1",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user adequately separated the secure zone from general enterprise IT services?",
    "guideline": "e"
  },
  {
    "id": "1.1.e.2",
    "section": "Secure Your Environment",
    "subsection": "1.1 SWIFT Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "e"
  },
  {
    "id": "1.2.a.1",
    "section": "Secure Your Environment",
    "subsection": "1.2 Operating System Privileged Account Control",
    "question": "Has the user adequately restricted the number of privileged accounts for operating systems?",
    "guideline": "a"
  },
  {
    "id": "1.2.a.2",
    "section": "Secure Your Environment",
    "subsection": "1.2 Operating System Privileged Account Control",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "1.2.b.1",
    "section": "Secure Your Environment",
    "subsection": "1.2 Operating System Privileged Account Control",
    "question": "Has the user adequately controlled the usage of privileged accounts for operating systems?",
    "guideline": "b"
  },
  {
    "id": "1.2.b.2",
    "section": "Secure Your Environment",
    "subsection": "1.2 Operating System Privileged Account Control",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "b"
  },
  {
    "id": "1.3.a.1",
    "section": "Secure Your Environment",
    "subsection": "1.3 Virtualisation or Cloud Platform Protection",
    "question": "Has the user adequately protected the virtualisation or cloud platform?",
    "guideline": "a"
  },
  {
    "id": "1.3.a.2",
    "section": "Secure Your Environment",
    "subsection": "1.3 Virtualisation or Cloud Platform Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "1.3.b.1",
    "section": "Secure Your Environment",
    "subsection": "1.3 Virtualisation or Cloud Platform Protection",
    "question": "Has the user adequately secured the virtualisation or cloud platform management console?",
    "guideline": "b"
  },
  {
    "id": "1.3.b.2",
    "section": "Secure Your Environment",
    "subsection": "1.3 Virtualisation or Cloud Platform Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "b"
  },
  {
    "id": "1.4.a.1",
    "section": "Secure Your Environment",
    "subsection": "1.4 Restriction of Internet Access",
    "question": "Has the user adequately restricted internet access?",
    "guideline": "a"
  },
  {
    "id": "1.4.a.2",
    "section": "Secure Your Environment",
    "subsection": "1.4 Restriction of Internet Access",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "1.5.a.1",
    "section": "Secure Your Environment",
    "subsection": "1.5 Customer Environment Protection",
    "question": "Has the user adequately separated the secure zone from the external environment?",
    "guideline": "a"
  },
  {
    "id": "1.5.a.2",
    "section": "Secure Your Environment",
    "subsection": "1.5 Customer Environment Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.1.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.1 Internal Data Flow Security",
    "question": "Has the user adequately protected the confidentiality and integrity of data flows?",
    "guideline": "a"
  },
  {
    "id": "2.1.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.1 Internal Data Flow Security",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.1.b.1",
    "section": "Secure Your Environment",
    "subsection": "2.1 Internal Data Flow Security",
    "question": "Has the user adequately validated the authenticity of data flows?",
    "guideline": "b"
  },
  {
    "id": "2.1.b.2",
    "section": "Secure Your Environment",
    "subsection": "2.1 Internal Data Flow Security",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "b"
  },
  {
    "id": "2.2.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.2 Security Updates",
    "question": "Has the user adequately implemented security updates?",
    "guideline": "a"
  },
  {
    "id": "2.2.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.2 Security Updates",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.3.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.3 System Hardening",
    "question": "Has the user adequately hardened the systems?",
    "guideline": "a"
  },
  {
    "id": "2.3.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.3 System Hardening",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.6.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.6 Operator Session Confidentiality and Integrity",
    "question": "Has the user adequately protected the confidentiality and integrity of operator sessions?",
    "guideline": "a"
  },
  {
    "id": "2.6.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.6 Operator Session Confidentiality and Integrity",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.7.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.7 Vulnerability Scanning",
    "question": "Has the user adequately implemented vulnerability scanning?",
    "guideline": "a"
  },
  {
    "id": "2.7.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.7 Vulnerability Scanning",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.8.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.8 Outsourced Critical Activity Protection",
    "question": "Has the user adequately protected outsourced critical activities?",
    "guideline": "a"
  },
  {
    "id": "2.8.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.8 Outsourced Critical Activity Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.9.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.9 Transaction Business Controls",
    "question": "Has the user adequately implemented transaction business controls?",
    "guideline": "a"
  },
  {
    "id": "2.9.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.9 Transaction Business Controls",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "2.10.a.1",
    "section": "Secure Your Environment",
    "subsection": "2.10 Application Hardening",
    "question": "Has the user adequately hardened the applications?",
    "guideline": "a"
  },
  {
    "id": "2.10.a.2",
    "section": "Secure Your Environment",
    "subsection": "2.10 Application Hardening",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "3.1.a.1",
    "section": "Secure Your Environment",
    "subsection": "3.1 Physical Security",
    "question": "Has the user adequately physically secured the environment?",
    "guideline": "a"
  },
  {
    "id": "3.1.a.2",
    "section": "Secure Your Environment",
    "subsection": "3.1 Physical Security",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "4.1.a.1",
    "section": "Know and Limit Access",
    "subsection": "4.1 Password Policy",
    "question": "Has the user adequately defined and implemented a password policy?",
    "guideline": "a"
  },
  {
    "id": "4.1.a.2",
    "section": "Know and Limit Access",
    "subsection": "4.1 Password Policy",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "4.2.a.1",
    "section": "Know and Limit Access",
    "subsection": "4.2 Multi-Factor Authentication",
    "question": "Has the user adequately implemented multi-factor authentication?",
    "guideline": "a"
  },
  {
    "id": "4.2.a.2",
    "section": "Know and Limit Access",
    "subsection": "4.2 Multi-Factor Authentication",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "5.1.a.1",
    "section": "Know and Limit Access",
    "subsection": "5.1 Logical Access Control",
    "question": "Has the user adequately implemented logical access control?",
    "guideline": "a"
  },
  {
    "id": "5.1.a.2",
    "section": "Know and Limit Access",
    "subsection": "5.1 Logical Access Control",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "5.2.a.1",
    "section": "Know and Limit Access",
    "subsection": "5.2 Token Management",
    "question": "Has the user adequately managed tokens?",
    "guideline": "a"
  },
  {
    "id": "5.2.a.2",
    "section": "Know and Limit Access",
    "subsection": "5.2 Token Management",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "5.4.a.1",
    "section": "Know and Limit Access",
    "subsection": "5.4 Password Repository Protection",
    "question": "Has the user adequately protected the password repository?",
    "guideline": "a"
  },
  {
    "id": "5.4.a.2",
    "section": "Know and Limit Access",
    "subsection": "5.4 Password Repository Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "6.1.a.1",
    "section": "Detect and Respond",
    "subsection": "6.1 Malware Protection",
    "question": "Has the user adequately implemented malware protection?",
    "guideline": "a"
  },
  {
    "id": "6.1.a.2",
    "section": "Detect and Respond",
    "subsection": "6.1 Malware Protection",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "6.2.a.1",
    "section": "Detect and Respond",
    "subsection": "6.2 Software Integrity",
    "question": "Has the user adequately checked software integrity?",
    "guideline": "a"
  },
  {
    "id": "6.2.a.2",
    "section": "Detect and Respond",
    "subsection": "6.2 Software Integrity",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "6.3.a.1",
    "section": "Detect and Respond",
    "subsection": "6.3 Database Integrity",
    "question": "Has the user adequately checked database integrity?",
    "guideline": "a"
  },
  {
    "id": "6.3.a.2",
    "section": "Detect and Respond",
    "subsection": "6.3 Database Integrity",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "6.4.a.1",
    "section": "Detect and Respond",
    "subsection": "6.4 Logging and Monitoring",
    "question": "Has the user adequately implemented logging and monitoring?",
    "guideline": "a"
  },
  {
    "id": "6.4.a.2",
    "section": "Detect and Respond",
    "subsection": "6.4 Logging and Monitoring",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "7.1.a.1",
    "section": "Detect and Respond",
    "subsection": "7.1 Cyber Incident Response Planning",
    "question": "Has the user adequately planned for cyber incident response?",
    "guideline": "a"
  },
  {
    "id": "7.1.a.2",
    "section": "Detect and Respond",
    "subsection": "7.1 Cyber Incident Response Planning",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  },
  {
    "id": "7.2.a.1",
    "section": "Detect and Respond",
    "subsection": "7.2 Security Training and Awareness",
    "question": "Has the user adequately implemented security training and awareness?",
    "guideline": "a"
  },
  {
    "id": "7.2.a.2",
    "section": "Detect and Respond",
    "subsection": "7.2 Security Training and Awareness",
    "question": "Has the user employed an alternative implementation approach?",
    "guideline": "a"
  }
]

const SOC2_QUESTIONS = [
  {
    "id": "CC1.1.1",
    "section": "Control Environment & Governance",
    "subsection": "CC1 Control Environment",
    "question": "Has the entity demonstrated a commitment to integrity and ethical values?",
    "guideline": "CC1.1"
  },
  {
    "id": "CC1.3.1",
    "section": "Control Environment & Governance",
    "subsection": "CC1 Control Environment",
    "question": "Has the entity established board of directors oversight regarding the development and performance of internal control?",
    "guideline": "CC1.3"
  },
  {
    "id": "CC2.1.1",
    "section": "Communication & Information Management",
    "subsection": "CC2 Communication and Information",
    "question": "Has the entity adequately identified and managed internal and external information required to support the functioning of internal control?",
    "guideline": "CC2.1"
  },
  {
    "id": "CC3.2.1",
    "section": "Risk Assessment & Management",
    "subsection": "CC3 Risk Assessment",
    "question": "Has the entity adequately identified risks to the achievement of its objectives across the entity?",
    "guideline": "CC3.2"
  },
  {
    "id": "CC5.1.1",
    "section": "Control Activities & Implementation",
    "subsection": "CC5 Control Activities",
    "question": "Has the entity selected and developed control activities that contribute to the mitigation of risks?",
    "guideline": "CC5.1"
  },
  {
    "id": "CC6.1.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity implemented logical access security software, infrastructure, and architectures to restrict access to authorized users?",
    "guideline": "CC6.1"
  },
  {
    "id": "CC6.1.2",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity employed an alternative implementation approach for logical access restrictions?",
    "guideline": "CC6.1"
  },
  {
    "id": "CC6.2.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity adequately identified and authenticated users, processes, and devices prior to allowing access?",
    "guideline": "CC6.2"
  },
  {
    "id": "CC6.3.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity managed access provisioning and removal to ensure the principle of least privilege?",
    "guideline": "CC6.3"
  },
  {
    "id": "CC6.4.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity restricted physical access to facilities and protected information assets?",
    "guideline": "CC6.4"
  },
  {
    "id": "CC6.6.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity implemented boundary protection devices (firewalls, IDS/IPS) to prevent unauthorized traffic?",
    "guideline": "CC6.6"
  },
  {
    "id": "CC6.7.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity restricted the transmission, movement, and removal of information to authorized internal and external parties?",
    "guideline": "CC6.7"
  },
  {
    "id": "CC6.8.1",
    "section": "Access Controls & Security",
    "subsection": "CC6 Logical and Physical Access Controls",
    "question": "Has the entity implemented controls to prevent or detect malicious software (malware)?",
    "guideline": "CC6.8"
  },
  {
    "id": "CC7.1.1",
    "section": "System Operations & Monitoring",
    "subsection": "CC7 System Operations",
    "question": "Has the entity implemented detection and monitoring procedures to identify configuration changes and susceptibility to vulnerabilities?",
    "guideline": "CC7.1"
  },
  {
    "id": "CC7.2.1",
    "section": "System Operations & Monitoring",
    "subsection": "CC7 System Operations",
    "question": "Has the entity adequately monitored the system for anomalies and security incidents?",
    "guideline": "CC7.2"
  },
  {
    "id": "CC7.3.1",
    "section": "System Operations & Monitoring",
    "subsection": "CC7 System Operations",
    "question": "Has the entity evaluated security incidents to determine the extent of the impact and remediation required?",
    "guideline": "CC7.3"
  },
  {
    "id": "CC7.4.1",
    "section": "System Operations & Monitoring",
    "subsection": "CC7 System Operations",
    "question": "Has the entity established a framework for responding to security incidents (Incident Response Plan)?",
    "guideline": "CC7.4"
  },
  {
    "id": "CC7.5.1",
    "section": "System Operations & Monitoring",
    "subsection": "CC7 System Operations",
    "question": "Has the entity implemented procedures to restore the affected environment after a security incident?",
    "guideline": "CC7.5"
  },
  {
    "id": "CC8.1.1",
    "section": "Change Management & Development",
    "subsection": "CC8 Change Management",
    "question": "Has the entity authorized, designed, developed, configured, documented, tested, and approved changes to infrastructure and data?",
    "guideline": "CC8.1"
  },
  {
    "id": "CC8.1.2",
    "section": "Change Management & Development",
    "subsection": "CC8 Change Management",
    "question": "Has the entity employed an alternative implementation approach for change management?",
    "guideline": "CC8.1"
  },
  {
    "id": "CC9.2.1",
    "section": "Vendor & Third-Party Risk Management",
    "subsection": "CC9 Risk Mitigation",
    "question": "Has the entity assessed and managed risks associated with vendors and business partners?",
    "guideline": "CC9.2"
  }
]

const AssessmentQuestions: React.FC<AssessmentQuestionsProps> = ({ framework, onComplete, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentSection, setCurrentSection] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [autoAnswering, setAutoAnswering] = useState(false);
  const [autoAnswerProgress, setAutoAnswerProgress] = useState({ current: 0, total: 0 });
  const [autoAnswerStarted, setAutoAnswerStarted] = useState(false);

  const questions = framework === 'SOC2' ? SOC2_QUESTIONS : SWIFT_QUESTIONS;

  const sections = Array.from(new Set(questions.map(q => q.section)));

  useEffect(() => {
    if (sections.length > 0) {
      const firstSection = sections[0];
      setCurrentSection(firstSection);
      setExpandedSections(new Set([firstSection]));
    }
  }, [framework]);

  const updateAnswer = (
    questionId: string,
    question: string,
    answer: 'yes' | 'no' | 'partial' | null,
    notes: string = '',
    evidence: EvidenceItem[] = [],
    reason: string = '',
    gapType?: 'outdated' | 'missing' | 'insufficient' | null,
    gapReason?: string
  ) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        question,
        answer,
        evidence: evidence.length > 0 ? evidence : (prev[questionId]?.evidence || []),
        evidenceIds: evidence.map(e => `${e.id}-${e.type}`),
        notes,
        reason: reason || prev[questionId]?.reason || '',
        gapType: gapType !== undefined ? gapType : prev[questionId]?.gapType,
        gapReason: gapReason || prev[questionId]?.gapReason || '',
        autoAnswered: prev[questionId]?.autoAnswered || false
      }
    }));
  };

  // Check if evidence is outdated (older than 90 days)
  const isEvidenceOutdated = (timestamp: string): boolean => {
    const evidenceDate = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - evidenceDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 90;
  };

  // Check if evidence preview indicates non-compliance (negative keywords)
  const indicatesNonCompliance = (preview: string): boolean => {
    const negativeKeywords = [
      'missing', 'failed', 'gaps', 'not properly', 'not implemented',
      'unpatched', 'unsecured', 'unhardened', 'missing controls',
      'no proper', 'improper', 'inadequate', 'deficient', 'violation',
      'non-compliant', 'non compliant', 'breach', 'weakness', 'vulnerability'
    ];
    const lowerPreview = preview.toLowerCase();
    return negativeKeywords.some(keyword => lowerPreview.includes(keyword));
  };

  // Analyze evidence and determine answer
  const analyzeEvidence = (evidenceItems: EvidenceItem[], question: string, questionId?: string): {
    answer: 'yes' | 'no' | 'partial';
    reason: string;
    gapType?: 'outdated' | 'missing' | 'insufficient' | null;
    gapReason?: string;
  } => {
    // 1. NO EVIDENCE FOUND → PARTIAL (evidence gap - missing)
    if (evidenceItems.length === 0) {
      return {
        answer: 'partial',
        reason: 'No evidence found for this requirement. Cannot determine compliance status.',
        gapType: 'missing',
        gapReason: 'No evidence items found in the system for this assessment question. Evidence gap detected.'
      };
    }

    // Check for outdated evidence
    const outdatedItems = evidenceItems.filter(item => isEvidenceOutdated(item.timestamp));
    const recentItems = evidenceItems.filter(item => !isEvidenceOutdated(item.timestamp));

    // Check relevance scores
    const highRelevanceItems = evidenceItems.filter(item => item.relevance >= 70);
    const mediumRelevanceItems = evidenceItems.filter(item => item.relevance >= 50 && item.relevance < 70);
    const lowRelevanceItems = evidenceItems.filter(item => item.relevance < 50);

    // Check if evidence indicates non-compliance
    const nonCompliantEvidence = evidenceItems.filter(item =>
      indicatesNonCompliance(item.preview) || item.relevance < 40
    );

    // 2. CLEAR EVIDENCE OF NON-COMPLIANCE → NO
    // If we have recent evidence with negative indicators (low relevance + negative keywords)
    if (nonCompliantEvidence.length > 0 && recentItems.length > 0) {
      const recentNonCompliant = nonCompliantEvidence.filter(item =>
        !isEvidenceOutdated(item.timestamp)
      );
      if (recentNonCompliant.length > 0) {
        return {
          answer: 'no',
          reason: `Found ${recentNonCompliant.length} recent evidence item(s) that clearly indicate non-compliance. The requirement is not adequately implemented.`,
          gapType: null, // Not a gap - it's a clear "no"
          gapReason: undefined
        };
      }
    }

    // 3. OUTDATED EVIDENCE ONLY → PARTIAL (evidence gap - outdated)
    if (recentItems.length === 0 && outdatedItems.length > 0) {
      return {
        answer: 'partial',
        reason: `Found ${outdatedItems.length} evidence item(s), but all are older than 90 days. Recent evidence is required to determine current compliance status.`,
        gapType: 'outdated',
        gapReason: `Evidence found is ${Math.round((new Date().getTime() - new Date(outdatedItems[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))} days old. SWIFT CSCF requires evidence to be current (within 90 days). Evidence gap detected.`
      };
    }

    // 4. INSUFFICIENT/LOW RELEVANCE EVIDENCE → PARTIAL (evidence gap - insufficient)
    if (highRelevanceItems.length === 0 && (mediumRelevanceItems.length > 0 || lowRelevanceItems.length > 0)) {
      return {
        answer: 'partial',
        reason: `Found ${evidenceItems.length} evidence item(s), but relevance scores are insufficient (below 70%). Cannot definitively determine compliance status.`,
        gapType: 'insufficient',
        gapReason: 'Evidence found has low or medium relevance scores, indicating it may not fully address the requirement. Evidence gap detected - additional evidence needed.'
      };
    }

    // 5. CLEAR EVIDENCE OF COMPLIANCE → YES
    if (recentItems.length > 0 && highRelevanceItems.length > 0) {
      return {
        answer: 'yes',
        reason: `Found ${recentItems.length} recent evidence item(s) with high relevance (${highRelevanceItems.length} items with ≥70% relevance). Clear evidence supports compliance.`,
        gapType: null,
        gapReason: undefined
      };
    }

    // 6. FALLBACK: PARTIAL (evidence gap - insufficient)
    return {
      answer: 'partial',
      reason: `Found ${evidenceItems.length} evidence item(s), but cannot definitively determine compliance status. Review recommended.`,
      gapType: 'insufficient',
      gapReason: 'Evidence found requires manual review to determine full compliance. Evidence gap detected.'
    };
  };

  // Predefined mock evidence responses for demo (supports SWIFT_CSP and SOC2)
  const getMockEvidenceForQuestion = (questionId: string): EvidenceItem[] => {
    const mockEvidence: Record<string, EvidenceItem[]> = {
      // Section 1 - Secure Your Environment
      '1.1.d.1': [
        { id: '1', type: 'Log', filename: 'swift_access_control.log', preview: 'Local operator access logs', relevance: 92, control_id: 'SWIFT-1.1', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', type: 'Document', filename: 'access_control_policy.pdf', preview: 'Access control policy document', relevance: 88, control_id: 'SWIFT-1.1', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '1.1.d.2': [
        { id: '3', type: 'Log', filename: 'remote_access_audit.log', preview: 'Remote operator access audit logs', relevance: 90, control_id: 'SWIFT-1.1', timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '1.1.e': [
        { id: '4', type: 'Document', filename: 'network_segmentation.pdf', preview: 'Network segmentation documentation', relevance: 85, control_id: 'SWIFT-1.1', timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '1.2': [
        { id: '5', type: 'Log', filename: 'privileged_account_audit.log', preview: 'Privileged account usage logs', relevance: 95, control_id: 'SWIFT-1.2', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '6', type: 'Document', filename: 'privileged_access_policy.pdf', preview: 'Privileged access control policy', relevance: 91, control_id: 'SWIFT-1.2', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '1.3': [
        { id: '7', type: 'Document', filename: 'virtualization_audit_report.pdf', preview: 'Virtualization platform audit shows missing security controls and unpatched vulnerabilities', relevance: 45, control_id: 'SWIFT-1.3', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '8', type: 'Log', filename: 'vm_security_gaps.log', preview: 'VM security configuration gaps identified - missing hardening controls', relevance: 40, control_id: 'SWIFT-1.3', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '1.4': [
        { id: '8', type: 'Log', filename: 'internet_access_control.log', preview: 'Internet access restriction logs', relevance: 89, control_id: 'SWIFT-1.4', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 2 - Know and Limit Access
      '2.1': [
        { id: '10', type: 'Log', filename: 'data_flow_security.log', preview: 'Internal data flow security logs', relevance: 93, control_id: 'SWIFT-2.1', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.2': [
        { id: '11', type: 'Log', filename: 'security_updates.log', preview: 'Security patch application logs', relevance: 94, control_id: 'SWIFT-2.2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '12', type: 'Document', filename: 'patch_management_policy.pdf', preview: 'Patch management policy', relevance: 90, control_id: 'SWIFT-2.2', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.3': [
        { id: '13', type: 'Document', filename: 'hardening_assessment.pdf', preview: 'System hardening assessment reveals multiple unhardened systems and missing security configurations', relevance: 35, control_id: 'SWIFT-2.3', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '14', type: 'Log', filename: 'hardening_failures.log', preview: 'System hardening checklist shows 60% of systems not properly hardened', relevance: 38, control_id: 'SWIFT-2.3', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.6': [
        { id: '14', type: 'Log', filename: 'operator_session_logs.log', preview: 'Operator session encryption logs', relevance: 91, control_id: 'SWIFT-2.6', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.7': [
        { id: '15', type: 'Log', filename: 'vulnerability_scan_results.log', preview: 'Vulnerability scanning results', relevance: 96, control_id: 'SWIFT-2.7', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '16', type: 'Document', filename: 'vuln_scanning_policy.pdf', preview: 'Vulnerability scanning policy', relevance: 92, control_id: 'SWIFT-2.7', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.9': [
        { id: '17', type: 'Log', filename: 'transaction_monitoring.log', preview: 'Transaction business control logs', relevance: 89, control_id: 'SWIFT-2.9', timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '2.10': [
        { id: '18', type: 'Document', filename: 'app_security_review.pdf', preview: 'Application security review indicates missing application hardening procedures and unsecured interfaces', relevance: 42, control_id: 'SWIFT-2.10', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 3 - Physical Security
      '3.1': [
        { id: '19', type: 'Document', filename: 'physical_security_audit.pdf', preview: 'Physical security controls documentation', relevance: 88, control_id: 'SWIFT-3.1', timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 4 - Authentication and Access Control
      '4.1': [
        { id: '20', type: 'Document', filename: 'password_policy.pdf', preview: 'Password policy document', relevance: 93, control_id: 'SWIFT-4.1', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '21', type: 'Log', filename: 'password_compliance.log', preview: 'Password policy enforcement logs', relevance: 90, control_id: 'SWIFT-4.1', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '4.2': [
        { id: '22', type: 'Log', filename: 'mfa_authentication.log', preview: 'MFA authentication logs', relevance: 97, control_id: 'SWIFT-4.2', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '23', type: 'Document', filename: 'mfa_policy.pdf', preview: 'Multi-factor authentication policy', relevance: 95, control_id: 'SWIFT-4.2', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 5 - Access Management
      '5.1': [
        { id: '24', type: 'Document', filename: 'logical_access_control.pdf', preview: 'Logical access control policy', relevance: 91, control_id: 'SWIFT-5.1', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '5.2': [
        { id: '25', type: 'Log', filename: 'token_audit.log', preview: 'Token management audit shows missing token tracking, unaccounted tokens, and improper token lifecycle management', relevance: 30, control_id: 'SWIFT-5.2', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '26', type: 'Document', filename: 'token_gaps.pdf', preview: 'Token management policy gaps identified - no proper tracking or management procedures', relevance: 35, control_id: 'SWIFT-5.2', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '5.4': [
        { id: '26', type: 'Document', filename: 'password_storage_policy.pdf', preview: 'Password storage security policy', relevance: 89, control_id: 'SWIFT-5.4', timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 6 - Protection and Integrity
      '6.1': [
        { id: '27', type: 'Log', filename: 'malware_protection.log', preview: 'Malware protection scan logs', relevance: 92, control_id: 'SWIFT-6.1', timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '6.2': [
        { id: '28', type: 'Document', filename: 'software_integrity_audit.pdf', preview: 'Software integrity verification audit shows missing integrity checks, unsigned binaries, and no verification procedures', relevance: 25, control_id: 'SWIFT-6.2', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '29', type: 'Log', filename: 'integrity_failures.log', preview: 'Software integrity checks failed - multiple unsigned components detected', relevance: 28, control_id: 'SWIFT-6.2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '6.3': [
        { id: '29', type: 'Log', filename: 'database_integrity.log', preview: 'Database integrity check logs', relevance: 90, control_id: 'SWIFT-6.3', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '6.4': [
        { id: '30', type: 'Log', filename: 'security_monitoring.log', preview: 'Security event logging and monitoring', relevance: 94, control_id: 'SWIFT-6.4', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '31', type: 'Document', filename: 'logging_policy.pdf', preview: 'Logging and monitoring policy', relevance: 91, control_id: 'SWIFT-6.4', timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // Section 7 - Incident Response and Training
      '7.1': [
        { id: '32', type: 'Document', filename: 'incident_response_plan.pdf', preview: 'Cyber incident response plan documentation', relevance: 89, control_id: 'SWIFT-7.1', timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      '7.2': [
        { id: '33', type: 'Document', filename: 'security_training.pdf', preview: 'Security awareness training documentation', relevance: 87, control_id: 'SWIFT-7.2', timestamp: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // SOC 2 mock evidence (recent timestamps within 90 days, compliance-focused narratives)
      'CC1.1.1': [
        { id: '1', type: 'Document', filename: 'code_of_conduct.pdf', preview: 'Code of conduct and ethics policy document establishes commitment to integrity, ethical values, and compliance with SOC 2 requirements. Includes employee acknowledgment and annual training records.', relevance: 92, control_id: 'SOC2-CC1.1', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC1.3.1': [
        { id: '2', type: 'Document', filename: 'board_oversight_policy.pdf', preview: 'Board of directors oversight documentation demonstrates active governance of internal control system. Includes quarterly board meeting minutes and control performance reviews.', relevance: 88, control_id: 'SOC2-CC1.3', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC2.1.1': [
        { id: '3', type: 'Document', filename: 'information_management_policy.pdf', preview: 'Information management and communication policy defines processes for identifying, capturing, and managing internal and external information required for SOC 2 compliance. Includes data classification and retention schedules.', relevance: 90, control_id: 'SOC2-CC2.1', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC3.2.1': [
        { id: '4', type: 'Document', filename: 'risk_assessment_report.pdf', preview: 'Enterprise risk assessment documentation identifies and evaluates risks to achievement of SOC 2 objectives. Includes risk register, threat modeling, and quarterly risk review processes.', relevance: 93, control_id: 'SOC2-CC3.2', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC5.1.1': [
        { id: '5', type: 'Document', filename: 'control_activities_policy.pdf', preview: 'Control activities selection and development policy documents how controls are selected, designed, and implemented to mitigate identified risks. Includes control matrix and effectiveness testing procedures.', relevance: 91, control_id: 'SOC2-CC5.1', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.1.1': [
        { id: '6', type: 'Log', filename: 'logical_access_control.log', preview: 'Logical access security software implementation logs demonstrate active enforcement of access restrictions. Shows IAM system configuration, role-based access control (RBAC) implementation, and access denial events.', relevance: 94, control_id: 'SOC2-CC6.1', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '7', type: 'Document', filename: 'access_control_architecture.pdf', preview: 'Logical access control architecture documentation describes identity and access management (IAM) infrastructure, authentication mechanisms, and authorization frameworks implemented to restrict access to authorized users only.', relevance: 92, control_id: 'SOC2-CC6.1', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.1.2': [
        { id: '8', type: 'Document', filename: 'alternative_access_controls.pdf', preview: 'Alternative logical access implementation approach documentation describes compensating controls and alternative methods used to achieve logical access restrictions when standard approaches are not applicable.', relevance: 88, control_id: 'SOC2-CC6.1', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.2.1': [
        { id: '9', type: 'Log', filename: 'authentication_logs.log', preview: 'User, process, and device authentication logs demonstrate successful identification and authentication prior to access. Includes multi-factor authentication (MFA) events, SSO sessions, and device certificate validations.', relevance: 95, control_id: 'SOC2-CC6.2', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.3.1': [
        { id: '10', type: 'Log', filename: 'access_provisioning.log', preview: 'Access provisioning and removal logs demonstrate least privilege implementation. Shows user access requests, approvals, role assignments, access reviews, and timely deprovisioning of terminated user accounts.', relevance: 93, control_id: 'SOC2-CC6.3', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.4.1': [
        { id: '11', type: 'Document', filename: 'physical_security_controls.pdf', preview: 'Physical access restrictions and facility protection documentation describes badge access systems, visitor management, data center security, and physical safeguards protecting information assets from unauthorized access.', relevance: 89, control_id: 'SOC2-CC6.4', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.6.1': [
        { id: '12', type: 'Log', filename: 'firewall_ids_ips.log', preview: 'Boundary protection device logs (firewalls, IDS/IPS) demonstrate active network perimeter security. Shows blocked unauthorized traffic attempts, intrusion detection alerts, and network segmentation enforcement.', relevance: 96, control_id: 'SOC2-CC6.6', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.7.1': [
        { id: '13', type: 'Document', filename: 'data_transmission_policy.pdf', preview: 'Information transmission, movement, and removal restrictions policy defines controls for data in transit, encryption requirements, secure file transfer protocols, and restrictions on data movement to authorized parties only.', relevance: 90, control_id: 'SOC2-CC6.7', timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC6.8.1': [
        { id: '14', type: 'Log', filename: 'malware_protection.log', preview: 'Malware detection and prevention system logs demonstrate active anti-malware controls. Shows real-time scanning results, quarantine actions, signature updates, and blocked malicious software attempts.', relevance: 94, control_id: 'SOC2-CC6.8', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC7.1.1': [
        { id: '15', type: 'Log', filename: 'configuration_monitoring.log', preview: 'Configuration change detection and vulnerability monitoring logs demonstrate continuous monitoring of system configurations and vulnerability management. Shows configuration drift alerts, vulnerability scan results, and patch status.', relevance: 92, control_id: 'SOC2-CC7.1', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC7.2.1': [
        { id: '16', type: 'Log', filename: 'anomaly_detection.log', preview: 'System anomaly and security incident monitoring logs demonstrate active security monitoring. Shows SIEM alerts, behavioral analytics detections, failed login attempts, and security event correlations.', relevance: 95, control_id: 'SOC2-CC7.2', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC7.3.1': [
        { id: '17', type: 'Document', filename: 'incident_evaluation_report.pdf', preview: 'Security incident evaluation and impact assessment documentation demonstrates incident analysis procedures. Includes incident severity classification, impact assessments, root cause analysis, and remediation tracking.', relevance: 91, control_id: 'SOC2-CC7.3', timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC7.4.1': [
        { id: '18', type: 'Document', filename: 'incident_response_plan.pdf', preview: 'Security incident response framework and plan documents procedures for responding to security incidents. Includes incident response team roles, escalation procedures, communication plans, and SOC 2 compliance requirements.', relevance: 93, control_id: 'SOC2-CC7.4', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC7.5.1': [
        { id: '19', type: 'Document', filename: 'disaster_recovery_procedures.pdf', preview: 'Environment restoration procedures after security incidents document recovery processes, backup verification, RTO/RPO targets, and procedures for restoring affected systems to secure operational state.', relevance: 90, control_id: 'SOC2-CC7.5', timestamp: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC8.1.1': [
        { id: '20', type: 'Log', filename: 'change_management.log', preview: 'Change authorization and approval logs demonstrate formal change management process. Shows change requests, approvals, testing results, deployment authorizations, and post-implementation reviews for infrastructure and data changes.', relevance: 94, control_id: 'SOC2-CC8.1', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC8.1.2': [
        { id: '21', type: 'Document', filename: 'alternative_change_management.pdf', preview: 'Alternative change management implementation approach documentation describes compensating controls and alternative methods for managing changes when standard change management processes are not applicable.', relevance: 87, control_id: 'SOC2-CC8.1', timestamp: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'CC9.2.1': [
        { id: '22', type: 'Document', filename: 'vendor_risk_assessment.pdf', preview: 'Vendor and business partner risk assessment and management documentation demonstrates third-party risk management program. Includes vendor due diligence, security questionnaires, contract reviews, and ongoing monitoring of vendor compliance with SOC 2 requirements.', relevance: 92, control_id: 'SOC2-CC9.2', timestamp: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    };

    // Try exact match first
    if (mockEvidence[questionId]) {
      return mockEvidence[questionId];
    }

    // Try matching by progressively removing the last segment
    // e.g., '1.1.d.1.1' -> '1.1.d.1' -> '1.1.d' -> '1.1' -> '1'
    let currentId = questionId;
    while (currentId.includes('.')) {
      const lastDotIndex = currentId.lastIndexOf('.');
      currentId = currentId.substring(0, lastDotIndex);
      if (mockEvidence[currentId]) {
        return mockEvidence[currentId];
      }
    }

    // No match found
    return [];
  };

  // Auto-answer all questions using predefined mock responses
  const autoAnswerAllQuestions = async () => {
    setAutoAnswering(true);
    setAutoAnswerStarted(true);
    setAutoAnswerProgress({ current: 0, total: questions.length });

    const newAnswers: Record<string, AssessmentAnswer> = { ...answers };

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      setAutoAnswerProgress({ current: i + 1, total: questions.length });

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 300));

      try {
        // Get mock evidence for this question
        const evidenceItems = getMockEvidenceForQuestion(question.id);

        // Analyze evidence
        const analysis = analyzeEvidence(evidenceItems, question.question, question.id);

        // Update answer
        newAnswers[question.id] = {
          questionId: question.id,
          question: question.question,
          answer: analysis.answer,
          evidence: evidenceItems,
          evidenceIds: evidenceItems.map(e => `${e.id}-${e.type}`),
          notes: analysis.reason,
          reason: analysis.reason,
          gapType: analysis.gapType,
          gapReason: analysis.gapReason,
          autoAnswered: true
        };

        setAnswers(newAnswers);
      } catch (error) {
        console.error(`Error auto-answering question ${question.id}:`, error);
        // Mark as unanswered if processing fails
        newAnswers[question.id] = {
          questionId: question.id,
          question: question.question,
          answer: null,
          evidence: [],
          evidenceIds: [],
          notes: 'Auto-answer failed. Please answer manually.',
          reason: 'Failed to process evidence automatically.',
          autoAnswered: false
        };
      }
    }

    setAnswers(newAnswers);
    setAutoAnswering(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getAnswerCount = () => {
    const answered = Object.values(answers).filter(a => a.answer !== null).length;
    return { answered, total: questions.length };
  };

  const handleComplete = () => {
    const answerArray = Object.values(answers);
    onComplete(answerArray);
  };

  const { answered, total } = getAnswerCount();
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {framework === 'SOC2' ? 'SOC 2 Assessment Questions' : 'SWIFT CSCF v2023 Assessment Questions'}
            </h2>
            <p className="text-gray-600">
              Answer the following questions to create your compliance assurance pack
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Progress</div>
            <div className="text-2xl font-bold text-blue-900">{answered}/{total}</div>
          </div>
        </div>

        {/* Auto-Answer Button */}
        <div className="mb-4">
          <button
            onClick={autoAnswerAllQuestions}
            disabled={autoAnswering}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${autoAnswering
                ? 'bg-blue-200 text-blue-700 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
              }
            `}
          >
            <Sparkles className="w-4 h-4" />
            {autoAnswering
              ? `Auto-Answering... (${autoAnswerProgress.current}/${autoAnswerProgress.total})`
              : autoAnswerStarted
                ? 'Re-run Auto-Answer'
                : 'Auto-Answer All Questions'
            }
          </button>
          {autoAnswering && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-900 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(autoAnswerProgress.current / autoAnswerProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Overall Progress Bar - Hide when auto-answering */}
        {!autoAnswering && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <motion.div
              className="bg-blue-900 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Answered: {answered}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-gray-700">Remaining: {total - answered}</span>
          </div>
        </div>
      </div>

      {/* Questions by Section */}
      <div className="space-y-4">
        {sections.map((section) => {
          const sectionQuestions = questions.filter(q => q.section === section);
          const sectionTotal = sectionQuestions.length;

          // Calculate actual answered count - only count if answer is explicitly set to yes, no, or partial
          const sectionAnswers = sectionQuestions.filter(q => {
            const answer = answers[q.id];
            return answer &&
              answer.answer !== null &&
              answer.answer !== undefined &&
              (answer.answer === 'yes' || answer.answer === 'no' || answer.answer === 'partial');
          }).length;

          // Calculate breakdown
          const yesCount = sectionQuestions.filter(q => answers[q.id]?.answer === 'yes').length;
          const noCount = sectionQuestions.filter(q => answers[q.id]?.answer === 'no').length;
          const partialCount = sectionQuestions.filter(q => answers[q.id]?.answer === 'partial').length;
          const pendingCount = sectionTotal - sectionAnswers;

          const isExpanded = expandedSections.has(section);
          const isComplete = sectionAnswers === sectionTotal;

          return (
            <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Counter Badge - Leftmost */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm flex-shrink-0 ${isComplete
                      ? 'bg-green-100 text-green-700'
                      : sectionAnswers > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                    {sectionAnswers}/{sectionTotal}
                  </div>

                  {/* Step Name - Left */}
                  <h3 className="text-base font-bold text-gray-900 flex-shrink-0">{section}</h3>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Answer Breakdown - Right */}
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    {yesCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                        <span className="text-gray-700">{yesCount} Yes</span>
                      </div>
                    )}
                    {noCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <span className="text-gray-700">{noCount} No</span>
                      </div>
                    )}
                    {partialCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                        <span className="text-gray-700">{partialCount} Partial</span>
                      </div>
                    )}
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <span className="text-gray-500">{pendingCount} Pending</span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-5 space-y-6">
                    {sectionQuestions.map((q) => {
                      const currentAnswer = answers[q.id];
                      const subsections = questions.filter(qq => qq.subsection === q.subsection);
                      const isFirstInSubsection = subsections[0].id === q.id;

                      return (
                        <div key={q.id} className={isFirstInSubsection ? 'pt-4 border-t border-gray-100 first:border-t-0' : ''}>
                          {isFirstInSubsection && (
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">{q.subsection}</h4>
                          )}

                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {q.id}
                                  </span>
                                  <span className="text-xs text-gray-500">Guideline: {q.guideline}</span>
                                </div>
                                <p className="text-gray-900 font-medium">{q.question}</p>
                              </div>
                            </div>

                            {/* Gap Indicator */}
                            {currentAnswer?.gapType && (
                              <div className={`mb-3 p-3 rounded-lg flex items-start gap-2 ${currentAnswer.gapType === 'outdated'
                                  ? 'bg-orange-50 border border-orange-200'
                                  : currentAnswer.gapType === 'missing'
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                {currentAnswer.gapType === 'outdated' && <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />}
                                {currentAnswer.gapType === 'missing' && <FileX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                                {currentAnswer.gapType === 'insufficient' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                                <div className="flex-1">
                                  <div className="text-xs font-semibold mb-1">
                                    {currentAnswer.gapType === 'outdated' && '⚠️ Evidence Gap: Outdated'}
                                    {currentAnswer.gapType === 'missing' && '❌ Evidence Gap: Missing'}
                                    {currentAnswer.gapType === 'insufficient' && '⚠️ Evidence Gap: Insufficient'}
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {currentAnswer.gapReason || 'Evidence gap detected'}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Auto-Answered Indicator */}
                            {currentAnswer?.autoAnswered && (
                              <div className="mb-3 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                <Sparkles className="w-3 h-3" />
                                <span>Auto-answered using Telescope AI</span>
                              </div>
                            )}

                            {/* Answer Options */}
                            <div className="flex gap-3 mb-3">
                              {(['yes', 'partial', 'no'] as const).map((option) => {
                                const isSelected = currentAnswer?.answer === option;
                                return (
                                  <button
                                    key={option}
                                    onClick={() => updateAnswer(
                                      q.id,
                                      q.question,
                                      option,
                                      currentAnswer?.notes || '',
                                      currentAnswer?.evidence || [],
                                      currentAnswer?.reason || ''
                                    )}
                                    className={`
                                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                                      ${isSelected
                                        ? option === 'yes'
                                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                          : option === 'partial'
                                            ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                            : 'bg-red-100 text-red-700 border-2 border-red-300'
                                        : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                      }
                                    `}
                                  >
                                    {option === 'yes' ? '✓ Yes' : option === 'partial' ? '~ Partial' : '✗ No'}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Evidence Items */}
                            {currentAnswer?.evidence && currentAnswer.evidence.length > 0 && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                <div className="text-xs font-semibold text-blue-900 mb-2">
                                  Evidence Found ({currentAnswer.evidence.length}):
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {currentAnswer.evidence.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="text-xs text-gray-700 flex items-center gap-2">
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'Log' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {item.type}
                                      </span>
                                      <span className="flex-1 truncate">{item.filename}</span>
                                      <span className="text-gray-500">{item.relevance}%</span>
                                      {isEvidenceOutdated(item.timestamp) && (
                                        <div title="Outdated">
                                          <Clock className="w-3 h-3 text-orange-500" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {currentAnswer.evidence.length > 5 && (
                                    <div className="text-xs text-gray-500 italic">
                                      ... and {currentAnswer.evidence.length - 5} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Reason Field (Auto-filled) */}
                            {currentAnswer?.reason && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 mb-1">Reason:</div>
                                <div className="text-sm text-gray-800">{currentAnswer.reason}</div>
                              </div>
                            )}

                            {/* Notes Field */}
                            <textarea
                              placeholder="Add additional notes or evidence references..."
                              value={currentAnswer?.notes || ''}
                              onChange={(e) => updateAnswer(
                                q.id,
                                q.question,
                                currentAnswer?.answer || null,
                                e.target.value,
                                currentAnswer?.evidence || [],
                                currentAnswer?.reason || ''
                              )}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evidence Ingestion
        </button>

        <button
          onClick={handleComplete}
          disabled={answered === 0}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
            ${answered > 0
              ? 'bg-blue-900 text-white hover:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Query Evidence
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AssessmentQuestions;
