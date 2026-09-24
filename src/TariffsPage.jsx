import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './PaymentModal';

export function TariffsPage() {
  const [status, setStatus] = useState('Загрузка тарифов...');
  const [tariffs, setTariffs] = useState([]);
  const [error, setError] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);

  const [selectedTariff, setSelectedTariff] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const navigate = useNavigate();
  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    loadTariffs();
  }, []);

  const loadTariffs = async () => {
    setStatus('Загрузка тарифов...');
    setError(null);
    try {
      const response = await fetch('/api/tariffs.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const text = await response.text();

      if (text.trim().startsWith('<')) {
        throw new Error('Сервер вернул HTML вместо JSON. Проверьте URL и логи PHP.');
      }

      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.message || 'Ошибка на стороне сервера');
      setTariffs(data.data || []);
      setStatus(`Тарифы успешно загружены (${(data.data || []).length} шт.)`);
    } catch (err) {
      setError(err);
      setStatus('Ошибка загрузки');
    }
  };

  const handleBuyTariff = (tariff) => {
    if (!currentUser) {
      alert('Сначала войдите в аккаунт!');
      navigate('/login');
      return;
    }

    setSelectedTariff(tariff);
    setIsPaymentOpen(true);
  };

  
  const handlePaymentSuccess = async (tariffFromModal) => {
    const tariffToActivate = tariffFromModal || selectedTariff;

    setIsPaymentOpen(false);
    if (!tariffToActivate) return;

    setLoadingPay(true);
    try {
      const response = await fetch('/api/activate_premium.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          tariff_id: tariffToActivate.id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        
        const updatedUser = {
          ...currentUser,
          is_premium: 1,
          tariff_level: data.tariff_level ?? 1,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        alert('🎉 ' + (data.message || 'Подписка активирована!'));

        navigate('/search');
      } else {
        alert('Ошибка: ' + data.message);
      }
    } catch (error) {
      console.error('Ошибка активации:', error);
      alert('Ошибка соединения с сервером.');
    } finally {
      setLoadingPay(false);
      setSelectedTariff(null);
    }
  };

  if (error) {
    return (
      <div className="tariff-container">
        <h2>Тарифы сайта знакомств</h2>
        <div id="status">{status}</div>
        <p className="error-message">Не удалось загрузить тарифы: {error.message}</p>
        <button className="btn" onClick={loadTariffs}>Обновить тарифы</button>
      </div>
    );
  }

  return (
    <div className="tariff-container">
      <h2>Тарифы сайта знакомств</h2>
      <div id="status">{status}</div>

      <div className="tariffs-grid" id="tariffs-container">
        {tariffs.length === 0 ? (
          <p>Тарифы не найдены</p>
        ) : (
          tariffs.map((tariff) => {
            const featuresList = Array.isArray(tariff.features)
              ? tariff.features.map((f, idx) => (
                  <li key={`${tariff.id}-feature-${idx}`}>{f}</li>
                ))
              : [];

            return (
              <div
                key={tariff.id}
                className={`tariff-card ${tariff.price == 0 ? 'free' : ''}`}
              >
                <div className="tariff-header">
                  {/* ✅ tariff.name вместо tariff.title */}
                  <h3>{tariff.name}</h3>
                  {tariff.price == 0 ? (
                    <span className="badge">Бесплатно</span>
                  ) : (
                    <p className="price">{tariff.price} ₽ / месяц</p>
                  )}
                </div>

                <ul className="features-list">
                  {featuresList.length > 0 ? featuresList : <li>Нет особенностей</li>}
                </ul>

                <button
                  className="select-btn"
                  onClick={() => handleBuyTariff(tariff)}
                  disabled={loadingPay}
                >
                  {loadingPay ? '⏳ Обработка...' : 'Выбрать тариф'}
                </button>
              </div>
            );
          })
        )}
      </div>

      <button id="reload-tariffs" className="btn" onClick={loadTariffs}>
        Обновить тарифы
      </button>

      
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        tariff={selectedTariff}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}