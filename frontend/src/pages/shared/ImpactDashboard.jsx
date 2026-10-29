import React from 'react';
import Layout from '../../components/layout/Layout';
import { useFoodLink } from '../../context/FoodLinkContext';

export default function ImpactDashboard() {
  const { impact } = useFoodLink();

  const maxWeekly = Math.max(...impact.weeklyTrend.map((d) => d.value), 350);

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
            Impact Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Updates live whenever a donor confirms a pickup. Baseline figures are sample values.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
              {impact.mealsSaved.toLocaleString()}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem' }}>
              Meals saved
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
              {impact.kgDiverted}
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem' }}>
              Kg diverted
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: '2.75rem', fontWeight: 800, color: '#166534', lineHeight: 1.1 }}>
              {impact.claimedRate}%
            </div>
            <div style={{ color: '#64748b', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem' }}>
              Claimed before expiry
            </div>
          </div>
        </div>

        {/* 2 Columns: Chart on Left, Top Donors & Peak Hours on Right */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Meals saved per week */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '2rem' }}>
              Meals saved per week
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1rem',
                flex: 1,
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {impact.weeklyTrend.map((item) => {
                const heightPercent = Math.max(15, (item.value / maxWeekly) * 100);
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
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                      {item.value}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '56px',
                        height: `${heightPercent * 2.2}px`,
                        backgroundColor: '#f97316',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Stack: Top Donors & Peak Waste Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Donors */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                Top donors
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {impact.topDonors.map((donor) => {
                  const widthPercent = Math.min(100, Math.round((donor.count / (donor.max || 600)) * 100));
                  return (
                    <div key={donor.name}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{donor.name}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{donor.count}</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            backgroundColor: '#166534',
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
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                Peak waste hours
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {impact.peakHours.map((hour) => {
                  const widthPercent = Math.min(100, Math.round((hour.count / (hour.max || 100)) * 100));
                  return (
                    <div key={hour.label}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span style={{ color: '#0f172a', fontWeight: 600 }}>{hour.label}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{hour.count}</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '10px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            backgroundColor: '#166534',
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

