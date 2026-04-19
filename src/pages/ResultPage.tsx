import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import type { VectorProfile } from '../types';
import { profiles, capitalOverlays, capitalBandLabels, personaEducationCards, educationConcepts } from '../data/profiles';
import type { CapitalOverlay } from '../data/profiles';
import { buildAnswerPayload } from '../data/scoring';
import { fetchProfileNarrative } from '../services/vectorAI';
import ProfileHeader from '../components/result/ProfileHeader';
import RecognitionCard from '../components/result/RecognitionCard';
import ReframeCard from '../components/result/ReframeCard';
import OrientationCard from '../components/result/OrientationCard';
import CapitalBandBadge from '../components/result/CapitalBandBadge';
import EducationCards from '../components/result/EducationCards';
import BridgeCard from '../components/result/BridgeCard';
import SkeletonCard from '../components/result/SkeletonCard';

function generateProfilePDF(
  profile: VectorProfile,
  profileContent: typeof profiles[keyof typeof profiles],
  overlay: CapitalOverlay,
  recognition: string,
  reframe: string,
): void {
  const personaLabel = formatPersonaLabel(profile.persona);
  const capitalLabel = capitalBandLabels[profile.capitalBand];
  const conceptNames = personaEducationCards[profile.persona] || [];
  const concepts = conceptNames
    .map((name) => educationConcepts[name])
    .filter(Boolean);

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

  function drawWrappedText(text: string, x: number, fontSize: number, maxWidth: number, lineHeight: number, color: [number, number, number]): void {
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
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Investor Profile Report', marginLeft, 28);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Generated ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), marginLeft, 36);

  y = 56;

  // --- Profile summary row ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('PROFILE', marginLeft, y);
  doc.text('CAPITAL POSITION', marginLeft + 60, y);
  doc.text('STACKMOTIVE TIER', marginLeft + 120, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(241, 245, 249);
  doc.text(personaLabel, marginLeft, y);
  doc.text(capitalLabel, marginLeft + 60, y);
  doc.text(overlay.stackmotiveTier, marginLeft + 120, y);
  y += 10;

  // Divider
  doc.setDrawColor(30, 30, 46);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 10;

  // --- Persona headline ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(99, 102, 241);
  const headlineLines = doc.splitTextToSize(profileContent.headline, contentWidth) as string[];
  for (const line of headlineLines) {
    checkPageBreak(7);
    doc.text(line, marginLeft, y);
    y += 7;
  }
  y += 6;

  // --- Recognition ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  checkPageBreak(6);
  doc.text('WHO YOU ARE', marginLeft, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  drawWrappedText(recognition, marginLeft, 10, contentWidth, 5, [241, 245, 249]);
  y += 6;

  // --- Reframe ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  checkPageBreak(6);
  doc.text('THE REFRAME', marginLeft, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  drawWrappedText(reframe, marginLeft, 10, contentWidth, 5, [241, 245, 249]);
  y += 6;

  // --- Capital position ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  checkPageBreak(6);
  doc.text('YOUR CAPITAL POSITION', marginLeft, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  drawWrappedText(overlay.description, marginLeft, 10, contentWidth, 5, [241, 245, 249]);
  y += 4;

  // Time horizon, friction point, desired outcome
  const timeHorizonMap: Record<string, string> = {
    long: '10+ years',
    medium: '3\u201310 years',
    short: 'Under 3 years',
    undefined: 'Not specified',
  };
  const payload = buildAnswerPayload(profile);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  checkPageBreak(5);
  doc.text('Time horizon: ' + (timeHorizonMap[payload.timeHorizon] ?? payload.timeHorizon), marginLeft, y);
  y += 4.5;
  checkPageBreak(5);
  doc.text('Friction point: ' + payload.frictionPoint, marginLeft, y);
  y += 4.5;
  checkPageBreak(5);
  doc.text('Desired outcome: ' + payload.desiredOutcome, marginLeft, y);
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
    doc.setTextColor(148, 163, 184);
    checkPageBreak(6);
    doc.text('TOP THREE RELEVANT CONCEPTS', marginLeft, y);
    y += 8;

    for (const concept of concepts) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(241, 245, 249);
      checkPageBreak(6);
      doc.text(concept.name, marginLeft, y);
      y += 5.5;
      doc.setFont('helvetica', 'normal');
      drawWrappedText(concept.description, marginLeft, 9, contentWidth, 4.5, [148, 163, 184]);
      y += 4;
    }
    y += 4;
  }

  // --- Footer ---
  const footerY = pageHeight - 14;
  doc.setDrawColor(30, 30, 46);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, footerY - 4, pageWidth - marginRight, footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Vector is an educational and orientation tool. Nothing in this document constitutes financial advice.', marginLeft, footerY);
  doc.text('www.stackmotiveapp.com  |  thesovsignal.substack.com', marginLeft, footerY + 4);

  doc.save('vector-profile-' + profile.persona + '-' + profile.capitalBand + '.pdf');
}

function formatPersonaLabel(persona: string): string {
  return persona
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const vectorProfile = (location.state as { profile?: VectorProfile } | null)?.profile;
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(true);
  const [dynamicRecognition, setDynamicRecognition] = useState<string | null>(null);
  const [dynamicReframe, setDynamicReframe] = useState<string | null>(null);

  const answerPayload = useMemo(
    () => (vectorProfile ? buildAnswerPayload(vectorProfile) : null),
    [vectorProfile],
  );

  useEffect(() => {
    if (!answerPayload) return;

    fetchProfileNarrative(answerPayload).then((content) => {
      if (content) {
        const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
        if (paragraphs.length >= 2) {
          setDynamicRecognition(paragraphs[0]);
          setDynamicReframe(paragraphs.slice(1).join('\n\n'));
        } else if (paragraphs.length === 1) {
          setDynamicRecognition(paragraphs[0]);
        }
      }
      setIsLoadingNarrative(false);
    });
  }, [answerPayload]);

  if (!vectorProfile) {
    navigate('/', { replace: true });
    return null;
  }

  const profileContent = profiles[vectorProfile.persona];
  const overlay = capitalOverlays[vectorProfile.capitalBand];
  const bandLabel = capitalBandLabels[vectorProfile.capitalBand];

  function handleDownload() {
    if (!vectorProfile || !profileContent || !overlay) return;
    const recognition = dynamicRecognition ?? profileContent.recognition;
    const reframe = dynamicReframe ?? profileContent.reframe;
    generateProfilePDF(vectorProfile, profileContent, overlay, recognition, reframe);
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        minHeight: '100vh',
      }}
    >
      <div
        className="result-container"
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '48px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Section 1 — ProfileHeader */}
        <ProfileHeader
          headline={profileContent.headline}
          accentColor={profileContent.accentColor}
          capitalBandLabel={bandLabel}
          animationDelay={0}
        />

        {/* Section 2 & 3 — RecognitionCard + ReframeCard (or Skeleton) */}
        {isLoadingNarrative ? (
          <SkeletonCard
            accentColor={profileContent.accentColor}
            animationDelay={150}
          />
        ) : (
          <>
            <RecognitionCard
              recognition={profileContent.recognition}
              dynamicContent={dynamicRecognition}
              accentColor={profileContent.accentColor}
              animationDelay={150}
            />
            <ReframeCard
              reframe={profileContent.reframe}
              dynamicContent={dynamicReframe}
              accentColor={profileContent.accentColor}
              animationDelay={300}
            />
          </>
        )}

        {/* Section 4 — OrientationCard */}
        <OrientationCard
          points={profileContent.orientation}
          accentColor={profileContent.accentColor}
          animationDelay={450}
        />

        {/* Section 5 — CapitalBandBadge standalone section */}
        <div
          style={{
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '600ms',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-text-muted)',
              marginBottom: '16px',
            }}
          >
            YOUR CAPITAL POSITION
          </p>
          <div style={{ marginBottom: '16px' }}>
            <CapitalBandBadge
              label={bandLabel}
              accentColor={profileContent.accentColor}
            />
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: '12px',
            }}
          >
            {overlay.description}
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            Recommended tier: {overlay.stackmotiveTier}
          </p>
        </div>

        {/* Section 6 — EducationCards */}
        <EducationCards
          persona={vectorProfile.persona}
          accentColor={profileContent.accentColor}
          animationDelay={750}
        />

        {/* Section 7 — BridgeCard */}
        <BridgeCard
          bridgeText={profileContent.bridgeText}
          bridgeCTA={profileContent.bridgeCTA}
          firstAction={overlay.firstAction}
          accentColor={profileContent.accentColor}
          animationDelay={900}
        />

        {/* Discovery CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '1050ms',
          }}
        >
          <button
            onClick={() => navigate('/discovery')}
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Explore the instrument reference guide \u2192
          </button>
        </div>

        {/* Section 8 — Action row */}
        <div
          className="action-row"
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '1200ms',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Start Over
          </button>
          <button
            onClick={handleDownload}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Download Profile
          </button>
        </div>
      </div>
    </div>
  );
}
