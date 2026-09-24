import React, { useState } from 'react';
import "../App.css";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    gender: '',
    age: '',
    education: '',
    interests: '',
    about: '',
    birth_date: '',   // ✅ новое поле
  });
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [honeypot, setHoneypot] = useState('');
  const [agreement, setAgreement] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const maxFileSize = 5 * 1024 * 1024;
    const maxFiles = 5;

    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.type)) {
        errors.push(`«${file.name}» — недопустимый формат. Разрешены только JPG, PNG, WEBP.`);
        continue;
      }

      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        errors.push(`«${file.name}» — расширение .${ext} не поддерживается.`);
        continue;
      }

      if (file.size > maxFileSize) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        errors.push(`«${file.name}» — файл ${sizeMb} МБ, максимум 5 МБ.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > maxFiles) {
      errors.push(`Можно загрузить не более ${maxFiles} фото.`);
      setRegistrationMessage(errors.join('\n'));
      return;
    }

    if (errors.length > 0) {
      setRegistrationMessage(errors.join('\n'));
      return;
    }

    setRegistrationMessage('');
    setSelectedFiles(validFiles);
    setPreviewImages(validFiles.map(file => URL.createObjectURL(file)));
  };

  const handleRemovePhoto = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewImages(newPreviews);
  };

  // ✅ Хелпер: считает возраст по дате рождения
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      setRegistrationMessage('Ваша заявка отклонена антиспам-системой.');
      return;
    }

    if (!agreement) {
      setRegistrationMessage('Для регистрации необходимо согласие на обработку персональных данных');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setRegistrationMessage('Пожалуйста, введите корректный email');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setRegistrationMessage('Пароли не совпадают');
      return;
    }
    if (formData.password.length < 8) {
      setRegistrationMessage('Пароль должен содержать минимум 8 символов');
      return;
    }
    if (!/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      setRegistrationMessage('Пароль должен содержать хотя бы одну цифру и одну букву');
      return;
    }
    if (!formData.username.trim() || !formData.city.trim() || !formData.gender || !formData.age) {
      setRegistrationMessage('Заполните все обязательные поля');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      setRegistrationMessage('Возраст должен быть числом от 18 до 99');
      return;
    }

    // ✅ ВАЛИДАЦИЯ ДАТЫ РОЖДЕНИЯ
    if (!formData.birth_date) {
      setRegistrationMessage('Укажите дату рождения — она нужна для расчёта биоритмов');
      return;
    }
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birthDate > today) {
      setRegistrationMessage('Дата рождения не может быть в будущем');
      return;
    }
    const ageFromBirth = calculateAge(formData.birth_date);
    if (ageFromBirth === null || ageFromBirth < 18) {
      setRegistrationMessage('Регистрация доступна с 18 лет');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('city', formData.city.trim());
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('age', ageNum);
      formDataToSend.append('education', formData.education.trim());
      formDataToSend.append('interests', formData.interests.trim());
      formDataToSend.append('about', formData.about.trim());
      formDataToSend.append('agreement', agreement ? '1' : '0');
      formDataToSend.append('birth_date', formData.birth_date);   // ✅ отправляем дату

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formDataToSend.append('photos[]', file);
        });
      }

      const response = await fetch('/api/register.php', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Не удалось прочитать ответ сервера (невалидный JSON)'
      }));

      console.log('Ответ регистрации:', data);

      if (!data.success) {
        setRegistrationMessage(data.message || 'Ошибка регистрации');
        return;
      }

      if (!data.user || !data.user.email) {
        setRegistrationMessage('Ошибка: сервер не вернул данные пользователя. Проверьте register.php.');
        return;
      }

      
      const userForStorage = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role || 'user',
        city: data.user.city || null,
        is_premium: data.user.is_premium === true || data.user.is_premium === 1 ? 1 : 0,
        tariff_level: data.user.tariff_level || 0,
        birth_date: data.user.birth_date || formData.birth_date || null,
      };

      localStorage.setItem('currentUser', JSON.stringify(userForStorage));
      setRegistrationMessage('');

      alert(`🎉 Регистрация успешна! Добро пожаловать, ${data.user.username || formData.username}!`);

      window.location.href = `/profile/${data.user.email}`;

    } catch (error) {
      console.error('Ошибка сети (fetch):', error);
      setRegistrationMessage('Не удалось подключиться к серверу. Проверьте соединение.');
    }
  };

  
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="registration-form-container">
      <h2>Donskie Matches</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <input
          type="text"
          name="honeypot"
          style={{ display: 'none' }}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        <div className="form-group">
          <label htmlFor="username">Имя пользователя *</label>
          <input
            type="text" id="username" name="username"
            value={formData.username} onChange={handleChange}
            placeholder="Введите имя пользователя" required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email" id="email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="example@mail.ru" required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль *</label>
          <input
            type="password" id="password" name="password"
            value={formData.password} onChange={handleChange}
            placeholder="Минимум 8 символов, цифра и буква" required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль *</label>
          <input
            type="password" id="confirmPassword" name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Город *</label>
          <input
            type="text" id="city" name="city"
            value={formData.city} onChange={handleChange}
            placeholder="Ваш город" required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Пол *</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">-- Выберите пол --</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="age">Возраст *</label>
          <input
            type="number" id="age" name="age"
            value={formData.age} onChange={handleChange}
            min="18" max="99" required
          />
        </div>

        
        <div className="form-group">
          <label htmlFor="birth_date">Дата рождения *</label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            max={todayStr}
            required
          />
          <p className="hint" style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Нужно для расчёта биоритмов и резонанса с другими людьми
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="education">Образование</label>
          <select id="education" name="education" value={formData.education} onChange={handleChange}>
            <option value="">Выберите</option>
            <option value="Среднее">Среднее</option>
            <option value="Среднее специальное">Среднее специальное</option>
            <option value="Высшее (бакалавр)">Высшее (бакалавр)</option>
            <option value="Высшее (магистр)">Высшее (магистр)</option>
            <option value="Учёная степень">Учёная степень</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="interests">Интересы</label>
          <input
            type="text" id="interests" name="interests"
            value={formData.interests} onChange={handleChange}
            placeholder="Например: путешествия, кино, спорт"
          />
        </div>

        <div className="form-group">
          <label htmlFor="about">О себе</label>
          <textarea
            id="about" name="about"
            value={formData.about} onChange={handleChange}
            placeholder="Расскажите немного о себе" rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="photos">Загрузите фото</label>
          <input
            type="file" id="photos" name="photos"
            accept=".jpg,.jpeg,.png,.webp"
            multiple onChange={handleFileChange}
          />
          <p className="hint">
            Только JPG, PNG, WEBP. Максимум 5 фото, до 5 МБ каждое.
          </p>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox" checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)} required
            />
            <span> Я согласен на обработку персональных данных</span>
          </label>
        </div>

        {previewImages.length > 0 && (
          <div className="gallery">
            <h4>Ваши фото</h4>
            <div className="gallery-grid">
              {previewImages.map((preview, index) => (
                <div key={index} className="gallery-item">
                  <img src={preview} alt={`Фото ${index + 1}`} />
                  <span className="photo-number">{index + 1}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemovePhoto(index)}
                    title="Удалить фото"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn">Зарегистрироваться</button>
      </form>
      {registrationMessage && (
        <p className="error-message" style={{ whiteSpace: 'pre-line' }}>
          {registrationMessage}
        </p>
      )}
      <p className="required-info">* Обязательные поля</p>
    </div>
  );
}

export default RegistrationForm;