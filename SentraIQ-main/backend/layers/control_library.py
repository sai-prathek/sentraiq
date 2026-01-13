"""
Control Library: Comprehensive control catalog with framework overlaps
Supports SWIFT CSP, SOC 2, and cross-compliance synergies
"""
from typing import Dict, List, Any, Optional
from enum import Enum
import json
import os
from pathlib import Path


class Framework(str, Enum):
    """Supported compliance frameworks"""
    SWIFT_CSP = "SWIFT_CSP"
    SOC2 = "SOC2"
    PCI_DSS = "PCI_DSS"
    ISO27001 = "ISO27001"
    NIST = "NIST"


class ControlType(str, Enum):
    """Control requirement types"""
    MANDATORY = "mandatory"
    ADVISORY = "advisory"


class InfrastructureType(str, Enum):
    """Infrastructure architectures"""
    CLOUD_A4 = "Cloud A4"
    ON_PREM = "On-Premises"
    HYBRID = "Hybrid"
    SWIFT_TERMINAL = "SWIFT Terminal"
    PAYMENT_GATEWAY = "Payment Gateway"


class SwiftArchitectureType(str, Enum):
    """SWIFT CSP Architecture Types"""
    A1 = "A1"
    A2 = "A2"
    A3 = "A3"
    A4 = "A4"
    B = "B"


