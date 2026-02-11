import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autotable plugin
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: any;
        autoTable: (options: any) => jsPDF;
    }
}

export type ExportFormat = 'csv' | 'pdf';

interface ExportOptions {
    filename: string;
    columns: string[];
    data: any[][];
    title?: string;
}

/**
 * Universal export utility for CSV and PDF formats
 */
export const exportData = (format: ExportFormat, options: ExportOptions) => {
    if (format === 'csv') {
        exportToCSV(options);
    } else {
        exportToPDF(options);
    }
};

/**
 * Generates and downloads a CSV file
 */
const exportToCSV = ({ filename, columns, data }: ExportOptions) => {
    // Escape values and join with commas
    const headerRow = columns.join(',');
    const dataRows = data.map(row =>
        row.map(cell => {
            const val = cell === null || cell === undefined ? '' : String(cell);
            // Escape quotes and wrap in quotes if contains comma
            if (val.includes(',') || val.includes('"')) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',')
    );

    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Generates and downloads a PDF file
 */
const exportToPDF = ({ filename, columns, data, title }: ExportOptions) => {
    const doc = new jsPDF();

    const pageTitle = title || filename.replace(/[-_]/g, ' ').toUpperCase();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(pageTitle, 14, 22);

    // Timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Table
    autoTable(doc, {
        startY: 35,
        head: [columns],
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 35 }
    });

    doc.save(`${filename}.pdf`);
};
