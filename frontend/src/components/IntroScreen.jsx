import { useEffect, useState } from 'react';

const DOTS = [
  { color: '#4285F4', delay: 0 },
  { color: '#EA4335', delay: 0.12 },
  { color: '#FBBC04', delay: 0.24 },
  { color: '#34A853', delay: 0.36 },
  { color: '#4285F4', delay: 0.48 },
];

export default function IntroScreen({ onFinished }) {
  const [phase, setPhase] = useState('enter'); // enter → bounce → reveal → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('bounce'), 300);
    const t2 = setTimeout(() => setPhase('reveal'), 1600);
    const t3 = setTimeout(() => setPhase('exit'), 2800);
    const t4 = setTimeout(() => onFinished(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinished]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: '#0f172a',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
      }}
    >
      {/* Ambient glow rings */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)',
          opacity: phase === 'reveal' || phase === 'exit' ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,168,83,0.06) 0%, transparent 70%)',
          opacity: phase === 'reveal' || phase === 'exit' ? 1 : 0,
          transition: 'opacity 1s ease 0.2s',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Google-style bouncing dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: phase === 'reveal' || phase === 'exit' ? 0 : 1,
            transform: phase === 'reveal' || phase === 'exit' ? 'scale(0.6)' : 'scale(1)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {DOTS.map((dot, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: dot.color,
                animation: phase === 'bounce' ? `introBounce 0.7s ease-in-out ${dot.delay}s infinite alternate` : 'none',
                opacity: phase === 'enter' ? 0 : 1,
                transform: phase === 'enter' ? 'scale(0)' : 'scale(1)',
                transition: `opacity 0.3s ease ${dot.delay + 0.1}s, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${dot.delay + 0.1}s`,
                boxShadow: `0 0 12px ${dot.color}80`,
              }}
            />
          ))}
        </div>

        {/* App name reveal */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            opacity: phase === 'reveal' ? 1 : phase === 'exit' ? 0.5 : 0,
            transform: phase === 'reveal' ? 'scale(1) translateY(0)' : phase === 'exit' ? 'scale(1.5) translateY(-20px)' : 'scale(0.8) translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Logo icon made of colored dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {['#4285F4', '#EA4335', '#FBBC04', '#34A853'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                  animation: phase === 'reveal' ? `revealDot 0.4s ease ${i * 0.06}s both` : 'none',
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                color: 'white',
                fontSize: 56,
                fontWeight: 900,
                letterSpacing: '-2px',
                lineHeight: 1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              TASK
              <span
                style={{
                  background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC04, #EA4335)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                FLOW
              </span>
            </h1>
            <p
              style={{
                color: 'rgba(148,163,184,0.8)',
                fontSize: 14,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                marginTop: 8,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Team Collaboration Platform
            </p>
          </div>

          {/* Loading bar */}
          <div
            style={{
              width: 200,
              height: 2,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 999,
              marginTop: 8,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC04, #EA4335)',
                borderRadius: 999,
                animation: phase === 'reveal' ? 'loadBar 1.2s ease forwards' : 'none',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes introBounce {
          from { transform: translateY(0px); }
          to   { transform: translateY(-18px); }
        }
        @keyframes revealDot {
          from { opacity: 0; transform: scale(0) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
