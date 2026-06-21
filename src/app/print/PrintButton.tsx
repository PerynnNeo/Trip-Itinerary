'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        padding: '11px 20px',
        borderRadius: 12,
        border: '2.5px solid #1A1310',
        background: '#1A1310',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '3px 3px 0 #FF2E88',
        letterSpacing: '.01em',
      }}
    >
      Print / Save as PDF
    </button>
  );
}
