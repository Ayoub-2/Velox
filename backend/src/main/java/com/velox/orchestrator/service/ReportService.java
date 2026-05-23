package com.velox.orchestrator.service;

import com.velox.orchestrator.model.Finding;
import com.velox.orchestrator.model.Scan;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {
    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generateExcelReport(Scan scan) throws IOException {
        logger.info("Generating Excel report for scan ID: {}", scan.getId());

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            // Create fonts & styles
            XSSFFont headerFont = workbook.createFont();
            headerFont.setColor(new XSSFColor(java.awt.Color.WHITE, null));
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);

            XSSFCellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new XSSFColor(new java.awt.Color(79, 129, 189), null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setWrapText(true);
            applyThinBorders(headerStyle);

            XSSFCellStyle leftAlignStyle = workbook.createCellStyle();
            leftAlignStyle.setAlignment(HorizontalAlignment.LEFT);
            leftAlignStyle.setVerticalAlignment(VerticalAlignment.TOP);
            leftAlignStyle.setWrapText(true);
            applyThinBorders(leftAlignStyle);

            // --- Sheet 1: Summary ---
            XSSFSheet summarySheet = workbook.createSheet("Summary");
            summarySheet.setColumnWidth(0, 25 * 256);
            summarySheet.setColumnWidth(1, 60 * 256);

            // Headers
            XSSFRow summaryHeader = summarySheet.createRow(0);
            XSSFCell h1 = summaryHeader.createCell(0);
            h1.setCellValue("Metric");
            h1.setCellStyle(headerStyle);

            XSSFCell h2 = summaryHeader.createCell(1);
            h2.setCellValue("Value");
            h2.setCellStyle(headerStyle);

            String targetUrl = scan.getTarget() != null ? scan.getTarget().getUrl() : "Unknown";
            String scanDate = scan.getCreatedAt() != null ? scan.getCreatedAt().format(DATE_FORMATTER) : "-";
            String scanType = scan.getScanType() != null ? scan.getScanType() : "Unknown";
            int criticalCount = scan.getCriticalCount() != null ? scan.getCriticalCount() : 0;
            int highCount = scan.getHighCount() != null ? scan.getHighCount() : 0;
            int totalFindings = scan.getFindings() != null ? scan.getFindings().size() : 0;

            String[][] summaryData = {
                    {"Target URL", targetUrl},
                    {"Scan Date", scanDate},
                    {"Scan Type", scanType},
                    {"Critical Findings", String.valueOf(criticalCount)},
                    {"High Findings", String.valueOf(highCount)},
                    {"Total Findings", String.valueOf(totalFindings)}
            };

            for (int i = 0; i < summaryData.length; i++) {
                XSSFRow row = summarySheet.createRow(i + 1);
                XSSFCell cellMetric = row.createCell(0);
                cellMetric.setCellValue(summaryData[i][0]);
                cellMetric.setCellStyle(leftAlignStyle);

                XSSFCell cellValue = row.createCell(1);
                cellValue.setCellValue(summaryData[i][1]);
                cellValue.setCellStyle(leftAlignStyle);
            }

            // --- Sheet 2: Findings ---
            XSSFSheet findingsSheet = workbook.createSheet("Findings");
            findingsSheet.setColumnWidth(0, 15 * 256); // Severity
            findingsSheet.setColumnWidth(1, 40 * 256); // Title
            findingsSheet.setColumnWidth(2, 40 * 256); // Location
            findingsSheet.setColumnWidth(3, 80 * 256); // Description
            findingsSheet.setColumnWidth(4, 15 * 256); // Tool

            XSSFRow findingsHeader = findingsSheet.createRow(0);
            String[] headers = {"Severity", "Title", "Location", "Description", "Tool"};
            for (int i = 0; i < headers.length; i++) {
                XSSFCell cell = findingsHeader.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<Finding> findings = scan.getFindings();
            if (findings != null) {
                int rowIndex = 1;
                for (Finding f : findings) {
                    XSSFRow row = findingsSheet.createRow(rowIndex++);

                    XSSFCell cellSev = row.createCell(0);
                    String sev = f.getSeverity() != null ? f.getSeverity().toUpperCase() : "INFO";
                    cellSev.setCellValue(sev);
                    applySeverityStyle(workbook, cellSev, sev, leftAlignStyle);

                    XSSFCell cellTitle = row.createCell(1);
                    cellTitle.setCellValue(f.getTitle() != null ? f.getTitle() : "Untitled");
                    cellTitle.setCellStyle(leftAlignStyle);

                    XSSFCell cellLoc = row.createCell(2);
                    cellLoc.setCellValue(f.getLocation() != null ? f.getLocation() : "-");
                    cellLoc.setCellStyle(leftAlignStyle);

                    XSSFCell cellDesc = row.createCell(3);
                    cellDesc.setCellValue(f.getDescription() != null ? f.getDescription() : "");
                    cellDesc.setCellStyle(leftAlignStyle);

                    XSSFCell cellTool = row.createCell(4);
                    cellTool.setCellValue(f.getTool() != null ? f.getTool() : "Unknown");
                    cellTool.setCellStyle(leftAlignStyle);
                }
            }

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();
        }
    }

    private void applyThinBorders(XSSFCellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        
        style.setTopBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_40_PERCENT.getIndex());
    }

    private void applySeverityStyle(XSSFWorkbook workbook, XSSFCell cell, String severity, XSSFCellStyle baseStyle) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.cloneStyleFrom(baseStyle);

        java.awt.Color color;
        switch (severity.toLowerCase()) {
            case "critical":
                color = new java.awt.Color(255, 199, 206); // Light Red
                break;
            case "high":
                color = new java.awt.Color(255, 235, 156); // Light Orange/Yellow
                break;
            case "medium":
                color = new java.awt.Color(255, 242, 204); // Light Yellow
                break;
            case "low":
                color = new java.awt.Color(226, 239, 218); // Light Green
                break;
            default:
                color = new java.awt.Color(242, 242, 242); // Gray
                break;
        }

        style.setFillForegroundColor(new XSSFColor(color, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFFont font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        cell.setCellStyle(style);
    }
}
