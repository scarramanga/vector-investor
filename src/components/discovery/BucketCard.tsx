import type { Bucket } from '../../data/discovery';

interface BucketCardProps {
  bucket: Bucket;
  percentage: number;
}

export default function BucketCard({ bucket, percentage }: BucketCardProps) {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <p
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: bucket.color,
          }}
        >
          {bucket.name}
        </p>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: `color-mix(in srgb, ${bucket.color} 15%, transparent)`,
            fontSize: '12px',
            fontWeight: 600,
            color: bucket.color,
          }}
        >
          {percentage}%
        </span>
      </div>
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
