from fpdf import FPDF
from datetime import datetime
import re
import os
from fpdf.errors import FPDFException


def _break_long_words(s: str, maxlen: int = 80) -> str:
    """
    Insert invisible break characters into very long uninterrupted strings so FPDF can wrap them.
    Uses zero-width space to avoid visible artifacts.
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
    try:
        pdf = PDFReport()
        # Try to register a unicode-capable TTF font if available
        ttf = _find_system_ttf()
        use_ttf = False
        if ttf:
            try:
                pdf.add_font('Custom', '', ttf, uni=True)
                default_font = 'Custom'
                use_ttf = True
            except Exception:
                default_font = 'Arial'
        else:
            default_font = 'Arial'

        # Ensure automatic page breaks and calculate usable width
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        usable_w = pdf.w - pdf.l_margin - pdf.r_margin

        # Set base font
        pdf.set_font(default_font, size=12)

        # Metadata
        target_text = _break_long_words(str(scan_data.target_url or 'Unknown'), 100)
        date_text = scan_data.created_at.strftime('%Y-%m-%d %H:%M') if getattr(scan_data, 'created_at', None) else ''
        scan_type_text = _break_long_words(str(getattr(scan_data, 'scan_type', '') or ''), 80)

        # helper to write text robustly
        def safe_multi_cell(p, w, h, txt):
            try:
                p.multi_cell(w, h, txt=txt)
                return
            except FPDFException:
                # recursively split text until it fits
                if not txt:
                    return
                if len(txt) == 1:
                    # single character too wide -> replace with placeholder
                    ch = txt
                    if p.get_string_width(ch) > w:
                        p.multi_cell(w, h, txt='?')
                    else:
                        p.multi_cell(w, h, txt=ch)
                    return
                mid = len(txt) // 2
                safe_multi_cell(p, w, h, txt[:mid])
                safe_multi_cell(p, w, h, txt[mid:])

        safe_multi_cell(pdf, usable_w, 6, f"Target: {target_text}")
        safe_multi_cell(pdf, usable_w, 6, f"Date: {date_text}")
        safe_multi_cell(pdf, usable_w, 6, f"Scan Type: {scan_type_text}")
        pdf.ln(6)

        pdf.set_font(default_font, 'B', size=14)
        safe_multi_cell(pdf, usable_w, 8, txt="Executive Summary")
        pdf.set_font(default_font, size=12)
        safe_multi_cell(pdf, usable_w, 6, txt=f"Critical Findings: {getattr(scan_data, 'critical_count', 0)}")
        safe_multi_cell(pdf, usable_w, 6, txt=f"High Findings: {getattr(scan_data, 'high_count', 0)}")
        pdf.ln(8)

        # Findings Details
        pdf.set_font(default_font, 'B', size=14)
        safe_multi_cell(pdf, usable_w, 8, txt="Detailed Findings")
        pdf.set_font(default_font, size=10)
        if not findings:
            pdf.multi_cell(usable_w, 6, txt="No findings detected.")

        for f in findings:
            severity = (getattr(f, 'severity', '') or '').upper()

            # Color coding title
            if severity == 'CRITICAL':
                pdf.set_text_color(255, 0, 0)
            elif severity == 'HIGH':
                pdf.set_text_color(255, 128, 0)
            else:
                pdf.set_text_color(0, 0, 0)

            pdf.set_font(default_font, 'B', size=11)
            title_text = _break_long_words(str(getattr(f, 'title', 'Untitled')), 100)
            safe_multi_cell(pdf, usable_w, 8, txt=f"[{severity}] {title_text}")

            pdf.set_text_color(0, 0, 0)
            pdf.set_font(default_font, size=10)

            raw_desc = str(getattr(f, 'description', 'No description') or 'No description')
            safe_desc = _break_long_words(raw_desc, 80)

            safe_location = _break_long_words(str(getattr(f, 'location', '-') or '-'), 80)
            location = f"Location: {safe_location}"

            indent = 12
            # location as an indented smaller block
            safe_multi_cell(pdf, usable_w - indent, 5, txt=location)

            # description paragraphs
            for paragraph in safe_desc.splitlines() or ['']:
                if paragraph.strip() == '':
                    pdf.ln(2)
                else:
                    safe_multi_cell(pdf, usable_w - indent, 5, txt=paragraph)

            pdf.ln(6)

        # Output PDF bytes in a unicode-safe way
        out = pdf.output(dest='S')
        if isinstance(out, bytes):
            pdf_bytes = out
        else:
            # try utf-8 first, fallback to latin-1
            try:
                pdf_bytes = out.encode('utf-8')
            except Exception:
                pdf_bytes = out.encode('latin-1', 'replace')

        return pdf_bytes
    except Exception as e:
        # On any PDF generation error, return a minimal PDF explaining the failure
        try:
            err_pdf = PDFReport()
            err_pdf.set_auto_page_break(auto=True, margin=15)
            err_pdf.add_page()
            err_pdf.set_font('Arial', size=12)
            err_w = err_pdf.w - err_pdf.l_margin - err_pdf.r_margin
            # Truncate error message to avoid width issues
            err_msg = str(e)[:200]
            err_pdf.multi_cell(err_w, 6, txt="Report generation failed")
            err_pdf.multi_cell(err_w, 6, txt=err_msg)
            out = err_pdf.output(dest='S')
            return out.encode('latin-1', 'replace') if isinstance(out, str) else out
        except Exception:
            raise
    
    # Metadata
    pdf.set_font("Arial", size=12)
    target_text = _break_long_words(str(scan_data.target_url or 'Unknown'), 100)
    date_text = scan_data.created_at.strftime('%Y-%m-%d %H:%M') if getattr(scan_data, 'created_at', None) else ''
    scan_type_text = _break_long_words(str(getattr(scan_data, 'scan_type', '') or ''), 80)

    pdf.multi_cell(usable_w, 6, txt=f"Target: {target_text}")
    pdf.multi_cell(usable_w, 6, txt=f"Date: {date_text}")
    pdf.multi_cell(usable_w, 6, txt=f"Scan Type: {scan_type_text}")
    pdf.ln(10)
    
    # Summary
    pdf.set_font("Arial", 'B', size=14)
    pdf.multi_cell(usable_w, 8, txt="Executive Summary")
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(usable_w, 6, txt=f"Critical Findings: {scan_data.critical_count}")
    pdf.multi_cell(usable_w, 6, txt=f"High Findings: {scan_data.high_count}")
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
        # use multi_cell so long titles wrap within usable width
        pdf.multi_cell(usable_w, 8, txt=f"[{severity}] {title_text}")
        
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
