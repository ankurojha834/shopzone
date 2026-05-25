import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  fontFamily: "'Outfit', sans-serif",
  transition: 'border-color .2s, background .2s',
  boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.55)',
  marginBottom: 6,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const ERR_STYLE = {
  fontSize: 12,
  color: '#fca5a5',
  marginTop: 4,
};

function FieldGroup({ label, type = 'text', value, onChange, error, placeholder, icon }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={LABEL_STYLE}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
            fontSize: 16, opacity: 0.45, pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...INPUT_STYLE,
            paddingLeft: icon ? 40 : 14,
            borderColor: error
              ? '#f87171'
              : focused
              ? 'var(--orange)'
              : 'rgba(255,255,255,0.12)',
            background: focused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
          }}
        />
      </div>
      {error && <p style={ERR_STYLE}>⚠ {error}</p>}
    </div>
  );
}

export default function AuthPanel({ onClose, onAuthSuccess }) {
  const { showToast } = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  function validate() {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'At least 6 characters';
    if (mode === 'register' && form.password !== form.confirm)
      errs.confirm = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const data = await api.auth(endpoint, body);
      showToast(
        mode === 'login' ? `Welcome back, ${data.user.name}!` : `Account created! Welcome, ${data.user.name}!`,
        'success'
      );
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
    }
    setLoading(false);
  }

  function switchMode(m) {
    setMode(m);
    setErrors({});
    setForm({ name: '', email: '', password: '', confirm: '' });
  }

  const isLogin = mode === 'login';

  return (
    <div
      className="overlay"
      onClick={onClose}
      style={{ justifyContent: 'flex-end' }}
    >
      <div
        className="panel"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #0f1923 0%, #1a2738 60%, #0f2233 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '28px 28px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 4,
            }}>
              {isLogin ? '👋 Welcome back' : '🚀 Create account'}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              {isLogin
                ? 'Sign in to your ShopZone account'
                : 'Join ShopZone and start shopping'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              borderRadius: 8,
              width: 36, height: 36,
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* ── Mode Toggle ── */}
        <div style={{
          display: 'flex',
          margin: '24px 28px 0',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: 4,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                transition: 'all .2s',
                background: mode === m ? 'var(--orange)' : 'transparent',
                color: mode === m ? 'var(--navy)' : 'rgba(255,255,255,0.5)',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}
          noValidate
        >
          {/* Name (register only) */}
          {!isLogin && (
            <FieldGroup
              label="Full Name"
              value={form.name}
              onChange={set('name')}
              placeholder="Ankur Sharma"
              error={errors.name}
              icon="👤"
            />
          )}

          <FieldGroup
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            error={errors.email}
            icon="✉"
          />

          <FieldGroup
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
            error={errors.password}
            icon="🔒"
          />

          {!isLogin && (
            <FieldGroup
              label="Confirm Password"
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat password"
              error={errors.confirm}
              icon="🔒"
            />
          )}

          {/* Forgot Password */}
          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 20 }}>
              <button
                type="button"
                style={{
                  background: 'none', border: 'none', color: 'var(--orange)',
                  fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'var(--green)' : 'var(--orange)',
              color: 'var(--navy)',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: "'Outfit', sans-serif",
              transition: 'background .2s, transform .1s',
              marginBottom: 20,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--orange-dark)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--orange)'; }}
          >
            {loading
              ? '⏳ Please wait…'
              : isLogin
              ? '🔑 Sign In'
              : '🎉 Create Account'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Social Login */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { icon: 'G', label: 'Google', bg: '#fff', color: '#1e293b' },
              { icon: 'f', label: 'Facebook', bg: '#1877f2', color: '#fff' },
            ].map(btn => (
              <button
                key={btn.label}
                type="button"
                onClick={() => showToast(`${btn.label} login coming soon!`, '')}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <span style={{
                  background: btn.bg, color: btn.color,
                  width: 20, height: 20, borderRadius: 4,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                }}>
                  {btn.icon}
                </span>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Switch mode */}
          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(isLogin ? 'register' : 'login')}
              style={{
                background: 'none', border: 'none', color: 'var(--orange)',
                fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", fontSize: 14,
              }}
            >
              {isLogin ? 'Register here' : 'Sign in here'}
            </button>
          </p>
        </form>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          fontSize: 12,
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
        }}>
          By continuing, you agree to ShopZone's Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
}
