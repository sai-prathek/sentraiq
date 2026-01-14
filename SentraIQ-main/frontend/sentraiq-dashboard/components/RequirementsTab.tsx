import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Shield, Clock, XCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Requirement {
  control_id: string;
  requirements: string[];
}

type RequirementStatus = 'pending' | 'in-progress' | 'completed';

interface RequirementStatusMap {
  [controlId: string]: {
    [requirementIndex: number]: RequirementStatus;
  };
}

interface RequirementsTabProps {
  swiftArchitectureType: string | null;
  onComplete: () => void;
  onBack: () => void;
}

// Evidence requirements based on architecture type
export const ARCHITECTURE_EVIDENCE_REQUIREMENTS: Record<string, Requirement[]> = {
  'A1': [
    {
      "control_id": "1.1",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A1",
        "Secure zone architecture documentation",
        "Network segmentation evidence showing isolation of SWIFT environment",
        "Access control lists and firewall rules for secure zone",
        "Evidence of secure zone monitoring and logging"
      ]
    },
    {
      "control_id": "1.2",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A1",
        "List of servers for in scope components",
        "Evidence of the most recent privilege access review of the administrators and access logs",
        "Evidence of privilege access change ticket servers",
        "Privileged account inventory and access matrix"
      ]
    },
    {
      "control_id": "1.3",
      "requirements": [
        "Evidence showing servers hosted in secure zone",
        "Screenshot or configuration files showing: Privileged access restrictions (IAM roles, least Privileges)",
        "Password and login policy enforcement",
        "OS Patching and security update schedule for VM",
        "Network architecture diagram showing isolation of the VM from other VMs and environments",
        "Firewall rules (or VPC) configuration with VM context",
        "Evidence of filtering/ inspection of network flows (e.g. packet inspection IDS/IPS logs)",
        "Multi-factor authentication evidence",
        "Evidence showing MFA is enabled for interactive access to the VM",
        "If MFA is not enforced at hypervisor level, evidence showing compliance at OS-level",
        "Event Logging & Monitoring screenshots or reports",
        "Screenshot or report showing centralised logging and monitoring of VM/ Server events",
        "Retention policy for logs",
        "Hypervisor security configuration documentation"
      ]
    },
    {
      "control_id": "1.4",
      "requirements": [
        "Screenshot evidence of failed ping to generic public IP showing internet browsing is not permitted from servers/ middleware/ VMs",
        "Network firewall rules showing internet restrictions",
        "Proxy configuration and outbound traffic filtering evidence"
      ]
    },
    {
      "control_id": "2.1",
      "requirements": [
        "Network architecture diagram showing internal data flows",
        "Evidence of encryption for internal data flows",
        "Network segmentation documentation",
        "Data flow security policy and procedures"
      ]
    },
    {
      "control_id": "2.2",
      "requirements": [
        "Provide evidence latest hardware/ software versions for components within Swift secure zone",
        "Patching Policy",
        "User Profiles configured on Swift applications",
        "VMWare/ Server - SOC reports",
        "Patch management procedures and schedules",
        "Evidence of patch deployment and testing"
      ]
    },
    {
      "control_id": "2.3",
      "requirements": [
        "System Hardening Policy",
        "Documentation of any deviation from the policy",
        "Provide devices software version",
        "Provide evidence detailing Swift in-scope devices are hardened as per the policy",
        "Provide Change management policy",
        "Hardening checklists and compliance reports"
      ]
    },
    {
      "control_id": "2.4A",
      "requirements": [
        "Network diagram showing secure zone to back office connectivity",
        "Data flow security controls between secure zone and back office",
        "Encryption evidence for back office data flows",
        "Access controls for back office connections"
      ]
    },
    {
      "control_id": "2.5A",
      "requirements": [
        "Evidence of encryption for external transmission to SWIFT",
        "Network security configuration for SWIFT connectivity",
        "Certificate management procedures",
        "Transmission security policy"
      ]
    },
    {
      "control_id": "2.6",
      "requirements": [
        "Data Encryption standards",
        "Session timeout screenshot",
        "Operator session security configuration",
        "Evidence of encrypted sessions for local GUI access"
      ]
    },
    {
      "control_id": "2.7",
      "requirements": [
        "Vulnerability management policy",
        "Vulnerability scan report for the in-scope components",
        "Vulnerability scan analysis for any open vulnerabilities",
        "Vulnerability closure roadmap (if applicable)",
        "Regular vulnerability scanning schedule and procedures"
      ]
    },
    {
      "control_id": "2.8",
      "requirements": [
        "Service provider assessment documentation",
        "Due diligence reports for critical outsourced services",
        "Service provider contracts and SLAs",
        "Third-party risk assessment reports"
      ]
    },
    {
      "control_id": "2.9",
      "requirements": [
        "Reconciliation - procedures for daily/ intraday",
        "Segregation of duty evidence",
        "Transaction business controls documentation",
        "Evidence of transaction monitoring and controls"
      ]
    },
    {
      "control_id": "2.10",
      "requirements": [
        "Application hardening documentation for local SWIFT interface",
        "Application security configuration",
        "Evidence of application security controls",
        "Application patch management procedures"
      ]
    },
    {
      "control_id": "2.11A",
      "requirements": [
        "RMA workflow documentation",
        "RMA business controls and procedures",
        "Evidence of RMA access controls and monitoring",
        "RMA user access reviews"
      ]
    },
    {
      "control_id": "3.1",
      "requirements": [
        "Confirmation if printers are being used and if they are in secure environment",
        "Physical security policy",
        "Data center/ server room security documentation",
        "Secure disposal of devices, procedure and evidence to demonstrate secure disposal",
        "Security guidelines and best practices for remote working",
        "Risk assessment related to the physical location of Swift devices",
        "Joiners/ movers/ Leavers evidence",
        "Physical access control logs and procedures"
      ]
    },
    {
      "control_id": "4.1",
      "requirements": [
        "Password policy",
        "Windows AD GPO screenshot for password configuration",
        "Password policy enforcement evidence for local systems",
        "Password complexity and expiration configuration"
      ]
    },
    {
      "control_id": "4.2",
      "requirements": [
        "Provide MFA screenshot for logging on to the Swift application",
        "System evidence showing MFA is enforced for operator and admin access",
        "MFA configuration documentation",
        "MFA failure monitoring and alerting evidence"
      ]
    },
    {
      "control_id": "5.1",
      "requirements": [
        "Access Control Policy",
        "User access review evidence that the accounts are reviewed at least annually",
        "Evidence showing user onboarding/ departure for Swift in-scope components",
        "Procedure on handling emergency access to systems",
        "Logical access control matrix and documentation"
      ]
    },
    {
      "control_id": "5.2",
      "requirements": [
        "Confirmation if physical tokens are used for accessing Swift operations",
        "If tokens are used: provide details on token management process, how tokens are issued and revoked",
        "Token inventory and management procedures",
        "Token lifecycle management documentation"
      ]
    },
    {
      "control_id": "5.3A",
      "requirements": [
        "Personnel vetting policy and procedures",
        "Evidence of background checks for all staff",
        "Vetting documentation and records",
        "Personnel security clearance procedures"
      ]
    },
    {
      "control_id": "5.4",
      "requirements": [
        "Policy/ procedure evidence showing that the access to password stored logically are logged",
        "Physical and logical data protection controls",
        "Data encryption at rest and in transit evidence",
        "Data protection policy and procedures"
      ]
    },
    {
      "control_id": "6.1",
      "requirements": [
        "Policy and procedure indicating the anti-malware solutions and configuration adopted to protect Swift in-scope components",
        "Provide evidence of alerts are logged through SIEM or decentralised (e.g. on the anti-malware solution itself) defined on potential scanning or update failures",
        "Provide evidence of testing performed on changes applied on the antimalware solution",
        "Malware protection deployment and coverage evidence"
      ]
    },
    {
      "control_id": "6.2",
      "requirements": [
        "Software integrity controls documentation",
        "Evidence of software integrity verification",
        "Code signing and verification procedures",
        "Software update and patch integrity controls"
      ]
    },
    {
      "control_id": "6.3",
      "requirements": [
        "Database integrity controls documentation",
        "Evidence of database integrity monitoring",
        "Database access controls and audit logs",
        "Database backup and recovery procedures"
      ]
    },
    {
      "control_id": "6.4",
      "requirements": [
        "Policy on defining logging, event management and monitoring",
        "Evidence showing logging tool where all the events are logged",
        "Provide evidence of how long the logs are retained",
        "Provide evidence of alerts raised through the tool and any action taken",
        "Centralized logging and monitoring architecture"
      ]
    },
    {
      "control_id": "6.5A",
      "requirements": [
        "Intrusion detection system configuration",
        "IDS/IPS deployment and coverage evidence",
        "Network intrusion detection logs and alerts",
        "Intrusion detection policy and procedures"
      ]
    },
    {
      "control_id": "7.1",
      "requirements": [
        "Cyber incident response plan",
        "Evidence of tabletop exercise performed",
        "Incident plan test report",
        "Incident response procedures and playbooks"
      ]
    },
    {
      "control_id": "7.2",
      "requirements": [
        "Evidence of training plan dedicated to end users",
        "Training completion stats",
        "Security awareness training documentation",
        "Training records for all staff"
      ]
    },
    {
      "control_id": "7.3A",
      "requirements": [
        "Penetration testing reports for full infrastructure",
        "Penetration testing schedule and procedures",
        "Remediation evidence for identified vulnerabilities",
        "Third-party penetration testing documentation"
      ]
    },
    {
      "control_id": "7.4A",
      "requirements": [
        "Scenario-based risk assessment documentation",
        "Risk assessment reports for full environment",
        "Risk mitigation plans and evidence",
        "Regular risk assessment schedule"
      ]
    }
  ],
  'A2': [
    {
      "control_id": "1.1",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A2",
        "Secure zone architecture documentation",
        "Network segmentation evidence showing isolation of SWIFT environment",
        "Access control lists and firewall rules for secure zone",
        "Evidence of secure zone monitoring and logging"
      ]
    },
    {
      "control_id": "1.2",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A2",
        "List of servers for in scope components",
        "Evidence of the most recent privilege access review of the administrators and access logs",
        "Evidence of privilege access change ticket servers",
        "Privileged account inventory and access matrix"
      ]
    },
    {
      "control_id": "1.3",
      "requirements": [
        "Evidence showing servers hosted in secure zone",
        "Screenshot or configuration files showing: Privileged access restrictions (IAM roles, least Privileges)",
        "Password and login policy enforcement",
        "OS Patching and security update schedule for VM",
        "Network architecture diagram showing isolation of the VM from other VMs and environments",
        "Firewall rules (or VPC) configuration with VM context",
        "Evidence of filtering/ inspection of network flows (e.g. packet inspection IDS/IPS logs)",
        "Multi-factor authentication evidence",
        "Evidence showing MFA is enabled for interactive access to the VM",
        "If MFA is not enforced at hypervisor level, evidence showing compliance at OS-level",
        "Event Logging & Monitoring screenshots or reports",
        "Screenshot or report showing centralised logging and monitoring of VM/ Server events",
        "Retention policy for logs",
        "Hypervisor security configuration documentation"
      ]
    },
    {
      "control_id": "1.4",
      "requirements": [
        "Screenshot evidence of failed ping to generic public IP showing internet browsing is not permitted from servers/ middleware/ VMs",
        "Network firewall rules showing internet restrictions",
        "Proxy configuration and outbound traffic filtering evidence"
      ]
    },
    {
      "control_id": "2.1",
      "requirements": [
        "Network architecture diagram showing internal data flows",
        "Evidence of encryption for internal data flows",
        "Network segmentation documentation",
        "Data flow security policy and procedures"
      ]
    },
    {
      "control_id": "2.2",
      "requirements": [
        "Provide evidence latest hardware/ software versions for components within Swift secure zone",
        "Patching Policy",
        "User Profiles configured on Swift applications",
        "VMWare/ Server - SOC reports",
        "Patch management procedures and schedules",
        "Evidence of patch deployment and testing"
      ]
    },
    {
      "control_id": "2.3",
      "requirements": [
        "System Hardening Policy",
        "Documentation of any deviation from the policy",
        "Provide devices software version",
        "Provide evidence detailing Swift in-scope devices are hardened as per the policy",
        "Provide Change management policy",
        "Hardening checklists and compliance reports"
      ]
    },
    {
      "control_id": "2.4A",
      "requirements": [
        "Network diagram showing secure zone to back office connectivity",
        "Data flow security controls between secure zone and back office",
        "Encryption evidence for back office data flows",
        "Access controls for back office connections"
      ]
    },
    {
      "control_id": "2.5A",
      "requirements": [
        "Evidence of encryption for external transmission to Service Provider",
        "Network security configuration for Service Provider connectivity",
        "Certificate management procedures",
        "Transmission security policy"
      ]
    },
    {
      "control_id": "2.6",
      "requirements": [
        "Data Encryption standards",
        "Session timeout screenshot",
        "Operator session security configuration",
        "Evidence of encrypted sessions for local GUI access"
      ]
    },
    {
      "control_id": "2.7",
      "requirements": [
        "Vulnerability management policy",
        "Vulnerability scan report for the in-scope components",
        "Vulnerability scan analysis for any open vulnerabilities",
        "Vulnerability closure roadmap (if applicable)",
        "Regular vulnerability scanning schedule and procedures"
      ]
    },
    {
      "control_id": "2.8",
      "requirements": [
        "Service provider assessment documentation for connectivity provider",
        "Due diligence reports for critical outsourced services",
        "Service provider contracts and SLAs",
        "Third-party risk assessment reports"
      ]
    },
    {
      "control_id": "2.9",
      "requirements": [
        "Reconciliation - procedures for daily/ intraday",
        "Segregation of duty evidence",
        "Transaction business controls documentation",
        "Evidence of transaction monitoring and controls"
      ]
    },
    {
      "control_id": "2.10",
      "requirements": [
        "Application hardening documentation for local SWIFT interface",
        "Application security configuration",
        "Evidence of application security controls",
        "Application patch management procedures"
      ]
    },
    {
      "control_id": "2.11A",
      "requirements": [
        "RMA workflow documentation",
        "RMA business controls and procedures",
        "Evidence of RMA access controls and monitoring",
        "RMA user access reviews"
      ]
    },
    {
      "control_id": "3.1",
      "requirements": [
        "Confirmation if printers are being used and if they are in secure environment",
        "Physical security policy",
        "Data center/ server room security documentation",
        "Secure disposal of devices, procedure and evidence to demonstrate secure disposal",
        "Security guidelines and best practices for remote working",
        "Risk assessment related to the physical location of Swift devices",
        "Joiners/ movers/ Leavers evidence",
        "Physical access control logs and procedures"
      ]
    },
    {
      "control_id": "4.1",
      "requirements": [
        "Password policy",
        "Windows AD GPO screenshot for password configuration",
        "Password policy enforcement evidence for local systems",
        "Password complexity and expiration configuration"
      ]
    },
    {
      "control_id": "4.2",
      "requirements": [
        "Provide MFA screenshot for logging on to the Swift application",
        "System evidence showing MFA is enforced for operator and admin access",
        "MFA configuration documentation",
        "MFA failure monitoring and alerting evidence"
      ]
    },
    {
      "control_id": "5.1",
      "requirements": [
        "Access Control Policy",
        "User access review evidence that the accounts are reviewed at least annually",
        "Evidence showing user onboarding/ departure for Swift in-scope components",
        "Procedure on handling emergency access to systems",
        "Logical access control matrix and documentation"
      ]
    },
    {
      "control_id": "5.2",
      "requirements": [
        "Confirmation if physical tokens are used for accessing Swift operations",
        "If tokens are used: provide details on token management process, how tokens are issued and revoked",
        "Token inventory and management procedures",
        "Token lifecycle management documentation"
      ]
    },
    {
      "control_id": "5.3A",
      "requirements": [
        "Personnel vetting policy and procedures",
        "Evidence of background checks for all staff",
        "Vetting documentation and records",
        "Personnel security clearance procedures"
      ]
    },
    {
      "control_id": "5.4",
      "requirements": [
        "Policy/ procedure evidence showing that the access to password stored logically are logged",
        "Physical and logical data protection controls",
        "Data encryption at rest and in transit evidence",
        "Data protection policy and procedures"
      ]
    },
    {
      "control_id": "6.1",
      "requirements": [
        "Policy and procedure indicating the anti-malware solutions and configuration adopted to protect Swift in-scope components",
        "Provide evidence of alerts are logged through SIEM or decentralised (e.g. on the anti-malware solution itself) defined on potential scanning or update failures",
        "Provide evidence of testing performed on changes applied on the antimalware solution",
        "Malware protection deployment and coverage evidence"
      ]
    },
    {
      "control_id": "6.2",
      "requirements": [
        "Software integrity controls documentation",
        "Evidence of software integrity verification",
        "Code signing and verification procedures",
        "Software update and patch integrity controls"
      ]
    },
    {
      "control_id": "6.3",
      "requirements": [
        "Database integrity controls documentation",
        "Evidence of database integrity monitoring",
        "Database access controls and audit logs",
        "Database backup and recovery procedures"
      ]
    },
    {
      "control_id": "6.4",
      "requirements": [
        "Policy on defining logging, event management and monitoring",
        "Evidence showing logging tool where all the events are logged",
        "Provide evidence of how long the logs are retained",
        "Provide evidence of alerts raised through the tool and any action taken",
        "Centralized logging and monitoring architecture"
      ]
    },
    {
      "control_id": "6.5A",
      "requirements": [
        "Intrusion detection system configuration",
        "IDS/IPS deployment and coverage evidence",
        "Network intrusion detection logs and alerts",
        "Intrusion detection policy and procedures"
      ]
    },
    {
      "control_id": "7.1",
      "requirements": [
        "Cyber incident response plan",
        "Evidence of tabletop exercise performed",
        "Incident plan test report",
        "Incident response procedures and playbooks"
      ]
    },
    {
      "control_id": "7.2",
      "requirements": [
        "Evidence of training plan dedicated to end users",
        "Training completion stats",
        "Security awareness training documentation",
        "Training records for all staff"
      ]
    },
    {
      "control_id": "7.3A",
      "requirements": [
        "Penetration testing reports for full infrastructure",
        "Penetration testing schedule and procedures",
        "Remediation evidence for identified vulnerabilities",
        "Third-party penetration testing documentation"
      ]
    },
    {
      "control_id": "7.4A",
      "requirements": [
        "Scenario-based risk assessment documentation",
        "Risk assessment reports for full environment",
        "Risk mitigation plans and evidence",
        "Regular risk assessment schedule"
      ]
    }
  ],
  'A3': [
    {
      "control_id": "1.1",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A3",
        "Endpoint and connector security documentation",
        "Evidence of endpoint protection and isolation",
        "Service provider security documentation"
      ]
    },
    {
      "control_id": "1.2",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A3",
        "List of endpoints for in scope components",
        "Evidence of the most recent privilege access review of the administrators and access logs for endpoints",
        "Evidence of privilege access change ticket for endpoints",
        "Endpoint privileged account inventory"
      ]
    },
    {
      "control_id": "1.4",
      "requirements": [
        "Screenshot evidence of failed ping to generic public IP showing internet browsing restrictions from endpoints",
        "Endpoint firewall rules showing internet restrictions",
        "Proxy configuration and outbound traffic filtering evidence for endpoints"
      ]
    },
    {
      "control_id": "2.1",
      "requirements": [
        "Network architecture diagram showing endpoint-to-internet data flows",
        "Evidence of encryption for endpoint data flows",
        "Endpoint network security documentation",
        "Data flow security policy and procedures for endpoints"
      ]
    },
    {
      "control_id": "2.2",
      "requirements": [
        "Provide evidence latest hardware/ software versions for endpoint components",
        "Patching Policy for endpoints",
        "User Profiles configured on endpoints",
        "Endpoint patch management procedures and schedules",
        "Evidence of patch deployment and testing for endpoints"
      ]
    },
    {
      "control_id": "2.3",
      "requirements": [
        "System Hardening Policy for endpoints",
        "Documentation of any deviation from the policy",
        "Provide endpoint devices software version",
        "Provide evidence detailing Swift in-scope endpoints are hardened as per the policy",
        "Endpoint hardening checklists and compliance reports"
      ]
    },
    {
      "control_id": "2.4A",
      "requirements": [
        "Network diagram showing connector to back office connectivity",
        "Data flow security controls between connector and back office",
        "Encryption evidence for back office data flows",
        "Access controls for back office connections"
      ]
    },
    {
      "control_id": "2.5A",
      "requirements": [
        "Evidence of encryption for external transmission from user to Service Provider",
        "Network security configuration for Service Provider connectivity",
        "Certificate management procedures",
        "Transmission security policy"
      ]
    },
    {
      "control_id": "2.6",
      "requirements": [
        "Data Encryption standards",
        "Session timeout screenshot",
        "Browser session security configuration",
        "Evidence of encrypted sessions for browser access"
      ]
    },
    {
      "control_id": "2.7",
      "requirements": [
        "Vulnerability management policy",
        "Vulnerability scan report for the endpoint components",
        "Vulnerability scan analysis for any open vulnerabilities",
        "Vulnerability closure roadmap (if applicable)",
        "Regular vulnerability scanning schedule and procedures for endpoints"
      ]
    },
    {
      "control_id": "2.8",
      "requirements": [
        "Service provider assessment documentation",
        "Due diligence reports for Service Provider",
        "Service provider contracts and SLAs",
        "Third-party risk assessment reports for Service Provider"
      ]
    },
    {
      "control_id": "2.9",
      "requirements": [
        "Reconciliation - procedures for daily/ intraday",
        "Segregation of duty evidence",
        "Transaction business controls documentation",
        "Evidence of transaction monitoring and controls"
      ]
    },
    {
      "control_id": "2.11A",
      "requirements": [
        "RMA workflow documentation (if utilized)",
        "RMA business controls and procedures",
        "Evidence of RMA access controls and monitoring",
        "RMA user access reviews"
      ]
    },
    {
      "control_id": "3.1",
      "requirements": [
        "Physical security policy",
        "Service provider physical security documentation",
        "Endpoint physical security controls",
        "Risk assessment related to the physical location of endpoints",
        "Joiners/ movers/ Leavers evidence"
      ]
    },
    {
      "control_id": "4.1",
      "requirements": [
        "Password policy",
        "Password policy enforcement evidence for endpoint/portal access",
        "Password complexity and expiration configuration",
        "Portal password configuration screenshots"
      ]
    },
    {
      "control_id": "4.2",
      "requirements": [
        "Provide MFA screenshot for logging on to the portal",
        "System evidence showing MFA is enforced for portal access",
        "MFA configuration documentation",
        "MFA failure monitoring and alerting evidence"
      ]
    },
    {
      "control_id": "5.1",
      "requirements": [
        "Access Control Policy",
        "User access review evidence that the accounts are reviewed at least annually",
        "Evidence showing user onboarding/ departure for Swift in-scope components",
        "Procedure on handling emergency access to systems",
        "Logical access control matrix and documentation for endpoint and portal"
      ]
    },
    {
      "control_id": "5.2",
      "requirements": [
        "Confirmation if MFA tokens are used for accessing Swift operations",
        "If tokens are used: provide details on token management process, how tokens are issued and revoked",
        "Token inventory and management procedures",
        "Token lifecycle management documentation"
      ]
    },
    {
      "control_id": "5.3A",
      "requirements": [
        "Personnel vetting policy and procedures",
        "Evidence of background checks for operators/admins",
        "Vetting documentation and records",
        "Personnel security clearance procedures"
      ]
    },
    {
      "control_id": "5.4",
      "requirements": [
        "Policy/ procedure evidence showing that the access to password stored logically are logged",
        "Physical and logical data protection controls for endpoints",
        "Data encryption at rest and in transit evidence",
        "Data protection policy and procedures"
      ]
    },
    {
      "control_id": "6.1",
      "requirements": [
        "Policy and procedure indicating the anti-malware solutions and configuration adopted to protect Swift in-scope endpoints",
        "Provide evidence of alerts are logged through SIEM or decentralised (e.g. on the anti-malware solution itself) defined on potential scanning or update failures",
        "Provide evidence of testing performed on changes applied on the antimalware solution",
        "Malware protection deployment and coverage evidence for endpoints"
      ]
    },
    {
      "control_id": "6.2",
      "requirements": [
        "Client software integrity controls documentation",
        "Evidence of client software integrity verification",
        "Code signing and verification procedures",
        "Software update and patch integrity controls"
      ]
    },
    {
      "control_id": "6.4",
      "requirements": [
        "Policy on defining logging, event management and monitoring",
        "Evidence showing logging tool where all the events are logged",
        "Provide evidence of how long the logs are retained",
        "Provide evidence of alerts raised through the tool and any action taken",
        "Centralized logging and monitoring architecture for endpoints/portal"
      ]
    },
    {
      "control_id": "6.5A",
      "requirements": [
        "Endpoint Detection and Response (EDR) configuration",
        "EDR deployment and coverage evidence",
        "Endpoint intrusion detection logs and alerts",
        "Intrusion detection policy and procedures for endpoints"
      ]
    },
    {
      "control_id": "7.1",
      "requirements": [
        "Cyber incident response plan",
        "Evidence of tabletop exercise performed",
        "Incident plan test report",
        "Incident response procedures and playbooks for endpoint/account scope"
      ]
    },
    {
      "control_id": "7.2",
      "requirements": [
        "Evidence of training plan dedicated to operators/admins",
        "Training completion stats",
        "Security awareness training documentation",
        "Training records for operators and admins"
      ]
    },
    {
      "control_id": "7.3A",
      "requirements": [
        "Penetration testing reports for endpoints (optional)",
        "Penetration testing schedule and procedures",
        "Remediation evidence for identified vulnerabilities",
        "Third-party penetration testing documentation"
      ]
    },
    {
      "control_id": "7.4A",
      "requirements": [
        "Scenario-based risk assessment documentation",
        "Risk assessment reports for limited environment",
        "Risk mitigation plans and evidence",
        "Regular risk assessment schedule"
      ]
    }
  ],
  'A4': [
    {
      "control_id": "1.2",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A4 & B",
        "List of servers for in scope components",
        "Evidence of the most recent privilege access review of the administrators and access logs",
        "Evidence of privilege access change ticket servers"
      ]
    },
    {
      "control_id": "1.3",
      "requirements": [
        "Evidence showing servers hosted in secure zone",
        "Screenshot or configuration files showing: Privileged access restrictions (IAM roles, least Privileges)",
        "Password and login policy enforcement",
        "OS Patching and security update schedule for VM",
        "Network architecture diagram showing isolation of the VM from other VMs and environments (if applicable)",
        "Firewall rules (or VPC) configuration with VM context",
        "Evidence of filtering/ inspection of network flows (e.g. packet inspection IDS/IPS logs)",
        "Multi-factor authentication evidence",
        "Evidence showing MFA is enabled for interactive access to the VM",
        "If MFA is not enforced at hypervisor level, evidence showing compliance at OS-level",
        "Event Logging & Monitoring screenshots or reports",
        "Screenshot or report showing centralised logging and monitoring of VM/ Server events",
        "Retention policy for logs"
      ]
    },
    {
      "control_id": "1.4",
      "requirements": [
        "Screenshot evidence of failed ping to generic public IP showing internet browsing is not permitted from servers/ middleware/ VMs"
      ]
    },
    {
      "control_id": "1.5",
      "requirements": [
        "Network and firewall rule config"
      ]
    },
    {
      "control_id": "2.2",
      "requirements": [
        "Provide evidence latest hardware/ software versions for components within Swift secure zone",
        "Patching Policy",
        "User Profiles configured on Swift applications",
        "VMWare/ Server - SOC reports"
      ]
    },
    {
      "control_id": "2.3",
      "requirements": [
        "System Hardening Policy",
        "Documentation of any deviation from the policy",
        "Provide devices software version",
        "Provide evidence detailing Swift in-scope devices are hardened as per the policy",
        "Provide Change management policy"
      ]
    },
    {
      "control_id": "2.4A",
      "requirements": [
        "Network diagram showing connector to back office connectivity",
        "Data flow security controls between connector and back office",
        "Encryption evidence for back office data flows",
        "Access controls for back office connections"
      ]
    },
    {
      "control_id": "2.5A",
      "requirements": [
        "Evidence of encryption for external transmission from connector to Service Provider",
        "Network security configuration for Service Provider connectivity",
        "Certificate management procedures",
        "Transmission security policy"
      ]
    },
    {
      "control_id": "2.6",
      "requirements": [
        "Data Encryption standards",
        "Session timeout screenshot",
        "Provide Service Bureau's SOC report"
      ]
    },
    {
      "control_id": "2.7",
      "requirements": [
        "Vulnerability management policy",
        "Vulnerability scan report for the in-scope components",
        "Vulnerability scan analysis for any open vulnerabilities",
        "Vulnerability closure roadmap (if applicable)"
      ]
    },
    {
      "control_id": "2.8",
      "requirements": [
        "Provide screenshot of third party service providers e.g. Service Bureau"
      ]
    },
    {
      "control_id": "2.9",
      "requirements": [
        "Reconciliation - procedures for daily/ intraday",
        "Segregation of duty evidence"
      ]
    },
    {
      "control_id": "2.11A",
      "requirements": [
        "RMA workflow documentation (if utilized)",
        "RMA business controls and procedures",
        "Evidence of RMA access controls and monitoring",
        "RMA user access reviews"
      ]
    },
    {
      "control_id": "3.1",
      "requirements": [
        "Confirmation if printers are being used and if they are in secure environment",
        "Physical security policy",
        "ISO270001 report for Zenith",
        "Secure disposal of devices, procedure and evidence to demonstrate secure disposal",
        "Security guidelines and best practices for remote working",
        "Risk assessment related to the physical location of Swift devices",
        "Joiners/ movers/ Leavers evidence"
      ]
    },
    {
      "control_id": "4.1",
      "requirements": [
        "Password policy",
        "Windows AD GPO screenshot for password configuration"
      ]
    },
    {
      "control_id": "4.2",
      "requirements": [
        "Provide MFA screenshot for logging on to the Swift application",
        "System evidence showing MFA is enforced"
      ]
    },
    {
      "control_id": "5.1",
      "requirements": [
        "Access Control Policy",
        "User access review evidence that the accounts are reviewed at least annually",
        "Evidence showing user onboarding/ departure for Swift in-scope components",
        "Procedure on handling emergency access to systems"
      ]
    },
    {
      "control_id": "5.2",
      "requirements": [
        "Confirmation if physical tokens are used for accessing Swift operations",
        "If tokens are used: provide details on token management process, how tokens are issued and revoked"
      ]
    },
    {
      "control_id": "5.3A",
      "requirements": [
        "Personnel vetting policy and procedures",
        "Evidence of background checks for operators/admins",
        "Vetting documentation and records",
        "Personnel security clearance procedures"
      ]
    },
    {
      "control_id": "5.4",
      "requirements": [
        "Policy/ procedure evidence showing that the access to password stored logically are logged"
      ]
    },
    {
      "control_id": "6.1",
      "requirements": [
        "Policy and procedure indicating the anti-malware solutions and configuration adopted to protect Swift in-scope components",
        "Provide evidence of alerts are logged through SIEM or decentralised (e.g. on the anti-malware solution itself) defined on potential scanning or update failures",
        "Provide evidence of testing performed on changes applied on the antimalware solution"
      ]
    },
    {
      "control_id": "6.2",
      "requirements": [
        "Connector software integrity controls documentation",
        "Evidence of connector software integrity verification",
        "Code signing and verification procedures",
        "Software update and patch integrity controls"
      ]
    },
    {
      "control_id": "6.3",
      "requirements": [
        "Connector database integrity controls documentation",
        "Evidence of connector database integrity monitoring",
        "Database access controls and audit logs",
        "Database backup and recovery procedures"
      ]
    },
    {
      "control_id": "6.4",
      "requirements": [
        "Policy on defining logging, event management and monitoring",
        "Evidence showing logging tool where all the events are logged",
        "Provide evidence of how long the logs are retained",
        "Provide evidence of alerts raised through the tool and any action taken"
      ]
    },
    {
      "control_id": "6.5A",
      "requirements": [
        "Intrusion detection system configuration for connector network",
        "IDS/IPS deployment and coverage evidence",
        "Network intrusion detection logs and alerts",
        "Intrusion detection policy and procedures"
      ]
    },
    {
      "control_id": "7.1",
      "requirements": [
        "Cyber incident response plan",
        "Evidence of tabletop exercise performed",
        "Incident plan test report"
      ]
    },
    {
      "control_id": "7.2",
      "requirements": [
        "Evidence of training plan dedicated to end users",
        "Training completion stats"
      ]
    },
    {
      "control_id": "7.3A",
      "requirements": [
        "Penetration testing reports for connector infrastructure",
        "Penetration testing schedule and procedures",
        "Remediation evidence for identified vulnerabilities",
        "Third-party penetration testing documentation"
      ]
    },
    {
      "control_id": "7.4A",
      "requirements": [
        "Scenario-based risk assessment documentation",
        "Risk assessment reports for connector environment",
        "Risk mitigation plans and evidence",
        "Regular risk assessment schedule"
      ]
    }
  ],
  'B': [
    {
      "control_id": "1.2",
      "requirements": [
        "Swift Architecture Diagram for Architecture type A4 & B",
        "List of servers for in scope components",
        "Evidence of the most recent privilege access review of the administrators and access logs",
        "Evidence of privilege access change ticket servers"
      ]
    },
    {
      "control_id": "1.4",
      "requirements": [
        "Screenshot evidence of failed ping to generic public IP showing internet browsing is not permitted from servers/ middleware/ VMs"
      ]
    },
    {
      "control_id": "2.2",
      "requirements": [
        "Provide evidence latest hardware/ software versions for components within Swift secure zone",
        "Patching Policy",
        "User Profiles configured on Swift applications",
        "VMWare/ Server - SOC reports"
      ]
    },
    {
      "control_id": "2.3",
      "requirements": [
        "System Hardening Policy",
        "Documentation of any deviation from the policy",
        "Provide devices software version",
        "Provide evidence detailing Swift in-scope devices are hardened as per the policy",
        "Provide Change management policy"
      ]
    },
    {
      "control_id": "2.6",
      "requirements": [
        "Data Encryption standards",
        "Session timeout screenshot",
        "Provide Service Bureau's SOC report"
      ]
    },
    {
      "control_id": "2.7",
      "requirements": [
        "Vulnerability management policy",
        "Vulnerability scan report for the in-scope components",
        "Vulnerability scan analysis for any open vulnerabilities",
        "Vulnerability closure roadmap (if applicable)"
      ]
    },
    {
      "control_id": "2.8",
      "requirements": [
        "Provide screenshot of third party service providers e.g. Service Bureau"
      ]
    },
    {
      "control_id": "2.9",
      "requirements": [
        "Reconciliation - procedures for daily/ intraday",
        "Segregation of duty evidence"
      ]
    },
    {
      "control_id": "2.11A",
      "requirements": [
        "RMA workflow documentation (if utilized)",
        "RMA business controls and procedures",
        "Evidence of RMA access controls and monitoring",
        "RMA user access reviews"
      ]
    },
    {
      "control_id": "3.1",
      "requirements": [
        "Confirmation if printers are being used and if they are in secure environment",
        "Physical security policy",
        "ISO270001 report for Zenith",
        "Secure disposal of devices, procedure and evidence to demonstrate secure disposal",
        "Security guidelines and best practices for remote working",
        "Risk assessment related to the physical location of Swift devices",
        "Joiners/ movers/ Leavers evidence"
      ]
    },
    {
      "control_id": "4.1",
      "requirements": [
        "Password policy",
        "Windows AD GPO screenshot for password configuration"
      ]
    },
    {
      "control_id": "4.2",
      "requirements": [
        "Provide MFA screenshot for logging on to the Swift application",
        "System evidence showing MFA is enforced"
      ]
    },
    {
      "control_id": "5.1",
      "requirements": [
        "Access Control Policy",
        "User access review evidence that the accounts are reviewed at least annually",
        "Evidence showing user onboarding/ departure for Swift in-scope components",
        "Procedure on handling emergency access to systems"
      ]
    },
    {
      "control_id": "5.2",
      "requirements": [
        "Confirmation if physical tokens are used for accessing Swift operations",
        "If tokens are used: provide details on token management process, how tokens are issued and revoked"
      ]
    },
    {
      "control_id": "5.3A",
      "requirements": [
        "Personnel vetting policy and procedures",
        "Evidence of background checks for operators",
        "Vetting documentation and records",
        "Personnel security clearance procedures"
      ]
    },
    {
      "control_id": "5.4",
      "requirements": [
        "Policy/ procedure evidence showing that the access to password stored logically are logged"
      ]
    },
    {
      "control_id": "6.1",
      "requirements": [
        "Policy and procedure indicating the anti-malware solutions and configuration adopted to protect Swift in-scope components",
        "Provide evidence of alerts are logged through SIEM or decentralised (e.g. on the anti-malware solution itself) defined on potential scanning or update failures",
        "Provide evidence of testing performed on changes applied on the antimalware solution"
      ]
    },
    {
      "control_id": "6.4",
      "requirements": [
        "Policy on defining logging, event management and monitoring",
        "Evidence showing logging tool where all the events are logged",
        "Provide evidence of how long the logs are retained",
        "Provide evidence of alerts raised through the tool and any action taken"
      ]
    },
    {
      "control_id": "7.1",
      "requirements": [
        "Cyber incident response plan",
        "Evidence of tabletop exercise performed",
        "Incident plan test report"
      ]
    },
    {
      "control_id": "7.2",
      "requirements": [
        "Evidence of training plan dedicated to end users",
        "Training completion stats"
      ]
    },
    {
      "control_id": "7.3A",
      "requirements": [
        "Penetration testing reports for user PC",
        "Penetration testing schedule and procedures",
        "Remediation evidence for identified vulnerabilities",
        "Third-party penetration testing documentation"
      ]
    },
    {
      "control_id": "7.4A",
      "requirements": [
        "Scenario-based risk assessment documentation",
        "Risk assessment reports for limited environment",
        "Risk mitigation plans and evidence",
        "Regular risk assessment schedule"
      ]
    }
  ]
};

