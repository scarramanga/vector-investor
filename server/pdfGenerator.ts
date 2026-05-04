/**
 * Server-side PDF generation for the Vector Investor Profile Report.
 * Replicates the client-side jsPDF output from ResultPage.tsx.
 *
 * - Makes an Anthropic Call 3 API call for AI-generated recognition/reframe
 * - Falls back to static content if the API call fails
 * - Returns a base64-encoded PDF string, or null on complete failure
 */

import { jsPDF } from 'jspdf';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from './promptBuilder.js';
import {
  profileHeadlines,
  staticRecognition,
  staticReframe,
  adviserManagedRecognition,
  adviserManagedReframe,
  capitalBandLabels,
  capitalOverlayDescriptions,
  preservationOverlayDescriptions,
  educationConcepts,
  personaEducationCards,
  lifeStageLabels,
  timeHorizonLabels,
} from './profileData.js';
import type { PersonaType, CapitalBand } from './profileData.js';

export interface PdfInput {
  persona: string;
  capitalBand: string;
  tierName: string;
  payload: Record<string, unknown>;
}

function stripMarkdown(text: string): string {
  return text
    .split('\n')
    .filter((line) => !line.match(/^#{1,6}\s/))
    .join('\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .trim();
}

function formatPersonaLabel(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Call Anthropic API with the Call 3 (PDF) prompt to get AI-generated
 * recognition and reframe text. Returns null on failure.
 */
async function fetchAiContent(
  payload: Record<string, unknown>,
): Promise<{ recognition: string; reframe: string } | null> {
  const apiKey = process.env['VECTOR_ANTHROPIC_API_KEY'] || '';
  const model = process.env['VECTOR_CLAUDE_MODEL'] || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    console.warn('[pdfGenerator] VECTOR_ANTHROPIC_API_KEY not set. Using static content.');
    return null;
  }

  const anthropic = new Anthropic({ apiKey });
  const systemPrompt = buildSystemPrompt('pdf');
  const userMessage = `Here is the user's complete Vector answer data:\n\n${JSON.stringify(payload, null, 2)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await anthropic.messages.create(
      {
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      },
      { signal: controller.signal },
    );

    clearTimeout(timer);

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.warn('[pdfGenerator] No text block in API response. Using static content.');
      return null;
    }

    const cleaned = stripMarkdown(textBlock.text);
    const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);

    if (paragraphs.length >= 2) {
      return {
        recognition: paragraphs[0],
        reframe: paragraphs.slice(1).join('\n\n'),
      };
    } else if (paragraphs.length === 1) {
      return { recognition: paragraphs[0], reframe: '' };
    }

    return null;
  } catch (err) {
    clearTimeout(timer);
    console.error('[pdfGenerator] Anthropic API error:', err);
    return null;
  }
}

/**
 * Generate the Vector Investor Profile Report as a PDF.
 * Returns a base64-encoded PDF string, or null on complete failure.
 */
export async function generateProfilePdf(input: PdfInput): Promise<string | null> {
  const persona = input.persona as PersonaType;
  const capitalBand = input.capitalBand as CapitalBand;
  const payload = input.payload;
  const tierName = input.tierName;

  const lifeStage = (payload['lifeStage'] as string) || '';
  const adviserManaged = payload['adviserManaged'] === true;
  const timeHorizon = (payload['timeHorizon'] as string) || 'undefined';
  const frictionPoint = (payload['frictionPoint'] as string) || '';
  const desiredOutcome = (payload['desiredOutcome'] as string) || '';

  const headline = profileHeadlines[persona] || '';
  const personaLabel = formatPersonaLabel(persona);
  const capitalLabel = capitalBandLabels[capitalBand] || capitalBand;
  const isPreservation = lifeStage === 'preservation';
  const overlayDescription = isPreservation
    ? (preservationOverlayDescriptions[capitalBand] || '')
    : (capitalOverlayDescriptions[capitalBand] || '');

  // Determine static fallback recognition/reframe
  const fallbackRecognition = adviserManaged
    ? (adviserManagedRecognition[persona] || staticRecognition[persona] || '')
    : (staticRecognition[persona] || '');
  const fallbackReframe = adviserManaged
    ? (adviserManagedReframe[persona] || staticReframe[persona] || '')
    : (staticReframe[persona] || '');

  // Fetch AI-generated content (with fallback)
  let recognition = fallbackRecognition;
  let reframe = fallbackReframe;

  try {
    const aiContent = await fetchAiContent(payload);
    if (aiContent) {
      recognition = aiContent.recognition || fallbackRecognition;
      reframe = aiContent.reframe || fallbackReframe;
      console.log('[pdfGenerator] Using AI-generated content for PDF');
    } else {
      console.log('[pdfGenerator] Using static fallback content for PDF');
    }
  } catch (err) {
    console.error('[pdfGenerator] AI content fetch error:', err);
  }

  // Get education concepts
  const conceptNames = personaEducationCards[persona] || [];
  const concepts = conceptNames
    .map((name) => educationConcepts[name])
    .filter(Boolean);

  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 24;
    const marginRight = 24;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 0;

    function checkPageBreak(needed: number) {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        y = 24;
      }
    }

    function drawWrappedText(
      text: string,
      x: number,
      fontSize: number,
      maxWidth: number,
      lineHeight: number,
      color: [number, number, number],
    ): void {
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      const lines = doc.splitTextToSize(text, maxWidth) as string[];
      for (const line of lines) {
        checkPageBreak(lineHeight);
        doc.text(line, x, y);
        y += lineHeight;
      }
    }

    // --- Header band ---
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pageWidth, 44, 'F');

    // Accent line
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 44, pageWidth, 1.5, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(241, 245, 249);
    doc.text('Vector by Sovereign Signal', marginLeft, 20);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(24);
    doc.setTextColor(148, 163, 184);
    doc.text('Investor Profile Report', marginLeft, 30);

    // Date
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Generated ' +
        new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      marginLeft,
      36,
    );

    y = 56;

    // --- Profile summary row ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.text('PROFILE', marginLeft, y);
    doc.text('CAPITAL POSITION', marginLeft + 60, y);
    doc.text('STACKMOTIVE TIER', marginLeft + 120, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    doc.text(personaLabel, marginLeft, y);
    doc.text(capitalLabel, marginLeft + 60, y);
    doc.text(tierName, marginLeft + 120, y);
    y += 10;

    // Divider
    doc.setDrawColor(30, 30, 46);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    // --- Persona headline ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const headlineLines = doc.splitTextToSize(headline, contentWidth) as string[];
    for (const line of headlineLines) {
      checkPageBreak(7);
      doc.text(line, marginLeft, y);
      y += 7;
    }
    y += 6;

    // --- Recognition ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    checkPageBreak(6);
    doc.text('WHO YOU ARE', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    drawWrappedText(recognition, marginLeft, 10, contentWidth, 5, [26, 26, 26]);
    y += 6;

    // --- Reframe ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    checkPageBreak(6);
    doc.text('THE REFRAME', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    drawWrappedText(reframe, marginLeft, 10, contentWidth, 5, [26, 26, 26]);
    y += 6;

    // --- Capital position ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    checkPageBreak(6);
    doc.text('YOUR CAPITAL POSITION', marginLeft, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    drawWrappedText(overlayDescription, marginLeft, 10, contentWidth, 5, [26, 26, 26]);
    y += 4;

    // Life stage, adviser-managed, time horizon, friction point, desired outcome
    doc.setFontSize(9);
    doc.setTextColor(51, 51, 51);
    checkPageBreak(5);
    doc.text('Life stage: ' + (lifeStageLabels[lifeStage] ?? lifeStage), marginLeft, y);
    y += 4.5;
    if (adviserManaged) {
      checkPageBreak(5);
      doc.text('Investment approach: Adviser-managed', marginLeft, y);
      y += 4.5;
    }
    checkPageBreak(5);
    doc.text('Time horizon: ' + (timeHorizonLabels[timeHorizon] ?? timeHorizon), marginLeft, y);
    y += 4.5;
    checkPageBreak(5);
    doc.text('Friction point: ' + frictionPoint, marginLeft, y);
    y += 4.5;
    checkPageBreak(5);
    doc.text('Desired outcome: ' + desiredOutcome, marginLeft, y);
    y += 8;

    // Divider
    doc.setDrawColor(30, 30, 46);
    doc.setLineWidth(0.3);
    checkPageBreak(4);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    // --- Top three concepts ---
    if (concepts.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      checkPageBreak(6);
      doc.text('TOP THREE RELEVANT CONCEPTS', marginLeft, y);
      y += 8;

      for (const concept of concepts) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        checkPageBreak(6);
        doc.text(concept.name, marginLeft, y);
        y += 5.5;
        doc.setFont('helvetica', 'normal');
        drawWrappedText(concept.description, marginLeft, 9, contentWidth, 4.5, [26, 26, 26]);
        y += 4;
      }
      y += 4;
    }

    // --- Footer ---
    const footerY = pageHeight - 14;
    doc.setDrawColor(30, 30, 46);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, footerY - 8, pageWidth - marginRight, footerY - 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      'This profile can be uploaded to StackMotive. Stack AI will use it to personalise your experience.',
      marginLeft,
      footerY - 4,
    );
    doc.text(
      'Vector is an educational and orientation tool. Nothing in this document constitutes financial advice.',
      marginLeft,
      footerY,
    );
    doc.text('www.stackmotiveapp.com  |  thesovsignal.substack.com', marginLeft, footerY + 4);

    // Output as base64
    const arrayBuffer = doc.output('arraybuffer');
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return base64;
  } catch (err) {
    console.error('[pdfGenerator] PDF generation error:', err);
    return null;
  }
}
