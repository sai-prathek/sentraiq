#!/usr/bin/env python3
"""
Script to ingest sample data into SentralQ
"""
import requests
from pathlib import Path

API_BASE = "http://localhost:8000/api/v1"

def ingest_log(file_path, source, description):
    """Ingest a log file"""
    with open(file_path, 'rb') as f:
        files = {'file': (file_path.name, f)}
        data = {
            'source': source,
            'description': description
        }
        response = requests.post(f"{API_BASE}/ingest/log", files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Ingested log: {file_path.name} (ID: {result['id']}, Hash: {result['hash'][:16]}...)")
            print(f"   Auto-mapped to {result.get('auto_mapped_count', 0)} controls")
        else:
            print(f"❌ Failed to ingest {file_path.name}: {response.text}")

def ingest_document(file_path, doc_type, description):
    """Ingest a document file"""
    with open(file_path, 'rb') as f:
        files = {'file': (file_path.name, f)}
        data = {
            'doc_type': doc_type,
            'description': description
        }
        response = requests.post(f"{API_BASE}/ingest/document", files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Ingested document: {file_path.name} (ID: {result['id']}, Hash: {result['hash'][:16]}...)")
            print(f"   Auto-mapped to {result.get('auto_mapped_count', 0)} controls")
        else:
            print(f"❌ Failed to ingest {file_path.name}: {response.text}")

def main():
    print("📊 Ingesting sample data into SentralQ...\n")

    # Ingest logs
    print("📝 Ingesting logs...")
    ingest_log(
        Path("data/sample_logs/swift_access_q3_2025.log"),
        source="SWIFT",
        description="SWIFT access logs Q3 2025 with MFA events"
    )

    ingest_log(
        Path("data/sample_logs/firewall_logs_q3_2025.log"),
        source="Firewall",
        description="Firewall logs Q3 2025 with encryption monitoring"
    )

    print("\n📄 Ingesting documents...")
    ingest_document(
        Path("data/sample_policies/corporate_access_control_policy_v2.txt"),
        doc_type="Policy",
        description="Corporate Access Control Policy - Multi-Factor Authentication requirements"
    )

    print("\n✅ Sample data ingestion complete!")
    print("🌐 Visit http://localhost:8000 to explore the dashboard")

if __name__ == "__main__":
    main()
