import React, { useEffect, useState } from 'react';
import "./Panels.css";

const SupportPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  
  if (!currentUser || (currentUser.role !== 'support' && currentUser.role !== 'developer')) {
    return (
      <div className="support-panel">
        <div className="card error-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: 24, margin: '0 0 12px' }}>⛔ Доступ запрещён</h2>
          <p style={{ color: '#64748b' }}>Вы не являетесь сотрудником поддержки.</p>
        </div>
      </div>
    );
  }

  
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`/api/get_users.php?admin_id=${currentUser.id}`);
        if (!res.ok) throw new Error('Сервер не отвечает');

        const data = await res.json();

        if (data.status === 'success' && Array.isArray(data.data)) {
          const formatted = data.data.map((u) => ({
            ...u,
            complaints: u.complaints || 0,
          }));
          setUsers(formatted);
          setError(null);
        } else if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          setError(null);
        } else {
          throw new Error(data.message || 'Неверный формат данных');
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser.id]);

  
  const toggleBan = async (id) => {
    const userToUpdate = users.find((u) => u.id === id);
    if (!userToUpdate) return;

    const newIsBanned = userToUpdate.is_banned === 1 ? 0 : 1;

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_banned: newIsBanned } : u))
    );

    try {
      const res = await fetch('/api/ban_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: id,
          is_banned: newIsBanned,
          admin_id: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error('Ошибка сети');
      const data = await res.json();

      if (!data.success) {
        // Откат при ошибке
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_banned: userToUpdate.is_banned } : u))
        );
        alert('Не удалось обновить: ' + (data.message || 'Неизвестная ошибка'));
      }
    } catch (err) {
      console.error('Ошибка API:', err);
      // Откат
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_banned: userToUpdate.is_banned } : u))
      );
      alert('Ошибка соединения с сервером');
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
        display: 'inline-block',
        padding: '4px 10px',
        background: s.bg,
        color: '#fff',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    );
  };

  
  const getStatusBadge = (isBanned) => {
    if (isBanned === 1) {
      return (
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
        }}>
          🚫 Забанен
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        background: '#d1fae5',
        color: '#065f46',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
      }}>
        ✅ Активен
      </span>
    );
  };

  const activeCount = users.filter((u) => u.is_banned !== 1).length;
  const bannedCount = users.filter((u) => u.is_banned === 1).length;

  return (
    <div className="support-panel">
      <header className="support-header">
        <h1>🛡️ Панель поддержки</h1>
        <p>Управление пользователями, обработка жалоб и банов</p>
      </header>

      
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Всего пользователей</div>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Активных</div>
          </div>
        </div>

        <div className="stat-card stat-banned">
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <div className="stat-value">{bannedCount}</div>
            <div className="stat-label">Забаненных</div>
          </div>
        </div>
      </div>

      {/* ===== ТАБЛИЦА ===== */}
      {loading ? (
        <div className="card loading-state">Загрузка списка пользователей...</div>
      ) : error ? (
        <div className="card error-state">
          <p>Не удалось загрузить данные.</p>
          <p><strong>Ошибка:</strong> {error}</p>
        </div>
      ) : (
        <div className="card table-card">
          <div className="card-header">
            <h3>📋 Список пользователей</h3>
            <span className="badge-count">{users.length} записей</span>
          </div>

          <div className="table-wrapper">
            <table className="panel-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Никнейм</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Жалоб</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.is_banned === 1 ? 'row-banned' : ''}>
                    <td className="cell-id">{user.id}</td>
                    <td className="cell-username">
                      <span className="username-text">{user.username}</span>
                    </td>
                    <td className="cell-email">{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.is_banned)}</td>
                    <td className="cell-complaints">
                      {user.complaints > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>
                          ⚠️ {user.complaints}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>0</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={user.is_banned === 1 ? 'btn btn-unban' : 'btn btn-ban'}
                        onClick={() => toggleBan(user.id)}
                      >
                        {user.is_banned === 1 ? '✅ Разбанить' : '🚫 Забанить'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPanel;