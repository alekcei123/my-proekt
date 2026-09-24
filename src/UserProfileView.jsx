import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LikeButton from './components/LikeButton';
import BiorhythmWidget from './components/BiorhythmWidget';


const PLACEHOLDER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23e2e8f0"/><circle cx="75" cy="55" r="24" fill="%2394a3b8"/><path d="M25 135 C25 105, 125 105, 125 135 Z" fill="%2394a3b8"/></svg>`;

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_AVATAR;
};

const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentUserId = currentUser?.id || null;
  const isPremium = currentUser?.is_premium === 1 || currentUser?.is_premium === true;

  useEffect(() => {
    fetch(`/api/get_user_by_id.php?user_id=${userId}`)
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.success) {
          setUserData(data.user);
        } else {
          setError('Пользователь не найден');
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки:', err);
        setError('Не удалось загрузить профиль.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>Загрузка анкеты...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!userData) return <p>Пользователь не найден</p>;

  const interestsArray = userData.interests
    ? userData.interests.split(',').map(i => i.trim())
    : [];

  const isOwnProfile = currentUserId === userData.id;

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '24px', border: '1px solid #ccc', borderRadius: '8px' }}>

      {/* Фото */}
      <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px auto', background: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img
          src={userData.photo ? '/' + userData.photo : PLACEHOLDER_AVATAR}
          alt={userData.username}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      </div>

      <h1 style={{ textAlign: 'center' }}>Анкета: {userData.username || 'Пользователь'}</h1>
      <p style={{ textAlign: 'center' }}><strong>Email:</strong> {userData.email}</p>

      <div style={{ marginTop: '20px' }}>
        {(userData.city || userData.age) && (
          <p style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            {userData.city && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>📍 {userData.city}</span>}
            {userData.age && <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>👤 {userData.age} лет</span>}
          </p>
        )}

        {userData.gender && <p style={{ textAlign: 'center' }}><strong>Пол:</strong> {userData.gender}</p>}

        {interestsArray.length > 0 && (
          <div style={{ margin: '16px 0', textAlign: 'center' }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Интересы:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {interestsArray.map((interest, idx) => (
                <span key={idx} style={{
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {userData.about && <p style={{ textAlign: 'center' }}><strong>О себе:</strong> {userData.about}</p>}
      </div>

      
      {!isOwnProfile && (
        <BiorhythmWidget
  userBirthDate={userData.birth_date}
  currentUserBirthDate={currentUser?.birth_date}
  tariffLevel={currentUser?.tariff_level || 0}
  userName={userData.username}
  onUpgrade={() => navigate('/tariffs')}
/>
      )}
      

    
      {currentUserId && !isOwnProfile && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <LikeButton
            targetUserId={userData.id}
            currentUserId={currentUserId}
            onLike={(data) => {
              if (data.match) {
                alert('💞 Взаимная симпатия! Перейдите в чат.');
              }
            }}
          />

          <Link to={`/chat/${userData.id}`} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '10px 24px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 6px rgba(40,167,69,0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
            }}>
              💬 Написать сообщение
            </button>
          </Link>
        </div>
      )}

      {!currentUserId && (
        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '24px' }}>
          Войдите, чтобы ставить лайки и писать сообщения.
        </p>
      )}

      {isOwnProfile && (
        <p style={{ textAlign: 'center', color: '#6c757d', marginTop: '24px' }}>
          Это ваш профиль. Редактировать анкету можно <Link to="/profile/questionnaire">здесь</Link>.
        </p>
      )}

      <p style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#6c757d' }}>← Назад к поиску</Link>
      </p>
    </div>
  );
};

export default UserProfileView;