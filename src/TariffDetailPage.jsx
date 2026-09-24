import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function TariffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTariff = async () => {
      setLoading(true);
      setError(null);
      try {
        
        const response = await fetch('/api/tariffs.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        if (text.trim().startsWith('<')) {
          throw new Error('Сервер вернул HTML вместо JSON');
        }

        const data = JSON.parse(text);
        if (!data.success) throw new Error(data.message || 'Ошибка сервера');

        
        const found = data.data?.find(
          (t) => String(t.id) === String(id)
        );

        if (!found) {
          throw new Error('Тариф не найден');
        }

        setTariff(found);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadTariff();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
  if (!tariff) return <p>Тариф не найден</p>;

  return (
    <div className="tariff-detail">
      <h2>{tariff.title}</h2>
      <p>Цена: {tariff.price} ₽ / {tariff.duration}</p>
      <ul>
        {Array.isArray(tariff.features) ? (
          tariff.features.map((f, idx) => (
            <li key={`${tariff.id}-feature-${idx}`}>{f}</li>
          ))
        ) : (
          <li>Нет особенностей</li>
        )}
      </ul>
      <a href="/tariffs" className="back-btn">
        <span className="icon">←</span> Назад к тарифам
      </a>
    </div>
  );
}