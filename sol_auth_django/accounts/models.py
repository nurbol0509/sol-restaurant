from django.db import models
from django.contrib.auth.models import AbstractUser
import json

# Функция для создания отдельной папки для каждого пользователя
def user_profile_path(instance, filename):
    ext = filename.split('.')[-1].lower()
    new_filename = f"profile.{ext}"          # всегда будет называться profile.jpg / profile.png
    return f'profile_pics/{instance.username}/{new_filename}'


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, verbose_name="Email")
    bio = models.TextField(blank=True, null=True, verbose_name="О себе")
    
    profile_picture = models.ImageField(
        upload_to=user_profile_path,
        default='profile_pics/default_avatar.png',
        blank=True,
        null=True,
        verbose_name="Фото профиля"
    )

    def __str__(self):
        return self.username



class Order(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, verbose_name="Пайдаланушы")
    items = models.TextField(verbose_name="Тапсырыс құрамы")   # JSON строка с блюдами
    total_price = models.IntegerField(verbose_name="Жалпы сома")
    address = models.TextField(blank=True, null=True, verbose_name="Мекенжай")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Күтілуде'),
            ('confirmed', 'Қабылданды'),
            ('delivered', 'Жеткізілді'),
            ('cancelled', 'Болдырылмады')
        ],
        default='pending',
        verbose_name="Статус"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Тапсырыс уақыты")

    def __str__(self):
        return f"Тапсырыс #{self.id} - {self.user.username} ({self.total_price} тг)"

    class Meta:
        verbose_name = "Тапсырыс"
        verbose_name_plural = "Тапсырыстар"

class ChatMessage(models.Model):
    user = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Пользователь")
    user_message = models.TextField(verbose_name="Сообщение пользователя")
    bot_response = models.TextField(verbose_name="Ответ бота")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время")

    def __str__(self):
        username = self.user.username if self.user else "Гость"
        return f"{username}: {self.user_message[:40]}..."

    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
        ordering = ['-created_at']


class Dish(models.Model):
    name = models.CharField(max_length=200, verbose_name="Тағам аты")
    description = models.TextField(blank=True, verbose_name="Сипаттама")
    price = models.IntegerField(verbose_name="Бағасы")
    category = models.CharField(max_length=100, choices=[
        ('main', 'Негізгі тағам'),
        ('salad', 'Салат'),
        ('soup', 'Сорпа'),
        ('dessert', 'Десерт'),
        ('drink', 'Сусын')
    ], verbose_name="Категория")
    is_available = models.BooleanField(default=True, verbose_name="Қолжетімді")

    def __str__(self):
        return f"{self.name} — {self.price} тг"

    class Meta:
        verbose_name = "Тағам"
        verbose_name_plural = "Тағамдар"