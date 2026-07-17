import { Injectable } from '@angular/core';

export interface PdfProject {
  title: string;
  description: string;
  technologies: { name: string }[];
  categories: string[];
}

/**
 * Builds a branded, print-friendly PDF of a category's projects entirely in the
 * browser. jsPDF is loaded via a dynamic import so it is code-split out of the
 * initial bundle and never executes during server-side prerendering.
 */
@Injectable({ providedIn: 'root' })
export class PdfExportService {
  async build(categoryLabel: string, projects: PdfProject[]): Promise<any> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentW = pageW - margin * 2;
    let y = margin + 6;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text('Alex Kariuki', margin, y);
    y += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(13, 148, 136);
    doc.text(`${categoryLabel} Projects`, margin, y);
    y += 12;
    doc.setDrawColor(45, 212, 191);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentW, y);
    y += 26;

    for (const p of projects) {
      const descLines: string[] = doc.splitTextToSize(p.description, contentW);
      const techLine = p.technologies.map((t) => t.name).join('   ·   ');
      const techLines: string[] = doc.splitTextToSize(techLine, contentW);
      const blockH = 16 + 14 + descLines.length * 13 + 8 + techLines.length * 12 + 20;

      if (y + blockH > pageH - margin) {
        doc.addPage();
        y = margin + 6;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13.5);
      doc.setTextColor(15, 23, 42);
      doc.text(p.title, margin, y);
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(p.categories.join('  •  '), margin, y);
      y += 15;

      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      doc.text(descLines, margin, y);
      y += descLines.length * 13 + 7;

      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136);
      doc.text(techLines, margin, y);
      y += techLines.length * 12 + 20;
    }

    // Footer on every page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('alex1kariuki.github.io', margin, pageH - 24);
      doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 24, { align: 'right' });
    }

    return doc;
  }

  /** Raw base64 (no data-URI prefix) for use as an EmailJS attachment. */
  toBase64(doc: any): string {
    const uri: string = doc.output('datauristring');
    const marker = 'base64,';
    return uri.substring(uri.indexOf(marker) + marker.length);
  }

  download(doc: any, filename: string): void {
    doc.save(filename);
  }
}
