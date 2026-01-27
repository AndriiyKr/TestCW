from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Стандартна панель адміністратора Django
    path('admin/', admin.site.urls),

    # Підключення всіх маршрутів нашого додатка api
    # Тепер всі наші алгоритми будуть доступні за префіксом /api/
    # Наприклад: http://localhost:8000/api/analyze/
    path('api/', include('api.urls')),
]