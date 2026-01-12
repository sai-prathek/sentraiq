#!/usr/bin/env python3
"""
Convert SentraIQ HTML business document to PDF
Supports multiple PDF generation methods
"""

import os
import sys
import subprocess
from pathlib import Path

def check_command(cmd):
    """Check if a command is available"""
    try:
        subprocess.run([cmd, '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def method_weasyprint():
    """Method 1: WeasyPrint (Python library - best quality)"""
    try:
        from weasyprint import HTML

        html_file = 'sentraiq_business_doc.html'
        pdf_file = 'SentraIQ_Business_Overview.pdf'

        print("✅ Using WeasyPrint...")
        print(f"📄 Converting {html_file} → {pdf_file}")

        HTML(html_file).write_pdf(pdf_file)

        print(f"✅ PDF created: {pdf_file}")
        print(f"📊 Size: {os.path.getsize(pdf_file) / 1024:.1f} KB")
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"❌ WeasyPrint error: {e}")
        return False

def method_pdfkit():
    """Method 2: pdfkit (requires wkhtmltopdf)"""
    try:
        import pdfkit

        html_file = 'sentraiq_business_doc.html'
        pdf_file = 'SentraIQ_Business_Overview.pdf'

        print("✅ Using pdfkit + wkhtmltopdf...")
        print(f"📄 Converting {html_file} → {pdf_file}")

        options = {
            'page-size': 'A4',
            'margin-top': '20mm',
            'margin-right': '15mm',
            'margin-bottom': '20mm',
            'margin-left': '15mm',
            'encoding': 'UTF-8',
            'no-outline': None,
            'enable-local-file-access': None,
            'grayscale': None,
            'print-media-type': None
        }

        pdfkit.from_file(html_file, pdf_file, options=options)

        print(f"✅ PDF created: {pdf_file}")
        print(f"📊 Size: {os.path.getsize(pdf_file) / 1024:.1f} KB")
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"❌ pdfkit error: {e}")
        return False

def method_chrome():
    """Method 3: Chrome headless (if Chrome/Chromium is installed)"""
    chrome_paths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        'google-chrome',
        'chromium'
    ]

    chrome_path = None
    for path in chrome_paths:
        if os.path.exists(path) or check_command(path):
            chrome_path = path
            break

    if not chrome_path:
        return False

    try:
        html_file = Path('sentraiq_business_doc.html').absolute()
        pdf_file = Path('SentraIQ_Business_Overview.pdf').absolute()

        print(f"✅ Using Chrome headless...")
        print(f"📄 Converting {html_file} → {pdf_file}")

        cmd = [
            chrome_path,
            '--headless',
            '--disable-gpu',
            '--print-to-pdf=' + str(pdf_file),
            '--print-to-pdf-no-header',
            'file://' + str(html_file)
        ]

        subprocess.run(cmd, check=True, capture_output=True)

        if pdf_file.exists():
            print(f"✅ PDF created: {pdf_file}")
            print(f"📊 Size: {pdf_file.stat().st_size / 1024:.1f} KB")
            return True
        return False
    except Exception as e:
        print(f"❌ Chrome error: {e}")
        return False

def method_browser_manual():
    """Method 4: Open in browser for manual save (fallback)"""
    import webbrowser

    html_file = Path('sentraiq_business_doc.html').absolute()

    print("\n⚠️  Opening in browser for manual conversion...")
    print("\nSteps:")
    print("1. Browser will open with the document")
    print("2. Press Cmd+P (Mac) or Ctrl+P (Windows/Linux)")
    print("3. Choose 'Save as PDF' or 'Microsoft Print to PDF'")
    print("4. Set to 'Black & White' or 'Grayscale'")
    print("5. Save as: SentraIQ_Business_Overview.pdf")

    input("\nPress Enter to open browser...")

    webbrowser.open('file://' + str(html_file))
    return False

def main():
    print("=" * 60)
    print("SentraIQ Business Document → PDF Converter")
    print("=" * 60)
    print()

    # Check if HTML file exists
    if not os.path.exists('sentraiq_business_doc.html'):
        print("❌ Error: sentraiq_business_doc.html not found!")
        print("   Please run this script from /Users/msp.raja/SentraIQ/")
        sys.exit(1)

    # Try methods in order of quality
    methods = [
        ("WeasyPrint", method_weasyprint),
        ("pdfkit", method_pdfkit),
        ("Chrome Headless", method_chrome),
    ]

    for name, method in methods:
        try:
            if method():
                print("\n🎉 Success! PDF generated.")

                # Try to open the PDF
                if os.path.exists('SentraIQ_Business_Overview.pdf'):
                    if sys.platform == 'darwin':  # macOS
                        subprocess.run(['open', 'SentraIQ_Business_Overview.pdf'])
                    elif sys.platform == 'linux':
                        subprocess.run(['xdg-open', 'SentraIQ_Business_Overview.pdf'])
                    elif sys.platform == 'win32':
                        os.startfile('SentraIQ_Business_Overview.pdf')

                return
        except Exception as e:
            print(f"⚠️  {name} failed: {e}")
            continue

    # If all methods failed, try manual browser method
    print("\n" + "=" * 60)
    print("All automatic methods failed. Trying manual browser method...")
    print("=" * 60)
    method_browser_manual()

    print("\n📝 Installation Instructions:")
    print("\nTo install automatic PDF conversion tools:")
    print("\nOption 1 (WeasyPrint - Recommended):")
    print("  pip install weasyprint")
    print("\nOption 2 (pdfkit):")
    print("  pip install pdfkit")
    print("  brew install wkhtmltopdf  # macOS")
    print("\nOption 3 (Chrome):")
    print("  Already have Chrome? Should work automatically.")

if __name__ == '__main__':
    main()