# Control Library: SWIFT CSP Controls
SWIFT_CONTROLS: Dict[str, Dict[str, Any]] = {
    "SWIFT-1.1": {
        "control_id": "SWIFT-1.1",
        "name": "SWIFT Environment Protection",
        "description": "Protect the SWIFT environment from unauthorized access and threats",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["swift", "environment", "protection", "secure zone", "isolation"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Is the SWIFT environment protected and isolated?",
            "Are secure zones properly configured?",
            "Is environment access restricted and monitored?"
        ],
        "evidence_types": ["network_diagrams", "security_configs", "access_logs"]
    },
    "SWIFT-1.2": {
        "control_id": "SWIFT-1.2",
        "name": "Operating System Privileged Account Control",
        "description": "Control and monitor privileged accounts on operating systems",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["privileged", "account", "operating system", "access control", "admin"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are privileged accounts controlled and monitored?",
            "Is privileged access reviewed regularly?",
            "Are privileged account activities logged?"
        ],
        "evidence_types": ["access_logs", "privileged_account_reviews", "configurations"]
    },
    "SWIFT-2.1": {
        "control_id": "SWIFT-2.1",
        "name": "Internal Data Flow Security",
        "description": "Secure data flow within the internal network",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["data flow", "internal", "network", "security", "communication"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Is internal data flow secured?",
            "Are network communications encrypted?",
            "Is data flow monitored and logged?"
        ],
        "evidence_types": ["network_logs", "encryption_configs", "monitoring_reports"]
    },
    "SWIFT-2.7": {
        "control_id": "SWIFT-2.7",
        "name": "Vulnerability Scanning",
        "description": "Perform vulnerability scanning of SWIFT-related infrastructure",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["vulnerability", "scanning", "tenable", "nessus", "penetration", "security_test"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are vulnerability scans performed quarterly?",
            "Are critical vulnerabilities remediated within 30 days?",
            "Are scan results reviewed and documented?"
        ],
        "evidence_types": ["scan_reports", "vulnerability_logs", "remediation_tickets"]
    },
    "SWIFT-2.8": {
        "control_id": "SWIFT-2.8",
        "name": "Critical Outsourced Service Provider Selection",
        "description": "Select and manage critical outsourced service providers",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["service provider", "outsourcing", "vendor", "selection", "management"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are service providers selected based on security criteria?",
            "Are service provider controls reviewed?",
            "Are service provider agreements documented?"
        ],
        "evidence_types": ["vendor_assessments", "service_agreements", "review_reports"]
    },
    "SWIFT-3.1": {
        "control_id": "SWIFT-3.1",
        "name": "Physical Security",
        "description": "Physical security controls for SWIFT infrastructure including data centers, server rooms, and connector environments",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["physical", "security", "data center", "server room", "access control", "connector"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Are physical access controls implemented?",
            "Is the data center/server room secured?",
            "Are physical access logs maintained?",
            "Is connector server room secured (if applicable)?"
        ],
        "evidence_types": ["access_logs", "security_policies", "cctv_reports", "physical_security_assessments"]
    },
    "SWIFT-1.3": {
        "control_id": "SWIFT-1.3",
        "name": "Virtualisation Platform Protection",
        "description": "Protect virtualisation platforms hosting SWIFT infrastructure",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["virtualisation", "hypervisor", "vm", "virtual machine", "platform"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Are hypervisors hardened and secured?",
            "Is virtualisation platform access restricted?",
            "Are VM configurations reviewed regularly?"
        ],
        "evidence_types": ["hypervisor_configs", "vm_configurations", "security_reports"]
    },
    "SWIFT-1.4": {
        "control_id": "SWIFT-1.4",
        "name": "Restriction of Internet Access",
        "description": "Restrict internet access to SWIFT environment",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["internet", "access", "restrict", "network", "firewall"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is internet access to SWIFT environment restricted?",
            "Are firewall rules documented and reviewed?",
            "Is network segmentation enforced?"
        ],
        "evidence_types": ["firewall_configs", "network_logs", "access_policies"]
    },
    "SWIFT-1.5": {
        "control_id": "SWIFT-1.5",
        "name": "Customer Environment Protection (Vendor Managed)",
        "description": "Protect customer environment when using vendor-managed services, particularly for connector/middleware environments",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["vendor", "managed", "service provider", "customer environment", "connector", "middleware"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Are vendor-managed services properly secured?",
            "Is customer environment isolated?",
            "Are vendor controls reviewed?",
            "Is connector/middleware environment protected?"
        ],
        "evidence_types": ["vendor_agreements", "security_assessments", "contracts", "connector_configs"]
    },
    "SWIFT-2.2": {
        "control_id": "SWIFT-2.2",
        "name": "Security Updates",
        "description": "Apply security updates to SWIFT-related systems",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["security", "updates", "patches", "vulnerability", "patching"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are security updates applied promptly?",
            "Is a patch management process in place?",
            "Are critical patches applied within SLA?"
        ],
        "evidence_types": ["patch_reports", "update_logs", "vulnerability_reports"]
    },
    "SWIFT-2.3": {
        "control_id": "SWIFT-2.3",
        "name": "System Hardening",
        "description": "Harden SWIFT-related systems according to security baselines",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["hardening", "baseline", "configuration", "security", "system"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are systems hardened according to baselines?",
            "Are hardening configurations documented?",
            "Are hardening checks performed regularly?"
        ],
        "evidence_types": ["hardening_reports", "configuration_files", "baseline_documents"]
    },
    "SWIFT-2.4A": {
        "control_id": "SWIFT-2.4A",
        "name": "Back Office Data Flow Security",
        "description": "Secure data flow between SWIFT environment and back office systems",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["back office", "data flow", "integration", "secure", "communication"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Is data flow to back office systems secured?",
            "Are integration points documented?",
            "Is data flow monitored?"
        ],
        "evidence_types": ["integration_diagrams", "network_logs", "security_reports"]
    },
    "SWIFT-2.5A": {
        "control_id": "SWIFT-2.5A",
        "name": "External Transmission Data Protection",
        "description": "Protect data in transit to external parties",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["transmission", "encryption", "tls", "ssl", "data protection", "external"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is data encrypted in transit?",
            "Are secure protocols used (TLS/SSL)?",
            "Is certificate management in place?"
        ],
        "evidence_types": ["certificate_reports", "encryption_configs", "network_logs"]
    },
    "SWIFT-2.6": {
        "control_id": "SWIFT-2.6",
        "name": "Operator Session Confidentiality",
        "description": "Ensure operator sessions are confidential and secure",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["operator", "session", "confidentiality", "encryption", "gui", "browser"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are operator sessions encrypted?",
            "Is session management implemented?",
            "Are session logs maintained?"
        ],
        "evidence_types": ["session_logs", "encryption_configs", "access_reports"]
    },
    "SWIFT-2.9": {
        "control_id": "SWIFT-2.9",
        "name": "Transaction Business Controls",
        "description": "Implement business controls for SWIFT transactions",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["transaction", "business", "controls", "validation", "authorization"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are transaction controls implemented?",
            "Is transaction validation performed?",
            "Are business rules documented?"
        ],
        "evidence_types": ["transaction_logs", "business_rules", "validation_reports"]
    },
    "SWIFT-2.10": {
        "control_id": "SWIFT-2.10",
        "name": "Application Hardening",
        "description": "Harden SWIFT application software",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["application", "hardening", "software", "configuration", "security"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Is SWIFT application hardened?",
            "Are application configurations secure?",
            "Are application updates applied?"
        ],
        "evidence_types": ["application_configs", "hardening_reports", "update_logs"]
    },
    "SWIFT-2.11A": {
        "control_id": "SWIFT-2.11A",
        "name": "RMA Business Controls",
        "description": "Implement business controls for Relationship Management Application (RMA)",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["rma", "relationship", "management", "business", "controls"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are RMA business controls implemented?",
            "Is RMA access controlled?",
            "Are RMA transactions logged?"
        ],
        "evidence_types": ["rma_logs", "access_reports", "business_rules"]
    },
    "SWIFT-4.1": {
        "control_id": "SWIFT-4.1",
        "name": "Password Policy",
        "description": "Enforce strong password policy for SWIFT access",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["password", "policy", "authentication", "access", "security"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is password policy enforced?",
            "Are password requirements documented?",
            "Is password complexity enforced?"
        ],
        "evidence_types": ["password_policies", "configurations", "audit_logs"]
    },
    "SWIFT-4.2": {
        "control_id": "SWIFT-4.2",
        "name": "Multi-Factor Authentication",
        "description": "Enforce multi-factor authentication for SWIFT access",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["mfa", "multi-factor", "authentication", "2fa", "token", "portal"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is MFA enforced for SWIFT access?",
            "Are MFA tokens managed securely?",
            "Are MFA failures monitored?"
        ],
        "evidence_types": ["mfa_logs", "token_management", "configurations"]
    },
    "SWIFT-5.1": {
        "control_id": "SWIFT-5.1",
        "name": "Logical Access Control",
        "description": "Implement logical access controls for SWIFT systems",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["logical", "access", "control", "authorization", "permission"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are logical access controls implemented?",
            "Is access reviewed regularly?",
            "Are access permissions documented?"
        ],
        "evidence_types": ["access_logs", "permission_matrices", "review_reports"]
    },
    "SWIFT-5.2": {
        "control_id": "SWIFT-5.2",
        "name": "Token Management",
        "description": "Manage authentication tokens securely",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["token", "management", "authentication", "hardware", "mfa"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are tokens managed securely?",
            "Is token inventory maintained?",
            "Are token assignments tracked?"
        ],
        "evidence_types": ["token_inventory", "assignment_logs", "management_policies"]
    },
    "SWIFT-5.3A": {
        "control_id": "SWIFT-5.3A",
        "name": "Personnel Vetting",
        "description": "Vet personnel with access to SWIFT systems",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["personnel", "vetting", "background", "check", "screening"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are personnel vetted before access?",
            "Is vetting process documented?",
            "Are vetting records maintained?"
        ],
        "evidence_types": ["vetting_records", "background_checks", "policies"]
    },
    "SWIFT-5.4": {
        "control_id": "SWIFT-5.4",
        "name": "Physical and Logical Data Protection",
        "description": "Protect data both physically and logically",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["data", "protection", "physical", "logical", "encryption"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is data protected at rest?",
            "Is data protected in transit?",
            "Are encryption keys managed securely?"
        ],
        "evidence_types": ["encryption_configs", "key_management", "data_protection_policies"]
    },
    "SWIFT-6.1": {
        "control_id": "SWIFT-6.1",
        "name": "Malware Protection",
        "description": "Protect SWIFT systems from malware",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["malware", "antivirus", "protection", "security", "threat"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is malware protection implemented?",
            "Are antivirus signatures updated?",
            "Are malware incidents monitored?"
        ],
        "evidence_types": ["antivirus_reports", "threat_logs", "security_reports"]
    },
    "SWIFT-6.2": {
        "control_id": "SWIFT-6.2",
        "name": "Software Integrity",
        "description": "Ensure integrity of SWIFT software",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["software", "integrity", "verification", "signing", "checksum"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is software integrity verified?",
            "Are software signatures checked?",
            "Is software tampering detected?"
        ],
        "evidence_types": ["integrity_reports", "signature_verification", "checksum_logs"]
    },
    "SWIFT-6.3": {
        "control_id": "SWIFT-6.3",
        "name": "Database Integrity",
        "description": "Ensure integrity of SWIFT databases",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["database", "integrity", "backup", "recovery", "data"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Is database integrity maintained?",
            "Are database backups performed?",
            "Is database recovery tested?"
        ],
        "evidence_types": ["backup_reports", "integrity_checks", "recovery_tests"]
    },
    "SWIFT-6.4": {
        "control_id": "SWIFT-6.4",
        "name": "Logging and Monitoring",
        "description": "Maintain comprehensive logging and monitoring",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["logging", "monitoring", "log", "audit", "siem"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are all activities logged?",
            "Is monitoring implemented?",
            "Are logs retained appropriately?"
        ],
        "evidence_types": ["audit_logs", "monitoring_reports", "siem_dashboards"]
    },
    "SWIFT-6.5A": {
        "control_id": "SWIFT-6.5A",
        "name": "Intrusion Detection",
        "description": "Detect intrusions in SWIFT environment",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["intrusion", "detection", "ids", "ips", "edr", "threat"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is intrusion detection implemented?",
            "Are intrusions detected promptly?",
            "Are intrusion alerts reviewed?"
        ],
        "evidence_types": ["ids_logs", "threat_reports", "alert_logs"]
    },
    "SWIFT-7.1": {
        "control_id": "SWIFT-7.1",
        "name": "Cyber Incident Response Planning",
        "description": "Plan and prepare for cyber incidents",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["incident", "response", "planning", "cyber", "security"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is incident response plan documented?",
            "Is incident response team defined?",
            "Are incident response procedures tested?"
        ],
        "evidence_types": ["incident_plans", "response_procedures", "test_reports"]
    },
    "SWIFT-7.2": {
        "control_id": "SWIFT-7.2",
        "name": "Security Training and Awareness",
        "description": "Provide security training and awareness to staff",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["training", "awareness", "security", "education", "staff"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is security training provided?",
            "Are staff aware of security policies?",
            "Is training completion tracked?"
        ],
        "evidence_types": ["training_records", "awareness_materials", "completion_certificates"]
    },
    "SWIFT-7.3A": {
        "control_id": "SWIFT-7.3A",
        "name": "Penetration Testing",
        "description": "Perform penetration testing of SWIFT infrastructure including endpoints, connectors, and user PCs",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["penetration", "testing", "pentest", "security", "assessment", "endpoints", "user pc"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Is penetration testing performed?",
            "Are test results reviewed?",
            "Are findings remediated?",
            "Is user PC security tested (for Architecture B)?"
        ],
        "evidence_types": ["pentest_reports", "remediation_plans", "test_results", "endpoint_testing"]
    },
    "SWIFT-7.4A": {
        "control_id": "SWIFT-7.4A",
        "name": "Scenario Based Risk Assessment",
        "description": "Perform scenario-based risk assessments",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.ADVISORY,
        "keywords": ["risk", "assessment", "scenario", "threat", "analysis"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.SWIFT_TERMINAL],
        "assessment_questions": [
            "Are risk assessments performed?",
            "Are scenarios documented?",
            "Are risks mitigated?"
        ],
        "evidence_types": ["risk_assessments", "scenario_documents", "mitigation_plans"]
    }
}

