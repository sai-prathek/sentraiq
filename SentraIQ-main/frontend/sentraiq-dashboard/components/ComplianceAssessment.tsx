import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, FileCheck, Sparkles, Clock, FileX, Database, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { api } from '../services/api';
import { EvidenceItem, DashboardOutletContext } from '../types';
import EvidenceDetailModal from './EvidenceDetailModal';

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

interface ComplianceAssessmentProps {
  framework: string;
  onComplete: (answers: AssessmentAnswer[]) => void;
  onBack: () => void;
  swiftArchitectureType?: string | null;
  controlApplicabilityMatrix?: any;
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

const ISO27001_QUESTIONS = [
  {
    "id": "A.5.1",
    "section": "5. Organizational Controls",
    "subsection": "Policies for information security",
    "question": "Has the organization defined, approved, and published information security policies to relevant personnel?",
    "guideline": "Control 5.1"
  },
  {
    "id": "A.5.2",
    "section": "5. Organizational Controls",
    "subsection": "Information security roles and responsibilities",
    "question": "Has the organization defined and allocated information security roles and responsibilities?",
    "guideline": "Control 5.2"
  },
  {
    "id": "A.5.3",
    "section": "5. Organizational Controls",
    "subsection": "Segregation of duties",
    "question": "Has the organization segregated conflicting duties and areas of responsibility to reduce the risk of unauthorized modification or misuse of assets?",
    "guideline": "Control 5.3"
  },
  {
    "id": "A.5.4",
    "section": "5. Organizational Controls",
    "subsection": "Management responsibilities",
    "question": "Does management require all personnel to apply information security in accordance with the established policies and procedures?",
    "guideline": "Control 5.4"
  },
  {
    "id": "A.5.5",
    "section": "5. Organizational Controls",
    "subsection": "Contact with authorities",
    "question": "Has the organization established and maintained contact with relevant authorities?",
    "guideline": "Control 5.5"
  },
  {
    "id": "A.5.6",
    "section": "5. Organizational Controls",
    "subsection": "Contact with special interest groups",
    "question": "Has the organization established and maintained contact with special interest groups or other specialist security forums?",
    "guideline": "Control 5.6"
  },
  {
    "id": "A.5.7",
    "section": "5. Organizational Controls",
    "subsection": "Threat intelligence",
    "question": "Does the organization collect and analyze information about information security threats to produce threat intelligence?",
    "guideline": "Control 5.7"
  },
  {
    "id": "A.5.8",
    "section": "5. Organizational Controls",
    "subsection": "Information security in project management",
    "question": "Is information security integrated into project management methodologies?",
    "guideline": "Control 5.8"
  },
  {
    "id": "A.5.9",
    "section": "5. Organizational Controls",
    "subsection": "Inventory of information and other associated assets",
    "question": "Has the organization developed and maintained an inventory of information and other associated assets?",
    "guideline": "Control 5.9"
  },
  {
    "id": "A.5.10",
    "section": "5. Organizational Controls",
    "subsection": "Acceptable use of information and other associated assets",
    "question": "Has the organization identified, documented, and implemented rules for the acceptable use of information and associated assets?",
    "guideline": "Control 5.10"
  },
  {
    "id": "A.5.11",
    "section": "5. Organizational Controls",
    "subsection": "Return of assets",
    "question": "Are personnel required to return all organizational assets in their possession upon change or termination of employment?",
    "guideline": "Control 5.11"
  },
  {
    "id": "A.5.12",
    "section": "5. Organizational Controls",
    "subsection": "Classification of information",
    "question": "Has information been classified in terms of legal requirements, value, criticality, and sensitivity to unauthorized disclosure or modification?",
    "guideline": "Control 5.12"
  },
  {
    "id": "A.5.13",
    "section": "5. Organizational Controls",
    "subsection": "Labelling of information",
    "question": "Has an appropriate set of procedures for information labelling been developed and implemented in accordance with the information classification scheme?",
    "guideline": "Control 5.13"
  },
  {
    "id": "A.5.14",
    "section": "5. Organizational Controls",
    "subsection": "Information transfer",
    "question": "Are there formal transfer policies, procedures, and controls in place to protect the transfer of information through the use of all types of communication facilities?",
    "guideline": "Control 5.14"
  },
  {
    "id": "A.5.15",
    "section": "5. Organizational Controls",
    "subsection": "Access control",
    "question": "Has the organization established and implemented specific access control policies regarding physical and logical access to information and associated assets?",
    "guideline": "Control 5.15"
  },
  {
    "id": "A.5.16",
    "section": "5. Organizational Controls",
    "subsection": "Identity management",
    "question": "Is the full life cycle of identities managed via a formal process?",
    "guideline": "Control 5.16"
  },
  {
    "id": "A.5.17",
    "section": "5. Organizational Controls",
    "subsection": "Authentication information",
    "question": "Is the allocation and management of authentication information controlled by a formal management process?",
    "guideline": "Control 5.17"
  },
  {
    "id": "A.5.18",
    "section": "5. Organizational Controls",
    "subsection": "Access rights",
    "question": "Are access rights to information and associated assets provisioned, reviewed, modified, and removed in accordance with the organization's topic-specific policy and rules?",
    "guideline": "Control 5.18"
  },
  {
    "id": "A.5.19",
    "section": "5. Organizational Controls",
    "subsection": "Information security in supplier relationships",
    "question": "Has the organization defined and implemented processes and procedures to manage the information security risks associated with the use of supplier's products or services?",
    "guideline": "Control 5.19"
  },
  {
    "id": "A.5.20",
    "section": "5. Organizational Controls",
    "subsection": "Addressing information security within supplier agreements",
    "question": "Have relevant information security requirements been established and agreed with each supplier?",
    "guideline": "Control 5.20"
  },
  {
    "id": "A.5.21",
    "section": "5. Organizational Controls",
    "subsection": "Managing information security in the ICT supply chain",
    "question": "Has the organization defined and implemented processes and procedures to manage the information security risks associated with the ICT products and services supply chain?",
    "guideline": "Control 5.21"
  },
  {
    "id": "A.5.22",
    "section": "5. Organizational Controls",
    "subsection": "Monitoring, review and change management of supplier services",
    "question": "Does the organization regularly monitor, review, and audit supplier service delivery?",
    "guideline": "Control 5.22"
  },
  {
    "id": "A.5.23",
    "section": "5. Organizational Controls",
    "subsection": "Information security for use of cloud services",
    "question": "Have processes for acquisition, use, management, and exit from cloud services been established in accordance with the organization's information security requirements?",
    "guideline": "Control 5.23"
  },
  {
    "id": "A.5.24",
    "section": "5. Organizational Controls",
    "subsection": "Information security incident management planning and preparation",
    "question": "Has the organization planned and prepared for managing information security incidents by defining, establishing, and communicating information security incident management processes?",
    "guideline": "Control 5.24"
  },
  {
    "id": "A.5.25",
    "section": "5. Organizational Controls",
    "subsection": "Assessment and decision on information security events",
    "question": "Does the organization assess information security events and decide if they are to be categorized as information security incidents?",
    "guideline": "Control 5.25"
  },
  {
    "id": "A.5.26",
    "section": "5. Organizational Controls",
    "subsection": "Response to information security incidents",
    "question": "Are information security incidents responded to in accordance with the documented procedures?",
    "guideline": "Control 5.26"
  },
  {
    "id": "A.5.27",
    "section": "5. Organizational Controls",
    "subsection": "Learning from information security incidents",
    "question": "Is knowledge gained from information security incidents used to strengthen and improve the information security controls?",
    "guideline": "Control 5.27"
  },
  {
    "id": "A.5.28",
    "section": "5. Organizational Controls",
    "subsection": "Collection of evidence",
    "question": "Does the organization establish and implement procedures for the identification, collection, acquisition, and preservation of evidence related to information security events?",
    "guideline": "Control 5.28"
  },
  {
    "id": "A.5.29",
    "section": "5. Organizational Controls",
    "subsection": "Information security during disruption",
    "question": "Does the organization plan and maintain information security continuity at an agreed level during disruption?",
    "guideline": "Control 5.29"
  },
  {
    "id": "A.5.30",
    "section": "5. Organizational Controls",
    "subsection": "ICT readiness for business continuity",
    "question": "Is ICT readiness planned, implemented, maintained, and tested based on business continuity objectives and ICT continuity requirements?",
    "guideline": "Control 5.30"
  },
  {
    "id": "A.5.31",
    "section": "5. Organizational Controls",
    "subsection": "Legal, statutory, regulatory and contractual requirements",
    "question": "Are legal, statutory, regulatory, and contractual requirements relevant to information security and the organization's approach to meet these requirements identified, documented, and kept up to date?",
    "guideline": "Control 5.31"
  },
  {
    "id": "A.5.32",
    "section": "5. Organizational Controls",
    "subsection": "Intellectual property rights",
    "question": "Has the organization implemented appropriate procedures to protect intellectual property rights?",
    "guideline": "Control 5.32"
  },
  {
    "id": "A.5.33",
    "section": "5. Organizational Controls",
    "subsection": "Protection of records",
    "question": "Are records protected from loss, destruction, falsification, unauthorized access, and unauthorized release?",
    "guideline": "Control 5.33"
  },
  {
    "id": "A.5.34",
    "section": "5. Organizational Controls",
    "subsection": "Privacy and protection of PII",
    "question": "Does the organization identify and meet the requirements regarding the preservation of privacy and protection of PII according to applicable laws and regulations?",
    "guideline": "Control 5.34"
  },
  {
    "id": "A.5.35",
    "section": "5. Organizational Controls",
    "subsection": "Independent review of information security",
    "question": "Is the organization's approach to managing information security and its implementation reviewed independently at planned intervals?",
    "guideline": "Control 5.35"
  },
  {
    "id": "A.5.36",
    "section": "5. Organizational Controls",
    "subsection": "Compliance with policies, rules and standards for information security",
    "question": "Is compliance with the organization's information security policies reviewed regularly?",
    "guideline": "Control 5.36"
  },
  {
    "id": "A.5.37",
    "section": "5. Organizational Controls",
    "subsection": "Documented operating procedures",
    "question": "Are operating procedures for information processing facilities documented and made available to personnel who need them?",
    "guideline": "Control 5.37"
  },
  {
    "id": "A.6.1",
    "section": "6. People Controls",
    "subsection": "Screening",
    "question": "Are background verification checks on all candidates for employment, contractors, and temporary staff performed prior to joining?",
    "guideline": "Control 6.1"
  },
  {
    "id": "A.6.2",
    "section": "6. People Controls",
    "subsection": "Terms and conditions of employment",
    "question": "Do the employment agreements state the personnel's and the organization's responsibilities for information security?",
    "guideline": "Control 6.2"
  },
  {
    "id": "A.6.3",
    "section": "6. People Controls",
    "subsection": "Information security awareness, education and training",
    "question": "Does the organization provide personnel with appropriate information security awareness, education, and training?",
    "guideline": "Control 6.3"
  },
  {
    "id": "A.6.4",
    "section": "6. People Controls",
    "subsection": "Disciplinary process",
    "question": "Is there a formal disciplinary process in place for personnel who have committed a security breach?",
    "guideline": "Control 6.4"
  },
  {
    "id": "A.6.5",
    "section": "6. People Controls",
    "subsection": "Responsibilities after termination or change of employment",
    "question": "Are information security responsibilities and duties that remain valid after termination or change of employment defined and communicated?",
    "guideline": "Control 6.5"
  },
  {
    "id": "A.6.6",
    "section": "6. People Controls",
    "subsection": "Confidentiality or non-disclosure agreements",
    "question": "Are confidentiality or non-disclosure agreements identifying information needs for protection reflected and reviewed regularly?",
    "guideline": "Control 6.6"
  },
  {
    "id": "A.6.7",
    "section": "6. People Controls",
    "subsection": "Remote working",
    "question": "Are security measures implemented to protect information accessed, processed, or stored at teleworking sites?",
    "guideline": "Control 6.7"
  },
  {
    "id": "A.6.8",
    "section": "6. People Controls",
    "subsection": "Information security event reporting",
    "question": "Does the organization provide a mechanism for personnel to report observed or suspected information security events?",
    "guideline": "Control 6.8"
  },
  {
    "id": "A.7.1",
    "section": "7. Physical Controls",
    "subsection": "Physical security perimeters",
    "question": "Are security perimeters defined and used to protect areas that contain information and other associated assets?",
    "guideline": "Control 7.1"
  },
  {
    "id": "A.7.2",
    "section": "7. Physical Controls",
    "subsection": "Physical entry",
    "question": "Are secure areas protected by appropriate entry controls and access points?",
    "guideline": "Control 7.2"
  },
  {
    "id": "A.7.3",
    "section": "7. Physical Controls",
    "subsection": "Securing offices, rooms and facilities",
    "question": "Is physical security for offices, rooms, and facilities designed and applied?",
    "guideline": "Control 7.3"
  },
  {
    "id": "A.7.4",
    "section": "7. Physical Controls",
    "subsection": "Physical security monitoring",
    "question": "Are premises monitored continuously for unauthorized physical access?",
    "guideline": "Control 7.4"
  },
  {
    "id": "A.7.5",
    "section": "7. Physical Controls",
    "subsection": "Protecting against physical and environmental threats",
    "question": "Is protection against physical and environmental threats designed and applied?",
    "guideline": "Control 7.5"
  },
  {
    "id": "A.7.6",
    "section": "7. Physical Controls",
    "subsection": "Working in secure areas",
    "question": "Are security measures for working in secure areas designed and implemented?",
    "guideline": "Control 7.6"
  },
  {
    "id": "A.7.7",
    "section": "7. Physical Controls",
    "subsection": "Clear desk and clear screen",
    "question": "Are clear desk rules for papers and removable storage media and clear screen rules for information processing facilities enforced?",
    "guideline": "Control 7.7"
  },
  {
    "id": "A.7.8",
    "section": "7. Physical Controls",
    "subsection": "Equipment siting and protection",
    "question": "Is equipment sited and protected to reduce the risks from environmental threats and hazards and opportunities for unauthorized access?",
    "guideline": "Control 7.8"
  },
  {
    "id": "A.7.9",
    "section": "7. Physical Controls",
    "subsection": "Security of assets off-premises",
    "question": "Are assets off-premises protected?",
    "guideline": "Control 7.9"
  },
  {
    "id": "A.7.10",
    "section": "7. Physical Controls",
    "subsection": "Storage media",
    "question": "Is storage media managed through its life cycle of acquisition, use, storage, and disposal?",
    "guideline": "Control 7.10"
  },
  {
    "id": "A.7.11",
    "section": "7. Physical Controls",
    "subsection": "Supporting utilities",
    "question": "Are information processing facilities protected from power failures and other disruptions caused by failures in supporting utilities?",
    "guideline": "Control 7.11"
  },
  {
    "id": "A.7.12",
    "section": "7. Physical Controls",
    "subsection": "Cabling security",
    "question": "Is cabling protected against interception, interference, or damage?",
    "guideline": "Control 7.12"
  },
  {
    "id": "A.7.13",
    "section": "7. Physical Controls",
    "subsection": "Equipment maintenance",
    "question": "Is equipment maintained correctly to ensure its continued availability and integrity?",
    "guideline": "Control 7.13"
  },
  {
    "id": "A.7.14",
    "section": "7. Physical Controls",
    "subsection": "Secure disposal or re-use of equipment",
    "question": "Are items of equipment containing storage media verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use?",
    "guideline": "Control 7.14"
  },
  {
    "id": "A.8.1",
    "section": "8. Technological Controls",
    "subsection": "User endpoint devices",
    "question": "Is information stored on, processed by, or accessible via user endpoint devices protected?",
    "guideline": "Control 8.1"
  },
  {
    "id": "A.8.2",
    "section": "8. Technological Controls",
    "subsection": "Privileged access rights",
    "question": "Is the allocation and use of privileged access rights restricted and managed?",
    "guideline": "Control 8.2"
  },
  {
    "id": "A.8.3",
    "section": "8. Technological Controls",
    "subsection": "Information access restriction",
    "question": "Is access to information and other associated assets restricted in accordance with the established access control policy?",
    "guideline": "Control 8.3"
  },
  {
    "id": "A.8.4",
    "section": "8. Technological Controls",
    "subsection": "Access to source code",
    "question": "Is read and write access to source code, development tools, and software libraries appropriately restricted?",
    "guideline": "Control 8.4"
  },
  {
    "id": "A.8.5",
    "section": "8. Technological Controls",
    "subsection": "Secure authentication",
    "question": "Are secure authentication technologies and procedures implemented based on information classification and risk assessment?",
    "guideline": "Control 8.5"
  },
  {
    "id": "A.8.6",
    "section": "8. Technological Controls",
    "subsection": "Capacity management",
    "question": "Is the use of resources monitored and adjusted in line with current and expected capacity requirements?",
    "guideline": "Control 8.6"
  },
  {
    "id": "A.8.7",
    "section": "8. Technological Controls",
    "subsection": "Protection against malware",
    "question": "Are protection against malware and appropriate user awareness procedures implemented?",
    "guideline": "Control 8.7"
  },
  {
    "id": "A.8.8",
    "section": "8. Technological Controls",
    "subsection": "Management of technical vulnerabilities",
    "question": "Is information about technical vulnerabilities of information systems obtained, evaluated, and are appropriate measures taken?",
    "guideline": "Control 8.8"
  },
  {
    "id": "A.8.9",
    "section": "8. Technological Controls",
    "subsection": "Configuration management",
    "question": "Are configurations, including security configurations, of hardware, software, services, and networks established, documented, implemented, monitored, and reviewed?",
    "guideline": "Control 8.9"
  },
  {
    "id": "A.8.10",
    "section": "8. Technological Controls",
    "subsection": "Information deletion",
    "question": "Is information stored in information systems, devices, or in any other storage media deleted when no longer required?",
    "guideline": "Control 8.10"
  },
  {
    "id": "A.8.11",
    "section": "8. Technological Controls",
    "subsection": "Data masking",
    "question": "Is data masking used in accordance with the organization's topic-specific policy on access control and other related topic-specific policies?",
    "guideline": "Control 8.11"
  },
  {
    "id": "A.8.12",
    "section": "8. Technological Controls",
    "subsection": "Data leakage prevention",
    "question": "Are data leakage prevention measures applied to systems, networks, and any other devices that process, store, or transmit sensitive information?",
    "guideline": "Control 8.12"
  },
  {
    "id": "A.8.13",
    "section": "8. Technological Controls",
    "subsection": "Information backup",
    "question": "Are backup copies of information, software, and systems maintained and tested regularly in accordance with the agreed topic-specific policy on backup?",
    "guideline": "Control 8.13"
  },
  {
    "id": "A.8.14",
    "section": "8. Technological Controls",
    "subsection": "Redundancy of information processing facilities",
    "question": "Are information processing facilities implemented with redundancy sufficient to meet availability requirements?",
    "guideline": "Control 8.14"
  },
  {
    "id": "A.8.15",
    "section": "8. Technological Controls",
    "subsection": "Logging",
    "question": "Are logs that record user activities, exceptions, faults, and information security events produced, stored, protected, and analyzed?",
    "guideline": "Control 8.15"
  },
  {
    "id": "A.8.16",
    "section": "8. Technological Controls",
    "subsection": "Monitoring activities",
    "question": "Are networks, systems, and applications monitored for anomalous behavior and appropriate actions taken?",
    "guideline": "Control 8.16"
  },
  {
    "id": "A.8.17",
    "section": "8. Technological Controls",
    "subsection": "Clock synchronization",
    "question": "Are the clocks of all relevant information processing systems synchronized to a single reference time source?",
    "guideline": "Control 8.17"
  },
  {
    "id": "A.8.18",
    "section": "8. Technological Controls",
    "subsection": "Use of privileged utility programs",
    "question": "Is the use of utility programs that can be capable of overriding system and application controls restricted and tightly controlled?",
    "guideline": "Control 8.18"
  },
  {
    "id": "A.8.19",
    "section": "8. Technological Controls",
    "subsection": "Installation of software on operational systems",
    "question": "Are procedures and measures implemented to securely manage software installation on operational systems?",
    "guideline": "Control 8.19"
  },
  {
    "id": "A.8.20",
    "section": "8. Technological Controls",
    "subsection": "Networks security",
    "question": "Are networks and network services secured to protect the information being transferred?",
    "guideline": "Control 8.20"
  },
  {
    "id": "A.8.21",
    "section": "8. Technological Controls",
    "subsection": "Security of network services",
    "question": "Are security mechanisms, service levels, and management requirements of all network services identified and included in network services agreements?",
    "guideline": "Control 8.21"
  },
  {
    "id": "A.8.22",
    "section": "8. Technological Controls",
    "subsection": "Segregation of networks",
    "question": "Are groups of information services, users, and information systems segregated on networks?",
    "guideline": "Control 8.22"
  },
  {
    "id": "A.8.23",
    "section": "8. Technological Controls",
    "subsection": "Web filtering",
    "question": "Is access to external websites managed to reduce exposure to malicious content?",
    "guideline": "Control 8.23"
  },
  {
    "id": "A.8.24",
    "section": "8. Technological Controls",
    "subsection": "Use of cryptography",
    "question": "Are rules for the effective use of cryptography and key management defined and implemented?",
    "guideline": "Control 8.24"
  },
  {
    "id": "A.8.25",
    "section": "8. Technological Controls",
    "subsection": "Secure development lifecycle",
    "question": "Are rules for the secure development of software and systems established and applied?",
    "guideline": "Control 8.25"
  },
  {
    "id": "A.8.26",
    "section": "8. Technological Controls",
    "subsection": "Application security requirements",
    "question": "Are information security requirements identified, specified, and approved when developing or acquiring applications?",
    "guideline": "Control 8.26"
  },
  {
    "id": "A.8.27",
    "section": "8. Technological Controls",
    "subsection": "Secure system architecture and engineering principles",
    "question": "Are principles for engineering secure systems established, documented, maintained, and applied to any information system implementation activities?",
    "guideline": "Control 8.27"
  },
  {
    "id": "A.8.28",
    "section": "8. Technological Controls",
    "subsection": "Secure coding",
    "question": "Are secure coding principles applied to software development?",
    "guideline": "Control 8.28"
  },
  {
    "id": "A.8.29",
    "section": "8. Technological Controls",
    "subsection": "Security testing in development and acceptance",
    "question": "Are security testing processes defined and implemented in the development life cycle?",
    "guideline": "Control 8.29"
  },
  {
    "id": "A.8.30",
    "section": "8. Technological Controls",
    "subsection": "Outsourced development",
    "question": "Does the organization supervise and monitor the outsourced system development activities?",
    "guideline": "Control 8.30"
  },
  {
    "id": "A.8.31",
    "section": "8. Technological Controls",
    "subsection": "Separation of development, test and production environments",
    "question": "Are development, testing, and production environments separated to reduce the risks of unauthorized access or changes to the production environment?",
    "guideline": "Control 8.31"
  },
  {
    "id": "A.8.32",
    "section": "8. Technological Controls",
    "subsection": "Change management",
    "question": "Are changes to the information processing facilities and information systems subject to change management procedures?",
    "guideline": "Control 8.32"
  },
  {
    "id": "A.8.33",
    "section": "8. Technological Controls",
    "subsection": "Test information",
    "question": "Is test information selected, protected, and controlled?",
    "guideline": "Control 8.33"
  },
  {
    "id": "A.8.34",
    "section": "8. Technological Controls",
    "subsection": "Protection of information systems during audit testing",
    "question": "Are audit tests and other assurance activities involving assessment of operational systems planned and agreed to minimize disruption to business processes?",
    "guideline": "Control 8.34"
  }
]

const PCI_DSS_QUESTIONS = [
  {
    "id": "PCI.1.1",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 1: Install and Maintain Network Security Controls",
    "question": "Are network security controls (NSCs) defined, implemented, and maintained according to documented policies?",
    "guideline": "NSC Processes and Documentation"
  },
  {
    "id": "PCI.1.2",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 1: Install and Maintain Network Security Controls",
    "question": "Are connections between the CDE (Cardholder Data Environment) and other networks restricted to only necessary traffic?",
    "guideline": "Network Connections and Restrictions"
  },
  {
    "id": "PCI.1.3",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 1: Install and Maintain Network Security Controls",
    "question": "Is direct public access to the CDE prohibited and are DMZs used for all inbound internet traffic?",
    "guideline": "Prohibition of Direct Public Access"
  },
  {
    "id": "PCI.1.4",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 1: Install and Maintain Network Security Controls",
    "question": "Are network security controls installed between all wireless networks and the CDE?",
    "guideline": "Wireless Network Segmentation"
  },
  {
    "id": "PCI.2.1",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 2: Apply Secure Configurations to All System Components",
    "question": "Are processes and mechanisms for applying secure configurations to all system components defined and understood?",
    "guideline": "Configuration Processes"
  },
  {
    "id": "PCI.2.2",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 2: Apply Secure Configurations to All System Components",
    "question": "Are system configuration standards applied to all system components to address known vulnerabilities?",
    "guideline": "System Configuration Standards"
  },
  {
    "id": "PCI.2.3",
    "section": "Build and Maintain a Secure Network and Systems",
    "subsection": "Requirement 2: Apply Secure Configurations to All System Components",
    "question": "Are all wireless environments securely configured and managed according to industry best practices?",
    "guideline": "Wireless Environment Configuration"
  },
  {
    "id": "PCI.3.1",
    "section": "Protect Account Data",
    "subsection": "Requirement 3: Protect Stored Account Data",
    "question": "Are data retention and disposal policies, procedures, and processes defined and implemented?",
    "guideline": "Data Retention and Disposal"
  },
  {
    "id": "PCI.3.2",
    "section": "Protect Account Data",
    "subsection": "Requirement 3: Protect Stored Account Data",
    "question": "Is Sensitive Authentication Data (SAD) stored only if needed for business and rendered unrecoverable after authorization?",
    "guideline": "Sensitive Authentication Data Storage"
  },
  {
    "id": "PCI.3.3",
    "section": "Protect Account Data",
    "subsection": "Requirement 3: Protect Stored Account Data",
    "question": "Is the Primary Account Number (PAN) masked when displayed (the first six and last four digits are the maximum number of digits to be displayed)?",
    "guideline": "PAN Masking"
  },
  {
    "id": "PCI.3.4",
    "section": "Protect Account Data",
    "subsection": "Requirement 3: Protect Stored Account Data",
    "question": "Is the PAN rendered unreadable anywhere it is stored using strong cryptography, truncation, or hashing?",
    "guideline": "PAN Storage Protection"
  },
  {
    "id": "PCI.3.5",
    "section": "Protect Account Data",
    "subsection": "Requirement 3: Protect Stored Account Data",
    "question": "Are keys used to encrypt account data protected against disclosure and misuse?",
    "guideline": "Key Management"
  },
  {
    "id": "PCI.4.1",
    "section": "Protect Account Data",
    "subsection": "Requirement 4: Protect Cardholder Data with Strong Cryptography During Transmission",
    "question": "Are processes for securing the transmission of cardholder data defined and documented?",
    "guideline": "Transmission Security Processes"
  },
  {
    "id": "PCI.4.2",
    "section": "Protect Account Data",
    "subsection": "Requirement 4: Protect Cardholder Data with Strong Cryptography During Transmission",
    "question": "Is strong cryptography used to safeguard PAN during transmission over open, public networks?",
    "guideline": "Transmission Over Public Networks"
  },
  {
    "id": "PCI.5.1",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 5: Protect All Systems and Networks from Malicious Software",
    "question": "Are processes and mechanisms for protecting systems and networks from malicious software defined and documented?",
    "guideline": "Malware Protection Processes"
  },
  {
    "id": "PCI.5.2",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 5: Protect All Systems and Networks from Malicious Software",
    "question": "Is malicious software (malware) prevented, or detected and addressed, by anti-malware mechanisms?",
    "guideline": "Anti-Malware Mechanisms"
  },
  {
    "id": "PCI.5.3",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 5: Protect All Systems and Networks from Malicious Software",
    "question": "Are anti-malware mechanisms and processes active, maintained, and monitored?",
    "guideline": "Anti-Malware Maintenance"
  },
  {
    "id": "PCI.6.1",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 6: Develop and Maintain Secure Systems and Software",
    "question": "Are processes for developing and maintaining secure systems and software defined and documented?",
    "guideline": "Secure Software Processes"
  },
  {
    "id": "PCI.6.2",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 6: Develop and Maintain Secure Systems and Software",
    "question": "Are bespoke and custom software developed securely, based on industry standards and/or best practices?",
    "guideline": "Secure Software Development"
  },
  {
    "id": "PCI.6.3",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 6: Develop and Maintain Secure Systems and Software",
    "question": "Are security vulnerabilities identified and managed using a risk ranking process?",
    "guideline": "Vulnerability Identification"
  },
  {
    "id": "PCI.6.4",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 6: Develop and Maintain Secure Systems and Software",
    "question": "Are public-facing web applications protected against attacks (e.g., via WAF or code reviews)?",
    "guideline": "Web Application Protection"
  },
  {
    "id": "PCI.6.5",
    "section": "Maintain a Vulnerability Management Program",
    "subsection": "Requirement 6: Develop and Maintain Secure Systems and Software",
    "question": "Are changes to system components managed securely?",
    "guideline": "Change Management"
  },
  {
    "id": "PCI.7.1",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 7: Restrict Access to Cardholder Data by Business Need to Know",
    "question": "Are processes for restricting access to system components and cardholder data defined and documented?",
    "guideline": "Access Control Processes"
  },
  {
    "id": "PCI.7.2",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 7: Restrict Access to Cardholder Data by Business Need to Know",
    "question": "Is access to system components and cardholder data defined and assigned according to the 'need to know' principle?",
    "guideline": "Least Privilege"
  },
  {
    "id": "PCI.8.1",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 8: Identify and Authenticate Access to System Components",
    "question": "Are processes for identifying and authenticating users defined and documented?",
    "guideline": "Authentication Processes"
  },
  {
    "id": "PCI.8.2",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 8: Identify and Authenticate Access to System Components",
    "question": "Is a unique ID assigned to each person with access to system components?",
    "guideline": "Unique User IDs"
  },
  {
    "id": "PCI.8.3",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 8: Identify and Authenticate Access to System Components",
    "question": "Is strong authentication managed for users and administrators?",
    "guideline": "Strong Authentication"
  },
  {
    "id": "PCI.8.4",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 8: Identify and Authenticate Access to System Components",
    "question": "Is Multi-Factor Authentication (MFA) implemented for all non-console access into the CDE?",
    "guideline": "Multi-Factor Authentication"
  },
  {
    "id": "PCI.9.1",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 9: Restrict Physical Access to Cardholder Data",
    "question": "Are processes for restricting physical access to cardholder data defined and documented?",
    "guideline": "Physical Security Processes"
  },
  {
    "id": "PCI.9.2",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 9: Restrict Physical Access to Cardholder Data",
    "question": "Are physical access controls managed and monitored for the facility and CDE?",
    "guideline": "Facility Access Controls"
  },
  {
    "id": "PCI.9.3",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 9: Restrict Physical Access to Cardholder Data",
    "question": "Is physical access for personnel and visitors authorized and managed?",
    "guideline": "Personnel and Visitor Access"
  },
  {
    "id": "PCI.9.4",
    "section": "Implement Strong Access Control Measures",
    "subsection": "Requirement 9: Restrict Physical Access to Cardholder Data",
    "question": "Are media with cardholder data securely stored, distributed, and destroyed?",
    "guideline": "Media Security"
  },
  {
    "id": "PCI.10.1",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 10: Log and Monitor All Access to System Components and Cardholder Data",
    "question": "Are processes for logging and monitoring all access to system components defined and documented?",
    "guideline": "Logging Processes"
  },
  {
    "id": "PCI.10.2",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 10: Log and Monitor All Access to System Components and Cardholder Data",
    "question": "Are audit logs generated for all activity within the CDE and related to cardholder data?",
    "guideline": "Audit Log Generation"
  },
  {
    "id": "PCI.10.3",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 10: Log and Monitor All Access to System Components and Cardholder Data",
    "question": "Are audit logs protected from destruction and unauthorized modification?",
    "guideline": "Log Protection"
  },
  {
    "id": "PCI.10.4",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 10: Log and Monitor All Access to System Components and Cardholder Data",
    "question": "Are audit logs reviewed to identify anomalies or suspicious activity?",
    "guideline": "Log Review"
  },
  {
    "id": "PCI.11.1",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 11: Test Security of Systems and Networks Regularly",
    "question": "Are processes for security testing of systems and networks defined and documented?",
    "guideline": "Security Testing Processes"
  },
  {
    "id": "PCI.11.2",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 11: Test Security of Systems and Networks Regularly",
    "question": "Are wireless access points identified and monitored, and unauthorized wireless access points addressed?",
    "guideline": "Wireless Testing"
  },
  {
    "id": "PCI.11.3",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 11: Test Security of Systems and Networks Regularly",
    "question": "Are internal and external vulnerabilities identified, prioritized, and addressed?",
    "guideline": "Vulnerability Scanning"
  },
  {
    "id": "PCI.11.4",
    "section": "Regularly Monitor and Test Networks",
    "subsection": "Requirement 11: Test Security of Systems and Networks Regularly",
    "question": "Are penetration tests performed to identify and correct exploitable vulnerabilities?",
    "guideline": "Penetration Testing"
  },
  {
    "id": "PCI.12.1",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Is the information security policy established, published, maintained, and disseminated?",
    "guideline": "Security Policy"
  },
  {
    "id": "PCI.12.3",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Are risks to the cardholder data environment formally identified, evaluated, and managed?",
    "guideline": "Risk Assessment"
  },
  {
    "id": "PCI.12.5",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Are PCI DSS scope and compliance validated and documented?",
    "guideline": "Scope Validation"
  },
  {
    "id": "PCI.12.6",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Is security awareness education provided to all personnel?",
    "guideline": "Security Awareness"
  },
  {
    "id": "PCI.12.9",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Are Third-Party Service Providers (TPSPs) managed to support the security of cardholder data?",
    "guideline": "Third-Party Management"
  },
  {
    "id": "PCI.12.10",
    "section": "Maintain an Information Security Policy",
    "subsection": "Requirement 12: Support Information Security with Organizational Policies and Programs",
    "question": "Is an incident response plan implemented and tested to respond to suspected or confirmed security incidents?",
    "guideline": "Incident Response"
  }
]

const ComplianceAssessment: React.FC<ComplianceAssessmentProps> = ({ 
  framework, 
  onComplete, 
  onBack,
  swiftArchitectureType,
  controlApplicabilityMatrix
}) => {
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentSection, setCurrentSection] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [autoAnswering, setAutoAnswering] = useState(false);
  const [autoAnswerProgress, setAutoAnswerProgress] = useState({ current: 0, total: 0 });
  const [autoAnswerStarted, setAutoAnswerStarted] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<EvidenceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Access shared pack list so assessment evidence is persisted across steps
  const { addEvidenceToPack } = useOutletContext<DashboardOutletContext>();

