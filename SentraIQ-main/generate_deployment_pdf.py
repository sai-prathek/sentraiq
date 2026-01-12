"""
Generate Professional Black & White PDF for SentraIQ Deployment Documentation
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable
)
from reportlab.lib import colors
from datetime import datetime

def create_deployment_pdf():
    """Create the deployment documentation PDF"""

    # Create PDF document
    filename = "SentraIQ_Deployment_Documentation.pdf"
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    # Container for the 'Flowable' objects
    story = []

    # Define styles
    styles = getSampleStyleSheet()

    # Custom styles for black and white theme
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.black,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.black,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderWidth=1,
        borderColor=colors.black,
        borderPadding=5,
        backColor=colors.lightgrey
    )

    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.black,
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )

    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.black,
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=6,
        fontName='Helvetica'
    )

    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.black,
        fontName='Courier',
        backColor=colors.lightgrey,
        borderWidth=1,
        borderColor=colors.black,
        borderPadding=8,
        leftIndent=10,
        rightIndent=10
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.black,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=4
    )

    # ========== TITLE PAGE ==========
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("SentraIQ", title_style))
    story.append(Paragraph("Evidence Lakehouse Deployment Documentation",
                          ParagraphStyle('Subtitle', parent=heading2_style, alignment=TA_CENTER)))
    story.append(Spacer(1, 0.5*inch))

    # Version info table
    version_data = [
        ['Version:', '1.0.0'],
        ['Date:', 'January 8, 2026'],
        ['Status:', 'Production Active'],
        ['Environment:', 'Vercel + Render.com']
    ]
    version_table = Table(version_data, colWidths=[2*inch, 3*inch])
    version_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
    ]))
    story.append(version_table)
    story.append(PageBreak())

    # ========== LIVE DEPLOYMENT URLS ==========
    story.append(Paragraph("Live Deployment URLs", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Frontend Application", heading2_style))
    story.append(Paragraph("<b>URL:</b> https://sentraiq.vercel.app/", body_style))
    story.append(Paragraph("• Platform: Vercel (Free Tier)", bullet_style))
    story.append(Paragraph("• Stack: React + TypeScript + Vite", bullet_style))
    story.append(Paragraph("• Status: ✓ Live & Connected", bullet_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Backend API", heading2_style))
    story.append(Paragraph("<b>URL:</b> https://sentraiq.onrender.com", body_style))
    story.append(Paragraph("• Platform: Render.com (Free Tier)", bullet_style))
    story.append(Paragraph("• Stack: FastAPI + Python 3.11", bullet_style))
    story.append(Paragraph("• Status: ✓ Healthy & Responding", bullet_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("API Documentation", heading2_style))
    story.append(Paragraph("<b>URL:</b> https://sentraiq.onrender.com/docs", body_style))
    story.append(Paragraph("Interactive Swagger UI with live API testing and complete endpoint documentation", body_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("GitHub Repository", heading2_style))
    story.append(Paragraph("<b>URL:</b> https://github.com/Deep-Learner-msp/SentraIQ", body_style))
    story.append(Paragraph("Branch: main (auto-deploys to production)", body_style))

    story.append(PageBreak())

    # ========== ARCHITECTURE ==========
    story.append(Paragraph("System Architecture", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Three-Tier Architecture", heading2_style))
    arch_data = [
        ['Component', 'Technology', 'Platform', 'Purpose'],
        ['Frontend', 'React + Vite', 'Vercel', 'User Interface & Dashboard'],
        ['Backend', 'FastAPI + Python', 'Render.com', 'REST API & Business Logic'],
        ['Database', 'PostgreSQL', 'Render.com', 'Data Persistence'],
        ['AI/ML', 'OpenAI GPT-5', 'Cloud API', 'Natural Language Processing']
    ]
    arch_table = Table(arch_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 2*inch])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Data Flow", heading3_style))
    story.append(Paragraph("1. User interacts with React frontend hosted on Vercel", bullet_style))
    story.append(Paragraph("2. Frontend sends HTTPS requests to FastAPI backend on Render", bullet_style))
    story.append(Paragraph("3. Backend processes requests and queries PostgreSQL database", bullet_style))
    story.append(Paragraph("4. For natural language queries, backend calls OpenAI GPT-5 API", bullet_style))
    story.append(Paragraph("5. Results are returned through the stack to the user", bullet_style))

    story.append(PageBreak())

    # ========== TECHNOLOGY STACK ==========
    story.append(Paragraph("Technology Stack", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Backend Technologies", heading2_style))
    backend_data = [
        ['Component', 'Version', 'Purpose'],
        ['FastAPI', '0.109.0', 'Web framework for building REST APIs'],
        ['Python', '3.11', 'Runtime environment'],
        ['SQLAlchemy', '2.0.25', 'ORM and async database operations'],
        ['PostgreSQL', 'Latest', 'Relational database'],
        ['OpenAI SDK', '1.10.0', 'GPT-5 integration for NL parsing'],
        ['PyMuPDF', '1.24.14', 'PDF document processing'],
        ['Uvicorn', '0.27.0', 'ASGI server'],
        ['Pydantic', '2.5.3', 'Data validation and settings']
    ]
    backend_table = Table(backend_data, colWidths=[1.8*inch, 1.2*inch, 3.5*inch])
    backend_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(backend_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Frontend Technologies", heading2_style))
    frontend_data = [
        ['Component', 'Version', 'Purpose'],
        ['React', '18', 'UI component library'],
        ['TypeScript', '5', 'Type-safe JavaScript'],
        ['Vite', '5', 'Build tool and dev server'],
        ['Tailwind CSS', '3', 'Utility-first CSS framework'],
        ['Axios', 'Latest', 'HTTP client for API calls'],
        ['React Router', '6', 'Client-side routing']
    ]
    frontend_table = Table(frontend_data, colWidths=[1.8*inch, 1.2*inch, 3.5*inch])
    frontend_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(frontend_table)

    story.append(PageBreak())

    # ========== API ENDPOINTS ==========
    story.append(Paragraph("API Endpoints", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Base URL: https://sentraiq.onrender.com/api/v1", code_style))
    story.append(Spacer(1, 0.2*inch))

    # Health Check
    story.append(Paragraph("1. Health Check", heading2_style))
    story.append(Paragraph("<font name='Courier'>GET /health</font>", code_style))
    story.append(Paragraph("Returns system health status and version information.", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Dashboard Stats
    story.append(Paragraph("2. Dashboard Statistics", heading2_style))
    story.append(Paragraph("<font name='Courier'>GET /api/v1/dashboard/stats</font>", code_style))
    story.append(Paragraph("Returns aggregate statistics for the dashboard including total logs, documents, evidence objects, and assurance packs.", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Ingest Log
    story.append(Paragraph("3. Ingest Log File", heading2_style))
    story.append(Paragraph("<font name='Courier'>POST /api/v1/ingest/log</font>", code_style))
    story.append(Paragraph("<b>Content-Type:</b> multipart/form-data", body_style))
    story.append(Paragraph("<b>Parameters:</b>", body_style))
    story.append(Paragraph("• file: Log file (required)", bullet_style))
    story.append(Paragraph("• source: SWIFT | ACH | SEPA | CARD (required)", bullet_style))
    story.append(Paragraph("• description: Log description (required)", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # Ingest Document
    story.append(Paragraph("4. Ingest Document", heading2_style))
    story.append(Paragraph("<font name='Courier'>POST /api/v1/ingest/document</font>", code_style))
    story.append(Paragraph("<b>Content-Type:</b> multipart/form-data", body_style))
    story.append(Paragraph("<b>Parameters:</b>", body_style))
    story.append(Paragraph("• file: PDF document (required)", bullet_style))
    story.append(Paragraph("• doc_type: POLICY | PROCEDURE | STANDARD | AUDIT_REPORT (required)", bullet_style))
    story.append(Paragraph("• description: Document description (required)", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # Evidence Telescope
    story.append(Paragraph("5. Evidence Telescope (Natural Language Query)", heading2_style))
    story.append(Paragraph("<font name='Courier'>POST /api/v1/evidence/telescope</font>", code_style))
    story.append(Paragraph("<b>Content-Type:</b> application/json", body_style))
    story.append(Paragraph("Accepts natural language queries and returns relevant evidence objects. Uses OpenAI GPT-5 for query parsing and intent extraction.", body_style))
    story.append(Spacer(1, 0.1*inch))

    # Generate Assurance Pack
    story.append(Paragraph("6. Generate Assurance Pack", heading2_style))
    story.append(Paragraph("<font name='Courier'>POST /api/v1/assurance/generate</font>", code_style))
    story.append(Paragraph("<b>Content-Type:</b> application/json", body_style))
    story.append(Paragraph("Generates tamper-evident assurance pack with evidence for specified compliance controls and date range.", body_style))

    story.append(PageBreak())

    # ========== PROJECT STRUCTURE ==========
    story.append(Paragraph("Project Structure", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<font name='Courier'>SentraIQ/</font>", heading3_style))
    structure_text = """
