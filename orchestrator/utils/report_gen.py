from fpdf import FPDF
from datetime import datetime
import re
import os
import logging
from fpdf.errors import FPDFException

logger = logging.getLogger(__name__)




def _find_system_ttf() -> str | None:
    """Look for a suitable TTF font on typical Linux paths and return the path or None."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return None

def _break_long_words(text: str, max_word_length: int = 80) -> str:
    """
    Break long words with hyphens to fit in PDF columns.
    Preserves line breaks and handles sentences.
    """
    if not text:
        return text
    
    lines = []
    for line in text.split('\n'):
        # Split by spaces but preserve the spacing
        words = line.split(' ')
        broken_words = []
        for word in words:
            if len(word) > max_word_length:
                # Insert soft hyphen or break the word
                parts = [word[i:i+max_word_length] for i in range(0, len(word), max_word_length)]
                broken_words.append('-\n'.join(parts))
            else:
                broken_words.append(word)
        lines.append(' '.join(broken_words))
    
    return '\n'.join(lines)

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
        logger.info(f"Starting PDF generation for target: {getattr(scan_data, 'target_url', 'unknown')}")
        logger.info(f"Findings count: {len(findings) if findings else 0}")
        
        pdf = PDFReport()
        # Try to register a unicode-capable TTF font if available
        ttf = _find_system_ttf()
        use_ttf = False
        if ttf:
            try:
                pdf.add_font('Custom', '', ttf, uni=True)
                default_font = 'Custom'
                use_ttf = True
                logger.info(f"Using custom font: {ttf}")
            except Exception as font_err:
                logger.warning(f"Could not load custom font: {font_err}, falling back to Arial")
                default_font = 'Arial'
        else:
            logger.info("No TTF font found, using Arial")
            default_font = 'Arial'

        # Ensure automatic page breaks and calculate usable width
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        usable_w = pdf.w - pdf.l_margin - pdf.r_margin
        logger.info(f"PDF page usable width: {usable_w}")

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
            except FPDFException as e:
                logger.warning(f"FPDF error for text length {len(txt)}: {e}, splitting...")
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
        else:
            logger.info(f"Processing {len(findings)} findings")

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

        # Output PDF bytes
        out = pdf.output(dest='S')
        # In Python 3, FPDF output() with dest='S' returns bytes
        if isinstance(out, bytes):
            logger.info(f"PDF generated successfully, size: {len(out)} bytes")
            return out
        else:
            # Fallback for older FPDF versions that might return str
            logger.warning("FPDF output returned string, encoding to bytes")
            return out.encode('latin-1', 'replace')
            
    except Exception as e:
        logger.error(f"PDF generation failed: {e}", exc_info=True)
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
            result = out.encode('latin-1', 'replace') if isinstance(out, str) else out
            logger.info(f"Error PDF generated, size: {len(result)} bytes")
            return result
        except Exception as err2:
            logger.error(f"Could not even generate error PDF: {err2}")
            raise
