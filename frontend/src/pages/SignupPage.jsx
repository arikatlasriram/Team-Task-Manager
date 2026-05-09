import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';

const ROLE_OPTIONS = [
  {
    id: 'user',
    label: 'Team Member',
    desc: 'Complete tasks assigned to you',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.25)',
    activeBorder: 'rgba(96,165,250,0.7)',
    icon: UserIcon,
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Create projects & assign tasks',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    activeBorder: 'rgba(167,139,250,0.7)',
    icon: ShieldCheck,
  },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'user' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeField, setActiveField] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      toast.success('Account created! Please sign in 🚀');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ef4444', '#f59e0b', '#10b981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const fieldStyle = (name) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${activeField === name ? 'rgba(66,133,244,0.6)' : 'rgba(148,163,184,0.12)'}`,
    borderRadius: 12,
    padding: '13px 16px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: activeField === name ? '0 0 0 3px rgba(66,133,244,0.12)' : 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  });

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
      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
          animation: 'blobDrift2 15s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(66,133,244,0.1) 0%, transparent 70%)',
          animation: 'blobDrift1 12s ease-in-out infinite alternate',
        }} />
      </div>

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Card */}
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
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, justifyContent: 'center' }}>
            {['#4285F4', '#EA4335', '#FBBC04', '#34A853'].map((color, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                backgroundColor: color, boxShadow: `0 0 8px ${color}`,
                animation: `dotFloat 2s ease-in-out ${i * 0.15}s infinite alternate`,
              }} />
            ))}
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: 'white', letterSpacing: '-1.5px', lineHeight: 1 }}>
            TASK<span style={{
              background: 'linear-gradient(135deg, #4285F4, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>FLOW</span>
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 14, marginTop: 8 }}>
            Create your free account
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                onFocus={() => setActiveField('name')}
                onBlur={() => setActiveField(null)}
                placeholder="John Doe"
                style={fieldStyle('name')}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Email Address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                onFocus={() => setActiveField('email')}
                onBlur={() => setActiveField(null)}
                placeholder="you@company.com"
                style={fieldStyle('email')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  placeholder="Min. 6 characters"
                  style={{ ...fieldStyle('password'), paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.5)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 999,
                        background: strength >= i ? strengthColors[strength] : 'rgba(148,163,184,0.15)',
                        transition: 'background 0.3s ease',
                        boxShadow: strength >= i ? `0 0 6px ${strengthColors[strength]}80` : 'none',
                      }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColors[strength], fontSize: 11, fontWeight: 700, minWidth: 36 }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.5px' }}>
                Confirm Password
              </label>
              <input
                id="confirm"
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirm}
                onChange={handleChange}
                onFocus={() => setActiveField('confirm')}
                onBlur={() => setActiveField(null)}
                placeholder="Repeat password"
                style={{
                  ...fieldStyle('confirm'),
                  border: form.confirm && form.confirm !== form.password
                    ? '1px solid rgba(239,68,68,0.6)'
                    : fieldStyle('confirm').border,
                }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>Passwords do not match</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label style={{ display: 'block', color: 'rgba(148,163,184,0.8)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.5px' }}>
                Account Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = form.role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: opt.id }))}
                      style={{
                        background: isActive ? opt.bg : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? opt.activeBorder : opt.border}`,
                        borderRadius: 12,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 16px ${opt.color}20` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Icon size={14} color={isActive ? opt.color : 'rgba(148,163,184,0.4)'} />
                        <span style={{ color: isActive ? opt.color : 'rgba(148,163,184,0.6)', fontSize: 12, fontWeight: 700 }}>
                          {opt.label}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(148,163,184,0.45)', fontSize: 10 }}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              id="signup-btn"
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
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(66,133,244,0.5)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(66,133,244,0.4)'; }}
            >
              {loading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(148,163,184,0.5)', fontSize: 13 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
              Login →
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
        @keyframes dotFloat {
          from { transform: translateY(0); }
          to   { transform: translateY(-5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder { color: rgba(148,163,184,0.35) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px rgba(15,23,42,0.9) inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}
