import React, { useState } from 'react';
import './ContactsPage.css';

export function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h1>📞 Контакты</h1>
        <p>Свяжитесь с нами по любым вопросам. Мы всегда рады помочь!</p>
      </div>

      <form className="contacts-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Ваше имя</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Иван Иванов"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="ivan@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="message">Сообщение</label>
          <textarea
            id="message"
            name="message"
            placeholder="Напишите ваш вопрос..."
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="contacts-submit">
          {sent ? '✅ Отправлено!' : 'Отправить'}
        </button>
      </form>

      <div className="contacts-info">
        <h3>Другие способы связи</h3>
        <div className="contacts-info-row">
          <strong>Телефон:</strong> +7 850 302-45-11
        </div>
        <div className="contacts-info-row">
          <strong>Email:</strong> info@site.ru
        </div>
        <div className="contacts-info-row">
          <strong>Мы в соцсетях:</strong> Telegram, VK
        </div>
      </div>
    </div>
  );
}