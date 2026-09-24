import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, tariff, onPaymentSuccess }) => {
  const [step, setStep] = useState('confirm'); 

  if (!isOpen) return null;

  const handleConfirm = () => {
    setStep('loading');
    
    setTimeout(() => {
      setStep('success');
    }, 1500);
  };

  const handleClose = () => {
    
    if (step === 'success' && onPaymentSuccess) {
      onPaymentSuccess(tariff);   
    } else {
      onClose();
    }
    setStep('confirm'); 
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '30px', borderRadius: '16px',
        width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Inter, sans-serif'
      }}>

        {step === 'confirm' && (
          <>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '22px' }}>
              Подтверждение оплаты
            </h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
              Вы выбрали тариф: <strong>{tariff?.name || tariff?.title}</strong>
            </p>
            <div style={{
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '15px', marginBottom: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: '#475569' }}>К оплате:</span>
              <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '20px' }}>
                {tariff?.price} ₽
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#475569',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 2, padding: '12px', backgroundColor: '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}
              >
                Подтвердить оплату
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
            <h3 style={{ color: '#1e293b', margin: 0 }}>Обработка платежа...</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Связываемся с банком. Пожалуйста, подождите.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>✅</div>
            <h3 style={{ color: '#10b981', margin: '0 0 10px 0' }}>
              Оплата прошла успешно!
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Нажмите «Закрыть», чтобы активировать подписку.
            </p>
            <button
              onClick={handleClose}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Закрыть
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal;