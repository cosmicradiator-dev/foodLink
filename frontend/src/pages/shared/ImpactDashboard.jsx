import React from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';

export default function ImpactDashboard() {
  const { impact } = useFoodLink();

  const maxWeekly = Math.max(...impact.weeklyTrend.map((d) => d.value), 350);

  return (
    <Layout>
      <style>{`
        .metric-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
        }
        .chart-bar:hover {
          filter: brightness(1.1);
          transform: scaleY(1.03);
          transform-origin: bottom;
        }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              📊 Impact Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time analytics on campus surplus food diversion, hunger relief, and donor engagement.
            </p>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '9999px',
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#166534',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Live sync active
          </div>
        </div>

        {/* 3 Metric Cards matching Figure 7 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="metric-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#166534', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {impact.mealsSaved.toLocaleString()}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
              🍱 Meals saved
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '0.25rem' }}>
              ↑ +14% vs last week
            </div>
          </div>

          <div
            className="metric-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0284c7', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {impact.kgDiverted} kg
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
              ♻️ Food waste diverted
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, marginTop: '0.25rem' }}>
              ~1.02 tons CO₂ eq. avoided
            </div>
          </div>

          <div
            className="metric-card"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#7c3aed', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {impact.claimedRate}%
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 600, fontSize: '1rem' }}>
              ⚡ Claimed before expiry
            </div>
            <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600, marginTop: '0.25rem' }}>
              Avg claim response: 18 min
            </div>
          </div>
        </div>

        {/* 2 Columns: Chart on Left, Top Donors & Peak Hours on Right (Figure 7) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: '1.75rem',
            alignItems: 'start',
          }}
        >
          {/* Meals saved per week */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📈 Meals saved per week
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                Weekly Volume
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flex: 1,
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {impact.weeklyTrend.map((item, idx) => {
                const heightPercent = Math.max(15, (item.value / maxWeekly) * 100);
                const isCurrent = idx === impact.weeklyTrend.length - 1;

                return (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? '#ea580c' : '#1e293b' }}>
                      {item.value}
                    </span>
                    <div
                      className="chart-bar"
                      style={{
                        width: '100%',
                        maxWidth: '52px',
                        height: `${heightPercent * 2.3}px`,
                        background: isCurrent
                          ? 'linear-gradient(180deg, #ea580c 0%, #f97316 100%)'
                          : 'linear-gradient(180deg, #f97316 0%, #fb923c 100%)',
                        borderRadius: '8px 8px 0 0',
                        transition: 'all 0.3s ease',
                        boxShadow: isCurrent ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: isCurrent ? '#ea580c' : '#64748b',
                        fontWeight: isCurrent ? 800 : 500,
                        marginTop: '0.25rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
              Consistent upward trajectory across campus hostel messes and canteens
            </div>
          </div>

          {/* Right Stack: Top Donors & Peak Waste Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Donors */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                🏆 Top donors
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {impact.topDonors.map((donor, idx) => {
                  const widthPercent = Math.min(100, Math.round((donor.count / (donor.max || 600)) * 100));
                  const badges = ['🥇', '🥈', '🥉', '⭐'];

                  return (
                    <div key={donor.name}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.88rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span style={{ color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{badges[idx] || '⭐'}</span> {donor.name}
                        </span>
                        <span style={{ color: '#166534', fontWeight: 800 }}>{donor.count} meals</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #166534, #22c55e)',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peak waste hours */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                ⏰ Peak surplus hours
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {impact.peakHours.map((hour) => {
                  const widthPercent = Math.min(100, Math.round((hour.count / (hour.max || 100)) * 100));
                  return (
                    <div key={hour.label}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.88rem',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>🕒 {hour.label}</span>
                        <span style={{ color: '#0f172a', fontWeight: 800 }}>{hour.count} listings</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #ea580c, #fb923c)',
                            borderRadius: '9999px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