const RequirementsTab: React.FC<RequirementsTabProps> = ({
  swiftArchitectureType,
  onComplete,
  onBack,
}) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [expandedControls, setExpandedControls] = useState<Set<string>>(new Set());
  const [requirementStatus, setRequirementStatus] = useState<RequirementStatusMap>({});
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load saved status from localStorage
  useEffect(() => {
    if (swiftArchitectureType) {
      const savedStatus = localStorage.getItem(`requirementStatus_${swiftArchitectureType}`);
      if (savedStatus) {
        try {
          setRequirementStatus(JSON.parse(savedStatus));
        } catch (e) {
          console.warn('Failed to load requirement status:', e);
        }
      }
    }
  }, [swiftArchitectureType]);

  // Save status to localStorage whenever it changes
  useEffect(() => {
    if (swiftArchitectureType && Object.keys(requirementStatus).length > 0) {
      localStorage.setItem(`requirementStatus_${swiftArchitectureType}`, JSON.stringify(requirementStatus));
    }
  }, [requirementStatus, swiftArchitectureType]);

  useEffect(() => {
    if (swiftArchitectureType && ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType]) {
      setRequirements(ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType]);
      // Expand first control by default
      if (ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType].length > 0) {
        setExpandedControls(new Set([ARCHITECTURE_EVIDENCE_REQUIREMENTS[swiftArchitectureType][0].control_id]));
      }
    } else {
      setRequirements([]);
    }
  }, [swiftArchitectureType]);

  const toggleControl = (controlId: string) => {
    const newExpanded = new Set(expandedControls);
    if (newExpanded.has(controlId)) {
      newExpanded.delete(controlId);
    } else {
      newExpanded.add(controlId);
    }
    setExpandedControls(newExpanded);
  };

  const updateRequirementStatus = (controlId: string, requirementIndex: number, status: RequirementStatus) => {
    setRequirementStatus(prev => ({
      ...prev,
      [controlId]: {
        ...(prev[controlId] || {}),
        [requirementIndex]: status
      }
    }));
  };

  const getRequirementStatus = (controlId: string, requirementIndex: number): RequirementStatus => {
    return requirementStatus[controlId]?.[requirementIndex] || 'pending';
  };


  const markAsComplete = (controlId: string, requirementIndex: number) => {
    updateRequirementStatus(controlId, requirementIndex, 'completed');
  };

  const markAsPending = (controlId: string, requirementIndex: number) => {
    updateRequirementStatus(controlId, requirementIndex, 'pending');
  };

  // Calculate progress statistics
  const totalRequirements = requirements.reduce((sum, req) => sum + req.requirements.length, 0);
  const completedRequirements = requirements.reduce((sum, req) => {
    return sum + req.requirements.reduce((reqSum, _, idx) => {
      const status = getRequirementStatus(req.control_id, idx);
      return reqSum + (status === 'completed' ? 1 : 0);
    }, 0);
  }, 0);
  const inProgressRequirements = requirements.reduce((sum, req) => {
    return sum + req.requirements.reduce((reqSum, _, idx) => {
      const status = getRequirementStatus(req.control_id, idx);
      return reqSum + (status === 'in-progress' ? 1 : 0);
    }, 0);
  }, 0);
  const pendingRequirements = totalRequirements - completedRequirements - inProgressRequirements;
  const completionPercentage = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

  // Filter requirements based on selected filter
  const filteredRequirements = requirements.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return req.requirements.some((_, idx) => getRequirementStatus(req.control_id, idx) === 'pending');
    }
    if (filter === 'completed') {
      return req.requirements.every((_, idx) => getRequirementStatus(req.control_id, idx) === 'completed');
    }
    return true;
  });

  if (!swiftArchitectureType) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Please select a SWIFT architecture type to view requirements.</p>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-bold text-yellow-900">
              Requirements Not Available
            </h3>
          </div>
          <p className="text-sm text-yellow-700">
            Evidence requirements are currently available for Architecture Types A4 and B. 
            For other architecture types, you can proceed directly to the Evidence Management step.
          </p>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
          >
            Continue to Evidence Management
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons - Moved to top for easier accessibility */}
      <div className="mb-6 flex items-center justify-between pb-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
        >
          Continue to Evidence Management
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Card with Progress */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Evidence Requirements for Architecture {swiftArchitectureType}
            </h3>
            <p className="text-sm text-blue-700">
              Track your progress as you collect evidence. Mark requirements as complete when evidence is uploaded or connected.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{requirements.length}</div>
            <div className="text-sm text-blue-700">Controls</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Overall Progress</span>
            <span className="text-sm font-bold text-blue-900">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200">
            <div className="text-lg font-bold text-gray-900">{totalRequirements}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-yellow-200">
            <div className="text-lg font-bold text-yellow-600">{pendingRequirements}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-blue-200">
            <div className="text-lg font-bold text-blue-600">{inProgressRequirements}</div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-green-200">
            <div className="text-lg font-bold text-green-600">{completedRequirements}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-200">
          <Filter className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-900">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-900 text-white' 
                : 'bg-white text-blue-700 hover:bg-blue-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-yellow-700 hover:bg-yellow-50'
            }`}
          >
            Pending ({pendingRequirements})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-green-700 hover:bg-green-50'
            }`}
          >
            Completed ({completedRequirements})
          </button>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredRequirements.map((req, idx) => {
          const isExpanded = expandedControls.has(req.control_id);
          const Icon = Shield;
          
          // Calculate control-level progress
          const controlCompleted = req.requirements.reduce((sum, _, reqIdx) => {
            return sum + (getRequirementStatus(req.control_id, reqIdx) === 'completed' ? 1 : 0);
          }, 0);
          const controlProgress = req.requirements.length > 0 
            ? Math.round((controlCompleted / req.requirements.length) * 100) 
            : 0;
          
          return (
            <motion.div
              key={req.control_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Control Header */}
              <button
                onClick={() => toggleControl(req.control_id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors rounded-t-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-gray-900">
                        Control {req.control_id}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {req.requirements.length} {req.requirements.length === 1 ? 'requirement' : 'requirements'}
                      </span>
                      {controlProgress === 100 && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </span>
                      )}
                      {controlProgress > 0 && controlProgress < 100 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {controlProgress}% Complete
                        </span>
                      )}
                    </div>
                    {controlProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 max-w-xs">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${controlProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <span className="text-sm text-gray-600">Collapse</span>
                  ) : (
                    <span className="text-sm text-gray-600">Expand</span>
                  )}
                  <ArrowRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Requirements List */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-5 space-y-3">
                    {req.requirements.map((requirement, reqIdx) => {
                      const status = getRequirementStatus(req.control_id, reqIdx);
                      
                      return (
                        <motion.div
                          key={reqIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: reqIdx * 0.03 }}
                          className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                            status === 'completed' 
                              ? 'bg-green-50 border-2 border-green-200' 
                              : status === 'in-progress'
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {/* Status Indicator */}
                          <div className="flex-shrink-0 mt-0.5">
                            {status === 'completed' ? (
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-700" />
                              </div>
                            ) : status === 'in-progress' ? (
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-700" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-gray-700" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className={`text-sm font-medium flex-1 ${
                                status === 'completed' ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}>
                                {requirement}
                              </p>
                              {/* Status Badge */}
                              <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {/* Mark as Complete Button */}
                              {status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsComplete(req.control_id, reqIdx);
                                  }}
                                  className="px-3 py-1.5 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1.5"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Mark Complete
                                </button>
                              )}
                              
                              {/* Mark as Pending Button (if completed) */}
                              {status === 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsPending(req.control_id, reqIdx);
                                  }}
                                  className="px-3 py-1.5 rounded text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Mark Pending
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RequirementsTab;
