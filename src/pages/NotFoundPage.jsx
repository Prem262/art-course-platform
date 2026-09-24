import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
      <FileQuestion size={36} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
      <span className="editorial-eyebrow">404 ERROR</span>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginTop: 8, marginBottom: 12 }}>
        Page Not Found
      </h2>
      <p className="text-secondary" style={{ fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        The studio page or resource you are looking for does not exist or may have been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn btn-primary"
        style={{ padding: '12px 28px' }}
      >
        Return to Studio
      </button>
    </div>
  );
};
