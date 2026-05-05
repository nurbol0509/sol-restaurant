from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import re
import random
import string
import time
import json
import os

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static')

CORS(app)

# ====================== СТРАНИЦЫ ======================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/index.html')
@app.route('/menu.html')
@app.route('/quiz.html')
@app.route('/register.html')
@app.route('/login.html')
@app.route('/delivery.html')
@app.route('/philosophy.html')
def render_page():
    page = request.path.strip('/')
    if page == '' or page == 'index':
        page = 'index.html'
    return render_template(page)

# ====================== API ======================
USER_DATA_FILE = "users.json"

@app.route("/register", methods=["POST"])
def register():
    new_user = request.json
    users_list = []
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, "r", encoding="utf-8") as file:
            try:
                users_list = json.load(file)
            except:
                users_list = []
    users_list.append(new_user)
    with open(USER_DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(users_list, file, ensure_ascii=False, indent=4)
    return jsonify({"status": "success", "message": "Тіркелу сәтті аяқталды!"})

@app.route("/generate_password")
def generate_password():
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for _ in range(10))
    return jsonify({"password": password})

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

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not os.path.exists(USER_DATA_FILE):
        return jsonify({"status": "error", "message": "Пайдаланушы табылмады"})
    with open(USER_DATA_FILE, "r", encoding="utf-8") as file:
        try:
            users = json.load(file)
        except:
            return jsonify({"status": "error", "message": "База қате"})
    for user in users:
        if user.get("email") == email and user.get("password") == password:
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

# ====================== СТАТИЧЕСКИЕ ФАЙЛЫ ======================
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/<path:filename>')
def serve_files(filename):
    if filename.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.pdf', '.mp4')):
        return send_from_directory('.', filename)
    return "File not found", 404

# ====================== ЗАПУСК ======================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)