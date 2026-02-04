from fpdf import FPDF
from datetime import datetime
import re


def _break_long_words(s: str, maxlen: int = 80) -> str:
    """
    Insert spaces into very long uninterrupted strings so FPDF can wrap them.
    """
    if not s:
        return s
    parts = []
    for token in re.split(r"(\s+)", s):
        # keep whitespace tokens as-is
        if token.isspace() or token == '':
            parts.append(token)
            continue
        if len(token) <= maxlen:
            parts.append(token)
        else:
            # break long token into chunks and join with zero-width space
            # so FPDF can wrap without inserting visible spaces at line ends
            chunks = [token[i:i+maxlen] for i in range(0, len(token), maxlen)]
            parts.append('\u200b'.join(chunks))
    return ''.join(parts)

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
        # Break long words before encoding
        safe_desc = _break_long_words(raw_desc, 80)
        description = safe_desc.encode('latin-1', 'replace').decode('latin-1')

        safe_location = _break_long_words(str(f.location or '-'), 80)
        location = f"Location: {safe_location}"

        # Use explicit usable width to avoid FPDF calculating zero-width in edge cases
        usable_w = pdf.w - pdf.l_margin - pdf.r_margin

        pdf.multi_cell(usable_w, 5, txt=location)
        # Split description into paragraphs to avoid extremely long single calls
        for paragraph in description.splitlines() or ['']:
            if paragraph.strip() == '':
                pdf.ln(2)
            else:
                pdf.multi_cell(usable_w, 5, txt=paragraph)
        pdf.ln(5)
        
    return pdf.output()
