
const nameInput = document.getElementById('name');
const cityInput = document.getElementById('city');
const birthdateInput = document.getElementById('birthdate');
const genderSelect = document.getElementById('gender');
const agreeCheckbox = document.getElementById('agree');
const registrationForm = document.querySelector('.advanced-form');
const submitBtn = registrationForm.querySelector('button[type="submit"]');


const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';
progressBar.innerHTML = '<div class="progress-fill" id="progress-fill"></div>';
registrationForm.insertBefore(progressBar, registrationForm.firstElementChild);

const progressFill = document.getElementById('progress-fill');


const formState = {
    name: false,
    city: false,
    birthdate: false,
    gender: false,
    agree: false
};


const validators = {
    name: /^[a-zA-Zа-яА-Я\s]{2,}$/,
    city: /^[a-zA-Zа-яА-Я\s]{3,}$/
};


function updateProgress() {
    const totalFields = Object.keys(formState).length;
    const completedFields = Object.values(formState).filter(Boolean).length;
    const progress = (completedFields / totalFields) * 100;

    progressFill.style.width = `${progress}%`;

    
    if (progress < 50) {
        progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12)';
    } else if (progress < 80) {
        progressFill.style.background = 'linear-gradient(90deg, #f39c12, #2ecc71)';
    } else {
        progressFill.style.background = '#2ecc71';
    }
}


function validateField(field, regex = null) {
    const wrapper = field.parentElement;
    const errorSpan = wrapper.querySelector('.error-message');

    let isValid = true;

    if (!field.value.trim()) {
        isValid = false;
    } else if (regex && !regex.test(field.value)) {
        isValid = false;
    }

    
    formState[field.id] = isValid;

    
    wrapper.classList.remove('valid', 'invalid');
    wrapper.classList.add(isValid ? 'valid' : 'invalid');

    
    if (errorSpan) {
        wrapper.classList.toggle('show-error', !isValid);
    }

    updateProgress();
    return isValid;
}


nameInput.addEventListener('input', () => {
    validateField(nameInput, validators.name);
});

cityInput.addEventListener('input', () => {
    validateField(cityInput, validators.city);
});


genderSelect.addEventListener('change', () => {
    validateField(genderSelect);
});

agreeCheckbox.addEventListener('change', () => {
    formState.agree = agreeCheckbox.checked;
    updateProgress();
});


birthdateInput.addEventListener('focus', () => {
    let hint = birthdateInput.parentElement.querySelector('.hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = 'Выберите дату рождения (минимум 18 лет)';
        birthdateInput.parentElement.appendChild(hint);
    }
});


birthdateInput.addEventListener('blur', () => {
    if (birthdateInput.value) {
        const birthDate = new Date(birthdateInput.value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            formState.birthdate = false;
            birthdateInput.parentElement.classList.add('invalid');
            let error = birthdateInput.parentElement.querySelector('.error-message');
            if (!error) {
                error = document.createElement('span');
                error.className = 'error-message';
                birthdateInput.parentElement.appendChild(error);
            }
            error.textContent = 'Вам должно быть не менее 18 лет';
            birthdateInput.parentElement.classList.add('show-error');
        } else {
            validateField(birthdateInput);
        }
    } else {
        validateField(birthdateInput);
    }
});


submitBtn.addEventListener('mouseenter', (e) => {
    e.target.style.transform = 'scale(1.05)';
    e.target.style.boxShadow = '0 5px 15px rgba(231, 76, 60, 0.4)';
});

submitBtn.addEventListener('mouseleave', (e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = 'none';
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT') {
                activeElement.parentElement.style.borderColor = '#e74c3c'; setTimeout(() => {
                    activeElement.parentElement.style.borderColor = '';
                }, 500);
            }
        }, 0);
    }
});

document.addEventListener('scroll', (e) => {
    const header = document.querySelector('.main-header');
    const scrollY = window.scrollY;

    const logo = header.querySelector('.logo');
    logo.style.transform = `translateY(${scrollY * 0.2}px)`;

    
    header.style.opacity = 1 - (scrollY / 500);
});


nameInput.addEventListener('copy', () => {
    showNotification('Имя скопировано в буфер обмена!');
});

cityInput.addEventListener('copy', () => {
    showNotification('Город скопирован в буфер обмена!');
});

function showNotification(message) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: opacity 0.3s;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.opacity = '1';

    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

nameInput.addEventListener('paste', (e) => {
    console.log('Вставлено значение в поле имени:', e.clipboardData.getData('text'));
});

cityInput.addEventListener('paste', (e) => {
    console.log('Вставлено значение в поле города:', e.clipboardData.getData('text'));
});

registrationForm.addEventListener('dragover', (e) => {
    e.preventDefault();
    registrationForm.style.backgroundColor = '#f8fff9';
    registrationForm.style.border = '2px dashed #27ae60';
});

registrationForm.addEventListener('dragleave', (e) => {
    e.preventDefault();
    registrationForm.style.backgroundColor = '';
    registrationForm.style.border = '';
});

