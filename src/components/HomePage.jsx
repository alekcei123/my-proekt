import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { couplesData } from '../couplesData';
import UserCard from './UserCard';
import MeetPlaceScreen from './MeetPlaceScreen'; 
import './HomePage.css'; 

const HomePage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = couplesData.length;

  const storedUser = JSON.parse(localStorage.getItem('currentUser'));
  const role = storedUser?.role;

  
  useEffect(() => {
    if (!couplesData || couplesData.length === 0) return;
    
    couplesData.forEach((couple) => {
      if (couple.image) {
        const img = new Image();
        img.src = couple.image;
      }
    });
  }, []);

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [total]);

  // Загрузка рекомендаций
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const currentUserId = storedUser?.id || 9;

        const res = await fetch('/api/get_recommendations.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUserId }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
          
          const filtered = data.data.filter(
            (u) => u && u.id !== currentUserId
          );
          setMatches(filtered);
          setApiError(null);
        } else {
          throw new Error('API вернул неожиданный формат данных');
        }
      } catch (err) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА API:', err);
        setApiError(err.message || 'Не удалось загрузить рекомендации');
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    if (role === 'support' || role === 'developer') {
      return;
    }
    
    loadMatches();
  }, [role, storedUser?.id]);

  if (role === 'support' || role === 'developer') {
    return (
      <main className="home-page-layout">
        <section className="card home-section">
          <h1>Панель управления</h1>
          <p>Вы вошли как {role === 'support' ? 'Поддержка' : 'Разработчик'}.</p>
          <p>Перейдите в свой раздел через меню сверху или нажмите на кнопку ниже:</p>
          <div className="hero-actions">
            <Link to={role === 'support' ? '/support' : '/developer'} className="slogan-btn primary">
              Перейти в панель
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const couple = couplesData[currentIndex];

  const handleOpenPlaceModal = () => setIsPlaceModalOpen(true);
  const handleClosePlaceModal = () => setIsPlaceModalOpen(false);

  return (
    <main className="home-page-layout">
      <section className="card home-section">
        <h1>Сайт знакомств нового поколения</h1>
        <h2>Мы учли опыт всех сайтов знакомств и создали Donskie Matches.</h2>
        
        <div className="home-nav">
          {storedUser ? (
            <>
              <Link to="/chat" className="nav-link">💬 Сообщения</Link>
              <Link to="/search" className="nav-link">🔍 Поиск</Link>
            </>
          ) : (
            <p style={{color: '#f5eded'}}>Войдите, чтобы общаться и искать анкеты.</p>
          )}
        </div>

        <div className="slideshow-container">
          <div className={`slide ${currentIndex === 0 ? 'active' : ''}`}>
            {couple && (
              <div className="story-card">
                <div className="story-image" style={{ position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={couple.image} 
                    alt={couple.name} 
                    loading="lazy" 
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      backgroundColor: '#f1f5f9',
                      display: 'block'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                </div>
                <div className="story-content">
                  <span className="tagline">{couple.tagline}</span>
                  <h3>{couple.name}</h3>
                  <p className="meta">Познакомились в {couple.year} году</p>
                  <p>{couple.description}</p>
                </div>
              </div>
            )}
          </div>
          <div className="indicators">
            {couplesData.map((_, idx) => (
              <span
                key={idx}
                className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        <div className="hero-actions">
          {!storedUser && (
            <Link to="/registration" className="slogan-btn primary">
              Присоединяйтесь к нам!
            </Link>
          )}
          
          <button 
            onClick={handleOpenPlaceModal}
            className="slogan-btn secondary"
            type="button"
          >
            🗺️ Подобрать место для свидания
          </button>
        </div>
      </section>

      <section className="matches-section">
        <header className="matches-header">
          <h2>Ваши персональные рекомендации</h2>
          <p>Люди, с которыми у вас много общего</p>
        </header>

        {loadingMatches ? (
          <div className="loading-state">Загрузка рекомендаций...</div>
        ) : apiError ? (
          <div className="error-state">
            <p>Не удалось загрузить рекомендации.</p>
            <p><strong>Ошибка:</strong> {apiError}</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="matches-grid">
            {matches.map((user) => {
              if (!user || !user.id) return null;
              // ✅ key теперь стабильный — user.id вместо Math.random()
              return <UserCard key={user.id} user={user} />;
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>Пока нет рекомендаций. Заполните анкету подробнее!</p>
          </div>
        )}
      </section>

      {isPlaceModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={handleClosePlaceModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
              width: '90%', maxWidth: '450px', position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <button 
              onClick={handleClosePlaceModal}
              style={{
                position: 'absolute', top: '12px', right: '16px',
                background: 'none', border: 'none',
                fontSize: '28px', cursor: 'pointer', color: '#333',
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            
            <h3 style={{ marginTop: 0, color: '#d32f2f' }}>Куда пойдем?</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Выбери место, чтобы предложить его в чате.</p>
            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
            
            <MeetPlaceScreen />
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;