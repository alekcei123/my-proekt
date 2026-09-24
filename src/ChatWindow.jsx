import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const PLACEHOLDER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill="%23e2e8f0"/><circle cx="25" cy="20" r="8" fill="%2394a3b8"/><path d="M10 45 C10 35, 40 35, 40 45 Z" fill="%2394a3b8"/></svg>`;

export function ChatWindow() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const containerRef = useRef(null);

  
  const loadMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(
        `/api/get_messages.php?user1=${currentUser.id}&user2=${userId}`
      );
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  };

  
  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/get_user_by_id.php?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOtherUser(data.user);
      })
      .catch(console.error);
  }, [userId]);

  
  useEffect(() => {
    if (!currentUser) return;

    loadMessages();

    const interval = setInterval(loadMessages, 7000);
    return () => clearInterval(interval);
  }, [userId]);

  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch('/api/send_message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: currentUser.id,
        receiver_id: parseInt(userId),
        message: newMessage.trim(),
      }),
    });

    if (res.ok) {
      setNewMessage('');
      loadMessages();
    }
  };

  
  const handleEditMessage = async (messageId, oldText) => {
    const newText = window.prompt('Изменить сообщение:', oldText);
    if (newText === null) return;           
    if (!newText.trim()) return;            
    if (newText.trim() === oldText) return; 

    try {
      const res = await fetch('/api/edit_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_id: currentUser.id,
          message: newText.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, message: data.new_text, edited: true } : m
          )
        );
      } else {
        alert('Ошибка: ' + (data.message || 'Не удалось изменить'));
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения');
    }
  };

  
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Удалить это сообщение?')) return;

    try {
      const res = await fetch('/api/delete_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_id: currentUser.id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        alert('Ошибка: ' + (data.message || 'Не удалось удалить'));
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка соединения');
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = PLACEHOLDER_AVATAR;
  };

  if (!otherUser)
    return (
      <div className="chat-page" style={{ textAlign: 'center', padding: '2rem' }}>
        Загрузка...
      </div>
    );

  return (
    <div className="chat-page">
      <div className="chat-window">
        <div className="chat-header">
          <img
            src={otherUser.photo ? '/' + otherUser.photo : PLACEHOLDER_AVATAR}
            alt=""
            className="chat-header-avatar"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
          <span className="chat-header-name">{otherUser.username}</span>
        </div>

        <div className="chat-messages" ref={containerRef}>
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`message ${isMine ? 'message-sent' : 'message-received'}`}
                style={{ position: 'relative' }}
              >
                <span>{msg.message}</span>

                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                  {msg.edited && (
                    <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                      (изменено)
                    </span>
                  )}
                </div>

                
                {isMine && (
                  <div className="message-actions">
                    <button
                      onClick={() => handleEditMessage(msg.id, msg.message)}
                      title="Редактировать"
                      className="msg-action-btn"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      title="Удалить"
                      className="msg-action-btn msg-action-delete"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
          />
          <button type="submit" className="chat-send-btn">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}