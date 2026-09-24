import React, { useMemo } from 'react';
import { getResonance, getResonanceCalendar, getBestDay } from '../utils/biorhythm';

export default function BiorhythmWidget({
  userBirthDate,
  currentUserBirthDate,
  tariffLevel = 0,       
  userName,
  onUpgrade,
}) {
  const todayResonance = useMemo(
    () => getResonance(userBirthDate, currentUserBirthDate),
    [userBirthDate, currentUserBirthDate]
  );

  const calendar = useMemo(
    () => getResonanceCalendar(userBirthDate, currentUserBirthDate, 30),
    [userBirthDate, currentUserBirthDate]
  );

  const bestDay = useMemo(
    () => (calendar && calendar.length > 0 ? getBestDay(calendar) : null),
    [calendar]
  );

  
  if (!userBirthDate || !currentUserBirthDate) {
    return null;
  }

  if (tariffLevel < 1) {
    return (
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginTop: 24 }}>
        <div
          style={{
            filter: 'blur(8px)',
            padding: 24,
            background: 'linear-gradient(135deg,#a78bfa,#60a5fa)',
            color: 'white',
          }}
        >
          <h3 style={{ margin: 0 }}>💫 Резонанс с {userName}</h3>
          <div style={{ fontSize: 48, fontWeight: 800 }}>78%</div>
          <div>Биоритмическая совместимость</div>
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <div style={{ fontSize: 40 }}>💎</div>
          <h3 style={{ margin: '8px 0' }}>Резонанс биоритмов</h3>
          <p style={{ color: '#475569', marginBottom: 16, maxWidth: 320 }}>
            Узнайте, насколько ваши ритмы совпадают с {userName}
          </p>
          <button
            onClick={onUpgrade}
            style={{
              padding: '10px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💫 Резонанс — 499 ₽
          </button>
        </div>
      </div>
    );
  }

  const color =
    todayResonance >= 70 ? '#10b981' : todayResonance >= 40 ? '#f59e0b' : '#ef4444';

  const label =
    todayResonance >= 70
      ? '🟢 Идеальный день для свидания'
      : todayResonance >= 40
      ? '🟡 Нейтральный день'
      : '🔴 Лучше отложить встречу';

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        marginTop: 24,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
      }}
    >
      {/* Верх — процент резонанса */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#1e293b' }}>💫 Резонанс с {userName}</h3>
        <div style={{ fontSize: 32, fontWeight: 800, color }}>{todayResonance}%</div>
      </div>
      <div
        style={{
          marginTop: 12,
          padding: '12px 16px',
          background: '#f8fafc',
          borderRadius: 8,
          fontSize: 15,
          color: '#475569',
        }}
      >
        <strong>{label}</strong>
      </div>

     
      {tariffLevel >= 2 && bestDay && (
        <>
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: '#ecfdf5',
              borderRadius: 8,
              fontSize: 15,
            }}
          >
            <div style={{ color: '#065f46', fontSize: 13 }}>✨ Лучший день для свидания</div>
            <div style={{ color: '#059669', fontWeight: 700, fontSize: 16 }}>
              {bestDay.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} — {bestDay.resonance}%
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              Прогноз на 30 дней:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
              {calendar.map((day, i) => (
                <div
                  key={i}
                  title={`${day.date.toLocaleDateString('ru-RU')}: ${day.resonance}%`}
                  style={{
                    aspectRatio: 1,
                    borderRadius: 6,
                    background:
                      day.rating === 'good'
                        ? '#10b981'
                        : day.rating === 'bad'
                        ? '#ef4444'
                        : '#f59e0b',
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              🟢 удачные дни · 🟡 нейтральные · 🔴 диссонанс
            </div>
          </div>
        </>
      )}
    </div>
  );
}