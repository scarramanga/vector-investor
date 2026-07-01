import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import type { VectorProfile } from '../types';
import { profiles, capitalOverlays, capitalBandLabels, personaEducationCards, educationConcepts, preservationCapitalOverlays, adviserManagedProfiles } from '../data/profiles';

import { buildAnswerPayload } from '../data/scoring';
import { fetchProfileNarrative, fetchPdfNarrative } from '../services/vectorAI';
import { trackQuizCompleted } from '../services/analytics';
import ProfileHeader from '../components/result/ProfileHeader';
import RecognitionCard from '../components/result/RecognitionCard';
import ReframeCard from '../components/result/ReframeCard';
import OrientationCard from '../components/result/OrientationCard';
import EducationCards from '../components/result/EducationCards';
import BridgeCard from '../components/result/BridgeCard';
import SkeletonCard from '../components/result/SkeletonCard';
import EmailCapture from '../components/result/EmailCapture';
import BrokerRecommendation from '../components/result/BrokerRecommendation';

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

function generateProfilePDF(
  profile: VectorProfile,
  profileContent: typeof profiles[keyof typeof profiles],
  recognition: string,
  reframe: string,
  overlayDescription: string,
  lifeStage: string,
  adviserManaged: boolean,
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
  doc.setFontSize(24);
  doc.setTextColor(148, 163, 184);
  doc.text('Investor Profile Report', marginLeft, 30);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Generated ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), marginLeft, 36);

  y = 56;

  // --- Profile summary row ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text('PROFILE', marginLeft, y);
  doc.text('CAPITAL POSITION', marginLeft + 60, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text(personaLabel, marginLeft, y);
  doc.text(capitalLabel, marginLeft + 60, y);
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
  const lifeStageLabels: Record<string, string> = {
    early_career: 'Early career',
    mid_career: 'Mid-career',
    established: 'Established',
    preservation: 'Approaching or in retirement',
  };
  const timeHorizonMap: Record<string, string> = {
    long: '10+ years',
    medium: '3\u201310 years',
    short: 'Shorter term with preservation focus',
    undefined: 'Not specified',
  };
  const payload = buildAnswerPayload(profile);
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
  doc.text('This profile can be uploaded to StackMotive. Stack AI will use it to personalise your experience.', marginLeft, footerY - 4);
  doc.text('Vector is an educational and orientation tool. Nothing in this document constitutes financial advice.', marginLeft, footerY);
  doc.text('www.stackmotiveapp.com  |  thesovsignal.substack.com', marginLeft, footerY + 4);

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'vector-profile-' + profile.persona + '-' + profile.capitalBand + '.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string | null>(null);
  const [capturedCountry, setCapturedCountry] = useState<string | null>(null);
  const [capturedPhilosophy, setCapturedPhilosophy] = useState<string | null>(null);
  const [emailCaptureComplete, setEmailCaptureComplete] = useState(false);

  const answerPayload = useMemo(
    () => (vectorProfile ? buildAnswerPayload(vectorProfile) : null),
    [vectorProfile],
  );

  useEffect(() => {
    if (vectorProfile) {
      trackQuizCompleted(vectorProfile.persona, vectorProfile.capitalBand);
    }
  }, [vectorProfile]);

  useEffect(() => {
    if (!answerPayload) return;

    fetchProfileNarrative(answerPayload).then((content) => {
      if (content) {
        const cleaned = stripMarkdown(content);
        const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);
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
  const isPreservation = answerPayload?.lifeStage === 'preservation';
  const isAdviserManaged = answerPayload?.adviserManaged === true;
  const adviserContent = isAdviserManaged ? adviserManagedProfiles[vectorProfile.persona] : null;
  const overlayDescription = isPreservation
    ? preservationCapitalOverlays[vectorProfile.capitalBand]
    : overlay.description;
  const staticRecognition = adviserContent?.recognition ?? profileContent.recognition;
  const staticReframe = adviserContent?.reframe ?? profileContent.reframe;
  const activeBridgeText = adviserContent?.bridgeText ?? profileContent.bridgeText;

  async function handleDownload() {
    if (!vectorProfile || !profileContent || !overlay || !answerPayload) return;
    setIsGeneratingPdf(true);
    try {
      const pdfContent = await fetchPdfNarrative(answerPayload);
      let recognition = staticRecognition;
      let reframe = staticReframe;
      if (pdfContent) {
        const cleaned = stripMarkdown(pdfContent);
        const paragraphs = cleaned.split('\n\n').filter((p) => p.trim().length > 0);
        if (paragraphs.length >= 2) {
          recognition = paragraphs[0];
          reframe = paragraphs.slice(1).join('\n\n');
        } else if (paragraphs.length === 1) {
          recognition = paragraphs[0];
        }
      }
      generateProfilePDF(vectorProfile, profileContent, recognition, reframe, overlayDescription, answerPayload.lifeStage, isAdviserManaged);
    } finally {
      setIsGeneratingPdf(false);
    }
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
          animationDelay={0}
        />
        <div
          style={{
            marginTop: '-24px',
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '50ms',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
            }}
          >
            INVESTOR PROFILE SUMMARY
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
              marginBottom: '4px',
            }}
          >
            Capital Position: {bandLabel}
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: 'var(--color-text-secondary)',
            }}
          >
            Profile: {formatPersonaLabel(vectorProfile.persona)}
          </p>
        </div>

        {/* Section 2 & 3 — RecognitionCard + ReframeCard (or Skeleton) */}
        {isLoadingNarrative ? (
          <SkeletonCard
            accentColor={profileContent.accentColor}
            animationDelay={150}
          />
        ) : (
          <>
            <RecognitionCard
              recognition={staticRecognition}
              dynamicContent={dynamicRecognition}
              accentColor={profileContent.accentColor}
              animationDelay={150}
            />
            <ReframeCard
              reframe={staticReframe}
              dynamicContent={dynamicReframe}
              accentColor={profileContent.accentColor}
              animationDelay={300}
            />
          </>
        )}

        {/* Section 4 — BridgeCard (platform next step) */}
        <BridgeCard
          bridgeText={activeBridgeText}
          firstAction={overlay.firstAction}
          accentColor={profileContent.accentColor}
          animationDelay={400}
        />

        {/* Section 5 — Email Capture */}
        {answerPayload && (
          <EmailCapture
            persona={vectorProfile.persona}
            capitalBand={vectorProfile.capitalBand}
            accentColor={profileContent.accentColor}
            answerPayload={answerPayload}
            animationDelay={450}
            capturedEmail={capturedEmail}
            emailCaptureComplete={emailCaptureComplete}
            onComplete={(_sessionToken, email, country, philosophy) => {
              setCapturedEmail(email);
              setCapturedCountry(country);
              setCapturedPhilosophy(philosophy);
              setEmailCaptureComplete(true);
            }}
          />
        )}

        {/* Section 6 — OrientationCard */}
        <OrientationCard
          points={profileContent.orientation}
          accentColor={profileContent.accentColor}
          animationDelay={550}
        />

        {/* Section 7 — Capital position detail */}
        <div
          style={{
            animation: 'fadeSlideUp 0.6s ease both',
            animationDelay: '650ms',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '16px',
            }}
          >
            YOUR CAPITAL POSITION
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
              marginBottom: '12px',
            }}
          >
            {overlayDescription}
          </p>
        </div>

        {/* Section 7.5 - What happens next (post-capture only) */}
        {emailCaptureComplete && capturedEmail && (
          <div
            style={{
              animation: 'fadeSlideUp 0.6s ease both',
              animationDelay: '750ms',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: '24px',
              }}
            >
              WHAT HAPPENS NEXT
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Step 1. Your profile arrives in StackMotive
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  Your Vector profile (persona, philosophy, and capital band) is sent to
                  StackMotive automatically. When you sign up, StackMotive uses it to orient your
                  experience from day one.
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Step 2. Foundry builds your Conviction Register
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  As you engage with StackMotive, Foundry tracks which signals speak to your
                  declared philosophy. Over time it builds a Conviction Register, a structured
                  record of where your thesis is strengthening, where it is being tested, and
                  where it has gaps.
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Step 3. Your Investment Constitution takes shape
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  When your Conviction Register has enough depth, StackMotive can draft an
                  Investment Constitution, a formal document capturing your thesis, your
                  qualifying criteria for each theme, and your governance principles for capital
                  allocation.
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  Step 4. Execution follows conviction
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                  }}
                >
                  At Operator tier and above, your Constitution connects to execution parameters.
                  Your conviction depth drives suggested position-level rules. You review, tune,
                  and confirm before anything goes live.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 8 — EducationCards */}
        <EducationCards
          persona={vectorProfile.persona}
          accentColor={profileContent.accentColor}
          animationDelay={850}
        />

        {/* Section 8.5 — Broker Recommendation (post-capture only, not for skip) */}
        {emailCaptureComplete && capturedEmail && capturedCountry && (
          <BrokerRecommendation
            country={capturedCountry}
            capitalBand={vectorProfile.capitalBand}
            philosophy={capturedPhilosophy}
            animationDelay={1050}
          />
        )}

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
            className="discovery-cta"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#ffffff',
              backgroundColor: profileContent.accentColor,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Explore the instrument reference guide →
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
            onClick={handleDownload}
            disabled={isGeneratingPdf}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              color: isGeneratingPdf ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: isGeneratingPdf ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isGeneratingPdf ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isGeneratingPdf) e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            {isGeneratingPdf ? 'Generating your profile...' : 'Download Investor Profile Report'}
          </button>
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
              e.currentTarget.style.borderColor = 'var(--color-text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
