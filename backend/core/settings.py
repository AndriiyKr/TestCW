import os
from pathlib import Path

# Базова директорія проекту
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретний ключ (для розробки)
SECRET_KEY = 'django-insecure-ваша-унікальна-комбінація-символів'

# Режим налагодження
DEBUG = False

# Дозволені хости
ALLOWED_HOSTS = ['graphinfo.pythonanywhere.com']

# Визначення встановлених додатків
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Сторонні бібліотеки
    'rest_framework',         # Для створення API
    'corsheaders',            # Для дозволу запитів з React
    
    # Наш додаток
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Має бути якомога вище
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# База даних (використовуємо SQLite для простоти розробки)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Валідація паролів
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Міжнародналізація
LANGUAGE_CODE = 'uk-ua'
TIME_ZONE = 'Europe/Kiev'
USE_I18N = True
USE_TZ = True

# Статичні файли
STATIC_URL = 'static/'

# Тип первинного ключа за замовчуванням
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- НАЛАШТУВАННЯ CORS ---
# Дозволяємо React (зазвичай порт 3000 або 5173 для Vite) звертатися до API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]

# Дозволяємо передачу заголовків авторизації та куків, якщо знадобиться
CORS_ALLOW_CREDENTIALS = True

# --- НАЛАШТУВАННЯ REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer', # Для зручного тестування в браузері
    ]
}