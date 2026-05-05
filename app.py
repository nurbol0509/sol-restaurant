from flask import Flask, request, jsonify, render_template
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import re
import random
import string
import time
import json
import os

app = Flask(__name__, 
            template_folder='templates',
           

 static_folder='static')   # ← важно!
CORS(app)

# Главная страница
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
def index_html():
    return render_template('index.html')

# Другие страницы
@app.route('/menu.html')
def menu():
    return render_template('menu.html')

@app.route('/quiz.html')
def quiz():
    return render_template('quiz.html')

@app.route('/register.html')
def register_page():
    return render_template('register.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/delivery.html')
def delivery():
    return render_template('delivery.html')

@app.route('/philosophy.html')
def philosophy():
    return render_template('philosophy.html')

@app.route('/philosophy')
def philosophy_short():
    return render_template('philosophy.html')

USER_DATA_FILE = "users.json"

# 📝 Тіркелу
@app.route("/register", methods=["POST"])
def register():
    new_user = request.json
    users_list = []
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, "r", encoding="utf-8") as file:
            try:
                users_list = json.load(file)
            except json.JSONDecodeError:
                users_list = []

    users_list.append(new_user)
    with open(USER_DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(users_list, file, ensure_ascii=False, indent=4)

    return jsonify({"status": "success", "message": "Деректер сақталды!"})

# 🔐 Пароль генерация
@app.route("/generate_password")
def generate_password():
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for _ in range(10))
    return jsonify({"password": password})

# 🔎 Пароль тексеру
@app.route("/check_password", methods=["POST"])
def check_password():
    data = request.json
    password = data.get("password", "")
    errors = []
    if len(password) < 8: errors.append("Кемінде 8 символ керек")
    if not re.search("[A-Z]", password): errors.append("Бас әріп керек")
    if not re.search("[0-9]", password): errors.append("Сан керек")
    if not re.search("[!@#$%^&*]", password): errors.append("Арнайы символ керек")

    if len(errors) == 0:
        return jsonify({"status":"strong"})
    else:
        return jsonify({"status":"weak","errors":errors})

# 🔑 Логин тексеру
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not os.path.exists(USER_DATA_FILE):
        return jsonify({"status": "error", "message": "Пайдаланушы табылмады (база бос)"})

    with open(USER_DATA_FILE, "r", encoding="utf-8") as file:
        try:
            users = json.load(file)
        except:
            return jsonify({"status": "error", "message": "База қате"})

    for user in users:
        if user["email"] == email and user["password"] == password:
            return jsonify({"status": "success", "message": "Қош келдіңіз!", "user": user.get("name", "Пайдаланушы")})

    return jsonify({"status": "error", "message": "Email немесе пароль қате!"})

# 🎲 Кубик
last_played = {}
@app.route("/roll_dice", methods=["POST"])
def roll_dice():
    data = request.json
    email = data.get("email", "guest")
    num_dice = int(data.get("num_dice", 1))
    dice_type = int(data.get("dice_type", 6))
    now = time.time()
    if email in last_played and (now - last_played[email] < 60):
        return jsonify({"status": "wait", "message": "Күте тұрыңыз!"})
    
    results = [random.randint(1, dice_type) for _ in range(num_dice)]
    last_played[email] = now
    return jsonify({"status":"ok", "results": results, "total": sum(results)})

# Статические файлы (стили, скрипты, картинки и т.д.)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/<path:filename>')
def serve_static(filename):
    if filename.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.pdf', '.mp4')):
        return send_from_directory('.', filename)
    return "File not found", 404

# МЫНАУ ЕҢ СОҢЫНДА ТҰРУЫ ТИІС!
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))   # Render және басқа хостингтер үшін
    app.run(host="0.0.0.0", port=port, debug=False)