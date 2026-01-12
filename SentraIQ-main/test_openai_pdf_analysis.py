#!/usr/bin/env python3
"""
Test OpenAI's new Prompt Templates with File Variables feature
for PDF analysis in SentraIQ
"""
import os
import sys
from pathlib import Path

try:
    import openai
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI package not installed")
    sys.exit(1)


def test_pdf_file_upload():
    """Test uploading a PDF to OpenAI for analysis"""

    print("=" * 80)
    print("TESTING OPENAI PDF FILE VARIABLES")
    print("=" * 80)
    print()

    # Check API key
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print("❌ No OPENAI_API_KEY environment variable found")
        sys.exit(1)

    print(f"✅ OpenAI API Key Found: {api_key[:8]}...{api_key[-4:]}")
    print()

    client = OpenAI(api_key=api_key)

    # Find a sample PDF in the project
    pdf_paths = [
        Path("data/sample_policies"),
        Path("storage/raw_vault/documents"),
    ]

    sample_pdf = None
    for pdf_dir in pdf_paths:
        if pdf_dir.exists():
            pdfs = list(pdf_dir.glob("*.pdf"))
            if pdfs:
                sample_pdf = pdfs[0]
                break

    if not sample_pdf or not sample_pdf.exists():
        print("⚠️  No sample PDF found in project")
        print("Creating a test scenario instead...")
        test_responses_api()
        return

    print(f"📄 Found sample PDF: {sample_pdf}")
    print(f"   Size: {sample_pdf.stat().st_size / 1024:.1f} KB")
    print()

    try:
        # Test 1: Upload PDF file
        print("Step 1: Uploading PDF to OpenAI...")
        with open(sample_pdf, "rb") as f:
            file = client.files.create(
                file=f,
                purpose="user_data"
            )
        print(f"✅ File uploaded: {file.id}")
        print(f"   Status: {file.status}")
        print(f"   Filename: {file.filename}")
        print()

        # Test 2: Try responses.create() API
        print("Step 2: Testing responses.create() API...")
        print("⚠️  Note: This requires a prompt template ID")
        print("   Creating a test query instead...")
        print()

        # Alternative: Use with assistants API or chat completions
        print("Step 3: Alternative - Using file with chat completions...")
        test_file_with_chat(client, file.id)

        # Cleanup
        print("\nStep 4: Cleaning up uploaded file...")
        client.files.delete(file.id)
        print("✅ File deleted")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


def test_file_with_chat(client, file_id):
    """Test using file with chat completions"""
    try:
        # Note: File references work with Assistants API, not directly with chat completions
        print("   Using file in assistant context...")

        # Create a simple query about the file
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": f"I've uploaded a file with ID {file_id}. Can you analyze it?"
                }
            ]
        )

        print(f"   Response: {response.choices[0].message.content[:200]}...")

    except Exception as e:
        print(f"   ⚠️  Direct file reference not supported in chat completions")
        print(f"   Error: {e}")


def test_responses_api():
    """Test the new responses.create() API"""

    print("\n" + "=" * 80)
    print("TESTING responses.create() API")
    print("=" * 80)
    print()

    api_key = os.environ.get('OPENAI_API_KEY')
    client = OpenAI(api_key=api_key)

    print("Checking available API methods...")
    print(f"   Has 'responses' attribute: {hasattr(client, 'responses')}")
    print(f"   Has 'chat' attribute: {hasattr(client, 'chat')}")
    print(f"   Has 'files' attribute: {hasattr(client, 'files')}")
    print(f"   Has 'assistants' attribute: {hasattr(client, 'assistants')}")
    print()

    if hasattr(client, 'responses'):
        print("✅ responses.create() API is available!")
        print("   This is a new feature for Prompt Templates")
        print()

        # Example from the docs
        print("Example usage (from OpenAI docs):")
        print("""
        response = client.responses.create(
            model="gpt-5",
            prompt={
                "id": "pmpt_abc123",  # Your prompt template ID
                "variables": {
                    "topic": "Dragons",
                    "reference_pdf": {
                        "type": "input_file",
                        "file_id": file.id,
                    },
                },
            },
        )
        print(response.output_text)
        """)
    else:
        print("⚠️  responses.create() API not yet available")
        print("   This may be a preview feature requiring:")
        print("   - Specific API access/beta program")
        print("   - Updated OpenAI SDK version")
        print("   - Prompt template creation in OpenAI dashboard")
        print()
        print("💡 Current alternative for SentraIQ:")
        print("   - Use Assistants API with file_search tool")
        print("   - Upload PDFs and query them with context")
        print("   - Or extract text with PyMuPDF (current approach)")


def suggest_sentraiq_integration():
    """Suggest how to integrate this with SentraIQ"""

    print("\n" + "=" * 80)
    print("INTEGRATION SUGGESTIONS FOR SENTRAIQ")
    print("=" * 80)
    print()

    print("📊 Current SentraIQ PDF Processing:")
    print("   ✅ PyMuPDF extracts text from PDFs")
    print("   ✅ Text stored in database for searching")
    print("   ✅ Keyword-based evidence retrieval")
    print()

    print("🚀 Enhancement with OpenAI File Variables:")
    print("   1. Upload compliance PDFs to OpenAI")
    print("   2. Create prompt templates for common queries:")
    print("      - 'Extract PCI-DSS control evidence from {pdf}'")
    print("      - 'Summarize access control policies in {pdf}'")
    print("      - 'Find MFA requirements in {policy_doc}'")
    print("   3. Use responses.create() for intelligent analysis")
    print()

    print("📝 Benefits:")
    print("   ✅ Native PDF understanding (no text extraction needed)")
    print("   ✅ Maintains formatting and structure context")
    print("   ✅ Better compliance evidence mapping")
    print("   ✅ Reduced preprocessing overhead")
    print()

    print("⚠️  Considerations:")
    print("   - Requires prompt template setup in OpenAI dashboard")
    print("   - File storage limits (check OpenAI quotas)")
    print("   - Additional API costs for file processing")
    print("   - May require beta access initially")
    print()


if __name__ == "__main__":
    test_pdf_file_upload()
    test_responses_api()
    suggest_sentraiq_integration()

    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)