├── backend/                    Backend FastAPI application
│   ├── main.py                Main application entry point
│   ├── config.py              Configuration & settings management
│   ├── database.py            SQLAlchemy models & DB initialization
│   ├── routers/               API route handlers
│   │   ├── ingestion.py      Layer 1: Data ingestion endpoints
│   │   ├── evidence.py       Layer 2: Evidence extraction
│   │   ├── assurance.py      Layer 3: Assurance pack generation
│   │   ├── dashboard.py      Dashboard statistics API
│   │   └── demo.py           Demo data endpoints
│   └── layers/               Business logic implementation
│       ├── ingest_layer.py   Log/document processing logic
│       ├── evidence_layer.py Evidence object creation
│       ├── assurance_layer.py Assurance pack generation
│       └── telescope.py      OpenAI NL query parsing
│
├── frontend/
│   └── sentraiq-dashboard/   React frontend application
│       ├── src/
│       │   ├── components/   React UI components
│       │   ├── services/     API client (api.ts)
│       │   └── types/        TypeScript type definitions
│       ├── vite.config.js    Vite build configuration
│       └── vercel.json       Vercel deployment config
│
├── data/                      Sample data files
│   ├── logs/                 Sample log files for demo
│   └── documents/            Sample policy documents
│
├── storage/                   Runtime storage directories
│   ├── raw_logs/             Ingested log files
│   ├── raw_documents/        Ingested document files
│   └── assurance_packs/      Generated assurance packs
│
├── requirements.txt           Python dependencies
├── render.yaml               Render.com deployment config
├── .python-version           Python version (3.11.0)
└── DEPLOYMENT.md             This documentation
"""
    story.append(Paragraph(structure_text.replace('\n', '<br/>'),
                          ParagraphStyle('Code', parent=code_style, fontSize=8)))

    story.append(PageBreak())

    # ========== SAMPLE DATA ==========
    story.append(Paragraph("Sample Data & Demo", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Sample Log Files", heading2_style))
    logs_data = [
        ['Filename', 'Description', 'Use Case'],
        ['swift_access_q3_2025.log', 'SWIFT terminal access logs', 'Access control evidence'],
        ['ach_transactions_q3_2025.log', 'ACH payment transaction logs', 'Transaction monitoring'],
        ['firewall_logs_q3_2025.log', 'Network firewall logs', 'Network security evidence']
    ]
    logs_table = Table(logs_data, colWidths=[2.2*inch, 2.3*inch, 2*inch])
    logs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(logs_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Sample Policy Documents", heading2_style))
    docs_data = [
        ['Filename', 'Description', 'Control Mapping'],
        ['mfa_policy.pdf', 'Multi-Factor Authentication Policy', 'AC-001, IA-005'],
        ['encryption_policy.pdf', 'Data Encryption Standards', 'CR-001, SC-013'],
        ['access_control_procedure.pdf', 'Access Control Procedures', 'AC-002, AC-003'],
        ['audit_report_q2_2025.pdf', 'Internal Audit Report', 'AU-001, AU-002']
    ]
    docs_table = Table(docs_data, colWidths=[2.2*inch, 2.3*inch, 2*inch])
    docs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(docs_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Demo Endpoints", heading3_style))
    story.append(Paragraph("<font name='Courier'>GET /api/v1/demo/logs</font> - List available demo log files", body_style))
    story.append(Paragraph("<font name='Courier'>GET /api/v1/demo/documents</font> - List available demo documents", body_style))

    story.append(PageBreak())

    # ========== LOCAL DEVELOPMENT ==========
    story.append(Paragraph("Local Development Setup", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Prerequisites", heading2_style))
    story.append(Paragraph("• Python 3.11", bullet_style))
    story.append(Paragraph("• Node.js 18+", bullet_style))
    story.append(Paragraph("• PostgreSQL (or SQLite for local development)", bullet_style))
    story.append(Paragraph("• OpenAI API Key (optional, for Telescope feature)", bullet_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Backend Setup", heading2_style))
    backend_setup = """git clone https://github.com/Deep-Learner-msp/SentraIQ.git
