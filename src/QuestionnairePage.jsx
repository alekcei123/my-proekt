import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionnairePage = () => {
  const [formData, setFormData] = useState({
    city: '',
    age: 0,
    interests: '',
    about: '',
    gender: 'other',
    birth_date: '',          // ✅ новое поле
  });
  const [status, setStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(stored);
    setUserId(user.id);
    setUserEmail(user.email);

    fetch(`/api/get_profile.php?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.profile) {
          setFormData({
            ...data.profile,
            birth_date: data.profile.birth_date || user.birth_date || '',
          });
        }
      })
      .catch(() => {});
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      return;
    }

    // ✅ Валидация даты рождения
    if (!formData.birth_date) {
      alert('Укажите дату рождения — она нужна для расчёта биоритмов');
      return;
    }
    const bd = new Date(formData.birth_date);
    if (bd > new Date()) {
      alert('Дата рождения не может быть в будущем');
      return;
    }

    const payload = {
      user_id: userId,
      city: formData.city,
      age: parseInt(formData.age) || 0,
      interests: formData.interests,
      about: formData.about,
      gender: formData.gender,
      birth_date: formData.birth_date,
    };

    setStatus('saving');

    try {
      const res = await fetch('/api/save_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error('Server error:', data);
        alert('Ошибка: ' + (data.debug_message || data.error || data.message || 'Неизвестная ошибка'));
        setStatus(null);
        return;
      }

      
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('currentUser') || '{}'),
        birth_date: formData.birth_date,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      alert('Анкета сохранена!');
      setStatus(null);

      if (userEmail) {
        navigate(`/profile/${userEmail}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Ошибка сети. Проверьте подключение к серверу.');
      setStatus(null);
    }
  };

  
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{formData.city || formData.about ? 'Редактировать анкету' : 'Заполните анкету'}</h2>
      {status && status !== 'saving' && <p style={{ color: 'red' }}>{status}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Город *</label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Возраст *</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData(prev => ({ ...prev, age: Number(e.target.value) }))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            min="18"
            max="99"
            required
          />
        </div>

        
        <div style={{ marginBottom: '12px' }}>
          <label>Дата рождения *</label>
          <input
            type="date"
            required
            value={formData.birth_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
            max={todayStr}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          <small style={{ color: '#64748b', fontSize: 12 }}>
            Нужна для расчёта биоритмов и резонанса
          </small>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Пол *</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
            <option value="other">Другой</option>
          </select>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>Интересы (через запятую):</label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label>О себе:</label>
          <textarea
            value={formData.about}
            onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
            rows="4"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'saving'}
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {status === 'saving' ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
};

export default QuestionnairePage;