# SOC 2 Controls
SOC2_CONTROLS: Dict[str, Dict[str, Any]] = {
    "SOC2-CC6.1": {
        "control_id": "SOC2-CC6.1",
        "name": "Logical Access Controls",
        "description": "Implement logical access controls to restrict access to systems and data",
        "framework": Framework.SOC2,
        "type": ControlType.MANDATORY,
        "keywords": ["access", "authentication", "authorization", "login", "permission"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Are logical access controls implemented?",
            "Is access reviewed quarterly?",
            "Are access attempts logged and monitored?"
        ],
        "evidence_types": ["access_logs", "iam_configs", "review_documents"]
    },
    "SOC2-CC6.2": {
        "control_id": "SOC2-CC6.2",
        "name": "Multi-Factor Authentication",
        "description": "Require MFA for privileged access",
        "framework": Framework.SOC2,
        "type": ControlType.MANDATORY,
        "keywords": ["mfa", "two-factor", "2fa", "authentication", "privileged"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Is MFA required for privileged access?",
            "Are MFA failures monitored?",
            "Is MFA policy documented?"
        ],
        "evidence_types": ["mfa_logs", "policy_documents", "configurations"]
    },
    "SOC2-CC7.1": {
        "control_id": "SOC2-CC7.1",
        "name": "System Monitoring",
        "description": "Monitor system activities and detect anomalies",
        "framework": Framework.SOC2,
        "type": ControlType.MANDATORY,
        "keywords": ["monitoring", "log", "audit", "detection", "anomaly", "siem"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Are systems monitored 24/7?",
            "Are anomalies detected and alerted?",
            "Are monitoring logs retained?"
        ],
        "evidence_types": ["monitoring_logs", "alert_reports", "siem_dashboards"]
    },
    "SOC2-CC8.1": {
        "control_id": "SOC2-CC8.1",
        "name": "Change Management",
        "description": "Manage changes to systems and processes",
        "framework": Framework.SOC2,
        "type": ControlType.MANDATORY,
        "keywords": ["change", "management", "approval", "deployment", "version"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Are changes approved before implementation?",
            "Are changes tested?",
            "Are change logs maintained?"
        ],
        "evidence_types": ["change_requests", "deployment_logs", "approval_documents"]
    }
}

