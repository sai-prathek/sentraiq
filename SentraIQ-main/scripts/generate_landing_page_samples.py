"""
Generate realistic sample files matching the landing page demo files
"""
import random
import json
from datetime import datetime, timedelta
from pathlib import Path

try:
    import fitz  # PyMuPDF
    HAS_PDF = True
except ImportError:
    HAS_PDF = False
    print("⚠️  PyMuPDF not available, creating text versions of PDFs")


def generate_swift_transaction_log():
    """Generate SWIFT_Transaction_Log_2025.log (~2.4 MB)"""
    logs_dir = Path(__file__).parent.parent / "data" / "sample_logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = logs_dir / "SWIFT_Transaction_Log_2025.log"
    
    # SWIFT message types
    message_types = ["MT103", "MT202", "MT940", "MT950", "MT101", "MT102"]
    currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "CAD"]
    statuses = ["COMPLETED", "PENDING", "REJECTED", "CANCELLED"]
    
    start_date = datetime(2025, 1, 1)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("# SWIFT Transaction Log - 2025\n")
        f.write("# Generated for SentraIQ POC Demonstration\n")
        f.write("# Format: ISO 20022 / SWIFT MT Message Logs\n\n")
        
        # Generate ~2.4 MB of log entries
        target_size = 2.4 * 1024 * 1024  # 2.4 MB in bytes
        current_size = 0
        entry_count = 0
        
        while current_size < target_size:
            timestamp = start_date + timedelta(
                days=random.randint(0, 364),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
                seconds=random.randint(0, 59)
            )
            
            msg_type = random.choice(message_types)
            msg_ref = f"{msg_type}-{random.randint(100000, 999999)}"
            sender_bic = f"BANK{random.randint(10, 99)}GB2X"
            receiver_bic = f"BANK{random.randint(10, 99)}US33"
            currency = random.choice(currencies)
            amount = round(random.uniform(1000, 10000000), 2)
            status = random.choice(statuses)
            
            # SWIFT log entry format
            log_entry = f"""[{timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')}] SWIFT_TRANSACTION
Message Type: {msg_type}
Message Reference: {msg_ref}
Sender BIC: {sender_bic}
Receiver BIC: {receiver_bic}
Transaction Date: {timestamp.strftime('%Y%m%d')}
Value Date: {(timestamp + timedelta(days=random.randint(0, 2))).strftime('%Y%m%d')}
Currency: {currency}
Amount: {amount:,.2f} {currency}
Status: {status}
Priority: {'NORMAL' if random.random() > 0.1 else 'URGENT'}
Authentication: {'VERIFIED' if status == 'COMPLETED' else 'PENDING'}
Compliance Check: {'PASSED' if status == 'COMPLETED' else 'REVIEW'}
Sanctions Screening: {'CLEAR' if random.random() > 0.05 else 'FLAGGED'}
Encryption: TLS 1.3
Message Hash: SHA256-{''.join(random.choices('0123456789abcdef', k=64))}
Audit Trail: AT-{timestamp.strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}
Processing Time: {random.randint(50, 500)}ms
Routing: {'DIRECT' if random.random() > 0.3 else 'CORRESPONDENT'}
Correspondent Bank: {'N/A' if random.random() > 0.3 else f'CORR{random.randint(100, 999)}GB2X'}

"""
            
            f.write(log_entry)
            current_size = file_path.stat().st_size
            entry_count += 1
            
            if entry_count % 1000 == 0:
                print(f"  Generated {entry_count} entries, size: {current_size / 1024 / 1024:.2f} MB")
    
    print(f"✅ Generated {file_path.name} ({entry_count} entries, {file_path.stat().st_size / 1024 / 1024:.2f} MB)")


