from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('create_order/', views.create_order, name='create_order'),
    path('chat_bot/', views.chat_bot, name='chat_bot'),
    path('dishes/', views.dish_list, name='dish_list'),
]