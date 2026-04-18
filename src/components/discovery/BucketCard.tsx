import type { Bucket } from '../../data/discovery';

interface BucketCardProps {
  bucket: Bucket;
}

export default function BucketCard({ bucket }: BucketCardProps) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: '180px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${bucket.color}`,
        padding: '20px',
      }}
    >
      <p
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: bucket.color,
          marginBottom: '8px',
        }}
      >
        {bucket.name}
      </p>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.5,
        }}
      >
        {bucket.purpose}
      </p>
    </div>
  );
}
