export function CRTGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,255,65,0.02) 50%, rgba(0,255,65,0.05) 100%)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          boxShadow: 'inset 0 0 100px rgba(0,255,65,0.1), inset 0 0 200px rgba(0,255,65,0.05)',
        }}
      />
    </div>
  );
}
