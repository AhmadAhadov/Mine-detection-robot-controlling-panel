import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Detection } from '../types/telemetry';

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('az-AZ');
}

export function exportPDF(detections: Detection[], operator = 'Yer Operatoru') {
  const doc = new jsPDF();

  // Başlıq
  doc.setFillColor(10, 14, 10);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(57, 255, 20);
  doc.setFontSize(18);
  doc.setFont('courier', 'bold');
  doc.text('Mina Askarlamasi Hesabati', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(180, 220, 180);
  doc.text(`Tarix: ${new Date().toLocaleString('az-AZ')}`, 14, 26);
  doc.text(`Operator: ${operator}`, 14, 33);

  // Xülasə
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('courier', 'normal');
  doc.setTextColor(10, 14, 10);
  doc.text('Missiya Xulasesi', 14, 52);
  doc.setFontSize(10);
  const mines = detections.filter(d => d.type === 'MINE').length;
  const metals = detections.filter(d => d.type === 'METAL').length;
  doc.text(`Umumi askarlamalar: ${detections.length}   |   Minalar: ${mines}   |   Metal obyektlər: ${metals}`, 14, 60);

  // Cədvəl
  autoTable(doc, {
    startY: 68,
    head: [['ID', 'Növ', 'Enlik', 'Uzunluq', 'Dərinlik (sm)', 'Etibarlılıq', 'Vaxt']],
    body: detections.map(d => [
      `#${String(d.id).padStart(3, '0')}`,
      d.type === 'MINE' ? 'MİNA' : 'METAL',
      d.lat.toFixed(6),
      d.lng.toFixed(6),
      d.depthCm !== null ? d.depthCm : 'Məlum deyil',
      `${d.confidence}%`,
      formatDate(d.timestamp),
    ]),
    styles: { font: 'courier', fontSize: 9 },
    headStyles: { fillColor: [10, 14, 10], textColor: [57, 255, 20] },
    alternateRowStyles: { fillColor: [240, 248, 240] },
  });

  // Alt yazı
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'Yer Stansiyasi | Məxfi — Mina Aşkarlama Məlumatları',
      14,
      doc.internal.pageSize.height - 8
    );
    doc.text(`Səhifə ${i} / ${pageCount}`, 180, doc.internal.pageSize.height - 8);
  }

  doc.save(`Hesabat_${Date.now()}.pdf`);
}

export function exportExcel(detections: Detection[]) {
  const rows = detections.map(d => ({
    ID: `#${String(d.id).padStart(3, '0')}`,
    Nov: d.type === 'MINE' ? 'MİNA' : 'METAL',
    Enlik: d.lat,
    Uzunluq: d.lng,
    'Derinlik (sm)': d.depthCm ?? 'Məlum deyil',
    'Etibarliliq (%)': d.confidence,
    Vaxt: formatDate(d.timestamp),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Aşkarlamalar');

  const summary = XLSX.utils.aoa_to_sheet([
    ['Mina Aşkarlama Hesabatı'],
    ['Yaradılıb', new Date().toLocaleString('az-AZ')],
    [],
    ['Ümumi aşkarlamalar', detections.length],
    ['Minalar', detections.filter(d => d.type === 'MINE').length],
    ['Metal obyektlər', detections.filter(d => d.type === 'METAL').length],
  ]);
  XLSX.utils.book_append_sheet(wb, summary, 'Xülasə');

  XLSX.writeFile(wb, `Hesabat_${Date.now()}.xlsx`);
}