cd SentraIQ

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=sqlite+aiosqlite:///./sentraiq.db" > .env
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env
echo "ENVIRONMENT=development" >> .env

# Run backend server
uvicorn backend.main:app --reload --port 8000"""
    story.append(Paragraph(backend_setup.replace('\n', '<br/>'), code_style))
    story.append(Paragraph("Backend will be available at: http://localhost:8000", body_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Frontend Setup", heading2_style))
    frontend_setup = """cd frontend/sentraiq-dashboard

# Install dependencies
npm install

# Run development server
npm run dev"""
    story.append(Paragraph(frontend_setup.replace('\n', '<br/>'), code_style))
    story.append(Paragraph("Frontend will be available at: http://localhost:3000", body_style))
    story.append(Paragraph("Vite proxy automatically forwards API requests to http://localhost:8000", body_style))

    story.append(PageBreak())

    # ========== DEPLOYMENT PROCESS ==========
    story.append(Paragraph("Deployment Process", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Continuous Deployment", heading2_style))
    story.append(Paragraph("Both frontend and backend are configured for automatic deployment from the GitHub main branch.", body_style))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("Backend Deployment (Render)", heading3_style))
    story.append(Paragraph("1. Push changes to main branch", bullet_style))
    story.append(Paragraph("2. Render detects changes via GitHub webhook", bullet_style))
    story.append(Paragraph("3. Build command: pip install -r requirements.txt", bullet_style))
    story.append(Paragraph("4. Start command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT", bullet_style))
    story.append(Paragraph("5. Health check on /health endpoint", bullet_style))
    story.append(Paragraph("6. Deploy to: https://sentraiq.onrender.com", bullet_style))
    story.append(Paragraph("<b>Build time:</b> 2-3 minutes", body_style))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("Frontend Deployment (Vercel)", heading3_style))
    story.append(Paragraph("1. Push changes to main branch", bullet_style))
    story.append(Paragraph("2. Vercel detects changes via GitHub webhook", bullet_style))
    story.append(Paragraph("3. Build command: npm install && npm run build", bullet_style))
    story.append(Paragraph("4. Deploy static files from /dist directory", bullet_style))
    story.append(Paragraph("5. Deploy to: https://sentraiq.vercel.app", bullet_style))
    story.append(Paragraph("<b>Build time:</b> 1-2 minutes", body_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Environment Variables", heading2_style))
    env_data = [
        ['Variable', 'Platform', 'Value', 'Required'],
        ['DATABASE_URL', 'Render', 'Auto-configured by Render', 'Yes'],
        ['OPENAI_API_KEY', 'Render', 'User provided', 'Optional'],
        ['ENVIRONMENT', 'Render', 'production', 'Yes'],
        ['VITE_API_URL', 'Vercel', 'https://sentraiq.onrender.com', 'Yes']
    ]
    env_table = Table(env_data, colWidths=[1.8*inch, 1.2*inch, 2*inch, 1.5*inch])
    env_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(env_table)

    story.append(PageBreak())

    # ========== TROUBLESHOOTING ==========
    story.append(Paragraph("Troubleshooting Guide", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    issues_data = [
        ['Issue', 'Symptom', 'Solution'],
        ['Frontend CORS error', 'CORS errors in browser console', 'Verify VITE_API_URL in Vercel. Check CORS config in backend/main.py'],
        ['Backend 500 errors', 'Internal server errors', 'Check Render logs. Verify DATABASE_URL. Validate OPENAI_API_KEY'],
        ['Database connection fail', 'Connection refused errors', 'Verify PostgreSQL service running. Check DATABASE_URL format'],
        ['Slow first request', '30+ second response time', 'Render free tier spins down after 15min inactivity. First request wakes it up'],
        ['Build failures', 'Deployment fails', 'Check requirements.txt syntax. Verify Python version (.python-version file)'],
        ['Missing data', 'Empty dashboard', 'Ingest sample data using /demo endpoints or frontend UI']
    ]
    issues_table = Table(issues_data, colWidths=[1.5*inch, 2*inch, 3*inch])
    issues_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(issues_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Monitoring & Logs", heading2_style))
    story.append(Paragraph("• <b>Backend logs:</b> https://dashboard.render.com/web/sentraiq-backend/logs", body_style))
    story.append(Paragraph("• <b>Frontend logs:</b> https://vercel.com/dashboard/deployments", body_style))
    story.append(Paragraph("• <b>Database metrics:</b> https://dashboard.render.com/d/sentraiq-db", body_style))

    story.append(PageBreak())

    # ========== TESTING ==========
    story.append(Paragraph("Testing & Validation", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("API Testing with cURL", heading2_style))
    curl_tests = """# Health check
