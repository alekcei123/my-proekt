import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const PLACEHOLDER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill="%23e2e8f0"/><circle cx="25" cy="20" r="8" fill="%2394a3b8"/><path d="M10 45 C10 35, 40 35, 40 45 Z" fill="%2394a3b8"/></svg>`;

export function ChatList() {
  const [dialogs, setDialogs] = useState([]);
  const userId = JSON.parse(localStorage.getItem('currentUser'))?.id;

  useEffect(() => {
    if (!userId) return;

    const loadDialogs = async () => {
      try {
        const res = await fetch(`/api/get_dialogs.php?user_id=${userId}`);
        const data = await res.json();
        if (data.success) setDialogs(data.dialogs);
      } catch (err) {
        console.error('Ошибка загрузки диалогов:', err);
      }
    };

    loadDialogs();

    const timer = setInterval(loadDialogs, 15000);
    return () => clearInterval(timer);
  }, [userId]);

  const handleImageError = (e) => {
    e.target.onerror = null;               
    e.target.src = PLACEHOLDER_AVATAR;     
  };

  return (
    <div className="chat-page">
      <div className="dialogs-list">
        <div className="dialogs-header">💬 Мои диалоги</div>
        {dialogs.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
            Нет сообщений
          </div>
        )}
        {dialogs.map((d) => (
          <Link to={`/chat/${d.other_user}`} key={d.other_user} className="dialog-item">
            <img
              src={d.photo ? '/' + d.photo : PLACEHOLDER_AVATAR}
              alt=""
              className="dialog-avatar"
              onError={handleImageError}
              loading="lazy"
              decoding="async"
            />
            <div className="dialog-info">
              <div className="dialog-name">{d.username}</div>
              <div className="dialog-last-msg">{d.last_message || '…'}</div>
            </div>
            <div className="dialog-time">
              {d.last_time ? new Date(d.last_time).toLocaleTimeString() : ''}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}