import pandas as pd
import io
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def generate_excel_report(scan_data, findings) -> bytes:
    """
    Generates a multi-sheet Excel report for the scan.
    Returns the Excel file as bytes.
    """
    try:
        logger.info(f"Starting Excel generation for target: {getattr(scan_data, 'target_url', 'unknown')}")
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            
            # --- Sheet 1: Summary ---
            summary_data = {
                "Metric": [
                    "Target URL", 
                    "Scan Date", 
                    "Scan Type", 
                    "Critical Findings", 
                    "High Findings",
                    "Total Findings"
                ],
                "Value": [
                    getattr(scan_data, 'target_url', 'Unknown'),
                    getattr(scan_data, 'created_at', datetime.now()).strftime('%Y-%m-%d %H:%M:%S'),
                    getattr(scan_data, 'scan_type', 'Unknown'),
                    getattr(scan_data, 'critical_count', 0),
                    getattr(scan_data, 'high_count', 0),
                    len(findings) if findings else 0
                ]
            }
            df_summary = pd.DataFrame(summary_data)
            df_summary.to_excel(writer, sheet_name='Summary', index=False)
            
            # Adjust column widths for Summary
            worksheet = writer.sheets['Summary']
            worksheet.column_dimensions['A'].width = 20
            worksheet.column_dimensions['B'].width = 50

            # --- Sheet 2: Findings ---
            if findings:
                rows = []
                for f in findings:
                    rows.append({
                        "Severity": str(getattr(f, 'severity', 'info')).upper(),
                        "Title": getattr(f, 'title', 'Untitled'),
                        "Location": getattr(f, 'location', '-'),
                        "Description": getattr(f, 'description', ''),
                        "Tool": getattr(f, 'tool', 'Unknown')
                    })
                df_findings = pd.DataFrame(rows)
            else:
                df_findings = pd.DataFrame(columns=["Severity", "Title", "Location", "Description", "Tool"])
                
            df_findings.to_excel(writer, sheet_name='Findings', index=False)
            
            # Adjust column widths for Findings
            worksheet = writer.sheets['Findings']
            worksheet.column_dimensions['A'].width = 10  # Severity
            worksheet.column_dimensions['B'].width = 40  # Title
            worksheet.column_dimensions['C'].width = 40  # Location
            worksheet.column_dimensions['D'].width = 60  # Description
            worksheet.column_dimensions['E'].width = 15  # Tool

        output.seek(0)
        return output.getvalue()

    except Exception as e:
        logger.error(f"Excel generation failed: {e}", exc_info=True)
        raise e
