import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to appropriate portal
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleFillStudent = () => {
    setEmail('student@demo.com');
    setPassword('demo123');
    setErrorMessage('');
  };

  const handleFillAdmin = () => {
    setEmail('admin@demo.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="login-page-studio">
      {/* Left Botanical Art & Studio Mood Panel */}
      <div className="login-left-art-panel">
        <img
          src="/images/studio-desk.jpg"
          alt="Botanical Art Studio"
          className="login-art-bg-image"
        />

        <div className="login-left-content">
          <span className="editorial-eyebrow" style={{ color: '#D9D4CA' }}>
            STUDIO PRACTICE · BOTANICAL ART
          </span>
          <h2 className="login-studio-quote">
            "A quiet digital studio for learning art through observation, patience and practice."
          </h2>
          <span className="login-studio-author">
            BOTANICAL ART STUDIO · EST. 2024
          </span>
        </div>

        <div className="login-left-content" style={{ fontSize: 12, color: '#A9A49B' }}>
          Painting · Botanical Art · Zentangle · Line Arts
        </div>
      </div>

      {/* Right Studio Entrance Form Panel */}
      <div className="login-right-form-panel">
        <div className="login-studio-form-card">
          <div style={{ marginBottom: 20 }}>
            <span className="editorial-eyebrow">
              WELCOME BACK
            </span>
            <h1 className="login-form-title">
              Continue your practice.
            </h1>
            <p className="login-form-subtitle">
              Sign in to resume your botanical studies and studio lessons.
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error)',
                border: '1px solid var(--error-border)',
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 'var(--radius-xs)'
              }}
              role="alert"
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="studio-form-group">
              <label className="studio-form-label" htmlFor="email-input">
                Email
              </label>
              <input
                id="email-input"
                type="email"
                className="studio-form-input"
                placeholder="student@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="studio-form-group">
              <label className="studio-form-label" htmlFor="password-input">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                className="studio-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-step-inside"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Entering Studio...' : 'Step Inside'}</span>
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="demo-credentials-studio-box">
            <div className="demo-credentials-studio-header">
              Studio Demo Access
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Student Access</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>student@demo.com • demo123</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillStudent}
                  className="btn-quick-fill-studio"
                >
                  Fill Student
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Studio Admin</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>admin@demo.com • admin123</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="btn-quick-fill-studio"
                >
                  Fill Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
