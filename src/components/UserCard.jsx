import React from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';

const getAgeText = (age) => {
  if (!age) return 'возраст не указан';
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return `${age} лет`;
  if (lastDigit === 1) return `${age} год`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${age} года`;
  return `${age} лет`;
};

const UserCard = ({ user, commonInterests }) => {
  console.log('🔍 ДАННЫЕ В USERCARD:', user);
  const interests = user.interests || (commonInterests && commonInterests[user.id]) || [];
  const imageSrc = user.photo ? user.photo : null;

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentUserId = currentUser?.id || null;

  const placeholderSvg = `data:image/svg+xml;utf8,<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" fill="%23e2e8f0"/><path d="M150 120C133.431 120 120 133.431 120 150C120 166.569 133.431 180 150 180C166.569 180 180 166.569 180 150C180 133.431 166.569 120 150 120ZM150 130C138.954 130 130 138.954 130 150C130 161.046 138.954 170 150 170C161.046 170 170 161.046 170 150C170 138.954 161.046 130 150 130ZM150 220C133.431 220 120 233.431 120 250C120 266.569 133.431 280 150 280C166.569 280 180 266.569 180 250C180 233.431 166.569 220 150 220ZM150 230C138.954 230 120 238.954 120 250C120 261.046 138.954 270 150 270C161.046 270 170 261.046 170 250C170 238.954 161.046 230 150 230Z" fill="%2394a3b8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="Arial" font-size="24" font-weight="bold">Нет фото</text></svg>`;

  return (
    <article style={{
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '320px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        height: '400px',
        position: 'relative',
        background: '#f1f5f9',
        overflow: 'hidden'
      }}>
        <img 
          src={imageSrc || placeholderSvg}
          alt={user.username || 'Профиль'}
          loading="lazy" 
          decoding="async"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: 'transform 0.3s ease',
            display: 'block'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderSvg;
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        />
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          color: '#1e293b',
          fontSize: '20px',
          fontWeight: '700'
        }}>
          {user.username}
        </h3>
        
        <p style={{
          margin: '0 0 16px 0',
          color: '#64748b',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {user.city || 'Город не указан'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            👤 {getAgeText(user.age)}
          </span>
        </p>

        {interests.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
            maxHeight: '80px',
            overflow: 'hidden'
          }}>
            {interests.map((interest, idx) => (
              <span key={idx} style={{
                backgroundColor: '#eff6ff',
                color: '#3b82f6',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {interest}
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '8px'
        }}>
          {/* Кнопка лайка */}
          {currentUserId && currentUserId !== user.id && (
            <LikeButton
              targetUserId={user.id}
              currentUserId={currentUserId}
              onLike={(data) => {
                if (data.match) {
                  alert('💞 Взаимная симпатия! Перейдите в чат.');
                }
              }}
            />
          )}

          {currentUserId && currentUserId !== user.id && (
            <Link 
              to={`/chat/${user.id}`} 
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <button style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
              }}>
                💬 Написать
              </button>
            </Link>
          )}

          
          <Link to={`/user/${user.id}`} style={{ textDecoration: 'none', display: 'block' }}>
            <button style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}>
              Посмотреть профиль
            </button>
          </Link>
        </div>
        {/* ===================== */}
      </div>
    </article>
  );
};

export default UserCard;