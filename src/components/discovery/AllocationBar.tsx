import type { AllocationSuggestion } from '../../data/discovery';

interface AllocationBarProps {
  allocation: AllocationSuggestion;
}

export default function AllocationBar({ allocation }: AllocationBarProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            width: `${allocation.foundation}%`,
            backgroundColor: 'var(--color-success)',
            animation: 'barGrow 0.8s ease both',
            animationDelay: '0ms',
            transformOrigin: 'left',
          }}
        />
        <div
          style={{
            width: `${allocation.growth}%`,
            backgroundColor: 'var(--color-primary)',
            animation: 'barGrow 0.8s ease both',
            animationDelay: '200ms',
            transformOrigin: 'left',
          }}
        />
        <div
          style={{
            width: `${allocation.conviction}%`,
            backgroundColor: 'var(--color-warning)',
            animation: 'barGrow 0.8s ease both',
            animationDelay: '400ms',
            transformOrigin: 'left',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '12px',
        }}
      >
        <div style={{ textAlign: 'center', flex: allocation.foundation }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success)' }}>
            Foundation
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {allocation.foundation}%
          </p>
        </div>
        <div style={{ textAlign: 'center', flex: allocation.growth }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
            Growth
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {allocation.growth}%
          </p>
        </div>
        <div style={{ textAlign: 'center', flex: allocation.conviction }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-warning)' }}>
            Conviction
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {allocation.conviction}%
          </p>
        </div>
      </div>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          marginTop: '16px',
          lineHeight: 1.5,
        }}
      >
        A starting point for someone with this profile. Not a prescription — a framework.
      </p>
    </div>
  );
}