# Control Overlap Mapping: Maps controls that satisfy multiple frameworks
CONTROL_OVERLAPS: Dict[str, List[str]] = {
    # SWIFT-4.2 (MFA) overlaps with SOC2-CC6.2 (MFA)
    "SWIFT-4.2": ["SOC2-CC6.2"],
    "SOC2-CC6.2": ["SWIFT-4.2"],
    
    # SWIFT-6.4 (Logging and Monitoring) overlaps with SOC2-CC7.1 (System Monitoring)
    "SWIFT-6.4": ["SOC2-CC7.1"],
    "SOC2-CC7.1": ["SWIFT-6.4"],
    
    # SWIFT-5.1 (Logical Access Control) overlaps with SOC2-CC6.1 (Logical Access)
    "SWIFT-5.1": ["SOC2-CC6.1"],
    "SOC2-CC6.1": ["SWIFT-5.1"],
    
    # SWIFT-4.1 (Password Policy) overlaps with SOC2-CC6.1 (Logical Access)
    "SWIFT-4.1": ["SOC2-CC6.1"],
}

# Infrastructure to Control Mapping
INFRASTRUCTURE_CONTROLS: Dict[str, List[str]] = {
    InfrastructureType.CLOUD_A4: [
        "SWIFT-1.1", "SWIFT-1.2", "SWIFT-2.1", "SWIFT-2.7", "SWIFT-2.8", "SWIFT-3.1",
        "SOC2-CC6.1", "SOC2-CC6.2", "SOC2-CC7.1", "SOC2-CC8.1"
    ],
    InfrastructureType.ON_PREM: [
        "SWIFT-1.1", "SWIFT-1.2", "SWIFT-2.1", "SWIFT-2.7", "SWIFT-2.8", "SWIFT-3.1",
        "SOC2-CC6.1", "SOC2-CC6.2", "SOC2-CC7.1", "SOC2-CC8.1"
    ],
    InfrastructureType.SWIFT_TERMINAL: [
        "SWIFT-2.1", "SWIFT-2.7", "SWIFT-2.8", "SWIFT-3.1"
    ],
    InfrastructureType.PAYMENT_GATEWAY: [
        "SWIFT-1.1", "SWIFT-1.2", "SWIFT-2.8", "SWIFT-3.1",
        "SOC2-CC6.1", "SOC2-CC6.2", "SOC2-CC7.1"
    ]
}


