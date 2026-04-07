async function loadTariffs() {
  const status = document.querySelector("#status");
  const container = document.querySelector("#tariffs-container");

  try {
    status.textContent = "Загрузка тарифов...";

    const response = await fetch("./tariffs.json");
    console.log("Что пришло: ", response);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tariffs = await response.json();
    console.log("Что получили после .json():", tariffs);

    // Очищаем контейнер и собираем HTML в одну строку
    container.innerHTML = "";
    let tariffsHTML = "";

    if (tariffs.length === 0) {
      tariffsHTML = "<p>Тарифы не найдены</p>";
    } else {
      tariffs.forEach((tariff) => {
        // Форматируем список функций
        const featuresHTML = tariff.features
          .map(feature => `<li>${feature}</li>`)
          .join('');

        tariffsHTML += `
          <div class="tariff-card ${tariff.price === 0 ? 'free' : ''}">
            <div class="tariff-header">
              <h3>${tariff.title}</h3>
              ${tariff.price === 0
                ? '<span class="badge">Бесплатно</span>'
                : `<p class="price">${tariff.price} ₽ / ${tariff.duration}</p>`
              }
            </div>
            <ul class="features-list">
              ${featuresHTML}
            </ul>
            <button class="select-btn" data-id="${tariff.id}">
              ${tariff.price === 0 ? 'Активировать' : 'Выбрать тариф'}
            </button>
          </div>
        `;
      });
    }

    container.innerHTML = tariffsHTML;

    // Добавляем обработчики кликов к кнопкам тарифов
    document.querySelectorAll('.select-btn').forEach(button => {
      button.addEventListener('click', function() {
        const tariffId = this.getAttribute('data-id');
        selectTariff(tariffId);
      });
    });

    status.textContent = `Тарифы успешно загружены (${tariffs.length} шт.)`;
  } catch (error) {
    console.error("Ошибка загрузки тарифов:", error);
    status.textContent = "Ошибка загрузки: проверьте файл tariffs.json";
    container.innerHTML = "<p class='error'>Не удалось загрузить тарифы</p>";
  }
}
document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateClock, 1000);
  updateClock();
  loadTariffs();

  // Обработчик для кнопки обновления тарифов с визуальной обратной связью
  const reloadBtn = document.querySelector('#reload-tariffs');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', async function() {
      // Добавляем состояние загрузки
      this.disabled = true;
      const originalText = this.textContent;
      this.textContent = 'Обновление...';

      try {
        await loadTariffs();
      } finally {
        // Восстанавливаем исходное состояние
        setTimeout(() => {
          this.disabled = false;
          this.textContent = originalText;
        }, 500);
      }
    });
  }
});


function selectTariff(tariffId) {
  console.log('Выбран тариф с ID:', tariffId);
  alert(`Выбран тариф с ID: ${tariffId}`);
  // Дополните логику: сохранение в localStorage, отправка на сервер и т. д.
}

// Часы
function updateClock() {
  const clock = document.querySelector("#clock");

  if (!clock) {
    console.warn('Элемент #clock не найден в DOM');
    return;
  }

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateClock, 1000);
  updateClock();
  loadTariffs();

  // Обработчик для кнопки обновления тарифов
  document.querySelector('#reload-tariffs').addEventListener('click', loadTariffs);
});