curl https://sentraiq.onrender.com/health

# Get dashboard statistics
curl https://sentraiq.onrender.com/api/v1/dashboard/stats

# Upload log file
curl -X POST https://sentraiq.onrender.com/api/v1/ingest/log \\
  -F "file=@swift_logs.log" \\
  -F "source=SWIFT" \\
  -F "description=Test upload"

# Natural language query
curl -X POST https://sentraiq.onrender.com/api/v1/evidence/telescope \\
  -H "Content-Type: application/json" \\
  -d '{"natural_language_query":"Show me all MFA evidence"}'"""
    story.append(Paragraph(curl_tests.replace('\n', '<br/>'), code_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Frontend Testing", heading2_style))
    story.append(Paragraph("1. Visit https://sentraiq.vercel.app/", bullet_style))
    story.append(Paragraph("2. Verify dashboard loads with three-layer visualization", bullet_style))
    story.append(Paragraph("3. Check that statistics are fetched from backend", bullet_style))
    story.append(Paragraph("4. Test Layer 1 (Ingestion) - Upload sample files", bullet_style))
    story.append(Paragraph("5. Test Layer 2 (Evidence) - Use Telescope for NL queries", bullet_style))
    story.append(Paragraph("6. Test Layer 3 (Assurance) - Generate compliance packs", bullet_style))

    story.append(PageBreak())

    # ========== COMPLIANCE CONTROLS ==========
    story.append(Paragraph("Compliance Controls Mapping", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    controls_data = [
        ['Control ID', 'Name', 'Description', 'Keywords'],
        ['AC-001', 'Multi-Factor Authentication', 'Enforce MFA for SWIFT terminal access', 'mfa, two-factor, 2fa, authentication'],
        ['AC-002', 'Access Control', 'Restrict access to authorized personnel', 'access, authorization, permission, denied'],
        ['CR-001', 'Data Encryption', 'Encrypt payment data in transit and at rest', 'encryption, tls, ssl, encrypted, cipher'],
        ['AU-001', 'Audit Logging', 'Maintain comprehensive audit logs', 'audit, log, record, event, activity'],
        ['IA-005', 'Authenticator Management', 'Manage authentication tokens/devices', 'token, authenticator, device, FIPS'],
        ['SC-013', 'Cryptographic Protection', 'Use approved cryptographic mechanisms', 'AES-256, TLS 1.3, cryptographic']
    ]
    controls_table = Table(controls_data, colWidths=[0.9*inch, 1.5*inch, 2.2*inch, 2*inch])
    controls_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(controls_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Supported Frameworks", heading3_style))
    story.append(Paragraph("• PCI-DSS (Payment Card Industry Data Security Standard)", bullet_style))
    story.append(Paragraph("• SWIFT CSP (Customer Security Programme)", bullet_style))
    story.append(Paragraph("• NIST 800-53 (Security and Privacy Controls)", bullet_style))
    story.append(Paragraph("• ISO 27001 (Information Security Management)", bullet_style))
    story.append(Paragraph("• SOC 2 (Service Organization Control)", bullet_style))

    story.append(PageBreak())

    # ========== RESOURCES ==========
    story.append(Paragraph("Resources & Links", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    resources_data = [
        ['Resource', 'URL', 'Description'],
        ['Frontend', 'https://sentraiq.vercel.app/', 'Live application dashboard'],
        ['Backend API', 'https://sentraiq.onrender.com', 'REST API base URL'],
        ['API Docs', 'https://sentraiq.onrender.com/docs', 'Interactive Swagger documentation'],
        ['Health Check', 'https://sentraiq.onrender.com/health', 'System health status'],
        ['GitHub Repo', 'https://github.com/Deep-Learner-msp/SentraIQ', 'Source code repository'],
        ['Render Dashboard', 'https://dashboard.render.com', 'Backend & DB management'],
        ['Vercel Dashboard', 'https://vercel.com/dashboard', 'Frontend deployment management']
    ]
    resources_table = Table(resources_data, colWidths=[1.3*inch, 2.7*inch, 2.5*inch])
    resources_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(resources_table)
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("Support", heading2_style))
    story.append(Paragraph("For issues, feature requests, or questions:", body_style))
    story.append(Paragraph("• Create an issue: https://github.com/Deep-Learner-msp/SentraIQ/issues", bullet_style))
    story.append(Paragraph("• Review documentation: DEPLOYMENT.md in repository", bullet_style))
    story.append(Paragraph("• Check API docs: https://sentraiq.onrender.com/docs", bullet_style))

    story.append(PageBreak())

    # ========== FOOTER PAGE ==========
    story.append(Spacer(1, 2*inch))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.black))
    story.append(Spacer(1, 0.3*inch))

    footer_style = ParagraphStyle('Footer', parent=body_style, alignment=TA_CENTER, fontSize=10)
    story.append(Paragraph("<b>SentraIQ Evidence Lakehouse</b>", footer_style))
    story.append(Paragraph("Hybrid Evidence Lakehouse for Payment Systems", footer_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Version 1.0.0 | January 8, 2026", footer_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Status: ✓ Production Deployment Active", footer_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("© 2026 SentraIQ Project", footer_style))

    # Build PDF
    doc.build(story)
    print(f"✓ PDF generated successfully: {filename}")
    return filename

if __name__ == "__main__":
    create_deployment_pdf()
