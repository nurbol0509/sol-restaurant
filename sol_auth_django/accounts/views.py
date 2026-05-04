from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegisterForm

# Flask сайт работает на порту 5000
FLASK_SITE_URL = "http://127.0.0.1:5000"

def home(request):
    return render(request, 'accounts/home.html')

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Қош келдіңіз, {user.username}!")
            # Передаём имя пользователя во Flask
            response = redirect(FLASK_SITE_URL)
            response.set_cookie('django_username', user.username, max_age=86400)  # на 1 день
            return response  # ← Перенаправление на Flask
        else:
            messages.error(request, "Тіркелу кезінде қате шықты.")
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Пробуем найти по username или email
        user = authenticate(request, username=username, password=password)

        if user is None:
            # Если не нашли по username, пробуем по email
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is not None:
            login(request, user)
            messages.success(request, f"Қайта қош келдіңіз, {user.username}!")
            response = redirect(FLASK_SITE_URL)
            response.set_cookie('django_username', user.username, max_age=86400)
            return response
        else:
            messages.error(request, "Пайдаланушы аты немесе пароль қате!")

    return render(request, 'accounts/login.html')

@login_required
def profile(request):
    if request.method == 'POST' and request.FILES.get('profile_picture'):
        user = request.user
        if user.profile_picture and user.profile_picture.path:
            import os
            if os.path.isfile(user.profile_picture.path):
                os.remove(user.profile_picture.path)
        
        user.profile_picture = request.FILES['profile_picture']
        user.save()
        messages.success(request, "Фото профилі сәтті жаңартылды!")
        return redirect('profile')
    
    return render(request, 'accounts/profile.html')

def logout_view(request):
    logout(request)
    messages.success(request, "Сіз жүйеден шықтыңыз.")
    response = redirect(FLASK_SITE_URL)
    response.delete_cookie('django_username')
    return response  # ← После выхода тоже на Flask

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from .models import Order

@csrf_exempt
def create_order(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            items = data.get('items', [])
            total = data.get('total', 0)

            if not items or total <= 0:
                return JsonResponse({"status": "error", "message": "Корзина бос"}, status=400)

            from django.contrib.auth import get_user_model
            User = get_user_model()
            test_user = User.objects.first()

            if not test_user:
                return JsonResponse({"status": "error", "message": "Пользователь табылмады"}, status=400)

            order = Order.objects.create(
                user=test_user,
                items=json.dumps(items, ensure_ascii=False),
                total_price=total,
                status='pending'
            )

            return JsonResponse({
                "status": "success",
                "order_id": order.id,
                "message": f"Тапсырыс №{order.id} сәтті қабылданды!\nЖалпы сома: {total} тг"
            })

        except Exception as e:
            print("Ошибка:", str(e))
            return JsonResponse({"status": "error", "message": "Сервер қатесі"}, status=400)

    return JsonResponse({"status": "error", "message": "POST әдісі қажет"}, status=405)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from django.conf import settings
from .models import ChatMessage

@csrf_exempt
def chat_bot(request):
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            user_message = data.get('message', '').strip()
            mode = data.get('mode', 'simple')

            if not user_message:
                return JsonResponse({"response": "Сообщение бос"}, status=400)

            bot_response = "Кешіріңіз, мен бұл сұраққа әзірге жауап бере алмаймын."

            if mode == 'ai':
                GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', None)
                
                if not GROQ_API_KEY:
                    bot_response = "Groq API ключі орнатылмаған."
                else:
                    try:
                        print("Отправка запроса в Groq...")

                        groq_response = requests.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers={
                                "Authorization": f"Bearer {GROQ_API_KEY}",
                                "Content-Type": "application/json"
                            },
                            json={
                                "model": "llama-3.3-70b-versatile",   # Актуальная мощная модель
                                "messages": [
                                    {
                                        "role": "system",
                                        "content": "Ты — дружелюбный и полезный помощник ресторана SOL в Алматы. Отвечай на казахском и русском языках, будь вежливым, остроумным и полезным."
                                    },
                                    {
                                        "role": "user",
                                        "content": user_message
                                    }
                                ],
                                "temperature": 0.7,
                                "max_tokens": 500
                            },
                            timeout=15
                        )

                        print("Статус Groq:", groq_response.status_code)

                        if groq_response.status_code == 200:
                            result = groq_response.json()
                            bot_response = result['choices'][0]['message']['content']
                        else:
                            bot_response = f"Groq API қате: {groq_response.status_code}"
                            print("Groq full error:", groq_response.text[:500])
                    except Exception as e:
                        print("Groq API error:", str(e))
                        bot_response = "ИИ сейчас недоступен. Попробуйте простой режим."
            else:
                # Простой режим
                lower = user_message.lower()
                if any(word in lower for word in ["привет", "сәлем", "салем", "hello"]):
                    bot_response = "Сәлем! SOL мейрамханасына қош келдіңіз! Қалай көмектесе аламын?"
                elif "меню" in lower:
                    bot_response = "Мәзірді көру үшін <a href='/menu.html'>мына жерге</a> басыңыз."
                elif "доставка" in lower:
                    bot_response = "Доставка туралы <a href='/delivery.html'>мына жерде</a>."
                elif "рахмет" in lower or "спасибо" in lower:
                    bot_response = "Рақмет сізге!"

            # Сохраняем в базу
            ChatMessage.objects.create(
                user=request.user if request.user.is_authenticated else None,
                user_message=user_message,
                bot_response=bot_response
            )

            return JsonResponse({"response": bot_response})

        except Exception as e:
            print("Chat error:", str(e))
            return JsonResponse({"response": "Қате шықты."}, status=500)

    return JsonResponse({"response": "POST әдісі қажет"}, status=405)

from .models import Dish

def dish_list(request):
    dishes = Dish.objects.filter(is_available=True)
    return render(request, 'accounts/dish_list.html', {'dishes': dishes})

