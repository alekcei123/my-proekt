import React, { useEffect, useState } from 'react';
import './Panels.css';

const DevPanel = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('stats');

  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  
  if (!currentUser || currentUser.role !== 'developer') {
    return (
      <div className="panel-container">
        <div className="card error-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: 24, margin: '0 0 12px' }}>⛔ Доступ запрещён</h2>
          <p style={{ color: '#64748b' }}>Только разработчик может открыть эту панель.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const load = async () => {
      try {
        
        const statsRes = await fetch(`/api/get_dev_stats.php?admin_id=${currentUser.id}`);
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setRecentUsers(statsData.recent_users || []);
        } else {
          throw new Error(statsData.message || 'Ошибка статистики');
        }

        
        const usersRes = await fetch(`/api/get_users.php?admin_id=${currentUser.id}`);
        const usersData = await usersRes.json();
        if (usersData.status === 'success' && Array.isArray(usersData.data)) {
          setUsers(usersData.data);
        } else if (usersData.success && Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser.id]);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Сменить роль пользователя на "${newRole}"?`)) return;

    try {
      const res = await fetch('/api/set_role.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: currentUser.id,
          user_id: userId,
          role: newRole,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert('Ошибка: ' + data.message);
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      developer: { bg: '#7c3aed', label: '⚙️ Разработчик' },
      support:   { bg: '#0891b2', label: '🛡️ Поддержка' },
      user:      { bg: '#10b981', label: '👤 Пользователь' },
    };
    const s = styles[role] || styles.user;
    return (
      <span style={{
        display: 'inline-block', padding: '4px 10px',
        background: s.bg, color: '#fff', borderRadius: 999,
        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="panel-container">
      <header className="panel-header">
        <div>
          <h1 style={{ margin: 0, color: '#1e293b' }}>⚙️ Панель разработчика</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '5px 0 0' }}>
            Управление системой, роли и метрики
          </p>
        </div>
      </header>

      {/* Табы */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap',
      }}>
        <button
          onClick={() => setTab('stats')}
          style={{
            padding: '10px 20px',
            background: tab === 'stats' ? '#7c3aed' : '#fff',
            color: tab === 'stats' ? '#fff' : '#475569',
            border: '2px solid #7c3aed',
            borderRadius: 8, fontWeight: 600, cursor: 'pointer',
          }}
        >
          📊 Статистика
        </button>
        <button
          onClick={() => setTab('users')}
          style={{
            padding: '10px 20px',
            background: tab === 'users' ? '#7c3aed' : '#fff',
            color: tab === 'users' ? '#fff' : '#475569',
            border: '2px solid #7c3aed',
            borderRadius: 8, fontWeight: 600, cursor: 'pointer',
          }}
        >
          👥 Пользователи ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="card loading-state">Загрузка...</div>
      ) : error ? (
        <div className="card error-state">
          <p>Ошибка: {error}</p>
        </div>
      ) : (
        <>
          {/* Вкладка «Статистика» */}
          {tab === 'stats' && stats && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16, marginBottom: 32,
              }}>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>👥</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#3b82f6' }}>{stats.users_total}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Всего пользователей</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>✅</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>{stats.users_active}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Активных</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>🚫</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444' }}>{stats.users_banned}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Забаненных</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>💎</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#f59e0b' }}>{stats.premium}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Premium</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>💬</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#0891b2' }}>{stats.messages_total}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Всего сообщений</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>❤️</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#ec4899' }}>{stats.likes_total}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Всего лайков</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>💞</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#22c55e' }}>{stats.matches_total}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Взаимных</div>
                </div>
              </div>

              <div className="card" style={{ padding: 20, marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>📈 Активность сегодня</h3>
                <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Новых пользователей</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>+{stats.users_today}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Новых сообщений</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#0891b2' }}>+{stats.messages_today}</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>🆕 Последние регистрации</h3>
                <table className="panel-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Никнейм</th>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Вкладка «Пользователи» */}
          {tab === 'users' && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>👥 Управление ролями</h3>
              <table className="panel-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Никнейм</th>
                    <th>Email</th>
                    <th>Текущая роль</th>
                    <th>Изменить роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        {u.id === currentUser.id ? (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>— это вы —</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{
                              padding: '6px 10px',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: 8,
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="user">👤 Пользователь</option>
                            <option value="support">🛡️ Поддержка</option>
                            <option value="developer">⚙️ Разработчик</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DevPanel;