registrationForm.addEventListener('drop', (e) => {
    e.preventDefault();
    registrationForm.style.backgroundColor = '';
    registrationForm.style.border = '';
    alert('Перетаскивание не поддерживается для этой формы!');
});


registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    
    const isNameValid = validateField(nameInput, validators.name);
    const isCityValid = validateField(cityInput, validators.city);
    const isBirthdateValid = birthdateInput.value ? validateField(birthdateInput) : false;
    const isGenderValid = genderSelect.value !== '';
    const isAgreeValid = agreeCheckbox.checked;

    if (isNameValid && isCityValid && isBirthdateValid && isGenderValid && isAgreeValid) {
        
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;
        submitBtn.style.background = '#95a5a6';

        
        setTimeout(() => {
            submitBtn.textContent = 'Успешно!';
            submitBtn.style.background = '#27ae60';

            setTimeout(() => {
                alert(`Спасибо за регистрацию, ${nameInput.value}!`);
                registrationForm.reset();
                resetFormState();
            }, 1000);
        }, 2000);
    } else {
        
        Object.keys(formState).forEach(fieldId => {
            if (!formState[fieldId]) {
                const field = document.getElementById(fieldId);
                if (field) {
                    field.parentElement.classList.add('shake');
            setTimeout(() => {
                field.parentElement.classList.remove('shake');
            }, 500);
                }
            }
        });

        alert('Пожалуйста, заполните все обязательные поля корректно');
    }
});


function resetFormState() {
    Object.keys(formState).forEach(key => {
        formState[key] = false;
    });
    updateProgress();

    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.classList.remove('valid', 'invalid', 'show-error');
    });

    submitBtn.textContent = 'Регистрация';
    submitBtn.disabled = false;
    submitBtn.style.background = '';
}


window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
       
        document.querySelector('.form-row').style.flexDirection = 'column';
    } else {
        document.querySelector('.form-row').style.flexDirection = 'row';
    }
});


window.addEventListener('beforeunload', (e) => {
    
    const hasFilledFields = [nameInput, cityInput, birthdateInput].some(field => field.value.trim() !== '');

    if (hasFilledFields) {
        e.preventDefault();
        e.returnValue = ''; 
        return 'Вы не завершили регистрацию. Вы уверены, что хотите покинуть страницу?';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    
    addHints();

    
    updateProgress();

    
    [nameInput, cityInput, birthdateInput, genderSelect].forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.3)';
        });

        field.addEventListener('blur', () => {
            field.parentElement.style.boxShadow = '';
        });
    });
});


function addHints() {
    const hints = {
        'name': 'Только буквы и пробелы, минимум 2 символа',
        'city': 'Только буквы и пробелы, минимум 3 символа',
        'birthdate': 'Выберите дату рождения (минимум 18 лет)',
        'gender': 'Выберите ваш пол из списка'
    };

    Object.entries(hints).forEach(([fieldId, hintText]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            let hint = field.parentElement.querySelector('.hint');
            if (!hint) {
                hint = document.createElement('div');
                hint.className = 'hint';
                hint.textContent = hintText;
                field.parentElement.appendChild(hint);
            }
        }
    });
}

  document.addEventListener('DOMContentLoaded', function() {
  
  const registerButton = document.querySelector('.btn-primary.btn-full');
  const sloganLink = document.querySelector('.slogan-btn');
  const nameInput = document.getElementById('name');

  
  if (registerButton) {
    registerButton.addEventListener('dblclick', function(event) {
      event.preventDefault(); 
      alert('Двойной клик на кнопке регистрации! Проверьте данные перед отправкой.');
    });
  }

  
  if (sloganLink) {
    sloganLink.addEventListener('dblclick', function(event) {
      alert('Двойной клик по слогану! Добро пожаловать на сайт!');
    });
  }

  
  if (nameInput) {
    nameInput.addEventListener('dblclick', function(event) {
      this.value = ''; // 
      this.focus(); 
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const galleryItems = document.querySelectorAll('.mini-gallery .gallery-item');
  const modal = createModal();
  let currentIndex = 0;

  
  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <span class="modal-close">&times;</span>
      <img class="modal-content" src="" alt="">
      <div class="modal-caption"></div>
      <button class="modal-prev">‹</button>
      <button class="modal-next">›</button>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      currentIndex = index;
      showImage(index);
      modal.style.display = 'block';
    });
  });

  
  function showImage(index) {
    const imgElement = galleryItems[index].querySelector('img');
    const modalImg = modal.querySelector('.modal-content');
    const modalCaption = modal.querySelector('.modal-caption');

    modalImg.src = imgElement.src;
    modalImg.alt = imgElement.alt;
    modalCaption.textContent = `Изображение ${index + 1} из ${galleryItems.length}`;
  }

  
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  modal.querySelector('.modal-prev').addEventListener('click', function() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    showImage(currentIndex);
  });

  modal.querySelector('.modal-next').addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    showImage(currentIndex);
  });

  
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'block') {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        showImage(currentIndex);
      }
      else if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        showImage(currentIndex);
      }
    }
  });

  function closeModal() {
    modal.style.display = 'none';
  }
});
