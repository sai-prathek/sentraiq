"""
Control Library: Comprehensive control catalog with framework overlaps
Supports SWIFT CSP, SOC 2, and cross-compliance synergies
"""
from typing import Dict, List, Any, Optional
from enum import Enum


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


# Control Library: SWIFT CSP Controls
SWIFT_CONTROLS: Dict[str, Dict[str, Any]] = {
    "SWIFT-1.1": {
        "control_id": "SWIFT-1.1",
        "name": "Restrict Internet Access",
        "description": "Restrict logical access to the SWIFT environment to internet-facing entry points",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["internet", "access", "restrict", "network", "firewall", "dmz"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Is internet access to SWIFT environment restricted?",
            "Are there documented network segmentation controls?",
            "Are firewall rules reviewed quarterly?"
        ],
        "evidence_types": ["network_logs", "firewall_configs", "network_diagrams"]
    },
    "SWIFT-1.2": {
        "control_id": "SWIFT-1.2",
        "name": "Segregate Critical Systems",
        "description": "Segregate critical systems from general IT environment",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["segregation", "network", "segmentation", "critical", "isolation"],
        "infrastructure_applicable": [InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM, InfrastructureType.HYBRID],
        "assessment_questions": [
            "Are critical SWIFT systems segregated from general IT?",
            "Is network segmentation documented and tested?",
            "Are access controls between segments enforced?"
        ],
        "evidence_types": ["network_diagrams", "access_logs", "configurations"]
    },
    "SWIFT-2.1": {
        "control_id": "SWIFT-2.1",
        "name": "Password Policy",
        "description": "Enforce strong password policy for operator accounts",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["password", "policy", "complexity", "authentication", "operator"],
        "infrastructure_applicable": [InfrastructureType.SWIFT_TERMINAL, InfrastructureType.CLOUD_A4],
        "assessment_questions": [
            "Is password policy enforced (min 12 chars, complexity)?",
            "Are passwords changed every 90 days?",
            "Is password history enforced (last 10 passwords)?"
        ],
        "evidence_types": ["policy_documents", "configurations", "audit_logs"]
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
        "name": "Multi-Factor Authentication",
        "description": "Enforce MFA for all operator accounts",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["mfa", "two-factor", "2fa", "authentication", "duo", "token", "hardware"],
        "infrastructure_applicable": [InfrastructureType.SWIFT_TERMINAL, InfrastructureType.CLOUD_A4],
        "assessment_questions": [
            "Is MFA enforced for all SWIFT operator accounts?",
            "Are MFA challenges logged and monitored?",
            "Is MFA hardware token management documented?"
        ],
        "evidence_types": ["mfa_logs", "configurations", "policy_documents"]
    },
    "SWIFT-3.1": {
        "control_id": "SWIFT-3.1",
        "name": "Audit Logging",
        "description": "Maintain comprehensive audit logs of SWIFT-related activities",
        "framework": Framework.SWIFT_CSP,
        "type": ControlType.MANDATORY,
        "keywords": ["audit", "logging", "log", "event", "activity", "monitoring"],
        "infrastructure_applicable": [InfrastructureType.SWIFT_TERMINAL, InfrastructureType.CLOUD_A4, InfrastructureType.ON_PREM],
        "assessment_questions": [
            "Are all SWIFT activities logged?",
            "Are logs retained for minimum 7 years?",
            "Are logs tamper-proof and immutable?"
        ],
        "evidence_types": ["audit_logs", "log_retention_policies", "siem_reports"]
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
    # SWIFT-2.8 (MFA) overlaps with SOC2-CC6.2 (MFA)
    "SWIFT-2.8": ["SOC2-CC6.2"],
    "SOC2-CC6.2": ["SWIFT-2.8"],
    
    # SWIFT-3.1 (Audit Logging) overlaps with SOC2-CC7.1 (System Monitoring)
    "SWIFT-3.1": ["SOC2-CC7.1"],
    "SOC2-CC7.1": ["SWIFT-3.1"],
    
    # SWIFT-2.1 (Password Policy) overlaps with SOC2-CC6.1 (Logical Access)
    "SWIFT-2.1": ["SOC2-CC6.1"],
    "SOC2-CC6.1": ["SWIFT-2.1"],
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
