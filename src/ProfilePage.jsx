import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserCard from './components/UserCard';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likesStats, setLikesStats] = useState({ received: 0, sent: 0, matches: 0 });
  const [mutuals, setMutuals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      navigate('/login');
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);

    fetch(`/api/get_profile.php?user_id=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data.profile);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetch(`/api/get_likes.php?user_id=${u.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const received = data.received || [];
          const sent = data.sent || [];
          const matches = data.matches || [];

          setLikesStats({
            received: received.length,
            sent: sent.length,
            matches: matches.length,
          });

          setMutuals(received.filter((x) => x.is_mutual === 1));
        }
      })
      .catch((err) => console.error(err));

    
    fetch('/api/get_recommendations.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: u.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          setRecommendations(data.data.filter((x) => x && x.id !== u.id));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingRecs(false));
  }, [navigate]);

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>

      {/* ===== ШАПКА ПРОФИЛЯ ===== */}
      <div style={{
        padding: 24, border: '1px solid #e2e8f0', borderRadius: 16,
        background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}>
        <h1 style={{ marginTop: 0 }}>Мой профиль</h1>
        <p><strong>Email:</strong> {user.email}</p>
        {profile?.city && <p><strong>Город:</strong> {profile.city}</p>}
        {profile?.age && <p><strong>Возраст:</strong> {profile.age}</p>}
        {profile?.gender && <p><strong>Пол:</strong> {profile.gender}</p>}
        {profile?.interests && <p><strong>Интересы:</strong> {profile.interests}</p>}
        {profile?.about && <p><strong>О себе:</strong> {profile.about}</p>}

        {/* СТАТИСТИКА СИМПАТИЙ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginTop: 20,
        }}>
          <div style={{ padding: 16, background: '#fef2f2', borderRadius: 12, textAlign: 'center', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: 26 }}>💌</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>{likesStats.received}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Вас лайкнули</div>
          </div>
          <div style={{ padding: 16, background: '#eff6ff', borderRadius: 12, textAlign: 'center', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: 26 }}>❤️</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{likesStats.sent}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Вы лайкнули</div>
          </div>
          <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 12, textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: 26 }}>💞</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{likesStats.matches}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Взаимных</div>
          </div>
        </div>
      </div>

      
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', margin: '24px 0' }}>
        <Link to="/my-likes" style={{ padding: '10px 24px', background: '#ec4899', color: '#fff', textDecoration: 'none', borderRadius: 40, fontWeight: 600 }}>💗 Мои симпатии</Link>
        <Link to="/chat" style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', textDecoration: 'none', borderRadius: 40, fontWeight: 600 }}>💬 Сообщения</Link>
        <Link to="/search" style={{ padding: '10px 24px', background: '#10b981', color: '#fff', textDecoration: 'none', borderRadius: 40, fontWeight: 600 }}>🔍 Поиск</Link>
        <Link to="/profile/questionnaire" style={{ padding: '10px 24px', background: '#f59e0b', color: '#fff', textDecoration: 'none', borderRadius: 40, fontWeight: 600 }}>✏️ Редактировать</Link>
      </div>

      {/* ВЗАИМНЫЕ СИМПАТИИ */}
      {mutuals.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 8 }}>💞 Взаимные симпатии</h3>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            С этими людьми можно сразу общаться
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {mutuals.map((m) => (
              <div key={m.id} style={{ textAlign: 'center', padding: 12, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', background: '#e2e8f0' }}>
                  {m.photo ? (
                    <img src={`/${m.photo}`} alt={m.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{m.username}</div>
                <Link to={`/chat/${m.id}`} style={{ display: 'block', padding: '6px 12px', background: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  💬 Написать
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      
      <section style={{ marginTop: 40 }}>
        <h3 style={{ textAlign: 'center', marginBottom: 8 }}>💫 Рекомендации для вас</h3>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          Лайкайте и пишите прямо отсюда
        </p>

        {loadingRecs ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Загрузка рекомендаций...</p>
        ) : recommendations.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>Пока нет рекомендаций</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {recommendations.map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;