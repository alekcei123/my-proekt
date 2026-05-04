document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('ageModal');
  const birthdateInput = document.getElementById('birthdate');
  const checkAgeBtn = document.getElementById('checkAgeBtn');
  const exitBtn = document.getElementById('exitBtn');
  const closeBtn = document.querySelector('.close');
  const validationMsg = document.getElementById('validationMsg');

  
  function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  
  function checkAgeWithAlert() {
    const birthDateStr = birthdateInput.value;

    if (!birthDateStr) {
      alert('Пожалуйста, выберите дату рождения!');
      return false;
    }

    const birthDate = new Date(birthDateStr);
    const age = calculateAge(birthDate);

    if (age < 18) {
      alert(`Вам ${age} лет. Доступ к сайту разрешён только лицам старше 18 лет.`);
      validationMsg.textContent = `Вам ${age} лет — недостаточно для доступа`;
      validationMsg.className = 'validation-message error';
      return false;
    } else {
      validationMsg.textContent = `Возраст: ${age} лет — доступ разрешён!`;
      validationMsg.className = 'validation-message success';

      // Сохраняем в localStorage, что возраст подтверждён
      localStorage.setItem('ageVerified', 'true');

      setTimeout(() => {
        modal.style.display = 'none';
        alert('Спасибо! Доступ к сайту открыт.');
      }, 1000);
      return true;
    }
  }

  
  function showAgeModal() {
    if (!localStorage.getItem('ageVerified')) {
      modal.style.display = 'block';
    }
  }

  
  checkAgeBtn.addEventListener('click', checkAgeWithAlert);

  exitBtn.addEventListener('click', () => {
    alert('Вы покидаете сайт.');
    window.location.href = 'https://www.google.com';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  
  showAgeModal();
});
