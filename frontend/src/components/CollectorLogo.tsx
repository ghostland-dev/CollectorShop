interface CollectorLogoProps {
  size?: number;
  showText?: boolean;
}

export function CollectorLogo({ size = 36, showText = true }: CollectorLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* SVG Logo — gemme/collection icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Fond cercle émeraude */}
        <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
        {/* Gemme centrale */}
        <polygon
          points="24,6 38,16 38,32 24,42 10,32 10,16"
          fill="rgba(255,255,255,0.9)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.5"
        />
        {/* Reflets de la gemme */}
        <polygon
          points="24,6 38,16 24,18"
          fill="rgba(52,211,153,0.8)"
        />
        <polygon
          points="10,16 24,18 24,6"
          fill="rgba(16,185,129,0.6)"
        />
        <polygon
          points="24,18 38,16 38,32 24,42"
          fill="rgba(4,120,87,0.3)"
        />
        <polygon
          points="10,16 24,18 24,42 10,32"
          fill="rgba(6,95,70,0.3)"
        />
        {/* Éclat central */}
        <polygon
          points="24,18 38,16 38,32 24,42 10,32 10,16"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="0.8"
        />
        {/* Petite étoile centrale */}
        <circle cx="24" cy="28" r="3" fill="rgba(52,211,153,0.9)" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Collector
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'rgba(52,211,153,0.95)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}>
            .shop
          </span>
        </div>
      )}
    </div>
  );
}
