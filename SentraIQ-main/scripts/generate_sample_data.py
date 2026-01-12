"""
Generate sample data for SentralQ POC demonstration
"""
import random
from datetime import datetime, timedelta
from pathlib import Path


def generate_sample_logs():
    """Generate sample log files"""
    logs_dir = Path(__file__).parent.parent / "data" / "sample_logs"
    logs_dir.mkdir(parents=True, exist_ok=True)

    # SWIFT Access Logs
    swift_log = logs_dir / "swift_access_q3_2025.log"
    with open(swift_log, 'w') as f:
        f.write("# SWIFT Alliance Access - Q3 2025 Authentication Logs\n")
        f.write("# Generated for SentralQ POC\n\n")

        start_date = datetime(2025, 7, 1)
        for i in range(100):
            timestamp = start_date + timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
            user = f"user{random.randint(1, 20)}"
            terminal = f"SWIFT-{random.randint(1, 5)}"

            # Most entries successful with MFA
            if random.random() > 0.1:
                mfa_status = "SUCCESS"
                auth_result = "GRANTED"
                event_id = "4624"
            else:
                mfa_status = "FAILED"
                auth_result = "DENIED"
                event_id = "4625"

            log_entry = f"""[{timestamp.isoformat()}] Event ID: {event_id} | Source: SWIFT | Terminal: {terminal}
User: {user} | Action: LOGIN | MFA Status: {mfa_status} | Result: {auth_result}
Source IP: 10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}
Two-Factor Authentication: {'VERIFIED' if mfa_status == 'SUCCESS' else 'FAILED'}
Access Control: {auth_result}

"""
            f.write(log_entry)

    # Firewall Logs
    firewall_log = logs_dir / "firewall_logs_q3_2025.log"
    with open(firewall_log, 'w') as f:
        f.write("# Firewall Access Logs - Q3 2025\n")
        f.write("# Payment Gateway Protection\n\n")

        start_date = datetime(2025, 7, 1)
        for i in range(50):
            timestamp = start_date + timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))

            actions = ["ALLOW", "BLOCK", "BLOCK", "ALLOW", "ALLOW"]  # More allows than blocks
            action = random.choice(actions)
            protocol = random.choice(["HTTPS", "TLS1.3", "TLS1.2"])

            log_entry = f"""[{timestamp.isoformat()}] FIREWALL | Action: {action}
Protocol: {protocol} | Port: {random.choice([443, 8443])}
Source: external-{random.randint(1, 100)}
Destination: payment-gateway-{random.randint(1, 3)}
Encryption: {protocol}
Status: {'Encrypted connection established' if action == 'ALLOW' else 'Connection denied - policy violation'}

"""
            f.write(log_entry)

    print(f"✅ Generated sample logs in {logs_dir}")


def generate_sample_policy():
    """Generate a sample security policy document (text file, as PDF creation requires additional libs)"""
    policy_dir = Path(__file__).parent.parent / "data" / "sample_policies"
    policy_dir.mkdir(parents=True, exist_ok=True)

    policy_file = policy_dir / "corporate_access_control_policy_v2.txt"

    policy_content = """
CORPORATE ACCESS CONTROL POLICY
Version 2.0
Effective Date: January 1, 2025

DOCUMENT CLASSIFICATION: INTERNAL - REGULATORY COMPLIANCE

================================================================================
1. OVERVIEW
================================================================================

This Corporate Access Control Policy establishes the security requirements for
access to payment systems, including SWIFT, CHAPS, and FPS terminals.

================================================================================
2. SCOPE
================================================================================

This policy applies to all employees, contractors, and third parties requiring
access to critical payment infrastructure.

================================================================================
3. ACCESS CONTROL REQUIREMENTS
================================================================================

3.1 Multi-Factor Authentication (MFA)

All access to SWIFT terminals and payment gateways MUST enforce Two-Factor
Authentication (2FA) using:
- Something you know (password)
- Something you have (hardware token or mobile authenticator)

Policy Clause 12.1: "Two-Factor Authentication is MANDATORY for all SWIFT
terminal access. No exceptions permitted without C-level authorization."

3.2 Password Requirements

- Minimum 12 characters
- Complexity: uppercase, lowercase, numbers, special characters
- Maximum age: 90 days
- Cannot reuse last 10 passwords

3.3 Account Lockout

- Maximum failed attempts: 3
- Lockout duration: 30 minutes
- Automatic notification to Security Operations Center (SOC)

================================================================================
4. PAYMENT SYSTEM SPECIFIC CONTROLS
================================================================================

4.1 SWIFT Alliance Access

- MFA required for all logins
- Session timeout: 15 minutes of inactivity
- Concurrent session limit: 1 per user
- All actions logged with timestamp and user ID

4.2 CHAPS and FPS Terminals

- Role-based access control (RBAC)
- Principle of least privilege
- Quarterly access reviews

================================================================================
5. ENCRYPTION REQUIREMENTS
================================================================================

5.1 Data in Transit

All payment data transmitted between systems MUST use:
- TLS 1.2 or higher
- Strong cipher suites only
- Certificate-based authentication

5.2 Data at Rest

- AES-256 encryption for stored payment data
- Encrypted backups
- Hardware Security Module (HSM) for key management

================================================================================
6. AUDIT AND LOGGING
================================================================================

6.1 Logging Requirements

All access attempts (successful and failed) MUST be logged with:
- Timestamp
- User ID
- Source IP address
- Action performed
- MFA status
- Result (granted/denied)

6.2 Log Retention

- Minimum retention: 7 years
- Immutable storage
- Regular integrity checks

================================================================================
7. COMPLIANCE AND ENFORCEMENT
================================================================================

This policy supports compliance with:
- SWIFT Customer Security Programme (CSP)
- PCI-DSS Requirements
- Regional banking regulations

Violations of this policy may result in:
- Immediate access revocation
- Disciplinary action up to and including termination
- Regulatory reporting where required

================================================================================
8. POLICY MAINTENANCE
================================================================================

This policy shall be reviewed annually and updated as necessary to reflect:
- Changes in regulatory requirements
- Emerging security threats
- Technology updates

Policy Owner: Chief Information Security Officer (CISO)
Last Review Date: January 1, 2025
Next Review Date: January 1, 2026

================================================================================
APPROVAL
================================================================================

Approved by:
- Chief Information Security Officer
- Chief Risk Officer
- Chief Technology Officer

Date: January 1, 2025
"""

    with open(policy_file, 'w') as f:
        f.write(policy_content)

    print(f"✅ Generated sample policy in {policy_dir}")
    print(f"📝 Note: Convert {policy_file.name} to PDF for document ingestion")


if __name__ == "__main__":
    print("🚀 Generating sample data for SentralQ POC...\n")
    generate_sample_logs()
    generate_sample_policy()
    print("\n✅ Sample data generation complete!")
    print("\n📌 Next steps:")
    print("1. Convert the policy .txt file to PDF (use any word processor)")
    print("2. Use the dashboard to ingest the sample logs and policy")
    print("3. Query evidence using Telescope")
    print("4. Generate an Assurance Pack")
