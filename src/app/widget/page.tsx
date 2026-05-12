'use client';

import { useState } from 'react';
import { BarChart3, ArrowRight } from 'lucide-react';

export default function WidgetPage() {
  const [totalSpend, setTotalSpend] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalSpend || !teamSize) return;

    const spend = Number(totalSpend);
    const team = Number(teamSize);

    setSubmitted(true);

    // Open the full audit page in a new tab after a short delay
    setTimeout(() => {
      window.open(
        `https://stackaudit.dev/?utm_source=widget&spend=${spend}&team=${team}`,
        '_blank'
      );
    }, 1500);
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: 'transparent',
      padding: '16px',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BarChart3 size={14} color="white" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'white', letterSpacing: '-0.3px' }}>
            Stack<span style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Audit</span>
          </span>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
              Are you overspending on AI tools? Find out in 10 seconds.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Total Monthly AI Spend ($)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={totalSpend}
                onChange={(e) => setTotalSpend(e.target.value)}
                required
                aria-label="Total Monthly AI Spend"
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '14px',
                  background: '#050810', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: 'white', outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Team Size
              </label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
                aria-label="Team Size"
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '14px',
                  background: '#050810', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: 'white', outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            <button type="submit" aria-label="Calculate spend per developer" style={{
              width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600,
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              Check My Spend <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{
              fontSize: '36px', fontWeight: 800, marginBottom: '4px',
              background: Number(totalSpend) / Math.max(Number(teamSize), 1) > 45
                ? 'linear-gradient(to right, #ef4444, #f97316)'
                : 'linear-gradient(to right, #10b981, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              ${Math.round(Number(totalSpend) / Math.max(Number(teamSize), 1))}/dev
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Industry average: <span style={{ color: 'white', fontWeight: 600 }}>$45/dev/mo</span>
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
              Opening full audit…
            </p>
          </div>
        )}

        <p style={{ fontSize: '10px', color: '#475569', textAlign: 'center' as const, marginTop: '12px' }}>
          Powered by <a href="https://stackaudit.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', textDecoration: 'none' }}>stackaudit.dev</a>
        </p>
      </div>
    </div>
  );
}
