interface StackMotiveHookProps {
  text: string;
  color: string;
  fontSize?: number;
}

export default function StackMotiveHook({ text, color, fontSize = 11 }: StackMotiveHookProps) {
  return (
    <a
      href="https://app.stackmotiveapp.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: `${fontSize}px`,
        color,
        textDecoration: 'none',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      → {text}
    </a>
  );
}
