// ========== register.js ==========

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("togglePassword");
    const generateBtn = document.getElementById("generatePassword");
    const passwordInput = document.getElementById("password");

    // Глазик - показать/скрыть пароль
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                toggleBtn.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                toggleBtn.textContent = "👁";
            }
        });
    }

    // Генерация пароля
    if (generateBtn && passwordInput) {
        generateBtn.addEventListener("click", () => {
            fetch("http://127.0.0.1:5000/generate_password")
                .then(res => res.json())
                .then(data => {
                    passwordInput.value = data.password;
                    checkPasswordStrength(data.password);
                })
                .catch(() => alert("Сервер қосулы емес!"));
        });
    }

    // Реал-тайм проверка пароля
    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            checkPasswordStrength(passwordInput.value);
        });
    }
});

// Проверка силы пароля (4 условия)
function checkPasswordStrength(password) {
    const reqLength = document.getElementById("req-length");
    const reqUpper = document.getElementById("req-upper");
    const reqNumber = document.getElementById("req-number");
    const reqSpecial = document.getElementById("req-special");

    // Минимум 8 символов
    reqLength.style.color = password.length >= 8 ? "#2ecc71" : "#ff4d4d";

    // Большая буква
    reqUpper.style.color = /[A-Z]/.test(password) ? "#2ecc71" : "#ff4d4d";

    // Цифра
    reqNumber.style.color = /[0-9]/.test(password) ? "#2ecc71" : "#ff4d4d";

    // Специальный символ
    reqSpecial.style.color = /[!@#$%^&*]/.test(password) ? "#2ecc71" : "#ff4d4d";
}

// Регистрация
function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Очистка ошибок
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

    if (!name) {
        document.getElementById("nameError").textContent = "Аты-жөніңізді енгізіңіз!";
        return;
    }
    if (!email) {
        document.getElementById("emailError").textContent = "Email енгізіңіз!";
        return;
    }
    if (!password) {
        alert("Пароль енгізіңіз!");
        return;
    }

    // Отправка на сервер
    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Тіркелу сәтті аяқталды! Қош келдіңіз, " + name);
            window.location.href = "index.html";
        } else {
            alert(data.message || "Тіркелу кезінде қате шықты");
        }
    })
    .catch(() => {
        alert("Сервермен байланыс орнатылмады! app.py қосулы екеніне көз жеткізіңіз.");
    });
}