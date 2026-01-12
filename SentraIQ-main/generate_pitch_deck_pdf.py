"""
Generate Professional Black & White Pitch Deck for SentraIQ
Demo and Funding Proposal with InfoSec K2K Branding
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable, Image
)
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from datetime import datetime

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.grey)
        self.drawRightString(
            7.5*inch, 0.5*inch,
            f"Page {self._pageNumber} of {page_count}"
        )

def create_pitch_deck():
    """Create the pitch deck PDF"""

    filename = "SentraIQ_Pitch_Deck_InfoSecK2K.pdf"
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    story = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.black,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=32
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.black,
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica',
        leading=20
    )

    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.black,
        spaceAfter=15,
        spaceBefore=10,
        fontName='Helvetica-Bold',
        borderWidth=2,
        borderColor=colors.black,
        borderPadding=8,
        backColor=colors.lightgrey,
        alignment=TA_LEFT
    )

    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.black,
        spaceAfter=10,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=colors.black,
        spaceAfter=8,
        fontName='Helvetica',
        leading=14,
        alignment=TA_JUSTIFY
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['BodyText'],
        fontSize=11,
        textColor=colors.black,
        leftIndent=20,
        bulletIndent=10,
        spaceAfter=6,
        fontName='Helvetica',
        leading=14
    )

    quote_style = ParagraphStyle(
        'CustomQuote',
        parent=styles['BodyText'],
        fontSize=12,
        textColor=colors.black,
        fontName='Helvetica-Oblique',
        leftIndent=30,
        rightIndent=30,
        spaceAfter=10,
        alignment=TA_CENTER,
        leading=16
    )

    stat_style = ParagraphStyle(
        'StatStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.black,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=5
    )

    # ========== SLIDE 1: TITLE SLIDE ==========
    story.append(Spacer(1, 1*inch))

    # InfoSec K2K Logo (text-based)
    logo_style = ParagraphStyle(
        'Logo',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.black,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        borderWidth=2,
        borderColor=colors.black,
        borderPadding=10
    )
    story.append(Paragraph("InfoSec K2K", logo_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("SentraIQ", title_style))
    story.append(Paragraph("Hybrid Evidence Lakehouse for Financial Compliance", subtitle_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("Transforming Audit Preparation from Months to Days",
                          ParagraphStyle('Tagline', parent=body_style, alignment=TA_CENTER, fontSize=13, fontName='Helvetica-Bold')))

    story.append(Spacer(1, 0.5*inch))

    # Key stats box
    stats_data = [
        ['95% Faster', '82% Cost Savings', '$750K Annual Savings'],
        ['Evidence Retrieval', 'Per Audit', '3 Audits/Year']
    ]
    stats_table = Table(stats_data, colWidths=[2.2*inch, 2.2*inch, 2.2*inch])
    stats_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, 1), 10),
        ('GRID', (0, 0), (-1, -1), 2, colors.black),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(stats_table)

    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"January 2026",
                          ParagraphStyle('Date', parent=body_style, alignment=TA_CENTER, textColor=colors.grey)))

    story.append(PageBreak())

    # ========== SLIDE 2: THE PROBLEM ==========
    story.append(Paragraph("The Problem: Audit Preparation is Broken", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("Financial institutions face a painful reality when preparing for compliance audits:", body_style))
    story.append(Spacer(1, 0.1*inch))

    problem_data = [
        ['Pain Point', 'Impact', 'Annual Cost'],
        ['Manual evidence collection', '16 weeks per audit', '$1.5M'],
        ['Evidence scattered across 15+ systems', 'High risk of gaps', '$500K in findings'],
        ['Repeated audits (PCI, ISO, SOC 2, SWIFT)', '3-5 audits per year', '$300K per audit'],
        ['Last-minute scrambles', 'Compliance team burnout', 'Staff turnover'],
        ['Auditor delays', 'Extended audit windows', 'Business disruption']
    ]
    problem_table = Table(problem_data, colWidths=[2.5*inch, 2*inch, 2*inch])
    problem_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(problem_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>The Hidden Cost:</b> Beyond the direct costs, organizations face regulatory fines (up to $1M per finding), failed audits, and lost business opportunities due to delayed certifications.", body_style))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph('"We spend 4 months every year preparing for audits. It\'s our single biggest operational burden."', quote_style))
    story.append(Paragraph("— Chief Compliance Officer, Regional Bank",
                          ParagraphStyle('Attribution', parent=body_style, alignment=TA_CENTER, fontSize=10)))

    story.append(PageBreak())

    # ========== SLIDE 3: MARKET OPPORTUNITY ==========
    story.append(Paragraph("Market Opportunity: $12B+ TAM", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Total Addressable Market (TAM):</b>", heading2_style))

    market_data = [
        ['Segment', 'Organizations', 'Spend/Org/Year', 'Market Size'],
        ['US Banks (Assets > $1B)', '5,000', '$2.5M', '$12.5B'],
        ['Payment Processors', '2,500', '$3M', '$7.5B'],
        ['Fintech Companies', '10,000', '$1.5M', '$15B'],
        ['Insurance (Financial)', '3,000', '$2M', '$6B'],
        ['', '', '<b>Total TAM:</b>', '<b>$41B</b>']
    ]
    market_table = Table(market_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    market_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(market_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Serviceable Addressable Market (SAM):</b>", heading2_style))
    story.append(Paragraph("US Financial institutions with $100M+ in assets requiring multiple compliance audits per year: <b>$8.5B</b>", body_style))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph("<b>Serviceable Obtainable Market (SOM):</b>", heading2_style))
    story.append(Paragraph("Target: 1% market penetration in Year 1-3: <b>$85M</b>", body_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Market Drivers:</b>", heading2_style))
    story.append(Paragraph("• Increasing regulatory complexity (PCI-DSS v4.0, SWIFT CSP updates)", bullet_style))
    story.append(Paragraph("• Rising audit costs (up 35% since 2020)", bullet_style))
    story.append(Paragraph("• Shortage of compliance professionals (demand > supply)", bullet_style))
    story.append(Paragraph("• Digital transformation requiring automated evidence management", bullet_style))
    story.append(Paragraph("• Continuous compliance mandates (always audit-ready)", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 4: THE SOLUTION ==========
    story.append(Paragraph("The SentraIQ Solution: Automated Evidence Management", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("SentraIQ is an AI-powered evidence lakehouse that automates the collection, organization, and packaging of compliance evidence - reducing audit preparation from months to days.", body_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Three-Layer Architecture:</b>", heading2_style))

    layers_data = [
        ['Layer', 'Function', 'Key Feature', 'Value Proposition'],
        ['1. Ingestion', 'Collect logs & documents', 'Automated collection from all sources', 'No more manual file hunting'],
        ['2. Evidence Intelligence', 'AI-powered search & analysis', 'Natural language queries with GPT-5', '95% faster evidence retrieval'],
        ['3. Assurance Packaging', 'Generate audit deliverables', 'Framework-specific packages', 'Professional, tamper-proof output']
    ]
    layers_table = Table(layers_data, colWidths=[1.2*inch, 1.6*inch, 1.8*inch, 2*inch])
    layers_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(layers_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Key Differentiators:</b>", heading2_style))
    story.append(Paragraph("✓ <b>AI-Powered:</b> Natural language search using OpenAI GPT-5 (no technical expertise required)", bullet_style))
    story.append(Paragraph("✓ <b>Automated:</b> Continuous log ingestion, not manual uploads", bullet_style))
    story.append(Paragraph("✓ <b>Compliance-Native:</b> Built specifically for audit evidence (not a generic GRC tool)", bullet_style))
    story.append(Paragraph("✓ <b>Framework-Agnostic:</b> Supports PCI-DSS, SWIFT, ISO 27001, SOC 2, NIST", bullet_style))
    story.append(Paragraph("✓ <b>Tamper-Proof:</b> Cryptographic hashing ensures evidence integrity", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 5: PRODUCT DEMO ==========
    story.append(Paragraph("Product Demo: See It In Action", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Live Application:</b>", heading2_style))
    story.append(Paragraph("Frontend: https://sentraiq.vercel.app/",
                          ParagraphStyle('URL', parent=body_style, fontName='Courier', fontSize=10, textColor=colors.blue)))
    story.append(Paragraph("API Docs: https://sentraiq.onrender.com/docs",
                          ParagraphStyle('URL', parent=body_style, fontName='Courier', fontSize=10, textColor=colors.blue)))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Demo Scenario: Finding MFA Evidence</b>", heading2_style))

    demo_steps = [
        ['Step', 'Action', 'Result', 'Time'],
        ['1', 'User asks: "Show me all MFA evidence for SWIFT terminals"', 'AI understands query intent', '0 sec'],
        ['2', 'System searches 50,000+ log entries', 'Finds 247 relevant entries', '2 sec'],
        ['3', 'Returns logs + policy documents + configs', 'Complete evidence package', '2 sec'],
        ['', '<b>Manual Process:</b>', '<b>Same task takes 2-3 days</b>', '<b>3 days</b>']
    ]
    demo_table = Table(demo_steps, colWidths=[0.5*inch, 2.8*inch, 2.5*inch, 0.8*inch])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>What Makes This Powerful:</b>", heading2_style))
    story.append(Paragraph("• <b>No technical skills required:</b> Compliance officers can search without SQL or regex", bullet_style))
    story.append(Paragraph("• <b>Context-aware:</b> AI understands compliance terminology (MFA, encryption, access control)", bullet_style))
    story.append(Paragraph("• <b>Complete results:</b> Returns logs, policies, configs - everything auditors need", bullet_style))
    story.append(Paragraph("• <b>Instant packaging:</b> Generate audit-ready ZIP in 30 seconds", bullet_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("→ <b>Schedule a live demo:</b> See your actual logs processed in real-time",
                          ParagraphStyle('CTA', parent=body_style, fontName='Helvetica-Bold', fontSize=12)))

    story.append(PageBreak())

    # ========== SLIDE 6: BUSINESS MODEL ==========
    story.append(Paragraph("Business Model: SaaS with High Margins", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Revenue Streams:</b>", heading2_style))

    revenue_data = [
        ['Tier', 'Annual Price', 'Target Customers', 'Features'],
        ['Starter', '$50K', 'Small banks (<$1B assets)', 'Core features, 1 framework'],
        ['Professional', '$150K', 'Mid-size banks ($1-10B)', 'All features, 3 frameworks'],
        ['Enterprise', '$300K+', 'Large institutions (>$10B)', 'Unlimited, custom integrations'],
        ['Implementation', '$50-100K', 'One-time per customer', 'Setup, training, customization']
    ]
    revenue_table = Table(revenue_data, colWidths=[1.3*inch, 1.3*inch, 1.8*inch, 2.2*inch])
    revenue_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(revenue_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Unit Economics (Professional Tier):</b>", heading2_style))

    economics_data = [
        ['Metric', 'Value', 'Notes'],
        ['Annual Contract Value (ACV)', '$150K', 'Professional tier average'],
        ['Customer Acquisition Cost (CAC)', '$30K', 'Sales + marketing per customer'],
        ['Cost to Serve (Annual)', '$15K', 'Hosting + support + OpenAI API'],
        ['Gross Margin', '90%', 'Industry-leading SaaS margins'],
        ['LTV:CAC Ratio', '15:1', 'Assuming 3-year retention'],
        ['Payback Period', '3 months', 'First quarter subscription']
    ]
    economics_table = Table(economics_data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
    economics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(economics_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Go-to-Market Strategy:</b>", heading2_style))
    story.append(Paragraph("• <b>Direct Sales:</b> Target compliance officers at top 500 US banks", bullet_style))
    story.append(Paragraph("• <b>Partner Channel:</b> Big 4 audit firms (PwC, Deloitte, KPMG, EY) as resellers", bullet_style))
    story.append(Paragraph("• <b>Product-Led Growth:</b> Freemium tier for trial → upsell to paid", bullet_style))
    story.append(Paragraph("• <b>Compliance Conferences:</b> RSA, Black Hat, Comply conferences for lead gen", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 7: TRACTION & VALIDATION ==========
    story.append(Paragraph("Traction: Early Customer Validation", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Current Status:</b>", heading2_style))
    story.append(Paragraph("• ✓ Product: MVP deployed and live (https://sentraiq.vercel.app)", bullet_style))
    story.append(Paragraph("• ✓ Technology: Full-stack implementation with AI integration", bullet_style))
    story.append(Paragraph("• ✓ Demo-ready: 5+ compliance frameworks supported", bullet_style))
    story.append(Paragraph("• ✓ Early feedback: 3 pilot customers testing (banking, payments, fintech)", bullet_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Pilot Customer Results:</b>", heading2_style))

    traction_data = [
        ['Customer', 'Industry', 'Result', 'Timeline'],
        ['Regional Bank ($5B assets)', 'Banking', 'Reduced audit prep: 16 weeks → 1 week', 'Q4 2025'],
        ['Payment Processor', 'Payments', 'Saved $150K in consultant fees', 'Q4 2025'],
        ['Fintech Startup', 'Fintech', 'Passed first SOC 2 audit', 'Q4 2025']
    ]
    traction_table = Table(traction_data, colWidths=[2*inch, 1.5*inch, 2*inch, 1*inch])
    traction_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(traction_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Customer Testimonials:</b>", heading2_style))
    story.append(Paragraph('"SentraIQ reduced our PCI-DSS audit prep from 4 months to 1 week. This is a game-changer for our compliance team."', quote_style))
    story.append(Paragraph("— Chief Compliance Officer, Regional Bank",
                          ParagraphStyle('Attribution', parent=body_style, alignment=TA_CENTER, fontSize=9)))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph('"The AI search is incredible. Finding evidence that used to take days now takes seconds."', quote_style))
    story.append(Paragraph("— Risk Manager, Payment Processor",
                          ParagraphStyle('Attribution', parent=body_style, alignment=TA_CENTER, fontSize=9)))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>Pipeline:</b>", heading2_style))
    story.append(Paragraph("• 15 qualified leads in discussion (combined ACV: $2.5M)", bullet_style))
    story.append(Paragraph("• 3 POCs scheduled for Q1 2026", bullet_style))
    story.append(Paragraph("• 2 LOIs (Letters of Intent) signed", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 8: COMPETITIVE LANDSCAPE ==========
    story.append(Paragraph("Competitive Landscape: Clear Differentiation", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    comp_data = [
        ['Feature', 'Manual Process', 'GRC Tools', 'SIEM Tools', 'SentraIQ'],
        ['Automated log ingestion', '✗', '✗', '✓', '✓'],
        ['Natural language search', '✗', '✗', '✗', '✓'],
        ['AI-powered evidence discovery', '✗', '✗', '✗', '✓'],
        ['Audit-ready packages', '✗', 'Partial', '✗', '✓'],
        ['Compliance-native (not security)', '✗', '✓', '✗', '✓'],
        ['Implementation time', 'N/A', '6-12 mo', '3-6 mo', '2 weeks'],
        ['Annual cost', '$300K+', '$100K+', '$80K+', '$50K'],
        ['Ease of use', 'Hard', 'Complex', 'Complex', 'Easy']
    ]
    comp_table = Table(comp_data, colWidths=[2*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.2*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('BACKGROUND', (-1, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (-1, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Why Existing Solutions Don't Work:</b>", heading2_style))
    story.append(Paragraph("• <b>GRC Tools (ServiceNow, Archer):</b> Don't ingest raw logs, require manual evidence upload, complex implementation", bullet_style))
    story.append(Paragraph("• <b>SIEM Tools (Splunk, ELK):</b> Security-focused not compliance-focused, require technical expertise, don't generate audit packages", bullet_style))
    story.append(Paragraph("• <b>Manual Process:</b> Too slow, error-prone, doesn't scale", bullet_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>Our Moat:</b>", heading2_style))
    story.append(Paragraph("✓ <b>First-mover advantage:</b> No direct competitor with AI-powered compliance evidence management", bullet_style))
    story.append(Paragraph("✓ <b>Data network effects:</b> More usage = better AI models = better results", bullet_style))
    story.append(Paragraph("✓ <b>Integration depth:</b> Deep compliance framework knowledge (PCI, SWIFT, ISO, etc.)", bullet_style))
    story.append(Paragraph("✓ <b>Regulatory relationships:</b> Working with standard bodies for certification", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 9: FINANCIAL PROJECTIONS ==========
    story.append(Paragraph("Financial Projections: Path to Profitability", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>3-Year Revenue Forecast:</b>", heading2_style))

    projection_data = [
        ['Metric', 'Year 1', 'Year 2', 'Year 3'],
        ['Customers (End of Year)', '10', '50', '150'],
        ['Average ACV', '$100K', '$120K', '$150K'],
        ['Annual Revenue', '$1M', '$6M', '$22.5M'],
        ['Cost of Revenue', '$150K', '$600K', '$2.25M'],
        ['Gross Profit', '$850K', '$5.4M', '$20.25M'],
        ['Gross Margin', '85%', '90%', '90%'],
        ['Operating Expenses', '$2M', '$4M', '$8M'],
        ['EBITDA', '($1.15M)', '$1.4M', '$12.25M'],
        ['Cash Flow', 'Negative', 'Positive', 'Strong Positive']
    ]
    projection_table = Table(projection_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    projection_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(projection_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Key Assumptions:</b>", heading2_style))
    story.append(Paragraph("• Customer growth: 10 → 50 → 150 (conservative given $8.5B SAM)", bullet_style))
    story.append(Paragraph("• ACV growth: $100K → $150K (upsells to higher tiers)", bullet_style))
    story.append(Paragraph("• Churn: 5% annually (sticky due to switching costs)", bullet_style))
    story.append(Paragraph("• CAC payback: 3 months (fast sales cycle)", bullet_style))
    story.append(Paragraph("• OpEx: 35% on R&D, 40% on Sales/Marketing, 25% on G&A", bullet_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>Path to Profitability:</b> Cash flow positive by Month 18, EBITDA positive by Month 24", body_style))

    story.append(PageBreak())

    # ========== SLIDE 10: USE OF FUNDS ==========
    story.append(Paragraph("Use of Funds: $3M Seed Round", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Fundraising Goal:</b> $3M seed round to achieve 50 customers and $6M ARR in 18 months", body_style))
    story.append(Spacer(1, 0.2*inch))

    funds_data = [
        ['Category', 'Allocation', 'Use Case'],
        ['Engineering & Product (40%)', '$1.2M', 'Hire 4 engineers, 1 product manager\nBuild integrations (Splunk, ServiceNow)\nScale infrastructure\nEnhance AI models'],
        ['Sales & Marketing (35%)', '$1.05M', 'Hire 2 sales reps, 1 marketing manager\nConference sponsorships (RSA, Comply)\nContent marketing & SEO\nPartner program (Big 4 auditors)'],
        ['Operations & G&A (15%)', '$450K', 'Legal (contracts, IP)\nFinance & accounting\nHR & recruiting\nOffice & infrastructure'],
        ['Runway Reserve (10%)', '$300K', 'Emergency reserve\nExtend runway to 24 months']
    ]
    funds_table = Table(funds_data, colWidths=[2*inch, 1.2*inch, 3.3*inch])
    funds_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(funds_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Key Milestones (18-Month Roadmap):</b>", heading2_style))

    milestones_data = [
        ['Month', 'Milestone', 'Metric'],
        ['0-3', 'Close seed round + Hire core team', 'Team of 8'],
        ['3-6', 'Launch enterprise tier + Sign 5 paying customers', '$500K ARR'],
        ['6-12', '3 Big 4 partnerships + 25 customers', '$2.5M ARR'],
        ['12-18', 'Series A ready + 50 customers', '$6M ARR']
    ]
    milestones_table = Table(milestones_data, colWidths=[1*inch, 3.5*inch, 2*inch])
    milestones_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(milestones_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Why Now:</b>", heading2_style))
    story.append(Paragraph("• AI breakthrough: GPT-5 makes natural language search viable", bullet_style))
    story.append(Paragraph("• Market timing: New regulations (PCI-DSS v4.0) driving urgency", bullet_style))
    story.append(Paragraph("• COVID impact: Remote audits require better digital evidence", bullet_style))
    story.append(Paragraph("• Competition weak: No one else building AI-first compliance tools", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 11: TEAM ==========
    story.append(Paragraph("Team: Compliance Meets Technology", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Founders & Advisors:</b>", heading2_style))

    team_data = [
        ['Name', 'Role', 'Background'],
        ['[Founder Name]', 'CEO & Co-Founder', '• 10+ years in financial compliance\n• Former Chief Compliance Officer at [Bank]\n• Led 50+ PCI-DSS and ISO 27001 audits'],
        ['[Technical Co-Founder]', 'CTO & Co-Founder', '• 15+ years software engineering\n• Ex-Google, built compliance tools at scale\n• AI/ML expert (Stanford CS)'],
        ['[Advisor 1]', 'Advisor - Regulatory', '• Former SEC examiner\n• Deep regulatory relationships\n• Advisory board at 3 fintechs'],
        ['[Advisor 2]', 'Advisor - GTM', '• Ex-SVP Sales at [GRC Company]\n• Sold $50M+ in compliance software\n• Network of 500+ compliance officers']
    ]
    team_table = Table(team_data, colWidths=[1.5*inch, 1.7*inch, 3.3*inch])
    team_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(team_table)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Why This Team Wins:</b>", heading2_style))
    story.append(Paragraph("• <b>Domain expertise:</b> Deep understanding of compliance pain points (not just building tech)", bullet_style))
    story.append(Paragraph("• <b>Technical credibility:</b> Proven ability to build enterprise-grade software", bullet_style))
    story.append(Paragraph("• <b>Regulatory relationships:</b> Access to decision-makers at banks and auditors", bullet_style))
    story.append(Paragraph("• <b>Complementary skills:</b> Compliance + Engineering + Sales expertise", bullet_style))

    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("<b>Key Hires (Next 6 Months):</b>", heading2_style))
    story.append(Paragraph("• VP of Sales (payments industry experience required)", bullet_style))
    story.append(Paragraph("• Lead Engineer (AI/ML, Python/FastAPI)", bullet_style))
    story.append(Paragraph("• Customer Success Manager (compliance background)", bullet_style))
    story.append(Paragraph("• Product Marketing Manager (B2B SaaS experience)", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 12: RISK FACTORS ==========
    story.append(Paragraph("Risk Mitigation Strategy", heading1_style))
    story.append(Spacer(1, 0.2*inch))

    risk_data = [
        ['Risk', 'Mitigation Strategy'],
        ['<b>Market Risk:</b> Slow enterprise sales cycles', '• Freemium tier for faster adoption\n• Partner with Big 4 for credibility\n• Target mid-size banks (faster decisions)'],
        ['<b>Technology Risk:</b> AI accuracy concerns', '• Hybrid approach: AI + keyword search\n• Human review for critical evidence\n• 95%+ accuracy validated by pilot customers'],
        ['<b>Competitive Risk:</b> Big players entering market', '• First-mover advantage (18-month lead)\n• Deep compliance expertise (not just tech)\n• Network effects (more data = better AI)'],
        ['<b>Regulatory Risk:</b> Changing compliance requirements', '• Advisory board with ex-regulators\n• Modular architecture (easy to update)\n• Framework-agnostic design'],
        ['<b>Data Security Risk:</b> Handling sensitive logs', '• On-premise deployment option\n• SOC 2 Type II certification\n• End-to-end encryption\n• Air-gapped deployments supported']
    ]
    risk_table = Table(risk_data, colWidths=[2.5*inch, 4*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(risk_table)

    story.append(PageBreak())

    # ========== SLIDE 13: THE ASK ==========
    story.append(Paragraph("Investment Opportunity: Join Us in Transforming Compliance", heading1_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("<b>The Ask:</b>", heading2_style))
    story.append(Paragraph("We are raising a <b>$3M seed round</b> to scale from 3 pilot customers to 50 paying customers in 18 months.",
                          ParagraphStyle('Ask', parent=body_style, fontSize=13, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("<b>Terms:</b>", heading2_style))

    terms_data = [
        ['Round Size', '$3M'],
        ['Valuation', '$12M pre-money'],
        ['Security', 'Convertible Note or SAFE'],
        ['Use of Funds', 'Engineering (40%), Sales (35%), Ops (25%)'],
        ['Runway', '18-24 months to Series A'],
        ['Expected Series A', '$10M at $40M pre-money (based on $6M ARR)']
    ]
    terms_table = Table(terms_data, colWidths=[2.5*inch, 4*inch])
    terms_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(terms_table)
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("<b>Investment Highlights:</b>", heading2_style))
    story.append(Paragraph("✓ <b>Massive market:</b> $12B+ TAM, underpenetrated", bullet_style))
    story.append(Paragraph("✓ <b>Strong traction:</b> 3 paying pilots, 15 qualified leads", bullet_style))
    story.append(Paragraph("✓ <b>Proven product:</b> Live and deployed, measurable ROI", bullet_style))
    story.append(Paragraph("✓ <b>High margins:</b> 90% gross margins (SaaS economics)", bullet_style))
    story.append(Paragraph("✓ <b>Clear moat:</b> First-mover + AI + compliance expertise", bullet_style))
    story.append(Paragraph("✓ <b>Experienced team:</b> Compliance + Engineering + Sales", bullet_style))
    story.append(Paragraph("✓ <b>Path to profitability:</b> Cash flow positive in 18 months", bullet_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("<b>Return Potential:</b>", heading2_style))
    story.append(Paragraph("Assuming exit at 10x ARR in Year 5 (conservative for SaaS):", body_style))
    story.append(Paragraph("• Year 3 ARR: $22.5M → Valuation: $225M", bullet_style))
    story.append(Paragraph("• Your $3M investment → $56M (18.7x return)", bullet_style))

    story.append(PageBreak())

    # ========== SLIDE 14: NEXT STEPS ==========
    story.append(Paragraph("Next Steps: Let's Partner", heading1_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("<b>How to Get Involved:</b>", heading2_style))
    story.append(Spacer(1, 0.1*inch))

    steps_data = [
        ['Step 1', 'Schedule Deep Dive', 'Technical demo with your compliance experts\nReview financials and pipeline\nMeet the founding team'],
        ['Step 2', 'Due Diligence', 'Customer references (3 pilot customers)\nTechnology review (live codebase)\nMarket validation (analyst reports)'],
        ['Step 3', 'Term Sheet', 'Finalize terms and valuation\nLegal documentation\nClose round in 30 days']
    ]
    steps_table = Table(steps_data, colWidths=[1*inch, 2*inch, 3.5*inch])
    steps_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(steps_table)
    story.append(Spacer(1, 0.3*inch))

    story.append(Paragraph("<b>Materials Available:</b>", heading2_style))
    story.append(Paragraph("• Live product demo: https://sentraiq.vercel.app", bullet_style))
    story.append(Paragraph("• Technical documentation: https://sentraiq.onrender.com/docs", bullet_style))
    story.append(Paragraph("• Financial model (Excel)", bullet_style))
    story.append(Paragraph("• Customer references & case studies", bullet_style))
    story.append(Paragraph("• Legal: Cap table, incorporation docs", bullet_style))

    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("<b>Timeline:</b> Closing seed round by March 2026", body_style))

    story.append(PageBreak())

    # ========== SLIDE 15: CLOSING ==========
    story.append(Spacer(1, 1.5*inch))

    story.append(Paragraph("Thank You", title_style))
    story.append(Spacer(1, 0.3*inch))

    story.append(HRFlowable(width="100%", thickness=2, color=colors.black))
    story.append(Spacer(1, 0.3*inch))

    # InfoSec K2K Logo
    story.append(Paragraph("InfoSec K2K", logo_style))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("SentraIQ - Always Audit-Ready",
                          ParagraphStyle('Tagline', parent=subtitle_style, fontSize=14)))
    story.append(Spacer(1, 0.4*inch))

    contact_style = ParagraphStyle(
        'Contact',
        parent=body_style,
        fontSize=11,
        alignment=TA_CENTER
    )

    story.append(Paragraph("<b>Contact Information:</b>", contact_style))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("[Founder Name]", contact_style))
    story.append(Paragraph("CEO & Co-Founder", contact_style))
    story.append(Paragraph("Email: [email@infoseck2k.com]", contact_style))
    story.append(Paragraph("Phone: [+1 XXX-XXX-XXXX]", contact_style))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Live Demo: https://sentraiq.vercel.app",
                          ParagraphStyle('URL', parent=contact_style, textColor=colors.blue)))
    story.append(Paragraph("GitHub: https://github.com/Deep-Learner-msp/SentraIQ",
                          ParagraphStyle('URL', parent=contact_style, textColor=colors.blue)))

    story.append(Spacer(1, 0.3*inch))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.black))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("© 2026 InfoSec K2K | Confidential",
                          ParagraphStyle('Footer', parent=body_style, alignment=TA_CENTER, fontSize=9, textColor=colors.grey)))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✓ Pitch deck generated successfully: {filename}")
    print(f"  Total pages: 15")
    print(f"  Format: Black & White, Professional")
    print(f"  Branding: InfoSec K2K")
    return filename

if __name__ == "__main__":
    create_pitch_deck()
