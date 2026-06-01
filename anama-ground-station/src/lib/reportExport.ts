import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Detection } from '../types/telemetry';

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('en-GB');
}

export function exportPDF(detections: Detection[], operator = 'Ground Operator') {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(10, 14, 10);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(57, 255, 20);
  doc.setFontSize(18);
  doc.setFont('courier', 'bold');
  doc.text('ANAMA Mine Detection Report', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(180, 220, 180);
  doc.text(`Date: ${new Date().toLocaleString('en-GB')}`, 14, 26);
  doc.text(`Operator: ${operator}`, 14, 33);

  // Summary
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('courier', 'normal');
  doc.setTextColor(10, 14, 10);
  doc.text('Mission Summary', 14, 52);
  doc.setFontSize(10);
  const mines = detections.filter(d => d.type === 'MINE').length;
  const metals = detections.filter(d => d.type === 'METAL').length;
  doc.text(`Total detections: ${detections.length}   |   Mines: ${mines}   |   Metal objects: ${metals}`, 14, 60);

  // Table
  autoTable(doc, {
    startY: 68,
    head: [['ID', 'Type', 'Latitude', 'Longitude', 'Depth (cm)', 'Confidence', 'Time']],
    body: detections.map(d => [
      `#${String(d.id).padStart(3, '0')}`,
      d.type,
      d.lat.toFixed(6),
      d.lng.toFixed(6),
      d.depthCm !== null ? d.depthCm : 'N/A',
      `${d.confidence}%`,
      formatDate(d.timestamp),
    ]),
    styles: { font: 'courier', fontSize: 9 },
    headStyles: { fillColor: [10, 14, 10], textColor: [57, 255, 20] },
    alternateRowStyles: { fillColor: [240, 248, 240] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'ANAMA Ground Station | Confidential — Mine Detection Data',
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, 180, doc.internal.pageSize.height - 8);
  }

  doc.save(`ANAMA_Report_${Date.now()}.pdf`);
}

export function exportExcel(detections: Detection[]) {
  const rows = detections.map(d => ({
    ID: `#${String(d.id).padStart(3, '0')}`,
    Type: d.type,
    Latitude: d.lat,
    Longitude: d.lng,
    'Depth (cm)': d.depthCm ?? 'N/A',
    'Confidence (%)': d.confidence,
    Timestamp: formatDate(d.timestamp),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Detections');

  // Summary sheet
  const summary = XLSX.utils.aoa_to_sheet([
    ['ANAMA Mine Detection Report'],
    ['Generated', new Date().toLocaleString('en-GB')],
    [],
    ['Total Detections', detections.length],
    ['Mines', detections.filter(d => d.type === 'MINE').length],
    ['Metal Objects', detections.filter(d => d.type === 'METAL').length],
  ]);
  XLSX.utils.book_append_sheet(wb, summary, 'Summary');

  XLSX.writeFile(wb, `ANAMA_Report_${Date.now()}.xlsx`);
}
