from fpdf import FPDF
from datetime import datetime
import re


def _break_long_words(s: str, maxlen: int = 80) -> str:
    """
    Insert spaces into very long uninterrupted strings so FPDF can wrap them.
    """
    if not s:
        return s
    pattern = r"(\S{" + str(maxlen) + r",})"
    return re.sub(pattern, lambda m: ' '.join([m.group(0)[i:i+maxlen] for i in range(0, len(m.group(0)), maxlen)]), s)

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
    target_text = _break_long_words(str(scan_data.target_url or 'Unknown'), 100)
    date_text = scan_data.created_at.strftime('%Y-%m-%d %H:%M') if getattr(scan_data, 'created_at', None) else ''
    scan_type_text = _break_long_words(str(getattr(scan_data, 'scan_type', '') or ''), 80)

    pdf.cell(200, 10, txt=f"Target: {target_text}", ln=1)
    pdf.cell(200, 10, txt=f"Date: {date_text}", ln=1)
    pdf.cell(200, 10, txt=f"Scan Type: {scan_type_text}", ln=1)
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
        severity = (f.severity or '').upper()
        
        # Color coding title
        if severity == 'CRITICAL':
            pdf.set_text_color(255, 0, 0)
        elif severity == 'HIGH':
            pdf.set_text_color(255, 128, 0)
        else:
            pdf.set_text_color(0, 0, 0)
            
        pdf.set_font("Arial", 'B', size=11)
        title_text = _break_long_words(str(f.title or 'Untitled'), 100)
        pdf.cell(0, 8, txt=f"[{severity}] {title_text}", ln=1)
        
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", size=10)
        
        raw_desc = str(f.description or "No description")
        description = _break_long_words(raw_desc, 120).encode('latin-1', 'replace').decode('latin-1')
        location = _break_long_words(str(f.location or '-'), 120)
        location = f"Location: {location}"
        
        pdf.multi_cell(0, 5, txt=location)
        pdf.multi_cell(0, 5, txt=description)
        pdf.ln(5)
        
    return pdf.output()
