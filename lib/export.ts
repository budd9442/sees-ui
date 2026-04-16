// Export utility functions for SEES application

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface CSVExportOptions extends ExportOptions {
  delimiter?: string;
  encoding?: string;
}

export interface PDFExportOptions extends ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ExcelExportOptions extends ExportOptions {
  sheetName?: string;
  includeCharts?: boolean;
}

// CSV Export Functions
export const csvUtils = {
  /**
   * Convert data array to CSV string
   */
  arrayToCSV: (data: any[], options: CSVExportOptions = {}): string => {
    if (data.length === 0) return '';

    const {
      delimiter = ',',
      includeHeaders = true,
    } = options;

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    if (includeHeaders) {
      csvRows.push(headers.map(header => escapeCSVField(header)).join(delimiter));
    }

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return escapeCSVField(value);
      });
      csvRows.push(values.join(delimiter));
    });

    return csvRows.join('\n');
  },

  /**
   * Download CSV file
   */
  downloadCSV: (data: any[], options: CSVExportOptions = {}): void => {
    const csvContent = csvUtils.arrayToCSV(data, options);
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadFile(csvContent, filename, 'text/csv');
  },

  /**
   * Parse CSV string to array
   */
  parseCSV: (csvString: string, delimiter: string = ','): any[] => {
    const lines = csvString.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(delimiter).map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(value => value.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  },
};

