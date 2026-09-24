import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LikeButton.css';

let likesCache = {
  userId: null,
  sentIds: new Set(),
  pending: null,
};

export const resetLikesCache = () => {
  likesCache = { userId: null, sentIds: new Set(), pending: null };
};

const fetchSentLikes = async (userId) => {
  if (likesCache.userId === userId && likesCache.sentIds.size >= 0) {
    return likesCache.sentIds;
  }

  if (likesCache.pending && likesCache.userId === userId) {
    return likesCache.pending;
  }

  likesCache.userId = userId;

  likesCache.pending = (async () => {
    try {
      const res = await fetch(`/api/get_likes.php?user_id=${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.sent)) {
        likesCache.sentIds = new Set(data.sent.map((item) => item.id));
      }
    } catch (e) {
      console.error('Ошибка загрузки лайков:', e);
    } finally {
      likesCache.pending = null;
    }
    return likesCache.sentIds;
  })();

  return likesCache.pending;
};

const LikeButton = ({ targetUserId, currentUserId, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [match, setMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const checkLike = async () => {
      const sentIds = await fetchSentLikes(currentUserId);
      if (!cancelled) {
        setLiked(sentIds.has(targetUserId));
      }
    };

    if (currentUserId && targetUserId) {
      checkLike();
    }

    return () => {
      cancelled = true;
    };
  }, [currentUserId, targetUserId]);

  
  const handleUnlike = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/unlike_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          target_user_id: targetUserId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setLiked(false);
        setMatch(false);
        // Убираем из кэша
        likesCache.sentIds.delete(targetUserId);
      } else {
        alert('Ошибка: ' + (data.message || 'Не удалось убрать лайк'));
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось убрать лайк. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleLike = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/like_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liker_id: currentUserId,
          liked_id: targetUserId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLiked(true);
        likesCache.sentIds.add(targetUserId);

        if (data.match) {
          setMatch(true);
          alert('🎉 Взаимная симпатия! Перейдите в чат, чтобы познакомиться.');
        }
        if (onLike) onLike(data);
      } else {
        alert(data.message || 'Ошибка при лайке');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось поставить лайк. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleClick = () => {
    if (loading) return;
    if (liked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  return (
    <div className="like-button-wrapper">
      <button
        className={`like-btn ${liked ? 'liked' : ''} ${match ? 'match' : ''}`}
        onClick={handleClick}
        disabled={loading}
        title={liked ? 'Нажмите, чтобы убрать лайк' : 'Поставить лайк'}
      >
        {loading
          ? '⏳'
          : liked
          ? match
            ? '💞 Взаимно!'
            : '❤️ Убрать'
          : '🤍 Лайк'}
      </button>
      {match && <div className="match-badge">💞 Взаимная симпатия!</div>}
    </div>
  );
};

export default LikeButton;