def get_all_controls() -> Dict[str, Dict[str, Any]]:
    """Get all controls from all frameworks"""
    all_controls = {}
    all_controls.update(SWIFT_CONTROLS)
    all_controls.update(SOC2_CONTROLS)
    return all_controls


def get_controls_by_framework(framework: Framework) -> Dict[str, Dict[str, Any]]:
    """Get controls for a specific framework"""
    if framework == Framework.SWIFT_CSP:
        return SWIFT_CONTROLS
    elif framework == Framework.SOC2:
        return SOC2_CONTROLS
    return {}


def get_controls_by_infrastructure(infrastructure: InfrastructureType) -> List[Dict[str, Any]]:
    """Get applicable controls for an infrastructure type"""
    control_ids = INFRASTRUCTURE_CONTROLS.get(infrastructure, [])
    all_controls = get_all_controls()
    return [all_controls[cid] for cid in control_ids if cid in all_controls]


def get_overlapping_controls(control_id: str) -> List[str]:
    """Get list of control IDs that overlap with the given control"""
    return CONTROL_OVERLAPS.get(control_id, [])


def get_shared_controls(frameworks: List[Framework]) -> List[Dict[str, Any]]:
    """
    Get controls that are shared across multiple frameworks (map once, report many)
    Returns controls that appear in all specified frameworks
    """
    if not frameworks:
        return []
    
    # Get all controls for each framework
    framework_controls = {}
    for fw in frameworks:
        framework_controls[fw] = set(get_controls_by_framework(fw).keys())
    
    # Find intersection
    shared_control_ids = set.intersection(*framework_controls.values()) if len(framework_controls) > 1 else set()
    
    # Also check overlaps
    all_controls = get_all_controls()
    for control_id, overlaps in CONTROL_OVERLAPS.items():
        # If a control from one framework overlaps with a control from another framework
        for fw in frameworks:
            if control_id in framework_controls.get(fw, set()):
                for overlap_id in overlaps:
                    if overlap_id in all_controls:
                        shared_control_ids.add(control_id)
                        shared_control_ids.add(overlap_id)
    
    return [all_controls[cid] for cid in shared_control_ids if cid in all_controls]