def generate_firewall_traffic_log():
    """Generate Firewall_Traffic_Q3.txt (~128 KB)"""
    logs_dir = Path(__file__).parent.parent / "data" / "sample_logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = logs_dir / "Firewall_Traffic_Q3.txt"
    
    protocols = ["TCP", "UDP", "HTTPS", "TLS"]
    actions = ["ALLOW", "BLOCK", "DENY"]
    services = ["payment-gateway", "swift-terminal", "api-server", "database", "admin-portal"]
    
    start_date = datetime(2025, 7, 1)  # Q3 2025
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write("# Firewall Traffic Log - Q3 2025\n")
        f.write("# Payment System Network Security\n")
        f.write("# Format: Standard Firewall Log Format\n\n")
        
        target_size = 128 * 1024  # 128 KB
        current_size = 0
        entry_count = 0
        
        while current_size < target_size:
            timestamp = start_date + timedelta(
                days=random.randint(0, 92),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            protocol = random.choice(protocols)
            action = random.choice(actions)
            service = random.choice(services)
            src_ip = f"{random.randint(1, 223)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 254)}"
            dst_ip = f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
            src_port = random.randint(1024, 65535)
            dst_port = random.choice([443, 8443, 3306, 5432, 8080, 22])
            
            log_entry = f"""{timestamp.strftime('%Y-%m-%d %H:%M:%S')} | {action} | {protocol} | 
SRC: {src_ip}:{src_port} | DST: {dst_ip}:{dst_port} | 
SERVICE: {service} | 
BYTES: {random.randint(100, 100000)} | 
PACKETS: {random.randint(1, 50)} | 
FLAGS: {'SYN,ACK' if action == 'ALLOW' else 'RST'} | 
REASON: {'Policy match' if action == 'ALLOW' else 'Security policy violation'} | 
RULE_ID: FW-RULE-{random.randint(100, 999)} | 
THREAT_LEVEL: {'LOW' if action == 'ALLOW' else random.choice(['MEDIUM', 'HIGH'])} | 
GEO_LOCATION: {random.choice(['US', 'GB', 'DE', 'FR', 'JP', 'CN', 'RU'])} | 
USER_AGENT: {'N/A' if protocol in ['TCP', 'UDP'] else 'Mozilla/5.0'}

"""
            
            f.write(log_entry)
            current_size = file_path.stat().st_size
            entry_count += 1
    
    print(f"✅ Generated {file_path.name} ({entry_count} entries, {file_path.stat().st_size / 1024:.2f} KB)")


def generate_aws_cloudtrail_log():
    """Generate AWS_CloudTrail_Prod_Jan2025.json (~15.2 MB)"""
    logs_dir = Path(__file__).parent.parent / "data" / "sample_logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = logs_dir / "AWS_CloudTrail_Prod_Jan2025.json"
    
    aws_services = ["s3", "ec2", "iam", "rds", "lambda", "cloudwatch", "kms", "secretsmanager"]
    event_names = {
        "s3": ["PutObject", "GetObject", "DeleteObject", "ListBucket"],
        "ec2": ["RunInstances", "TerminateInstances", "DescribeInstances"],
        "iam": ["CreateUser", "AttachUserPolicy", "ListUsers", "GetUser"],
        "rds": ["CreateDBInstance", "ModifyDBInstance", "DescribeDBInstances"],
        "lambda": ["InvokeFunction", "CreateFunction", "UpdateFunction"],
        "cloudwatch": ["PutMetricData", "GetMetricStatistics"],
        "kms": ["Encrypt", "Decrypt", "CreateKey"],
        "secretsmanager": ["GetSecretValue", "CreateSecret", "UpdateSecret"]
    }
    
    start_date = datetime(2025, 1, 1)
    
    target_size = 15.2 * 1024 * 1024  # 15.2 MB
    current_size = 0
    entry_count = 0
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('{\n  "Records": [\n')
        
        first_entry = True
        
        while current_size < target_size:
            timestamp = start_date + timedelta(
                days=random.randint(0, 31),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
                seconds=random.randint(0, 59)
            )
            
            service = random.choice(aws_services)
            event_name = random.choice(event_names[service])
            user_arn = f"arn:aws:iam::123456789012:user/user{random.randint(1, 50)}"
            region = random.choice(["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"])
            
            # CloudTrail log entry structure
            record = {
                "eventVersion": "1.08",
                "userIdentity": {
                    "type": "IAMUser",
                    "principalId": f"AIDA{random.randint(1000000000000000, 9999999999999999)}",
                    "arn": user_arn,
                    "accountId": "123456789012",
                    "userName": f"user{random.randint(1, 50)}"
                },
                "eventTime": timestamp.isoformat() + "Z",
                "eventSource": f"{service}.amazonaws.com",
                "eventName": event_name,
                "awsRegion": region,
                "sourceIPAddress": f"{random.randint(1, 223)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 254)}",
                "userAgent": "aws-cli/2.15.0 Python/3.11.0",
                "requestParameters": {
                    "bucketName": f"prod-bucket-{random.randint(1, 100)}" if service == "s3" else None,
                    "instanceType": f"t3.{random.choice(['micro', 'small', 'medium'])}" if service == "ec2" else None
                },
                "responseElements": {
                    "x-amz-request-id": f"{''.join(random.choices('0123456789ABCDEF', k=16))}",
                    "x-amz-id-2": f"{''.join(random.choices('0123456789abcdef', k=64))}"
                },
                "requestID": f"{''.join(random.choices('0123456789ABCDEF', k=16))}",
                "eventID": f"{''.join(random.choices('0123456789abcdef', k=36))}",
                "readOnly": random.choice([True, False]),
                "resources": [
                    {
                        "accountId": "123456789012",
                        "type": f"AWS::{service.upper()}",
                        "ARN": f"arn:aws:{service}:{region}:123456789012:{random.choice(['resource', 'instance', 'bucket'])}/{random.randint(1, 1000)}"
                    }
                ],
                "eventType": "AwsApiCall",
                "managementEvent": random.choice([True, False]),
                "recipientAccountId": "123456789012"
            }
            
            if not first_entry:
                f.write(',\n')
            else:
                first_entry = False
            
            json.dump(record, f, indent=4)
            
            current_size = file_path.stat().st_size
            entry_count += 1
            
            if entry_count % 500 == 0:
                print(f"  Generated {entry_count} entries, size: {current_size / 1024 / 1024:.2f} MB")
        
        f.write('\n  ]\n}')
    
    print(f"✅ Generated {file_path.name} ({entry_count} entries, {file_path.stat().st_size / 1024 / 1024:.2f} MB)")


def generate_nist_compliance_audit_pdf():
    """Generate NIST_800_53_Compliance_Audit.pdf (~4.1 MB)"""
    policies_dir = Path(__file__).parent.parent / "data" / "sample_policies"
    policies_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = policies_dir / "NIST_800_53_Compliance_Audit.pdf"
    
    content = """
NIST 800-53 COMPLIANCE AUDIT REPORT
Payment Systems Security Assessment
Fiscal Year 2025

================================================================================
EXECUTIVE SUMMARY
================================================================================

This comprehensive audit report evaluates the organization's compliance with 
NIST Special Publication 800-53 (Revision 5) security controls for payment 
processing systems. The assessment covers access control, encryption, audit 
logging, and incident response capabilities.

Audit Period: January 1, 2025 - December 31, 2025
Audit Scope: Payment Gateway Infrastructure, SWIFT Terminal Access, 
             Customer Data Protection, Network Security

Overall Compliance Rating: 87% (Meets Requirements)

================================================================================
1. ACCESS CONTROL (AC) FAMILY
================================================================================

1.1 AC-2: Account Management
Status: COMPLIANT
Evidence: Active Directory integration, automated account provisioning, 
         quarterly access reviews documented.

1.2 AC-3: Access Enforcement
Status: COMPLIANT  
Evidence: Role-based access control (RBAC) implemented, least privilege 
         principle enforced, access denied logs reviewed.

1.3 AC-7: Unsuccessful Logon Attempts
Status: COMPLIANT
Evidence: Account lockout after 3 failed attempts, 30-minute lockout duration, 
         automated alerts to SOC.

1.4 AC-11: Session Lock
Status: COMPLIANT
Evidence: 15-minute inactivity timeout on SWIFT terminals, automatic screen 
         lock implemented.

1.5 AC-17: Remote Access
Status: PARTIALLY COMPLIANT
Gap: VPN access logs not fully integrated with SIEM.
Remediation: Integrate VPN logs by Q2 2025.

================================================================================
2. AUDIT AND ACCOUNTABILITY (AU) FAMILY
================================================================================

2.1 AU-2: Audit Events
Status: COMPLIANT
Evidence: Comprehensive logging of authentication, authorization, and data 
         access events. Log retention: 7 years.

2.2 AU-3: Content of Audit Records
Status: COMPLIANT
Evidence: All required fields captured: timestamp, user ID, source IP, action, 
         result, MFA status.

2.3 AU-4: Audit Storage Capacity
Status: COMPLIANT
Evidence: Centralized log management system with 50TB capacity, automated 
         archival to immutable storage.

2.4 AU-6: Audit Review, Analysis, and Reporting
Status: COMPLIANT
Evidence: Daily automated audit log reviews, weekly security team analysis, 
         monthly compliance reports generated.

2.5 AU-9: Protection of Audit Information
Status: COMPLIANT
Evidence: Audit logs stored in encrypted, immutable format. Access restricted 
         to security team only.

================================================================================
3. IDENTIFICATION AND AUTHENTICATION (IA) FAMILY
================================================================================

3.1 IA-2: Identification and Authentication (Organizational Users)
Status: COMPLIANT
Evidence: Multi-factor authentication (MFA) mandatory for all SWIFT terminal 
         access. Hardware tokens issued to authorized personnel.

3.2 IA-5: Authenticator Management
Status: COMPLIANT
Evidence: Password policy enforced: 12+ characters, complexity requirements, 
         90-day rotation, password history (last 10 passwords).

3.3 IA-8: Identification and Authentication (Non-Organizational Users)
Status: COMPLIANT
Evidence: Third-party access requires separate authentication, MFA enforced, 
         time-limited access tokens.

================================================================================
4. SYSTEM AND COMMUNICATIONS PROTECTION (SC) FAMILY
================================================================================

4.1 SC-7: Boundary Protection
Status: COMPLIANT
Evidence: Firewall rules documented, network segmentation implemented, 
         DMZ architecture for payment gateways.

4.2 SC-8: Transmission Confidentiality and Integrity
Status: COMPLIANT
Evidence: TLS 1.3 enforced for all payment data transmission, certificate 
         pinning implemented, HSTS headers configured.

4.3 SC-12: Cryptographic Key Establishment and Management
Status: COMPLIANT
Evidence: Hardware Security Module (HSM) for key management, key rotation 
         procedures documented, key escrow for disaster recovery.

4.4 SC-13: Cryptographic Protection
Status: COMPLIANT
Evidence: AES-256 encryption for data at rest, TLS 1.3 for data in transit, 
         FIPS 140-2 Level 3 validated cryptographic modules.

4.5 SC-28: Protection of Information at Rest
Status: COMPLIANT
Evidence: Database encryption enabled, backup encryption verified, key 
         management through HSM.

================================================================================
5. SYSTEM AND INFORMATION INTEGRITY (SI) FAMILY
================================================================================

5.1 SI-2: Flaw Remediation
Status: COMPLIANT
Evidence: Monthly security patch cycle, critical patches applied within 48 
         hours, vulnerability scanning weekly.

5.2 SI-3: Malicious Code Protection
Status: COMPLIANT
Evidence: Endpoint protection on all servers, signature updates daily, 
         behavioral analysis enabled.

5.3 SI-4: System Monitoring
Status: COMPLIANT
Evidence: 24/7 Security Operations Center (SOC), SIEM integration, automated 
         threat detection, incident response procedures documented.

5.4 SI-7: Software, Firmware, and Information Integrity
Status: COMPLIANT
Evidence: Code signing for all applications, integrity checks on system files, 
         secure boot enabled.

================================================================================
6. INCIDENT RESPONSE (IR) FAMILY
================================================================================

6.1 IR-4: Incident Handling
Status: COMPLIANT
Evidence: Incident response plan documented, response team identified, 
         quarterly tabletop exercises conducted.

6.2 IR-5: Incident Monitoring
Status: COMPLIANT
Evidence: Automated security event monitoring, threat intelligence feeds 
         integrated, escalation procedures defined.

6.3 IR-6: Incident Reporting
Status: COMPLIANT
Evidence: Regulatory reporting procedures documented, breach notification 
         timelines defined, communication templates prepared.

================================================================================
7. RISK ASSESSMENT (RA) FAMILY
================================================================================

7.1 RA-2: Security Categorization
Status: COMPLIANT
Evidence: Payment systems categorized as HIGH impact, data classification 
         scheme implemented.

7.2 RA-3: Risk Assessment
Status: COMPLIANT
Evidence: Annual risk assessments conducted, threat modeling performed, 
         residual risk documented and accepted by management.

================================================================================
8. SECURITY ASSESSMENT AND AUTHORIZATION (CA) FAMILY
================================================================================

8.1 CA-2: Security Assessments
Status: COMPLIANT
Evidence: Annual penetration testing, quarterly vulnerability assessments, 
         external audit conducted.

8.2 CA-7: Continuous Monitoring
Status: COMPLIANT
Evidence: Continuous security monitoring implemented, automated compliance 
         checking, real-time alerting.

================================================================================
9. FINDINGS AND RECOMMENDATIONS
================================================================================

CRITICAL FINDINGS:
- None

HIGH PRIORITY FINDINGS:
1. VPN log integration incomplete (AC-17)
   Recommendation: Complete SIEM integration by Q2 2025
   Owner: Network Security Team
   Due Date: June 30, 2025

MEDIUM PRIORITY FINDINGS:
1. Some legacy systems still using TLS 1.2
   Recommendation: Upgrade to TLS 1.3 by Q3 2025
   Owner: Infrastructure Team

2. Quarterly access reviews not fully automated
   Recommendation: Implement automated access review workflow
   Owner: Identity and Access Management Team

================================================================================
10. COMPLIANCE SUMMARY
================================================================================

Total Controls Assessed: 156
Compliant: 136 (87%)
Partially Compliant: 15 (10%)
Non-Compliant: 5 (3%)

Overall Assessment: The organization demonstrates strong compliance with NIST 
800-53 requirements. The identified gaps are manageable and remediation plans 
are in place.

================================================================================
APPROVAL AND SIGNATURES
================================================================================

Prepared by:
- Chief Information Security Officer (CISO)
- Compliance Officer
- External Audit Firm: Security Audit Partners LLC

Reviewed by:
- Chief Risk Officer (CRO)
- Chief Technology Officer (CTO)
- Board of Directors - Risk Committee

Date: January 15, 2025
Report Version: 1.0
Classification: CONFIDENTIAL - INTERNAL USE ONLY

================================================================================
APPENDIX A: EVIDENCE DOCUMENTATION
================================================================================

All evidence referenced in this audit report is maintained in the SentraIQ 
Evidence Lakehouse system. Evidence IDs and references are available upon 
request through the compliance portal.

================================================================================
END OF REPORT
================================================================================
"""
    
    if HAS_PDF:
        # Create PDF using PyMuPDF
        doc = fitz.open()
        page = doc.new_page()
        
        # Add content in chunks to reach ~4.1 MB
        # We'll add the content multiple times with variations
        text_to_add = content
        for i in range(8):  # Repeat content to reach target size
            if i > 0:
                text_to_add += f"\n\n--- Appendix Section {i+1} ---\n\n"
                text_to_add += content.replace("Fiscal Year 2025", f"Fiscal Year 2025 - Section {i+1}")
            
            # Insert text
            page.insert_text((50, 50 + i * 800), text_to_add[:5000], fontsize=10)
            
            # Add new page if needed
            if i % 2 == 1:
                page = doc.new_page()
        
        # Add more content to reach target size
        additional_content = "\n" * 1000 + "Detailed technical specifications and control implementation details follow..." * 100
        page.insert_text((50, 50), additional_content, fontsize=9)
        
        doc.save(file_path)
        doc.close()
        print(f"✅ Generated {file_path.name} ({file_path.stat().st_size / 1024 / 1024:.2f} MB)")
    else:
        # Create text version
        text_file = policies_dir / "NIST_800_53_Compliance_Audit.txt"
        with open(text_file, 'w', encoding='utf-8') as f:
            # Repeat content to reach ~4.1 MB
            for i in range(20):
                f.write(content)
                if i < 19:
                    f.write(f"\n\n--- Section {i+2} ---\n\n")
        print(f"✅ Generated {text_file.name} (text version, {text_file.stat().st_size / 1024 / 1024:.2f} MB)")
        print(f"   Note: Install PyMuPDF to generate actual PDF file")


def generate_user_access_review_policy():
    """Generate User_Access_Review_Policy.docx content (~1.2 MB)"""
    policies_dir = Path(__file__).parent.parent / "data" / "sample_policies"
    policies_dir.mkdir(parents=True, exist_ok=True)
    
    # Since we don't have python-docx, create a text version
    file_path = policies_dir / "User_Access_Review_Policy.txt"
    
    content = """
USER ACCESS REVIEW POLICY
Version 3.1
Effective Date: January 1, 2025
Document Classification: INTERNAL - COMPLIANCE

================================================================================
1. PURPOSE AND SCOPE
================================================================================

This policy establishes the requirements for periodic review of user access 
rights to ensure that access permissions remain appropriate and aligned with 
job responsibilities. This policy applies to all systems, applications, and 
data repositories within the organization, with particular emphasis on payment 
processing systems.

Scope:
- All employees, contractors, and third-party vendors
- All information systems, including SWIFT terminals, payment gateways, 
  databases, and administrative portals
- All data classifications: Public, Internal, Confidential, Restricted

================================================================================
2. POLICY STATEMENT
================================================================================

The organization shall conduct regular access reviews to:
- Verify that user access rights are appropriate for current job functions
- Identify and remove unnecessary or excessive access privileges
- Detect and remediate orphaned accounts (accounts for terminated employees)
- Ensure compliance with regulatory requirements (PCI-DSS, SWIFT CSP, GDPR)
- Maintain the principle of least privilege

================================================================================
3. ACCESS REVIEW REQUIREMENTS
================================================================================

3.1 Frequency of Reviews

3.1.1 High-Risk Systems (Payment Processing, SWIFT Terminals)
- Frequency: Quarterly (every 90 days)
- Review Scope: All users with access to payment systems
- Reviewers: Line managers, Information Security, Compliance Officer

3.1.2 Standard Business Systems
- Frequency: Semi-annually (every 180 days)
- Review Scope: All active user accounts
- Reviewers: Line managers, IT Security

3.1.3 Administrative and Privileged Accounts
- Frequency: Monthly (every 30 days)
- Review Scope: All accounts with elevated privileges (admin, root, service)
- Reviewers: CISO, IT Security Manager

3.2 Review Process

Step 1: Access List Generation
- System administrators generate current access lists for each system
- Lists include: username, role, permissions, last login date, account status
- Lists exported in standardized format (CSV/Excel) for review

Step 2: Manager Review
- Access lists distributed to line managers
- Managers verify each employee's access against current job responsibilities
- Managers identify:
  * Access that should be removed (role changes, project completion)
  * Access that should be added (new responsibilities)
  * Access that requires justification (temporary project access)

Step 3: Security Team Review
- Security team reviews manager feedback
- Identifies orphaned accounts (no manager assigned, terminated employees)
- Flags excessive privileges (users with access beyond job requirements)
- Reviews privileged account usage logs

Step 4: Remediation
- Unnecessary access removed within 5 business days
- New access requests processed through standard access request procedure
- Orphaned accounts disabled immediately
- Excessive privileges reduced to minimum required

Step 5: Documentation and Sign-Off
- Review results documented in access review system
- Managers sign off on access decisions
- Compliance team maintains audit trail
- Review report generated for management and auditors

================================================================================
4. ROLES AND RESPONSIBILITIES
================================================================================

4.1 Line Managers
- Review and approve/deny access for direct reports
- Justify continued access for their team members
- Request access changes as needed
- Complete reviews within 10 business days

4.2 Information Security Team
- Generate access lists for review
- Review privileged account access
- Identify security risks and excessive privileges
- Execute access changes (additions/removals)
- Maintain access review system and documentation

4.3 Compliance Officer
- Ensure reviews are conducted on schedule
- Verify compliance with regulatory requirements
- Maintain audit trail of all access reviews
- Report access review status to management

4.4 Human Resources
- Notify IT Security of employee terminations within 24 hours
- Provide organizational charts for access review
- Verify job titles and departments for access justification

4.5 System Administrators
- Provide technical support for access changes
- Generate system-specific access reports
- Verify access changes are implemented correctly

================================================================================
5. ACCESS REVIEW CRITERIA
================================================================================

5.1 Access to be REMOVED:
- Employee no longer requires access for job function
- Project or temporary assignment completed
- Employee transferred to different department
- Employee on extended leave (>90 days) without business justification
- Access granted in error
- Privileged access no longer justified

5.2 Access to be MAINTAINED:
- Access required for current job responsibilities
- Access required for active projects (with end date documented)
- Access required for backup/on-call responsibilities
- Access required for compliance or regulatory purposes

5.3 Access to be ADDED:
- New job responsibilities requiring additional access
- New project assignment requiring temporary access
- Promotion or role change requiring elevated access
- Cross-training or backup responsibilities

5.4 Special Considerations:
- Service accounts: Reviewed by IT Security, justified by system owner
- Shared accounts: Prohibited except where technically unavoidable (documented)
- Emergency access: Reviewed monthly, usage logged and justified
- Third-party vendor access: Reviewed quarterly, time-limited where possible

================================================================================
6. DOCUMENTATION REQUIREMENTS
================================================================================

All access reviews must be documented with:
- Review date and period covered
- Systems/applications reviewed
- List of reviewers and their roles
- Access changes requested (additions/removals)
- Justification for access decisions
- Manager sign-off
- Completion date and status

Documentation retention: 7 years (regulatory requirement)

================================================================================
7. EXCEPTIONS AND ESCALATIONS
================================================================================

7.1 Exception Process
- Requests for exception to access review policy must be submitted to CISO
- Exceptions must be justified with business case
- Exceptions are time-limited and require periodic re-justification
- All exceptions documented and tracked

7.2 Escalation
- Disputes regarding access decisions escalated to department head
- Final authority: Chief Information Security Officer (CISO)
- Compliance concerns escalated to Chief Risk Officer (CRO)

================================================================================
8. COMPLIANCE AND ENFORCEMENT
================================================================================

This policy supports compliance with:
- PCI-DSS Requirement 7: Restrict access to cardholder data
- SWIFT Customer Security Programme (CSP) Control 6.1: Access Control
- NIST 800-53 AC-2: Account Management
- GDPR Article 32: Security of processing
- SOX Section 404: Internal controls

Non-compliance with this policy may result in:
- Disciplinary action
- Access revocation
- Regulatory reporting
- Legal consequences

================================================================================
9. METRICS AND REPORTING
================================================================================

The following metrics are tracked and reported quarterly:
- Percentage of reviews completed on time
- Number of access removals per review cycle
- Number of orphaned accounts identified and remediated
- Average time to complete access review
- Number of exceptions granted
- Compliance score (target: >95%)

================================================================================
10. POLICY MAINTENANCE
================================================================================

This policy is reviewed annually and updated as necessary to reflect:
- Changes in regulatory requirements
- Organizational changes
- Technology updates
- Lessons learned from access review process

Policy Owner: Chief Information Security Officer (CISO)
Last Review Date: January 1, 2025
Next Review Date: January 1, 2026

================================================================================
APPROVAL
================================================================================

Approved by:
- Chief Information Security Officer
- Chief Risk Officer
- Chief Human Resources Officer
- Chief Technology Officer

Date: January 1, 2025

================================================================================
APPENDIX A: ACCESS REVIEW CHECKLIST
================================================================================

For each user account, reviewers should verify:
[ ] User is still employed/active
[ ] User's role matches current access level
[ ] Access is required for current job responsibilities
[ ] Last login date is recent (within last 90 days for standard accounts)
[ ] No excessive privileges granted
[ ] Manager approval obtained
[ ] Access changes documented

================================================================================
APPENDIX B: ACCESS REVIEW TEMPLATE
================================================================================

System: _______________________
Review Period: _______________ to _______________
Reviewer Name: _______________________
Review Date: _______________

User Accounts Reviewed: _____
Access Removals: _____
Access Additions: _____
Orphaned Accounts Identified: _____
Exceptions Granted: _____

Manager Signature: _______________________
Date: _______________

================================================================================
END OF POLICY DOCUMENT
================================================================================
"""
    
    with open(file_path, 'w', encoding='utf-8') as f:
        # Repeat content to reach ~1.2 MB
        for i in range(6):
            f.write(content)
            if i < 5:
                f.write(f"\n\n--- Section {i+2} ---\n\n")
    
    print(f"✅ Generated {file_path.name} (text version, {file_path.stat().st_size / 1024 / 1024:.2f} MB)")
    print(f"   Note: Install python-docx to generate actual DOCX file")


def generate_pci_dss_gap_analysis_pdf():
    """Generate PCI_DSS_Gap_Analysis_Report.pdf (~3.5 MB)"""
    policies_dir = Path(__file__).parent.parent / "data" / "sample_policies"
    policies_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = policies_dir / "PCI_DSS_Gap_Analysis_Report.pdf"
    
    content = """
PCI-DSS GAP ANALYSIS REPORT
Payment Card Industry Data Security Standard Compliance Assessment
Assessment Date: January 2025

================================================================================
EXECUTIVE SUMMARY
================================================================================

This gap analysis report evaluates the organization's current state of 
compliance with the Payment Card Industry Data Security Standard (PCI-DSS) 
Version 4.0. The assessment identifies gaps between current security controls 
and PCI-DSS requirements, providing a roadmap for achieving and maintaining 
compliance.

Assessment Scope:
- Cardholder Data Environment (CDE)
- Payment processing systems
- Network infrastructure
- Access controls and authentication
- Data encryption and key management
- Security monitoring and logging

Overall Compliance Status: 82% (Substantial Compliance with Remediation Needed)

================================================================================
1. REQUIREMENT 1: INSTALL AND MAINTAIN NETWORK SECURITY CONTROLS
================================================================================

1.1 Requirement 1.1: Processes and mechanisms for installing and maintaining 
    network security controls are defined and understood.
Status: COMPLIANT
Evidence: Network security policy documented, change management process in place.

1.2 Requirement 1.2: Network security controls are implemented.
Status: COMPLIANT
Evidence: Firewalls deployed, network segmentation implemented, DMZ architecture 
         for payment systems.

1.3 Requirement 1.3: Network access to the cardholder data environment is 
    restricted.
Status: PARTIALLY COMPLIANT
Gap: Some legacy systems still allow direct database access from application 
     servers without additional network controls.
Remediation: Implement network access control lists (ACLs) by Q2 2025.
Priority: HIGH

1.4 Requirement 1.4: Network connections between trusted and untrusted networks 
    are controlled.
Status: COMPLIANT
Evidence: Firewall rules documented, traffic filtering implemented, VPN access 
         restricted.

================================================================================
2. REQUIREMENT 2: APPLY SECURE CONFIGURATIONS TO ALL SYSTEM COMPONENTS
================================================================================

2.1 Requirement 2.1: Processes and mechanisms for applying secure configurations 
    are defined and understood.
Status: COMPLIANT
Evidence: Security configuration standards documented, hardening procedures 
         defined.

2.2 Requirement 2.2: System components are configured and managed securely.
Status: COMPLIANT
Evidence: Default passwords changed, unnecessary services disabled, security 
         patches applied.

2.3 Requirement 2.3: System components are protected from known vulnerabilities.
Status: PARTIALLY COMPLIANT
Gap: Some systems have patches pending beyond 30-day window.
Remediation: Accelerate patch management process, target 14-day patch cycle.
Priority: MEDIUM

2.4 Requirement 2.4: System components are configured to prevent misuse.
Status: COMPLIANT
Evidence: Logging enabled, audit trails configured, system monitoring active.

================================================================================
3. REQUIREMENT 3: PROTECT STORED CARDHOLDER DATA
================================================================================

3.1 Requirement 3.1: Processes and mechanisms for protecting stored cardholder 
    data are defined and understood.
Status: COMPLIANT
Evidence: Data retention policy documented, encryption requirements defined.

3.2 Requirement 3.2: Storage of cardholder data is minimized.
Status: COMPLIANT
Evidence: Cardholder data retention limited to business necessity, data 
         minimization practices implemented.

3.3 Requirement 3.3: Sensitive authentication data is not stored after 
    authorization.
Status: COMPLIANT
Evidence: Full magnetic stripe data not stored, CVV not stored, PIN blocks 
         encrypted.

3.4 Requirement 3.4: Primary account numbers (PANs) are protected when stored.
Status: COMPLIANT
Evidence: PAN encryption implemented (AES-256), key management through HSM, 
         tokenization used where applicable.

3.5 Requirement 3.5: PAN is unreadable anywhere it is stored.
Status: COMPLIANT
Evidence: Strong cryptography implemented, key strength verified, key management 
         procedures documented.

================================================================================
4. REQUIREMENT 4: PROTECT CARDHOLDER DATA WITH STRONG CRYPTOGRAPHY DURING 
   TRANSMISSION
================================================================================

4.1 Requirement 4.1: Processes and mechanisms for protecting cardholder data 
    during transmission are defined and understood.
Status: COMPLIANT
Evidence: Encryption policy documented, TLS requirements defined.

4.2 Requirement 4.2: Strong cryptography and security protocols are implemented 
    to safeguard cardholder data during transmission.
Status: COMPLIANT
Evidence: TLS 1.3 implemented, weak cipher suites disabled, certificate 
         management in place.

4.3 Requirement 4.3: PAN is protected with strong cryptography during 
    transmission.
Status: COMPLIANT
Evidence: All PAN transmission encrypted, no PAN sent via email or instant 
         messaging.

================================================================================
5. REQUIREMENT 5: PROTECT ALL SYSTEMS AND NETWORKS FROM MALICIOUS SOFTWARE
================================================================================

5.1 Requirement 5.1: Processes and mechanisms for protecting systems and 
    networks from malicious software are defined and understood.
Status: COMPLIANT
Evidence: Anti-malware policy documented, update procedures defined.

5.2 Requirement 5.2: Malicious software is prevented or detected and addressed.
Status: COMPLIANT
Evidence: Anti-virus deployed on all systems, signature updates automated, 
         behavioral analysis enabled.

5.3 Requirement 5.3: Anti-malware mechanisms are actively running.
Status: COMPLIANT
Evidence: Real-time scanning enabled, scheduled scans configured, tamper 
         protection active.

================================================================================
6. REQUIREMENT 6: DEVELOP AND MAINTAIN SECURE SYSTEMS AND SOFTWARE
================================================================================

6.1 Requirement 6.1: Processes and mechanisms for developing and maintaining 
    secure systems and software are defined and understood.
Status: COMPLIANT
Evidence: Secure development lifecycle (SDLC) documented, coding standards 
         defined.

6.2 Requirement 6.2: Bespoke and custom software are developed securely.
Status: PARTIALLY COMPLIANT
Gap: Some legacy applications lack security code review, vulnerability scanning 
     not fully integrated into CI/CD pipeline.
Remediation: Implement automated security scanning, require code reviews for 
             all custom code.
Priority: HIGH

6.3 Requirement 6.3: Security vulnerabilities are identified and addressed.
Status: COMPLIANT
Evidence: Vulnerability scanning monthly, penetration testing annually, patch 
         management process in place.

6.4 Requirement 6.4: Public-facing web applications are protected against 
    attacks.
Status: COMPLIANT
Evidence: Web application firewall (WAF) deployed, input validation implemented, 
         OWASP Top 10 mitigations in place.

================================================================================
7. REQUIREMENT 7: RESTRICT ACCESS TO CARDHOLDER DATA BY BUSINESS NEED TO KNOW
================================================================================

7.1 Requirement 7.1: Processes and mechanisms for restricting access to 
    cardholder data are defined and understood.
Status: COMPLIANT
Evidence: Access control policy documented, role-based access control (RBAC) 
         implemented.

7.2 Requirement 7.2: Access to system components and cardholder data is 
    restricted.
Status: COMPLIANT
Evidence: Least privilege principle enforced, access reviews quarterly, 
         separation of duties implemented.

7.3 Requirement 7.3: Access is assigned and managed via an access control system.
Status: COMPLIANT
Evidence: Centralized identity management, automated provisioning/deprovisioning, 
         access requests require approval.

================================================================================
8. REQUIREMENT 8: IDENTIFY USERS AND AUTHENTICATE ACCESS TO SYSTEM COMPONENTS
================================================================================

8.1 Requirement 8.1: Processes and mechanisms for identifying users and 
    authenticating access are defined and understood.
Status: COMPLIANT
Evidence: Authentication policy documented, user identification procedures 
         defined.

8.2 Requirement 8.2: User identification and authentication are managed.
Status: COMPLIANT
Evidence: Unique user IDs assigned, shared accounts prohibited, MFA implemented 
         for remote access.

8.3 Requirement 8.3: Strong authentication is implemented for all access.
Status: COMPLIANT
Evidence: MFA required for all administrative access, password complexity 
         enforced, account lockout configured.

8.4 Requirement 8.4: Multi-factor authentication (MFA) is implemented.
Status: COMPLIANT
Evidence: MFA mandatory for remote access, hardware tokens issued, MFA for 
         payment system access.

================================================================================
9. REQUIREMENT 9: RESTRICT PHYSICAL ACCESS TO CARDHOLDER DATA
================================================================================

9.1 Requirement 9.1: Processes and mechanisms for restricting physical access 
    are defined and understood.
Status: COMPLIANT
Evidence: Physical security policy documented, access control procedures 
         defined.

9.2 Requirement 9.2: Physical access to system components is restricted.
Status: COMPLIANT
Evidence: Data center access restricted, badge readers implemented, visitor 
         logs maintained.

9.3 Requirement 9.3: Physical access is managed and monitored.
Status: COMPLIANT
Evidence: CCTV surveillance, access logs reviewed, visitor escort procedures 
         in place.

================================================================================
10. REQUIREMENT 10: LOG AND MONITOR ALL ACCESS TO SYSTEM COMPONENTS AND 
    CARDHOLDER DATA
================================================================================

10.1 Requirement 10.1: Processes and mechanisms for logging and monitoring are 
     defined and understood.
Status: COMPLIANT
Evidence: Logging policy documented, monitoring procedures defined.

10.2 Requirement 10.2: Audit logs are implemented to support the detection of 
     anomalies and suspicious activity.
Status: COMPLIANT
Evidence: Comprehensive logging implemented, log retention 1 year minimum, 
          centralized log management.

10.3 Requirement 10.3: Audit logs are protected from destruction and 
     modification.
Status: COMPLIANT
Evidence: Logs stored in immutable format, write-once storage, access 
          restricted to security team.

10.4 Requirement 10.4: Audit logs are reviewed to identify anomalies and 
     suspicious activity.
Status: COMPLIANT
Evidence: Daily log reviews, automated alerting, security information and event 
          management (SIEM) deployed.

================================================================================
11. REQUIREMENT 11: TEST SECURITY OF SYSTEMS AND NETWORKS REGULARLY
================================================================================

11.1 Requirement 11.1: Processes and mechanisms for testing security are defined 
     and understood.
Status: COMPLIANT
Evidence: Testing policy documented, vulnerability assessment procedures defined.

11.2 Requirement 11.2: Wireless access points are identified and managed.
Status: COMPLIANT
Evidence: Wireless inventory maintained, unauthorized access points prohibited, 
          wireless networks isolated from CDE.

11.3 Requirement 11.3: Security vulnerabilities are identified and addressed.
Status: COMPLIANT
Evidence: Vulnerability scanning quarterly, penetration testing annually, 
          external ASV scanning.

11.4 Requirement 11.4: Network intrusions and unexpected file changes are 
     detected and responded to.
Status: COMPLIANT
Evidence: Intrusion detection system (IDS) deployed, file integrity monitoring 
          (FIM) implemented, change detection alerts configured.

11.5 Requirement 11.5: Penetration testing is performed.
Status: COMPLIANT
Evidence: Annual penetration testing conducted, external and internal testing 
          performed, remediation verified.

================================================================================
12. REQUIREMENT 12: SUPPORT INFORMATION SECURITY WITH ORGANIZATIONAL POLICIES 
    AND PROGRAMS
================================================================================

12.1 Requirement 12.1: Processes and mechanisms for supporting information 
     security are defined and understood.
Status: COMPLIANT
Evidence: Information security policy documented, security program established.

12.2 Requirement 12.2: Risk to the cardholder data environment is managed.
Status: COMPLIANT
Evidence: Risk assessment conducted annually, risk register maintained, risk 
          treatment plans documented.

12.3 Requirement 12.3: A security awareness program is implemented.
Status: COMPLIANT
Evidence: Security training mandatory, phishing simulations conducted, security 
          awareness materials distributed.

12.4 Requirement 12.4: Third-party service providers are managed.
Status: COMPLIANT
Evidence: Vendor management program in place, contracts include PCI-DSS 
          requirements, vendor assessments conducted.

12.5 Requirement 12.5: Incident response and business continuity procedures are 
     established.
Status: COMPLIANT
Evidence: Incident response plan documented, business continuity plan tested, 
          communication procedures defined.

================================================================================
GAP ANALYSIS SUMMARY
================================================================================

Total Requirements Assessed: 360
Fully Compliant: 295 (82%)
Partially Compliant: 50 (14%)
Non-Compliant: 15 (4%)

Critical Gaps (Must Remediate):
1. Network access controls for legacy systems (Requirement 1.3)
2. Security code review for legacy applications (Requirement 6.2)

High Priority Gaps:
1. Patch management cycle (Requirement 2.3)
2. CI/CD security scanning integration (Requirement 6.2)

Remediation Timeline:
- Q1 2025: Address critical gaps
- Q2 2025: Address high priority gaps
- Q3 2025: Achieve 95%+ compliance
- Q4 2025: Maintain compliance, prepare for annual assessment

================================================================================
RECOMMENDATIONS
================================================================================

1. Accelerate network segmentation project for legacy systems
2. Implement automated security scanning in development pipeline
3. Reduce patch management cycle from 30 to 14 days
4. Enhance code review process with security focus
5. Conduct quarterly gap assessments to track progress

================================================================================
APPROVAL
================================================================================

Prepared by: PCI-DSS Assessment Team
Reviewed by: Chief Information Security Officer
Approved by: Chief Risk Officer

Date: January 20, 2025
Report Version: 1.0
Classification: CONFIDENTIAL

================================================================================
END OF REPORT
================================================================================
"""
    
    if HAS_PDF:
        # Create PDF using PyMuPDF
        doc = fitz.open()
        page = doc.new_page()
        
        # Add content in chunks to reach ~3.5 MB
        text_to_add = content
        for i in range(6):  # Repeat content to reach target size
            if i > 0:
                text_to_add += f"\n\n--- Section {i+1} ---\n\n"
                text_to_add += content.replace("January 2025", f"January 2025 - Section {i+1}")
            
            # Insert text
            page.insert_text((50, 50 + i * 700), text_to_add[:6000], fontsize=10)
            
            # Add new page if needed
            if i % 2 == 1:
                page = doc.new_page()
        
        # Add more content to reach target size
        additional_content = "\n" * 800 + "Detailed technical specifications and control implementation evidence follow..." * 80
        page.insert_text((50, 50), additional_content, fontsize=9)
        
        doc.save(file_path)
        doc.close()
        print(f"✅ Generated {file_path.name} ({file_path.stat().st_size / 1024 / 1024:.2f} MB)")
    else:
        # Create text version
        text_file = policies_dir / "PCI_DSS_Gap_Analysis_Report.txt"
        with open(text_file, 'w', encoding='utf-8') as f:
            # Repeat content to reach ~3.5 MB
            for i in range(15):
                f.write(content)
                if i < 14:
                    f.write(f"\n\n--- Section {i+2} ---\n\n")
        print(f"✅ Generated {text_file.name} (text version, {text_file.stat().st_size / 1024 / 1024:.2f} MB)")
        print(f"   Note: Install PyMuPDF to generate actual PDF file")


def main():
    print("🚀 Generating realistic sample files for landing page...\n")
    
    print("📝 Generating log files...")
    generate_swift_transaction_log()
    generate_firewall_traffic_log()
    generate_aws_cloudtrail_log()
    
    print("\n📄 Generating document files...")
    generate_nist_compliance_audit_pdf()
    generate_user_access_review_policy()
    generate_pci_dss_gap_analysis_pdf()
    
    print("\n✅ All sample files generated successfully!")
    print("\n📌 Files are available in:")
    print("   - data/sample_logs/ (for log files)")
    print("   - data/sample_policies/ (for document files)")
    print("\n💡 These files can now be used for demo purposes on the landing page.")


if __name__ == "__main__":
    main()
