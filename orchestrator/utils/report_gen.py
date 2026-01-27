from fpdf import FPDF
from datetime import datetime

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Velox Security Scan Report', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_pdf_report(scan_data, findings):
    pdf = PDFReport()
    pdf.add_page()
    
    # Metadata
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Target: {scan_data.target_url or 'Unknown'}", ln=1)
    pdf.cell(200, 10, txt=f"Date: {scan_data.created_at.strftime('%Y-%m-%d %H:%M')}", ln=1)
    pdf.cell(200, 10, txt=f"Scan Type: {scan_data.scan_type}", ln=1)
    pdf.ln(10)
    
    # Summary
    pdf.set_font("Arial", 'B', size=14)
    pdf.cell(200, 10, txt="Executive Summary", ln=1)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Critical Findings: {scan_data.critical_count}", ln=1)
    pdf.cell(200, 10, txt=f"High Findings: {scan_data.high_count}", ln=1)
    pdf.ln(10)
    
    # Findings Details
    pdf.set_font("Arial", 'B', size=14)
    pdf.cell(200, 10, txt="Detailed Findings", ln=1)
    
    pdf.set_font("Arial", size=10)
    
    if not findings:
        pdf.cell(200, 10, txt="No findings detected.", ln=1)
    
    for f in findings:
        severity = f.severity.upper()
        
        # Color coding title
        if severity == 'CRITICAL':
            pdf.set_text_color(255, 0, 0)
        elif severity == 'HIGH':
            pdf.set_text_color(255, 128, 0)
        else:
            pdf.set_text_color(0, 0, 0)
            
        pdf.set_font("Arial", 'B', size=11)
        pdf.cell(0, 8, txt=f"[{severity}] {f.title}", ln=1)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=10)
        
        description = (f.description or "No description").encode('latin-1', 'replace').decode('latin-1')
        location = f"Location: {f.location}"
        
        pdf.multi_cell(0, 5, txt=location)
        pdf.multi_cell(0, 5, txt=description)
        pdf.ln(5)
        
    return pdf.output()