def get_mandatory_vs_advisory(infrastructure: InfrastructureType, frameworks: List[Framework]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Get controls split by mandatory vs advisory for given infrastructure and frameworks
    """
    controls = get_controls_by_infrastructure(infrastructure)
    
    # Filter by frameworks
    framework_control_ids = set()
    for fw in frameworks:
        framework_control_ids.update(get_controls_by_framework(fw).keys())
    
    filtered_controls = [c for c in controls if c["control_id"] in framework_control_ids]
    
    mandatory = [c for c in filtered_controls if c["type"] == ControlType.MANDATORY]
    advisory = [c for c in filtered_controls if c["type"] == ControlType.ADVISORY]
    
    return {
        "mandatory": mandatory,
        "advisory": advisory
    }


# Load SWIFT CSP v2024 Framework Mapping
def _load_swift_csp_mapping() -> Dict[str, Any]:
    """Load SWIFT CSP v2024 framework mapping from JSON file"""
    try:
        # Get the path relative to this file
        current_dir = Path(__file__).parent.parent.parent
        mapping_path = current_dir / "data" / "frameworks" / "swift_csp_v2024.json"
        
        if mapping_path.exists():
            with open(mapping_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return {}
    except Exception as e:
        print(f"Warning: Could not load SWIFT CSP mapping: {e}")
        return {}


# Load framework mapping
SWIFT_CSP_MAPPING: Dict[str, Any] = _load_swift_csp_mapping()


def get_swift_architecture_types() -> List[Dict[str, Any]]:
    """Get all SWIFT architecture type definitions"""
    if SWIFT_CSP_MAPPING:
        return SWIFT_CSP_MAPPING.get("swift_architecture_types", [])
    return []


def get_control_applicability_by_architecture(control_id: str, architecture_type: SwiftArchitectureType) -> Optional[Dict[str, Any]]:
    """
    Get control applicability for a specific SWIFT architecture type
    
    Args:
        control_id: Control ID (e.g., "1.1", "2.7", "2.4A")
        architecture_type: SWIFT architecture type (A1, A2, A3, A4, B)
    
    Returns:
        Dictionary with is_applicable, scope, and advisory, or None if not found
    """
    if not SWIFT_CSP_MAPPING:
        return None
    
    arch_id = architecture_type.value
    
    # Search through control applicability matrix
    for domain in SWIFT_CSP_MAPPING.get("control_applicability_matrix", []):
        for control in domain.get("controls", []):
            if control.get("control_id") == control_id:
                mapping = control.get("mapping", {})
                arch_mapping = mapping.get(arch_id, {})
                
                # Determine if control is advisory:
                # 1. If control_id ends with "A", it's advisory
                # 2. If the mapping has advisory: true, it's advisory
                is_advisory = control_id.endswith("A") or arch_mapping.get("advisory", False)
                
                result = arch_mapping.copy()
                result["advisory"] = is_advisory
                return result
    
    return None


def get_applicable_controls_by_architecture(architecture_type: SwiftArchitectureType) -> List[Dict[str, Any]]:
    """
    Get all applicable controls for a specific SWIFT architecture type
    
    Args:
        architecture_type: SWIFT architecture type (A1, A2, A3, A4, B)
    
    Returns:
        List of control dictionaries with applicability information including advisory status
    """
    if not SWIFT_CSP_MAPPING:
        return []
    
    arch_id = architecture_type.value
    applicable_controls = []
    
    # Search through control applicability matrix
    for domain in SWIFT_CSP_MAPPING.get("control_applicability_matrix", []):
        for control in domain.get("controls", []):
            mapping = control.get("mapping", {})
            arch_mapping = mapping.get(arch_id, {})
            
            if arch_mapping.get("is_applicable", False):
                control_id = control.get("control_id")
                # Determine if control is advisory:
                # 1. If control_id ends with "A", it's advisory
                # 2. If the mapping has advisory: true, it's advisory
                is_advisory = control_id.endswith("A") or arch_mapping.get("advisory", False)
                
                control_info = {
                    "control_id": control_id,
                    "control_name": control.get("control_name"),
                    "domain": domain.get("domain"),
                    "is_applicable": True,
                    "scope": arch_mapping.get("scope", ""),
                    "architecture_type": arch_id,
                    "advisory": is_advisory
                }
                applicable_controls.append(control_info)
    
    return applicable_controls


def get_controls_by_swift_architecture(architecture_type: SwiftArchitectureType) -> List[Dict[str, Any]]:
    """
    Get controls applicable to a SWIFT architecture type, enriched with control library data
    
    Args:
        architecture_type: SWIFT architecture type (A1, A2, A3, A4, B)
    
    Returns:
        List of enriched control dictionaries with advisory status
    """
    applicable_controls = get_applicable_controls_by_architecture(architecture_type)
    all_controls = get_all_controls()
    
    # Enrich with control library data
    enriched_controls = []
    for control_info in applicable_controls:
        control_id = control_info.get("control_id")
        # Try to find matching control in library (format: "SWIFT-1.1" or "SWIFT-2.4A")
        swift_control_id = f"SWIFT-{control_id}"
        
        if swift_control_id in all_controls:
            # Merge library data with architecture-specific data
            enriched = all_controls[swift_control_id].copy()
            # Override type if advisory flag is set (from JSON mapping)
            if control_info.get("advisory", False):
                enriched["type"] = ControlType.ADVISORY
            enriched.update({
                "architecture_scope": control_info.get("scope"),
                "architecture_type": control_info.get("architecture_type"),
                "domain": control_info.get("domain"),
                "advisory": control_info.get("advisory", False)
            })
            enriched_controls.append(enriched)
        else:
            # Control not in library yet, return basic info with advisory status
            control_info["type"] = ControlType.ADVISORY if control_info.get("advisory", False) else ControlType.MANDATORY
            enriched_controls.append(control_info)
    
    return enriched_controls
