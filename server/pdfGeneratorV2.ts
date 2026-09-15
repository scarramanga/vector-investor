/**
 * GAP-267 Phase 2 (Part 5) -- deterministic v2 profile PDF.
 *
 * Renders the v2 readout exactly as the user saw it (What you told us / Our
 * interpretation / What remains unclear / A useful next step) plus the explore
 * themes. No AI, no persona: every line traces to an answer, so an AI outage
 * never degrades the report. Matches the branded style of pdfGenerator.ts.
 */

import { jsPDF } from 'jspdf';

export interface V2PdfInput {
  readout: {
    told: string[];
    interpretation: string[];
    unclear: string[];
    next_step: string;
  };
  exploreThemes: { name: string; tagline: string; example: string | null }[];
}

export async function generateV2ProfilePdf(input: V2PdfInput): Promise<string | null> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 24;
    const contentWidth = pageWidth - marginLeft * 2;
    let y = 0;

    function checkPageBreak(needed: number): void {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        y = 24;
      }
    }

    function text(
      value: string,
      size: number,
      color: [number, number, number],
      font: 'normal' | 'bold' = 'normal',
      lineHeight = 5.5,
      x = marginLeft,
    ): void {
      const safe = String(value ?? '');
      if (!safe) return;
      doc.setFont('helvetica', font);
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(safe, contentWidth - (x - marginLeft)) as string[];
      for (const line of lines) {
        checkPageBreak(lineHeight);
        doc.text(String(line ?? ''), x, y);
        y += lineHeight;
      }
    }

    function section(title: string, items: string[]): void {
      if (!items.length) return;
      y += 6;
      checkPageBreak(14);
      text(title, 13, [17, 24, 39], 'bold', 7);
      for (const item of items) {
        text('-  ' + item, 11, [51, 51, 51], 'normal', 5.5);
        y += 1.5;
      }
    }

    // --- Header band (matches pdfGenerator.ts) ---
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pageWidth, 44, 'F');
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 44, pageWidth, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(241, 245, 249);
    doc.text('Vector by Sovereign Signal', marginLeft, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(148, 163, 184);
    doc.text('Your investor-approach profile', marginLeft, 31);
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Generated ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      marginLeft,
      39,
    );

    y = 56;
    text(
      'This describes how you approach investing. It does not assess what you should buy or whether you are ready to trade.',
      10,
      [107, 114, 128],
      'normal',
      5,
    );

    section('What you told us', input.readout.told);
    section('Our interpretation', input.readout.interpretation);
    section('What remains unclear', input.readout.unclear);

    if (input.readout.next_step) {
      y += 6;
      checkPageBreak(16);
      text('A useful next step', 13, [17, 24, 39], 'bold', 7);
      text(input.readout.next_step, 11, [51, 51, 51], 'normal', 5.5);
    }

    if (input.exploreThemes.length) {
      y += 6;
      checkPageBreak(16);
      text('Where you might explore next', 13, [17, 24, 39], 'bold', 7);
      for (const theme of input.exploreThemes) {
        checkPageBreak(14);
        text(theme.name, 11, [17, 24, 39], 'bold', 5.5);
        text(theme.tagline, 10, [51, 51, 51], 'normal', 5);
        if (theme.example) {
          text(
            'For example: ' + theme.example + ' - shown to illustrate the theme, not as a recommendation.',
            9,
            [107, 114, 128],
            'normal',
            4.5,
          );
        }
        y += 2.5;
      }
    }

    // --- Footer / legal ---
    y += 8;
    checkPageBreak(16);
    doc.setDrawColor(229, 231, 235);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;
    text(
      'This is an educational orientation, not financial advice or a recommendation. Nothing here is personalised to your financial situation, and every conclusion above is drawn only from the answers you gave.',
      8,
      [148, 163, 184],
      'normal',
      4.4,
    );

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (err) {
    console.error('[pdfV2] generation failed:', err);
    return null;
  }
}
