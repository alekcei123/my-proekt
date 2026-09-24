import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';

import { YMInitializer } from 'react-yandex-metrika';

import RegistrationForm from './components/RegistrationForm';
import HomePage from './components/HomePage';
import { TariffsPage } from './TariffsPage';
import { TariffDetailPage } from './TariffDetailPage';
import ProfilePage from './ProfilePage';
import QuestionnairePage from './QuestionnairePage';
import MeetPlaceScreen from './components/MeetPlaceScreen';
import UserProfileView from './UserProfileView';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import SearchPage from './SearchPage';
import SupportPanel from './components/SupportPanel';
import DevPanel from './components/DevPanel';

import LoginPage from './components/LoginPage';
import MyLikesPage from './MyLikesPage';

import { resetLikesCache } from './components/LikeButton';

import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { ContactsPage } from './pages/ContactsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    resetLikesCache();
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isUserRole =
    currentUser?.role === 'user' ||
    currentUser?.role === 'support' ||
    currentUser?.role === 'developer';

  return (
    <div className='App'>

      <YMInitializer
        accounts={[112887943]}
        options={{
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          trackHash: true,
        }}
      />

      <header className='main-header fixed'>
        <div className='container header-flex'>
          <Link to='/' className='logo' title='На главную'>
            <span>Donskie Matches</span>
          </Link>

          <nav className='desktop-nav'>
            <ul className='nav-list'>
              <li><Link to='/' className='nav-link'>🏠 Главная</Link></li>
              {!currentUser && <li><Link to='/registration' className='nav-link'>✍️ Регистрация</Link></li>}
              <li><Link to='/tariffs' className='nav-link'>💎 Тарифы</Link></li>
              <li><Link to='/contacts' className='nav-link'>📞 Контакты</Link></li>
              {!currentUser && <li><Link to='/login' className='nav-link login-nav-link'>🔑 Войти</Link></li>}
              {isUserRole && (
                <>
                  <li><Link to='/chat' className='nav-link'>💬 Сообщения</Link></li>
                  <li><Link to='/search' className='nav-link'>🔍 Поиск</Link></li>
                  <li><Link to='/my-likes' className='nav-link'>💗 Симпатии</Link></li>
                </>
              )}
              {currentUser?.role === 'support' && (
                <li><Link to='/support' className='nav-link'>🛡️ Панель поддержки</Link></li>
              )}
              {currentUser?.role === 'developer' && (
                <li><Link to='/developer' className='nav-link'>⚙️ Панель разработчика</Link></li>
              )}
            </ul>
          </nav>

          
          <div className='login-form'>
            {currentUser ? (
              <button className="header-login-btn" onClick={handleLogout}>
                Выйти ({currentUser.email})
              </button>
            ) : null}
          </div>

          
          {currentUser ? (
            <button
              className='mobile-quick-logout'
              onClick={handleLogout}
              aria-label='Выйти из аккаунта'
              title='Выйти'
            >
              🚪
            </button>
          ) : (
            <Link
              to='/login'
              className='mobile-quick-login'
              aria-label='Войти в аккаунт'
              title='Войти'
            >
              🔑
            </Link>
          )}

          {/* Бургер */}
          <button
            className='burger-btn'
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label='Меню'
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        
        {mobileMenuOpen && (
          <>
            <div className='mobile-overlay' onClick={() => setMobileMenuOpen(false)} />
            <nav className='mobile-nav'>
              {currentUser && (
                <div className='mobile-user-info'>
                  <div className='mobile-user-name'>👤 {currentUser.username || 'Пользователь'}</div>
                  <div className='mobile-user-email'>{currentUser.email}</div>
                </div>
              )}

              <Link to='/' className='mobile-nav-link'>🏠 Главная</Link>
              {!currentUser && <Link to='/registration' className='mobile-nav-link'>✍️ Регистрация</Link>}
              <Link to='/tariffs' className='mobile-nav-link'>💎 Тарифы</Link>
              <Link to='/contacts' className='mobile-nav-link'>📞 Контакты</Link>

              {isUserRole && (
                <>
                  <Link to='/chat' className='mobile-nav-link'>💬 Сообщения</Link>
                  <Link to='/search' className='mobile-nav-link'>🔍 Поиск</Link>
                  <Link to='/my-likes' className='mobile-nav-link'>💗 Симпатии</Link>
                </>
              )}

              {currentUser?.role === 'support' && (
                <Link to='/support' className='mobile-nav-link'>🛡️ Панель поддержки</Link>
              )}
              {currentUser?.role === 'developer' && (
                <Link to='/developer' className='mobile-nav-link'>⚙️ Панель разработчика</Link>
              )}

              {!currentUser && (
                <Link to='/login' className='mobile-nav-link mobile-nav-login'>🔑 Войти</Link>
              )}

              {currentUser && (
                <button className='mobile-logout-btn' onClick={handleLogout}>
                  🚪 Выйти
                </button>
              )}
            </nav>
          </>
        )}
      </header>

      <main>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/registration' element={<RegistrationForm />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/tariffs' element={<TariffsPage />} />
          <Route path='/tariff/:id' element={<TariffDetailPage />} />
          <Route path="/profile/:email" element={<ProfilePage />} />
          <Route path="/profile/questionnaire" element={<QuestionnairePage />} />
          <Route path="/meet-place" element={<MeetPlaceScreen />} />
          <Route path="/user/:userId" element={<UserProfileView />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:userId" element={<ChatWindow />} />
          <Route path="/search" element={<SearchPage />} />

          <Route path="/my-likes" element={
            currentUser ? <MyLikesPage /> : <Navigate to="/login" replace />
          } />

          <Route path="/support" element={
            <ProtectedRoute allowedRoles={['support', 'developer']}>
              <SupportPanel />
            </ProtectedRoute>
          } />
          <Route path="/developer" element={
            <ProtectedRoute allowedRoles={['developer']}>
              <DevPanel />
            </ProtectedRoute>
          } />

          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>

      <footer className='main-footer'>
        <div className='container'>
          <div className='footer-grid'>
            <div className='footer-brand'>
              <div className='logo'>Donskie Matches</div>
              <p>Сайт знакомств нового поколения!</p>
            </div>
            <nav className='footer-nav'>
              <h4>Навигация</h4>
               <Link to='/' className='footer-link'>Главная</Link>
               {!currentUser && <Link to='/registration' className='footer-link'>Регистрация</Link>}
               {!currentUser && <Link to='/login' className='footer-link'>Войти</Link>}
               <Link to='/contacts' className='footer-link'>Контакты</Link>
            </nav>
            <div className='footer-contacts'>
              <h4>Контакты</h4>
              <p>Тел.: +7 850 302-45-11</p>
              <p>Email: info@site.ru</p>
            </div>
            <div className='footer-social'>
              <h4>Мы в соцсетях</h4>
              <a href='#' aria-label='Telegram'>Telegram</a>
              <a href='#' aria-label='VK'>VK</a>
            </div>
          </div>
          <div className='footer-bottom'>
            <div className="legal-links">
              <Link to="/privacy">Политика конфиденциальности</Link>
              <span>|</span>
              <Link to="/terms">Соглашение</Link>
              <span>|</span>
              <Link to="/contacts">Связаться с нами</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;