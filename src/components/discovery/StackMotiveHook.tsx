interface StackMotiveHookProps {
  text: string;
  color: string;
  fontSize?: number;
}

export default function StackMotiveHook({ text, color, fontSize = 11 }: StackMotiveHookProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: `${fontSize}px`,
        color,
      }}
    >
      → {text}
    </span>
  );
}
