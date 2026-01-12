#!/bin/bash

# Generate professional black and white PDF from markdown
# Requires: pandoc, LaTeX (for best quality)

set -e

echo "📄 SentraIQ Business Document → PDF Generator"
echo "=============================================="
echo ""

INPUT_FILE="SENTRAIQ_BUSINESS_OVERVIEW.md"
OUTPUT_FILE="SentraIQ_Business_Overview.pdf"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: $INPUT_FILE not found!"
    exit 1
fi

# Method 1: Try pandoc with LaTeX (best quality)
if command -v pandoc &> /dev/null && command -v pdflatex &> /dev/null; then
    echo "✅ Found pandoc + LaTeX - generating high-quality PDF..."

    pandoc "$INPUT_FILE" \
        -o "$OUTPUT_FILE" \
        --pdf-engine=pdflatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V documentclass=report \
        -V colorlinks=true \
        -V linkcolor=black \
        -V urlcolor=black \
        -V toccolor=black \
        --toc \
        --toc-depth=2 \
        --number-sections \
        --highlight-style=monochrome \
        --metadata title="SentraIQ: AI-Powered Evidence Lakehouse" \
        --metadata subtitle="Business Overview & Market Analysis" \
        --metadata author="InfoSec K2K" \
        --metadata date="$(date '+%B %Y')"

    echo "✅ PDF generated: $OUTPUT_FILE"

# Method 2: Try pandoc without LaTeX (using wkhtmltopdf)
elif command -v pandoc &> /dev/null && command -v wkhtmltopdf &> /dev/null; then
    echo "✅ Found pandoc + wkhtmltopdf - generating PDF..."

    # First convert to HTML
    pandoc "$INPUT_FILE" \
        -o temp_output.html \
        --standalone \
        --toc \
        --toc-depth=2 \
        --css=<(cat <<EOF
body {
    font-family: 'Georgia', serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #000;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}
h1, h2, h3, h4, h5, h6 {
    color: #000;
    font-weight: bold;
    margin-top: 1.5em;
}
h1 { font-size: 24pt; border-bottom: 2px solid #000; }
h2 { font-size: 18pt; border-bottom: 1px solid #000; }
h3 { font-size: 14pt; }
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
}
table th, table td {
    border: 1px solid #000;
    padding: 8px;
    text-align: left;
}
table th {
    background-color: #e0e0e0;
    font-weight: bold;
}
code {
    background-color: #f0f0f0;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
}
pre {
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    padding: 10px;
    overflow-x: auto;
}
a {
    color: #000;
    text-decoration: underline;
}
@media print {
    body { font-size: 10pt; }
    a { color: #000; }
}
EOF
)

    # Then convert HTML to PDF
    wkhtmltopdf \
        --enable-local-file-access \
        --print-media-type \
        --grayscale \
        --margin-top 20mm \
        --margin-bottom 20mm \
        --margin-left 20mm \
        --margin-right 20mm \
        temp_output.html \
        "$OUTPUT_FILE"

    rm temp_output.html
    echo "✅ PDF generated: $OUTPUT_FILE"

# Method 3: macOS TextEdit conversion (fallback)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "⚠️  pandoc not found. Using macOS fallback method..."
    echo "📝 Opening in TextEdit - you'll need to manually export to PDF"
    echo ""
    echo "Steps:"
    echo "1. TextEdit will open with the document"
    echo "2. Go to File → Print"
    echo "3. Click 'PDF' dropdown → 'Save as PDF'"
    echo "4. Save as: $OUTPUT_FILE"
    echo ""
    read -p "Press Enter to open TextEdit..."

    open -a TextEdit "$INPUT_FILE"

else
    echo "❌ Error: No PDF generation tools found!"
    echo ""
    echo "Please install one of these options:"
    echo ""
    echo "Option 1 (Best - Full LaTeX):"
    echo "  brew install pandoc"
    echo "  brew install --cask mactex-no-gui"
    echo ""
    echo "Option 2 (Good - wkhtmltopdf):"
    echo "  brew install pandoc"
    echo "  brew install --cask wkhtmltopdf"
    echo ""
    echo "Option 3 (Quick - Online converter):"
    echo "  Upload $INPUT_FILE to:"
    echo "  - https://www.markdowntopdf.com/"
    echo "  - https://md2pdf.netlify.app/"
    exit 1
fi

# Open the PDF
if [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo "🎉 Success! Opening PDF..."
    open "$OUTPUT_FILE"
fi
