import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

// Floating particle component
function Particle({ style }) {
  return <div className="absolute rounded-full pointer-events-none" style={style} />;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(form.email, form.password);
      toast.success(`Welcome back, ${userData.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const particles = [
    { width: 6, height: 6, top: '15%', left: '10%', background: '#4285F4', opacity: 0.4, animation: 'floatP1 6s ease-in-out infinite' },
    { width: 8, height: 8, top: '70%', left: '8%', background: '#EA4335', opacity: 0.3, animation: 'floatP2 8s ease-in-out infinite' },
    { width: 5, height: 5, top: '40%', right: '12%', background: '#FBBC04', opacity: 0.35, animation: 'floatP3 7s ease-in-out infinite' },
    { width: 7, height: 7, top: '80%', right: '15%', background: '#34A853', opacity: 0.3, animation: 'floatP1 9s ease-in-out infinite reverse' },
    { width: 4, height: 4, top: '25%', right: '8%', background: '#4285F4', opacity: 0.25, animation: 'floatP2 5s ease-in-out infinite' },
    { width: 10, height: 10, top: '55%', left: '5%', background: '#a78bfa', opacity: 0.2, animation: 'floatP3 10s ease-in-out infinite' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 40%, #1a0a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Animated background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)',
          animation: 'blobDrift1 12s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
          animation: 'blobDrift2 15s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '20%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,168,83,0.06) 0%, transparent 70%)',
          animation: 'blobDrift1 10s ease-in-out infinite alternate reverse',
        }} />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Main card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 16, justifyContent: 'center',
          }}>
            {['#4285F4', '#EA4335', '#FBBC04', '#34A853'].map((color, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
                animation: `dotFloat 2s ease-in-out ${i * 0.15}s infinite alternate`,
              }} />
            ))}
          </div>
          <h1 style={{
            fontSize: 38, fontWeight: 900, color: 'white',
            letterSpacing: '-1.5px', lineHeight: 1,
          }}>
            TASK<span style={{
              background: 'linear-gradient(135deg, #4285F4, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>FLOW</span>
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 14, marginTop: 8, letterSpacing: '0.5px' }}>
            Login to your workspace
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: 24,
          padding: 32,
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        }}>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeField === 'email' ? 'rgba(66,133,244,0.6)' : 'rgba(148,163,184,0.12)'}`,
                    borderRadius: 12,
                    padding: '13px 16px',
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: activeField === 'email' ? '0 0 0 3px rgba(66,133,244,0.12)' : 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeField === 'password' ? 'rgba(66,133,244,0.6)' : 'rgba(148,163,184,0.12)'}`,
                    borderRadius: 12,
                    padding: '13px 44px 13px 16px',
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: activeField === 'password' ? '0 0 0 3px rgba(66,133,244,0.12)' : 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(148,163,184,0.5)', padding: 4,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(148,163,184,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(66,133,244,0.4)' : 'linear-gradient(135deg, #4285F4, #5b6ee1)',
                border: 'none',
                borderRadius: 12,
                padding: '14px',
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(66,133,244,0.4)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.3px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(66,133,244,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(66,133,244,0.4)';
              }}
            >
              {loading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>Login <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(148,163,184,0.5)', fontSize: 13 }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#60a5fa'}
            >
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blobDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes blobDrift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-30px, -40px) scale(0.95); }
        }
        @keyframes floatP1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(8px); }
        }
        @keyframes floatP2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(15px) translateX(-10px); }
        }
        @keyframes floatP3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-12px) translateX(15px); }
        }
        @keyframes dotFloat {
          from { transform: translateY(0); }
          to   { transform: translateY(-5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(148,163,184,0.35); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px rgba(15,23,42,0.9) inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}