// PDF Export Utility
export const pdfUtils = {
  /**
   * Generate PDF content structure
   */
  generatePDF: (data: any[], options: PDFExportOptions = {}): string => {
    const {
      title = 'Export Report',
      author = 'SEES System',
      subject = 'Data Export',
    } = options;

    // PDF content structure - standardized for library integration (e.g., jsPDF)
    const pdfContent = `
PDF Document
Title: ${title}
Author: ${author}
Subject: ${subject}
Generated: ${new Date().toLocaleString()}

Data:
${JSON.stringify(data, null, 2)}
    `;

    return pdfContent;
  },

  /**
   * Download PDF file
   */
  downloadPDF: (data: any[], options: PDFExportOptions = {}): void => {
    const pdfContent = pdfUtils.generatePDF(data, options);
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.pdf`;
    
    downloadFile(pdfContent, filename, 'application/pdf');
  },
};

// Excel Export Utility
export const excelUtils = {
  /**
   * Generate Excel content structure
   */
  generateExcel: (data: any[], options: ExcelExportOptions = {}): string => {
    const {
      sheetName = 'Sheet1',
    } = options;

    // Excel content structure - standardized for library integration (e.g., SheetJS)
    const excelContent = `
Excel Spreadsheet
Sheet: ${sheetName}
Generated: ${new Date().toLocaleString()}

Data:
${JSON.stringify(data, null, 2)}
    `;

    return excelContent;
  },

  /**
   * Download Excel file
   */
  downloadExcel: (data: any[], options: ExcelExportOptions = {}): void => {
    const excelContent = excelUtils.generateExcel(data, options);
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    downloadFile(excelContent, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  },
};

// JSON Export Functions
export const jsonUtils = {
  /**
   * Download JSON file
   */
  downloadJSON: (data: any[], options: ExportOptions = {}): void => {
    const jsonContent = JSON.stringify(data, null, 2);
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.json`;
    
    downloadFile(jsonContent, filename, 'application/json');
  },

  /**
   * Parse JSON file
   */
  parseJSON: (jsonString: string): any[] => {
    try {
      const data = JSON.parse(jsonString);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },
};

// Generic Export Functions
export const exportUtils = {
  /**
   * Export data in multiple formats
   */
  exportData: (data: any[], format: 'csv' | 'pdf' | 'excel' | 'json', options: ExportOptions = {}): void => {
    switch (format) {
      case 'csv':
        csvUtils.downloadCSV(data, options as CSVExportOptions);
        break;
      case 'pdf':
        pdfUtils.downloadPDF(data, options as PDFExportOptions);
        break;
      case 'excel':
        excelUtils.downloadExcel(data, options as ExcelExportOptions);
        break;
      case 'json':
        jsonUtils.downloadJSON(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  },

  /**
   * Get supported export formats
   */
  getSupportedFormats: (): string[] => {
    return ['csv', 'pdf', 'excel', 'json'];
  },

  /**
   * Get format MIME type
   */
  getMimeType: (format: string): string => {
    const mimeTypes: Record<string, string> = {
      csv: 'text/csv',
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json: 'application/json',
    };
    
    return mimeTypes[format] || 'application/octet-stream';
  },
};

export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';

/**
 * Generates and downloads tabular exports in browser context.
 * Uses real binary generation for PDF (jsPDF) and Excel (exceljs).
 */
export async function exportTabularData(
  data: Record<string, unknown>[],
  format: ExportFormat,
  options: ExportOptions = {}
): Promise<void> {
  const filenameBase = options.filename || `export_${new Date().toISOString().split('T')[0]}`;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data available to export');
  }

  if (format === 'csv') {
    csvUtils.downloadCSV(data, { ...options, filename: `${filenameBase}.csv` });
    return;
  }

  if (format === 'json') {
    jsonUtils.downloadJSON(data, { ...options, filename: `${filenameBase}.json` });
    return;
  }

  if (format === 'excel') {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet((options as ExcelExportOptions).sheetName || 'Sheet1');
    const headers = Object.keys(data[0]);
    sheet.columns = headers.map((h) => ({ header: h, key: h, width: Math.max(14, h.length + 2) }));
    data.forEach((row) => {
      const normalized: Record<string, unknown> = {};
      headers.forEach((h) => {
        const value = row[h];
        normalized[h] = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value;
      });
      sheet.addRow(normalized);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenameBase}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: (options as PDFExportOptions).orientation || 'portrait',
      unit: 'pt',
      format: (options as PDFExportOptions).pageSize?.toLowerCase() || 'a4',
    });
    const title = (options as PDFExportOptions).title || 'Export Report';
    const headers = Object.keys(data[0]);
    let y = 40;
    doc.setFontSize(14);
    doc.text(title, 40, y);
    y += 20;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y);
    y += 18;
    doc.setFontSize(9);
    doc.text(headers.join(' | '), 40, y);
    y += 14;
    for (const row of data) {
      const rowText = headers
        .map((h) => {
          const value = row[h];
          return String(value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value);
        })
        .join(' | ');
      const wrapped = doc.splitTextToSize(rowText, 520);
      if (y + wrapped.length * 11 > 800) {
        doc.addPage();
        y = 40;
      }
      doc.text(wrapped, 40, y);
      y += wrapped.length * 11 + 4;
    }
    doc.save(`${filenameBase}.pdf`);
  }
}

// Helper Functions
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains delimiter, quotes, or newlines, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// File Upload Utilities
export const fileUtils = {
  /**
   * Validate file type
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    if (allowedTypes.includes('*')) return true;
    
    return allowedTypes.some(type => {
      if (type.includes('*')) {
        const extension = type.split('*')[1];
        return file.name.toLowerCase().endsWith(extension.toLowerCase());
      }
      return file.type === type;
    });
  },

  /**
   * Validate file size
   */
  validateFileSize: (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Read file as text
   */
  readFileAsText: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  },

  /**
   * Read file as data URL
   */
  readFileAsDataURL: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  },
};

// Date/Time Utilities
export const dateUtils = {
  /**
   * Format date for display
   */
  formatDate: (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime: (date: Date | string): string => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  },

  /**
   * Check if date is today
   */
  isToday: (date: Date | string): boolean => {
    const today = new Date();
    const target = new Date(date);
    return today.toDateString() === target.toDateString();
  },

  /**
   * Check if date is this week
   */
  isThisWeek: (date: Date | string): boolean => {
    const today = new Date();
    const target = new Date(date);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return target >= weekAgo && target <= today;
  },
};
