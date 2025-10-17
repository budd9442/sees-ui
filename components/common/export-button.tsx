'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function ExportButton({
  onExport,
  disabled = false,
  className = '',
  variant = 'outline',
  size = 'default',
  children,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    if (disabled || isExporting) return;

    setIsExporting(true);
    setExportingFormat(format);

    try {
      await onExport(format);
      toast.success(`Data exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <File className="h-4 w-4" />;
      case 'json':
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF Document';
      case 'excel':
        return 'Excel Spreadsheet';
      case 'csv':
        return 'CSV File';
      case 'json':
        return 'JSON File';
      default:
        return format.toUpperCase();
    }
  };

  const formats: Array<{ key: 'pdf' | 'excel' | 'csv' | 'json'; label: string; icon: React.ReactNode }> = [
    { key: 'pdf', label: 'PDF Document', icon: getFormatIcon('pdf') },
    { key: 'excel', label: 'Excel Spreadsheet', icon: getFormatIcon('excel') },
    { key: 'csv', label: 'CSV File', icon: getFormatIcon('csv') },
    { key: 'json', label: 'JSON File', icon: getFormatIcon('json') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {children || 'Export'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format.key}
            onClick={() => handleExport(format.key)}
            disabled={disabled || isExporting}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {exportingFormat === format.key ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                format.icon
              )}
              <span>{format.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Utility functions for common export operations
export const exportUtils = {
  // Mock PDF export
  exportToPDF: (data: any[], filename: string = 'export.pdf') => {
    return new Promise<void>((resolve) => {
      // In a real application, this would generate an actual PDF
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    });
  },

  // Mock Excel export
  exportToExcel: (data: any[], filename: string = 'export.xlsx') => {
    return new Promise<void>((resolve) => {
      // In a real application, this would generate an actual Excel file
      const blob = new Blob(['Mock Excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    });
  },

  // CSV export
  exportToCSV: (data: any[], filename: string = 'export.csv') => {
    return new Promise<void>((resolve) => {
      if (data.length === 0) {
        resolve();
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    });
  },

  // JSON export
  exportToJSON: (data: any[], filename: string = 'export.json') => {
    return new Promise<void>((resolve) => {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    });
  },
};
