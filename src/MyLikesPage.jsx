import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MyLikesPage.css';

const PLACEHOLDER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill="%23e2e8f0"/><circle cx="25" cy="20" r="8" fill="%2394a3b8"/><path d="M10 45 C10 35, 40 35, 40 45 Z" fill="%2394a3b8"/></svg>`;

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_AVATAR;
};

function MyLikesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('incoming');
  const [data, setData] = useState({
    incoming: [],
    outgoing: [],
    matches: [],
    counts: { received: 0, sent: 0, matches: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserId = useMemo(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored).id : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/');
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/get_likes.php?user_id=${currentUserId}`);
        const json = await res.json();

        if (cancelled) return;

        if (!json.success) {
          throw new Error(json.message || 'Ошибка загрузки');
        }

        setData({
          incoming: json.received || [],
          outgoing: json.sent || [],
          matches: json.matches || [],
          counts: json.counts || { received: 0, sent: 0, matches: 0 },
        });
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, navigate]);

  if (!currentUserId) return null;

  const list = tab === 'incoming' ? data.incoming : data.outgoing;

  return (
    <div className="my-likes-container">
      <div className="my-likes-header">
        <h1>💗 Мои симпатии</h1>
        <p>Здесь вы можете посмотреть, кто вас лайкнул и кого лайкнули вы</p>
      </div>

      <div className="likes-stats">
        <div className="stat-card">
          <span className="stat-icon">💌</span>
          <span className="stat-value">{data.counts.received || 0}</span>
          <span className="stat-label">Вас лайкнули</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{data.counts.sent || 0}</span>
          <span className="stat-label">Вы лайкнули</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🤝</span>
          <span className="stat-value">{data.counts.matches || 0}</span>
          <span className="stat-label">Взаимно</span>
        </div>
      </div>

      <div className="likes-tabs">
        <button
          className={`tab-btn ${tab === 'incoming' ? 'active' : ''}`}
          onClick={() => setTab('incoming')}
        >
          💌 Кто лайкнул вас ({data.counts.received || 0})
        </button>
        <button
          className={`tab-btn ${tab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setTab('outgoing')}
        >
          ❤️ Кого лайкнули вы ({data.counts.sent || 0})
        </button>
      </div>

      {loading ? (
        <p className="likes-loading">Загрузка...</p>
      ) : error ? (
        <p className="likes-error">Ошибка: {error}</p>
      ) : list.length === 0 ? (
        <p className="likes-empty">
          {tab === 'incoming'
            ? 'Пока вас никто не лайкнул. Заполните профиль и добавьте фото, чтобы привлекать внимание!'
            : 'Вы ещё никого не лайкнули. Зайдите в поиск и найдите интересных людей!'}
        </p>
      ) : (
        <div className="likes-grid">
          {list.map((user) => (
            <Link
              key={`${user.id}-${user.liked_at || ''}`}
              to={`/user/${user.id}`}
              className="like-card"
            >
              <div className="like-photo">
                <img
                  src={user.photo ? `/${user.photo}` : PLACEHOLDER_AVATAR}
                  alt={user.username}
                  onError={handleImageError}
                  loading="lazy"
                  decoding="async"
                />
                {user.is_mutual === 1 && (
                  <span className="mutual-badge">🤝 Взаимно</span>
                )}
              </div>
              <div className="like-info">
                <h3>{user.username}</h3>
                <p>
                  {user.city}
                  {user.age ? `, ${user.age} лет` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="likes-back">
        <Link to={`/profile`} className="back-btn">
          ← Вернуться в профиль
        </Link>
      </div>
    </div>
  );
}

export default MyLikesPage;