  // Helper function to extract control ID from question ID (e.g., "1.1.a.1" -> "1.1")
  const getControlIdFromQuestionId = (questionId: string): string | null => {
    const parts = questionId.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    return null;
  };

  // Helper function to check if a control is applicable to the selected architecture
  const isControlApplicable = (controlId: string): boolean => {
    if (!swiftArchitectureType || !controlApplicabilityMatrix) {
      return true; // If no architecture selected, show all questions
    }

    // Search through control applicability matrix
    for (const domain of controlApplicabilityMatrix.control_applicability_matrix || []) {
      for (const control of domain.controls || []) {
        if (control.control_id === controlId) {
          const mapping = control.mapping?.[swiftArchitectureType];
          return mapping?.is_applicable || false;
        }
      }
    }
    return false;
  };

  // Get all questions, then filter for SWIFT if architecture is selected
  let allQuestions =
    framework === 'SOC2'
      ? SOC2_QUESTIONS
      : framework === 'ISO27001_2022'
        ? ISO27001_QUESTIONS
        : framework === 'PCI_DSS'
          ? PCI_DSS_QUESTIONS
          : SWIFT_QUESTIONS;

  // Filter SWIFT questions based on architecture type
  const questions = framework === 'SWIFT_CSP' && swiftArchitectureType && controlApplicabilityMatrix
    ? allQuestions.filter((q) => {
        const controlId = getControlIdFromQuestionId(q.id);
        if (!controlId) return true; // Include questions without valid control IDs
        return isControlApplicable(controlId);
      })
    : allQuestions;

  const sections = Array.from(new Set(questions.map(q => q.section)));

  // Initialize current section and expanded sections when framework, architecture, or questions change
  useEffect(() => {
    if (sections.length > 0) {
      const firstSection = sections[0];
      setCurrentSection(firstSection);
      // Keep all sections closed by default
      setExpandedSections(new Set());
    }
  }, [framework, swiftArchitectureType, sections.length]);

  // Hydrate answers from localStorage when the component mounts or framework changes.
  // This lets auto-answered results persist when navigating forward/backward between
  // Steps 3+ without resetting, while GenerateTab clears localStorage when the user
  // navigates back before Step 3.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only hydrate if we don't already have answers in state
    if (Object.keys(answers).length > 0) return;

    try {
      const stored = window.localStorage.getItem('assessmentAnswers');
      if (!stored) return;

      const parsed = JSON.parse(stored) as AssessmentAnswer[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      const record: Record<string, AssessmentAnswer> = {};
      parsed.forEach((ans) => {
        if (!ans || !ans.questionId) return;
        record[ans.questionId] = ans;
      });

      if (Object.keys(record).length > 0) {
        setAnswers(record);
      }
    } catch (e) {
      console.warn('Failed to hydrate assessment answers from localStorage:', e);
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
        { 
          id: '1', 
          type: 'Log', 
          filename: 'swift_access_control.log', 
          preview: '2024-01-15 14:32:18 [AUTH] User: admin@swift.local authenticated via MFA. Session ID: sess_abc123. IP: 10.0.1.45. Access granted to secure zone SWIFT-CORE-01. Role: Local Operator. Access duration: 4h 23m.', 
          relevance: 92, 
          control_id: 'SWIFT-1.1', 
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '2', 
          type: 'Document', 
          filename: 'access_control_policy.pdf', 
          preview: 'Section 3.2: Local Operator Access Control. All local operators must authenticate using multi-factor authentication (MFA) before accessing the secure zone. Access is logged and monitored in real-time. Session timeouts are enforced after 8 hours of inactivity. Access rights are reviewed quarterly by the security team.', 
          relevance: 88, 
          control_id: 'SWIFT-1.1', 
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '1.1.d.2': [
        { 
          id: '3', 
          type: 'Log', 
          filename: 'remote_access_audit.log', 
          preview: '2024-01-10 09:15:42 [REMOTE] Remote operator teleworker-usr-789 connected via VPN. MFA verified. Source IP: 203.0.113.45 (whitelisted). Access granted to SWIFT-CORE-02. Session encrypted with TLS 1.3. On-call staff member: John Doe (ID: emp_456).', 
          relevance: 90, 
          control_id: 'SWIFT-1.1', 
          timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '1.1.e': [
        { 
          id: '4', 
          type: 'Document', 
          filename: 'network_segmentation.pdf', 
          preview: 'Network Architecture Document v2.1: The SWIFT secure zone (VLAN 100) is physically and logically separated from general enterprise IT services (VLAN 200-500). Firewall rules enforce strict isolation. No direct network paths exist between secure zone and enterprise networks. All inter-zone communication requires explicit approval and is logged.', 
          relevance: 85, 
          control_id: 'SWIFT-1.1', 
          timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '1.2': [
        { 
          id: '5', 
          type: 'Log', 
          filename: 'privileged_account_audit.log', 
          preview: '2024-01-20 11:08:33 [PRIV] Privileged account swift-admin-01 used for system configuration change. User: Jane Smith. Action: Modified firewall rule FW-001. Approval: Approved by Security Manager (ticket #INC-7892). Session recorded and archived. Total privileged accounts active: 3 (within limit of 5).', 
          relevance: 95, 
          control_id: 'SWIFT-1.2', 
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '6', 
          type: 'Document', 
          filename: 'privileged_access_policy.pdf', 
          preview: 'Privileged Account Management Policy: Maximum of 5 privileged accounts allowed for operating systems in SWIFT environment. All privileged account usage requires approval workflow. Accounts are reviewed monthly. Privileged sessions are recorded and cannot be deleted. Account access is restricted to business hours only.', 
          relevance: 91, 
          control_id: 'SWIFT-1.2', 
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '1.3': [
        { 
          id: '7', 
          type: 'Document', 
          filename: 'virtualization_audit_report.pdf', 
          preview: 'Virtualization Security Audit Report Q4 2023: CRITICAL FINDINGS - Missing security controls detected on hypervisor platform. 3 VMs running unpatched ESXi 6.7 (CVE-2023-XXXX). Management console access not restricted to dedicated network segment. Missing host-based firewall rules. Remediation required within 30 days.', 
          relevance: 45, 
          control_id: 'SWIFT-1.3', 
          timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '8', 
          type: 'Log', 
          filename: 'vm_security_gaps.log', 
          preview: '2024-01-18 16:22:11 [SECURITY] VM Security Scan Results: VM-APP-03: Missing hardening controls (CIS Benchmark score: 45/100). VM-DB-01: Unsecured management interface detected. VM-WEB-02: Outdated security patches (last patch: 2023-08-15). Total gaps: 12. Status: NON-COMPLIANT.', 
          relevance: 40, 
          control_id: 'SWIFT-1.3', 
          timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '1.4': [
        { 
          id: '8', 
          type: 'Log', 
          filename: 'internet_access_control.log', 
          preview: '2024-01-21 08:45:22 [FIREWALL] Internet access request DENIED. Source: SWIFT-CORE-01 (10.0.1.10). Destination: api.github.com (140.82.112.3). Reason: Internet access restricted per SWIFT CSCF policy. Allowed destinations: SWIFT network endpoints only. Request logged for audit.', 
          relevance: 89, 
          control_id: 'SWIFT-1.4', 
          timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 2 - Know and Limit Access
      '2.1': [
        { 
          id: '10', 
          type: 'Log', 
          filename: 'data_flow_security.log', 
          preview: '2024-01-22 13:27:55 [DATAFLOW] Internal data transfer: SWIFT-CORE-01 → SWIFT-DB-01. Protocol: TLS 1.3. Encryption: AES-256-GCM. Integrity check: SHA-256 HMAC verified. Data size: 2.3 MB. Transfer successful. All data flows encrypted and authenticated per policy.', 
          relevance: 93, 
          control_id: 'SWIFT-2.1', 
          timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.2': [
        { 
          id: '11', 
          type: 'Log', 
          filename: 'security_updates.log', 
          preview: '2024-01-25 02:15:00 [PATCH] Security update applied: Windows Server 2022 KB5034204 (Critical). System: SWIFT-CORE-01. Patch tested in staging environment. Installation successful. Reboot completed. Verification: All services operational. Next scheduled patch cycle: 2024-02-08.', 
          relevance: 94, 
          control_id: 'SWIFT-2.2', 
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '12', 
          type: 'Document', 
          filename: 'patch_management_policy.pdf', 
          preview: 'Security Update Management Policy v3.0: Critical security patches must be applied within 7 days of release. Patches are tested in isolated staging environment before production deployment. All patch applications are logged and verified. Monthly patch review meetings ensure compliance with SWIFT CSCF requirements.', 
          relevance: 90, 
          control_id: 'SWIFT-2.2', 
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.3': [
        { 
          id: '13', 
          type: 'Document', 
          filename: 'hardening_assessment.pdf', 
          preview: 'System Hardening Assessment Report: NON-COMPLIANT - 8 out of 12 systems fail hardening benchmarks. Missing configurations: Unnecessary services enabled (FTP, Telnet), default passwords not changed, audit logging incomplete, firewall rules not applied. Remediation deadline: 2024-02-15. Risk level: HIGH.', 
          relevance: 35, 
          control_id: 'SWIFT-2.3', 
          timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '14', 
          type: 'Log', 
          filename: 'hardening_failures.log', 
          preview: '2024-01-16 10:30:45 [HARDEN] Hardening Compliance Scan: SWIFT-CORE-01: FAIL (Score: 45/100). SWIFT-DB-01: FAIL (Score: 52/100). SWIFT-WEB-01: PASS (Score: 88/100). Overall compliance: 40% (5/12 systems compliant). Action required: Immediate remediation.', 
          relevance: 38, 
          control_id: 'SWIFT-2.3', 
          timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.6': [
        { 
          id: '14', 
          type: 'Log', 
          filename: 'operator_session_logs.log', 
          preview: '2024-01-19 09:12:33 [SESSION] Operator session established: User: admin@swift.local. Session ID: sess_xyz789. Encryption: TLS 1.3 with perfect forward secrecy. Cipher: AES-256-GCM. Session integrity verified. All operator communications encrypted and logged per SWIFT CSCF 2.6.', 
          relevance: 91, 
          control_id: 'SWIFT-2.6', 
          timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.7': [
        { 
          id: '15', 
          type: 'Log', 
          filename: 'vulnerability_scan_results.log', 
          preview: '2024-01-23 03:00:00 [VULN-SCAN] Weekly vulnerability scan completed. Scanned: 12 systems. Critical: 0, High: 2, Medium: 8, Low: 15. All critical vulnerabilities remediated. High severity items scheduled for patch deployment (ticket #INC-8012). Scan compliance: 100%.', 
          relevance: 96, 
          control_id: 'SWIFT-2.7', 
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '16', 
          type: 'Document', 
          filename: 'vuln_scanning_policy.pdf', 
          preview: 'Vulnerability Scanning Policy: Automated vulnerability scans performed weekly on all SWIFT systems. External scans conducted monthly by third-party vendor. Critical vulnerabilities must be patched within 7 days. All scan results are reviewed by security team and tracked in vulnerability management system.', 
          relevance: 92, 
          control_id: 'SWIFT-2.7', 
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.9': [
        { 
          id: '17', 
          type: 'Log', 
          filename: 'transaction_monitoring.log', 
          preview: '2024-01-14 14:55:12 [TX-MONITOR] SWIFT transaction processed: MT103 payment. Amount: EUR 125,000.00. Sender: BANK-A. Receiver: BANK-B. Dual authorization verified (User1 + User2). Transaction limits checked: PASS. Business controls enforced. Transaction approved and logged.', 
          relevance: 89, 
          control_id: 'SWIFT-2.9', 
          timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '2.10': [
        { 
          id: '18', 
          type: 'Document', 
          filename: 'app_security_review.pdf', 
          preview: 'Application Security Review Q4 2023: GAPS IDENTIFIED - Application hardening procedures not documented. 3 applications have unsecured REST API interfaces (no authentication). Missing input validation on payment processing module. Security headers not configured. Remediation plan required by 2024-02-20.', 
          relevance: 42, 
          control_id: 'SWIFT-2.10', 
          timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 3 - Physical Security
      '3.1': [
        { 
          id: '19', 
          type: 'Document', 
          filename: 'physical_security_audit.pdf', 
          preview: 'Physical Security Audit Report: Data center access controlled via badge readers and biometric authentication. CCTV coverage: 100% of critical areas. Visitor logs maintained. Environmental controls: Temperature 20-22°C, Humidity 45-55%. Fire suppression system tested quarterly. All physical security controls operational and compliant.', 
          relevance: 88, 
          control_id: 'SWIFT-3.1', 
          timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 4 - Authentication and Access Control
      '4.1': [
        { 
          id: '20', 
          type: 'Document', 
          filename: 'password_policy.pdf', 
          preview: 'Password Policy v4.2: Minimum length: 16 characters. Complexity: Upper, lower, numbers, special characters required. Password history: 12 previous passwords cannot be reused. Maximum age: 90 days. Password attempts: 5 failed attempts lock account for 30 minutes. Policy enforced via Active Directory GPO.', 
          relevance: 93, 
          control_id: 'SWIFT-4.1', 
          timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '21', 
          type: 'Log', 
          filename: 'password_compliance.log', 
          preview: '2024-01-24 11:20:15 [PASSWORD] Password policy compliance check: 145/150 accounts compliant (96.7%). 5 accounts flagged for password expiration (due within 7 days). Enforcement: Automatic password reset notifications sent. All non-compliant accounts will be locked per policy.', 
          relevance: 90, 
          control_id: 'SWIFT-4.1', 
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '4.2': [
        { 
          id: '22', 
          type: 'Log', 
          filename: 'mfa_authentication.log', 
          preview: '2024-01-27 08:45:22 [MFA] Multi-factor authentication successful: User: jane.smith@swift.local. Method: TOTP (Google Authenticator). Primary auth: Password. Secondary auth: 6-digit code verified. Session established. MFA compliance: 100% (all users enrolled).', 
          relevance: 97, 
          control_id: 'SWIFT-4.2', 
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '23', 
          type: 'Document', 
          filename: 'mfa_policy.pdf', 
          preview: 'Multi-Factor Authentication Policy: MFA required for all user accounts accessing SWIFT systems. Supported methods: TOTP apps, hardware tokens, SMS (backup only). MFA must be used for initial login and re-authentication every 8 hours. Exemptions require CISO approval. Policy compliance: 100%.', 
          relevance: 95, 
          control_id: 'SWIFT-4.2', 
          timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 5 - Access Management
      '5.1': [
        { 
          id: '24', 
          type: 'Document', 
          filename: 'logical_access_control.pdf', 
          preview: 'Logical Access Control Policy: Role-based access control (RBAC) implemented. Access rights granted based on job function and least privilege principle. Access reviews conducted quarterly. All access changes require manager approval. Access logs maintained for 7 years. Unused accounts deactivated after 90 days of inactivity.', 
          relevance: 91, 
          control_id: 'SWIFT-5.1', 
          timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '5.2': [
        { 
          id: '25', 
          type: 'Log', 
          filename: 'token_audit.log', 
          preview: '2024-01-19 15:33:18 [TOKEN-AUDIT] Token management audit FAILED: 12 tokens unaccounted. Token lifecycle tracking incomplete. 3 expired tokens still active. No token rotation policy documented. Token inventory missing for 5 API services. Status: NON-COMPLIANT. Remediation required.', 
          relevance: 30, 
          control_id: 'SWIFT-5.2', 
          timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '26', 
          type: 'Document', 
          filename: 'token_gaps.pdf', 
          preview: 'Token Management Gap Analysis: CRITICAL GAPS - No centralized token registry. Token expiration not enforced. Missing token rotation procedures. No audit trail for token usage. Token revocation process undefined. Recommendation: Implement token management system and establish token lifecycle procedures.', 
          relevance: 35, 
          control_id: 'SWIFT-5.2', 
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '5.4': [
        { 
          id: '26', 
          type: 'Document', 
          filename: 'password_storage_policy.pdf', 
          preview: 'Password Repository Protection Policy: All passwords stored using bcrypt hashing (cost factor 12). Salt values unique per password. Password repository access restricted to security team only. Repository encrypted at rest (AES-256). Access logs maintained. Repository backed up securely. Compliance: 100%.', 
          relevance: 89, 
          control_id: 'SWIFT-5.4', 
          timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 6 - Protection and Integrity
      '6.1': [
        { 
          id: '27', 
          type: 'Log', 
          filename: 'malware_protection.log', 
          preview: '2024-01-20 04:00:00 [ANTIVIRUS] Daily malware scan completed: 12 systems scanned, 0 threats detected. Signature database: Updated (version 2024.01.20.001). Real-time protection: ACTIVE. Quarantine: 0 items. All systems protected. Next scan: 2024-01-21 04:00:00.', 
          relevance: 92, 
          control_id: 'SWIFT-6.1', 
          timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '6.2': [
        { 
          id: '28', 
          type: 'Document', 
          filename: 'software_integrity_audit.pdf', 
          preview: 'Software Integrity Audit Report: CRITICAL FINDINGS - No integrity verification procedures documented. 8 unsigned binaries detected in production. No code signing certificates in use. Missing file integrity monitoring (FIM) system. No baseline established for software components. Immediate remediation required.', 
          relevance: 25, 
          control_id: 'SWIFT-6.2', 
          timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '29', 
          type: 'Log', 
          filename: 'integrity_failures.log', 
          preview: '2024-01-25 14:18:42 [INTEGRITY] Software integrity check FAILED: /opt/swift/bin/payment-processor: No signature found. /usr/local/lib/swift-core.so: Hash mismatch. /var/swift/config/app.conf: Modified without approval. Total failures: 11. Status: NON-COMPLIANT.', 
          relevance: 28, 
          control_id: 'SWIFT-6.2', 
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '6.3': [
        { 
          id: '29', 
          type: 'Log', 
          filename: 'database_integrity.log', 
          preview: '2024-01-18 23:00:00 [DB-INTEGRITY] Database integrity check completed: Database: swift_transactions_db. Tables checked: 45. Checksums verified: 100% match. No corruption detected. Referential integrity: PASS. Transaction log integrity: VERIFIED. All database integrity checks passed.', 
          relevance: 90, 
          control_id: 'SWIFT-6.3', 
          timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '6.4': [
        { 
          id: '30', 
          type: 'Log', 
          filename: 'security_monitoring.log', 
          preview: '2024-01-28 12:45:33 [SIEM] Security event logged: Event ID: SEC-2024-001234. Type: Authentication success. User: admin@swift.local. Source IP: 10.0.1.45. Timestamp: 2024-01-28T12:45:33Z. All security events logged to SIEM. Real-time monitoring: ACTIVE. Alert threshold: 5 failed attempts.', 
          relevance: 94, 
          control_id: 'SWIFT-6.4', 
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: '31', 
          type: 'Document', 
          filename: 'logging_policy.pdf', 
          preview: 'Logging and Monitoring Policy: All security events logged to centralized SIEM. Log retention: 7 years. Real-time monitoring for authentication failures, privilege escalations, and data access. Alerts configured for suspicious activities. Logs are tamper-proof and archived. Compliance: 100%.', 
          relevance: 91, 
          control_id: 'SWIFT-6.4', 
          timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      // Section 7 - Incident Response and Training
      '7.1': [
        { 
          id: '32', 
          type: 'Document', 
          filename: 'incident_response_plan.pdf', 
          preview: 'Cyber Incident Response Plan v3.1: Incident response team defined (CISO, Security Analysts, IT Operations). Escalation procedures documented. Communication plan includes stakeholders and regulatory notifications. Containment procedures for different incident types. Recovery and post-incident review processes. Plan tested quarterly.', 
          relevance: 89, 
          control_id: 'SWIFT-7.1', 
          timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ],
      '7.2': [
        { 
          id: '33', 
          type: 'Document', 
          filename: 'security_training.pdf', 
          preview: 'Security Awareness Training Records Q3 2023: All 150 employees completed annual security awareness training. Topics covered: Phishing, password security, data handling, incident reporting. Training completion: 100%. Quiz scores: Average 87%. Training materials updated quarterly. Next training: Q1 2024.', 
          relevance: 87, 
          control_id: 'SWIFT-7.2', 
          timestamp: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() 
        }
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
      ],
      // ISO/IEC 27001:2022 mock evidence (grouped by Annex A clause families)
      'A.5': [
        { id: 'ISO-5-1', type: 'Document', filename: 'iso27001_information_security_policy.pdf', preview: 'ISO/IEC 27001:2022-compliant information security policy approved by executive management, communicated to all personnel, and reviewed annually.', relevance: 94, control_id: 'A.5.1', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-5-2', type: 'Document', filename: 'iso27001_roles_and_responsibilities_matrix.xlsx', preview: 'RACI matrix defining information security roles and responsibilities across the organization, including ISMS owner, risk owners, and control owners.', relevance: 92, control_id: 'A.5.2', timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-5-3', type: 'Log', filename: 'segregation_of_duties_change_log.log', preview: 'Change management and production access logs demonstrating segregation of duties between developers, approvers, and deployers.', relevance: 90, control_id: 'A.5.3', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'A.6': [
        { id: 'ISO-6-1', type: 'Document', filename: 'pre_employment_screening_procedure.pdf', preview: 'Background verification procedure describing screening checks for employees, contractors, and temporary staff, aligned with local regulations.', relevance: 91, control_id: 'A.6.1', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-6-2', type: 'Document', filename: 'security_awareness_training_records.csv', preview: 'Training completion records showing that personnel have completed annual information security and privacy awareness training.', relevance: 93, control_id: 'A.6.3', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'A.7': [
        { id: 'ISO-7-1', type: 'Document', filename: 'physical_security_design.pdf', preview: 'Physical security design for offices and data rooms showing security perimeters, access control points, CCTV coverage, and alarm systems.', relevance: 92, control_id: 'A.7.1', timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-7-2', type: 'Log', filename: 'badge_access_logs.log', preview: 'Physical entry logs for secure areas demonstrating enforcement of badge-based access controls and monitoring of unauthorized attempts.', relevance: 95, control_id: 'A.7.2', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'A.8': [
        { id: 'ISO-8-1', type: 'Log', filename: 'endpoint_protection_logs.log', preview: 'Endpoint protection logs showing anti-malware status, blocked threats, and policy enforcement across laptops and workstations.', relevance: 94, control_id: 'A.8.7', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-8-2', type: 'Log', filename: 'vulnerability_scan_results_iso27001.log', preview: 'Technical vulnerability scan reports and remediation tracking demonstrating active vulnerability management aligned with ISO/IEC 27001:2022 requirements.', relevance: 93, control_id: 'A.8.8', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'ISO-8-3', type: 'Document', filename: 'backup_and_recovery_strategy.pdf', preview: 'Backup and recovery strategy describing backup frequency, off-site storage, restore testing schedule, and RPO/RTO targets.', relevance: 91, control_id: 'A.8.13', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      // PCI DSS v4.0 mock evidence (grouped by requirement sections)
      'PCI.1': [
        { id: 'PCI-1-1', type: 'Document', filename: 'pci_network_security_controls_policy.pdf', preview: 'PCI DSS v4.0 network security controls (NSC) policy defining firewall rules, network segmentation, DMZ architecture, and wireless network isolation for the Cardholder Data Environment (CDE).', relevance: 93, control_id: 'PCI.1.1', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-1-2', type: 'Log', filename: 'cde_network_connection_logs.log', preview: 'Network connection logs demonstrating restriction of traffic between CDE and other networks to only necessary, authorized connections per PCI DSS requirement 1.2.', relevance: 95, control_id: 'PCI.1.2', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.2': [
        { id: 'PCI-2-1', type: 'Document', filename: 'pci_system_configuration_standards.pdf', preview: 'PCI DSS v4.0 system configuration standards applied to all system components addressing known vulnerabilities, default passwords, and secure configuration baselines.', relevance: 92, control_id: 'PCI.2.1', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-2-2', type: 'Log', filename: 'configuration_compliance_scan.log', preview: 'Configuration compliance scan results showing adherence to PCI DSS secure configuration standards across all system components in the CDE.', relevance: 94, control_id: 'PCI.2.2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.3': [
        { id: 'PCI-3-1', type: 'Document', filename: 'pci_data_retention_disposal_policy.pdf', preview: 'PCI DSS v4.0 data retention and disposal policy defining retention periods for cardholder data, secure deletion procedures, and media destruction processes.', relevance: 91, control_id: 'PCI.3.1', timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-3-2', type: 'Log', filename: 'pan_encryption_verification.log', preview: 'Primary Account Number (PAN) encryption verification logs demonstrating that PAN is rendered unreadable using strong cryptography, truncation, or hashing per PCI DSS requirement 3.4.', relevance: 96, control_id: 'PCI.3.4', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-3-3', type: 'Document', filename: 'pci_key_management_procedures.pdf', preview: 'Key management procedures protecting encryption keys used for cardholder data, including key generation, distribution, storage, rotation, and destruction per PCI DSS requirement 3.5.', relevance: 93, control_id: 'PCI.3.5', timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.4': [
        { id: 'PCI-4-1', type: 'Document', filename: 'pci_transmission_security_policy.pdf', preview: 'PCI DSS v4.0 transmission security policy requiring strong cryptography (TLS 1.2+) for PAN transmission over open, public networks.', relevance: 94, control_id: 'PCI.4.1', timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-4-2', type: 'Log', filename: 'tls_encryption_verification.log', preview: 'TLS encryption verification logs confirming that all PAN transmissions over public networks use strong cryptography meeting PCI DSS requirement 4.2.', relevance: 95, control_id: 'PCI.4.2', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.5': [
        { id: 'PCI-5-1', type: 'Document', filename: 'pci_malware_protection_policy.pdf', preview: 'PCI DSS v4.0 malware protection policy requiring anti-malware mechanisms on all systems commonly affected by malware, with automatic updates and periodic scans.', relevance: 92, control_id: 'PCI.5.1', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-5-2', type: 'Log', filename: 'antimalware_status_reports.log', preview: 'Anti-malware status reports showing active protection, signature updates, and scan results across all systems in the CDE per PCI DSS requirement 5.2.', relevance: 94, control_id: 'PCI.5.2', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.6': [
        { id: 'PCI-6-1', type: 'Document', filename: 'pci_secure_development_lifecycle.pdf', preview: 'PCI DSS v4.0 secure software development lifecycle (SDLC) policy incorporating security requirements, secure coding practices, and vulnerability management.', relevance: 91, control_id: 'PCI.6.1', timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-6-2', type: 'Log', filename: 'code_review_security_findings.log', preview: 'Secure code review findings and remediation tracking demonstrating that bespoke and custom software is developed securely per PCI DSS requirement 6.2.', relevance: 93, control_id: 'PCI.6.2', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-6-3', type: 'Log', filename: 'vulnerability_risk_ranking.log', preview: 'Vulnerability risk ranking process logs showing identification, prioritization, and remediation of security vulnerabilities per PCI DSS requirement 6.3.', relevance: 92, control_id: 'PCI.6.3', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.7': [
        { id: 'PCI-7-1', type: 'Document', filename: 'pci_access_control_policy.pdf', preview: 'PCI DSS v4.0 access control policy implementing least privilege and need-to-know principles for access to system components and cardholder data.', relevance: 93, control_id: 'PCI.7.1', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-7-2', type: 'Log', filename: 'access_rights_review.log', preview: 'Access rights review logs demonstrating that access to system components and cardholder data is defined and assigned according to business need-to-know per PCI DSS requirement 7.2.', relevance: 94, control_id: 'PCI.7.2', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.8': [
        { id: 'PCI-8-1', type: 'Document', filename: 'pci_authentication_policy.pdf', preview: 'PCI DSS v4.0 authentication policy requiring unique user IDs, strong authentication, and Multi-Factor Authentication (MFA) for all non-console access into the CDE.', relevance: 95, control_id: 'PCI.8.1', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-8-2', type: 'Log', filename: 'unique_user_id_verification.log', preview: 'User ID verification logs confirming that each person with access to system components has a unique ID per PCI DSS requirement 8.2.', relevance: 96, control_id: 'PCI.8.2', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-8-3', type: 'Log', filename: 'mfa_enforcement_cde.log', preview: 'Multi-Factor Authentication (MFA) enforcement logs demonstrating MFA implementation for all non-console access into the Cardholder Data Environment per PCI DSS requirement 8.4.', relevance: 97, control_id: 'PCI.8.4', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.9': [
        { id: 'PCI-9-1', type: 'Document', filename: 'pci_physical_security_policy.pdf', preview: 'PCI DSS v4.0 physical security policy restricting physical access to cardholder data, including facility access controls, visitor management, and media handling procedures.', relevance: 92, control_id: 'PCI.9.1', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-9-2', type: 'Log', filename: 'physical_access_cde_logs.log', preview: 'Physical access control logs for the Cardholder Data Environment showing badge access, visitor escorts, and monitoring of physical access per PCI DSS requirement 9.2.', relevance: 94, control_id: 'PCI.9.2', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.10': [
        { id: 'PCI-10-1', type: 'Document', filename: 'pci_logging_monitoring_policy.pdf', preview: 'PCI DSS v4.0 logging and monitoring policy requiring audit logs for all activity within the CDE and related to cardholder data, with log protection and review procedures.', relevance: 93, control_id: 'PCI.10.1', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-10-2', type: 'Log', filename: 'cde_audit_logs.log', preview: 'Audit logs generated for all activity within the Cardholder Data Environment and related to cardholder data, demonstrating compliance with PCI DSS requirement 10.2.', relevance: 96, control_id: 'PCI.10.2', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-10-3', type: 'Log', filename: 'log_review_anomaly_detection.log', preview: 'Audit log review records identifying anomalies and suspicious activity, with evidence of regular log analysis per PCI DSS requirement 10.4.', relevance: 94, control_id: 'PCI.10.4', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.11': [
        { id: 'PCI-11-1', type: 'Document', filename: 'pci_security_testing_policy.pdf', preview: 'PCI DSS v4.0 security testing policy requiring vulnerability scanning, penetration testing, and wireless access point monitoring per PCI DSS requirement 11.', relevance: 92, control_id: 'PCI.11.1', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-11-2', type: 'Log', filename: 'wireless_access_point_scan.log', preview: 'Wireless access point identification and monitoring logs, with evidence of addressing unauthorized wireless access points per PCI DSS requirement 11.2.', relevance: 93, control_id: 'PCI.11.2', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-11-3', type: 'Log', filename: 'pci_vulnerability_scan_results.log', preview: 'Internal and external vulnerability scan results with risk prioritization and remediation tracking per PCI DSS requirement 11.3.', relevance: 95, control_id: 'PCI.11.3', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-11-4', type: 'Document', filename: 'penetration_test_report.pdf', preview: 'Penetration test report demonstrating annual penetration testing to identify and correct exploitable vulnerabilities per PCI DSS requirement 11.4.', relevance: 94, control_id: 'PCI.11.4', timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      'PCI.12': [
        { id: 'PCI-12-1', type: 'Document', filename: 'pci_information_security_policy.pdf', preview: 'PCI DSS v4.0 information security policy established, published, maintained, and disseminated to all personnel, reviewed annually per PCI DSS requirement 12.1.', relevance: 94, control_id: 'PCI.12.1', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-12-2', type: 'Document', filename: 'pci_risk_assessment_cde.pdf', preview: 'Formal risk assessment for the cardholder data environment identifying, evaluating, and managing risks to cardholder data per PCI DSS requirement 12.3.', relevance: 93, control_id: 'PCI.12.3', timestamp: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-12-3', type: 'Document', filename: 'pci_scope_validation_report.pdf', preview: 'PCI DSS scope validation and compliance documentation demonstrating annual validation of CDE scope and compliance status per PCI DSS requirement 12.5.', relevance: 95, control_id: 'PCI.12.5', timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-12-4', type: 'Document', filename: 'pci_security_awareness_training_records.csv', preview: 'Security awareness education completion records showing that all personnel have received PCI DSS security awareness training per requirement 12.6.', relevance: 92, control_id: 'PCI.12.6', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-12-5', type: 'Document', filename: 'pci_third_party_service_provider_agreements.pdf', preview: 'Third-Party Service Provider (TPSP) agreements and due diligence documentation demonstrating management of TPSPs to support cardholder data security per PCI DSS requirement 12.9.', relevance: 91, control_id: 'PCI.12.9', timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'PCI-12-6', type: 'Document', filename: 'pci_incident_response_plan.pdf', preview: 'PCI DSS v4.0 incident response plan implemented and tested to respond to suspected or confirmed security incidents affecting cardholder data per requirement 12.10.', relevance: 93, control_id: 'PCI.12.10', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
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

        // Add all evidence items for this question into the shared pack list.
        // Deduplication is handled by DashboardLayout's addEvidenceToPack implementation.
        evidenceItems.forEach((item) => addEvidenceToPack(item));

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
      {/* Action Buttons - Above all components */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={answered !== total}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${answered === total
                ? 'bg-blue-900 text-white hover:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Control Status
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {framework === 'SOC2'
                ? 'SOC 2 Compliance Assessment'
                : framework === 'ISO27001_2022'
                  ? 'ISO/IEC 27001:2022 Compliance Assessment'
                  : framework === 'PCI_DSS'
                    ? 'PCI DSS v4.0 Compliance Assessment'
                    : 'SWIFT CSP v2025 Compliance Assessment'}
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
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

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
              ? `Auto-Answering using Telescope AI... (${autoAnswerProgress.current}/${autoAnswerProgress.total})`
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

                            {/* Evidence Items - Card Format */}
                            {currentAnswer?.evidence && currentAnswer.evidence.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <FileCheck className="w-4 h-4" />
                                  Evidence Found ({currentAnswer.evidence.length}):
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  <AnimatePresence>
                                    {currentAnswer.evidence.map((item, idx) => {
                                      const isOutdated = isEvidenceOutdated(item.timestamp);
                                      return (
                                        <motion.div
                                          key={`${item.id}-${item.type}-${idx}`}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                                          onClick={() => {
                                            setCurrentEvidence(item);
                                            setIsModalOpen(true);
                                          }}
                                        >
                                          <div className="flex justify-between items-start gap-4">
                                            <div className="flex gap-3 flex-1 min-w-0">
                                              {/* Icon */}
                                              <div className={`p-2 rounded-lg flex-shrink-0 ${item.type === 'Log' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {item.type === 'Log' ? (
                                                  <Database className="w-5 h-5" />
                                                ) : (
                                                  <FileText className="w-5 h-5" />
                                                )}
                                              </div>
                                              
                                              {/* Content */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                  <h5 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                                                    {item.filename}
                                                  </h5>
                                                  {item.control_id && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 font-mono flex-shrink-0">
                                                      {item.control_id}
                                                    </span>
                                                  )}
                                                  {isOutdated && (
                                                    <div className="flex items-center gap-1 text-orange-600 flex-shrink-0" title="Outdated evidence (older than 90 days)">
                                                      <Clock className="w-3 h-3" />
                                                      <span className="text-xs">Outdated</span>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                {/* Preview */}
                                                <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border border-gray-100 mb-2 line-clamp-2">
                                                  {item.preview}
                                                </p>
                                                
                                                {/* Metadata */}
                                                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                                                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                                                  <span>ID: {item.id}</span>
                                                  {item.control_id && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                                                      Control: {item.control_id}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Relevance Score */}
                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold">
                                                <Sparkles className="w-3 h-3" />
                                                {item.relevance}%
                                              </div>
                                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-900 transition-colors" />
                                            </div>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </AnimatePresence>
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

      {/* Evidence Detail Modal - Hide actions since evidence is auto-added during assessment */}
      <EvidenceDetailModal
        evidence={currentEvidence}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hideActions={true}
      />
    </div>
  );
};

export default ComplianceAssessment;
