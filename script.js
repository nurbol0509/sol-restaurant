// Потсветка
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dish').forEach(dish => {
        dish.addEventListener('mouseenter', () => {
            dish.style.boxShadow = '0 0 15px gold';
            dish.style.transform = 'scale(1.05)';
            dish.style.transition = 'all 0.3s';
        });
        dish.addEventListener('mouseleave', () => {
            dish.style.boxShadow = 'none';
            dish.style.transform = 'scale(1)';
        });
    });
});


// Кнопка "Наверх" (размещаем слева от чат-бота)
const backToTopBtn = document.createElement('button');
backToTopBtn.innerHTML = "↑";
backToTopBtn.className = "back-to-top";
document.body.appendChild(backToTopBtn);

window.onscroll = () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
};

backToTopBtn.onclick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// іздеу
function searchDish() {
    const input = document.getElementById('menuSearch').value.toLowerCase();
    const dishes = document.querySelectorAll('.dish');
    dishes.forEach(dish => {
        const title = dish.querySelector('h3').innerText.toLowerCase();
        
        if (title.includes(input)) {
            dish.style.display = ""; 
        } else {
            dish.style.display = "none"; 
        }
    });
}

// меню
function toggleMenu(){

const menu = document.getElementById("dropdownMenu");

if(menu.style.display === "block"){

menu.style.display = "none";

}else{

menu.style.display = "block";

}

}

let siteEnterTime = Date.now();

// 1 минуттан кейін overlay ашу (алғашқы көрсетілім)
setTimeout(showDiceOverlay, 1200000);

function showDiceOverlay() {
    document.getElementById("diceOverlay").style.display = "flex";
}

// Жабу батырмасы
function closeDiceOverlay(){
    document.getElementById("diceOverlay").style.display = "none";

    // 2 минуттан кейін қайта шығару
    setTimeout(showDiceOverlay, 120000); // 2 минут = 120000ms
}

// Кубик ойнау функциясы (Python серверге сұраныс)
function rollDice(){
    const numDice = document.getElementById("numDice").value;
    const diceType = document.getElementById("diceType").value;
    const resultDiv = document.getElementById("diceResult");

    fetch("http://127.0.0.1:5000/roll_dice", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({num_dice:numDice, dice_type:diceType})
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "wait"){
            resultDiv.innerHTML = data.message;
        } else {
            resultDiv.innerHTML = `<p>Нәтижелер: ${data.results.join(", ")}</p>
                                   <p>Қосынды: ${data.total}</p>`;
        }
    });
}



function downloadMenu() {

    window.open('SOL_Menu_KZ.pdf', '_blank');
    
    fetch('SOL_Menu_KZ.pdf')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'SOL_Menu_KZ.pdf'; // Жүктелетін файлдың аты
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('Файлды жүктеу мүмкін болмады!'));
}

function downloadWebP() {
    // Жүктеп алғыңыз келетін суреттің сілтемесі (мысалы, фондан суреті)
    const imageUrl = "https://симферопольресторан.рф/wp-content/uploads/2025/05/Menju-restorana_4.webp";
    
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Файлдың атын .webp деп өзгертіп жазамыз
            a.download = "dessert-menu.webp"; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        })
        .catch(() => alert("Суретті жүктеп алу кезінде қате шықты."));
}

// ==================== ЧАТ-БОТ SOL С ДВУМЯ РЕЖИМАМИ ====================

let currentMode = 'simple'; // 'simple' или 'ai'
let chatHistory = [];

function toggleChat() {
    const chatWindow = document.getElementById("chatWindow");
    chatWindow.style.display = (chatWindow.style.display === "flex") ? "none" : "flex";
    
    if (chatWindow.style.display === "flex" && document.getElementById("chatBody").children.length === 0) {
        const username = getUsernameFromCookie();
        const greeting = username 
            ? `Сәлем, ${username}! Мен SOL мейрамханасының көмекшісімін.` 
            : "Сәлем! Мен SOL мейрамханасының көмекшісімін. Қалай көмектесе аламын?";
        addBotMessage(greeting);
    }
}

function getUsernameFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('django_username=')) {
            return decodeURIComponent(trimmed.split('=')[1]);
        }
    }
    return null;
}

function addMessage(text, isUser) {
    const chatBody = document.getElementById("chatBody");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    msgDiv.innerHTML = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function addBotMessage(text) {
    addMessage(text, false);
}

// Переключение режима
function toggleMode() {
    currentMode = currentMode === 'simple' ? 'ai' : 'simple';
    const modeBtn = document.getElementById('mode-btn');
    modeBtn.textContent = currentMode === 'ai' ? '🤖 ИИ режим' : '📋 Қарапайым';
    addBotMessage(currentMode === 'ai' ? 'ИИ режим қосылды. Енді мен ақылдырақ жауап беремін!' : 'Қарапайым режимге қайтылды.');
}

// Отправка сообщения
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (text === "") return;

    addMessage(text, true);
    chatHistory.push({role: "user", content: text});
    input.value = "";

    if (currentMode === 'simple') {
        // Простой режим
        setTimeout(() => {
            let response = "Кешіріңіз, мен бұл сұраққа әзірге жауап бере алмаймын.";
            const lower = text.toLowerCase();

            if (lower.includes("привет") || lower.includes("сәлем")) response = "Сәлем! Қалай көмектесе аламын?";
            else if (lower.includes("меню")) response = "Мәзірді көру үшін <a href='menu.html'>мына жерге</a> басыңыз.";
            else if (lower.includes("доставка")) response = "Доставка туралы <a href='delivery.html'>мына жерде</a>.";
            else if (lower.includes("рахмет")) response = "Рақмет сізге!";
            
            addBotMessage(response);
            chatHistory.push({role: "bot", content: response});
        }, 600);
    } 
    else {
        // ИИ режим (Grok API)
        try {
            const response = await fetch("http://127.0.0.1:8000/chat_bot/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: text,
                    mode: "ai",
                    history: chatHistory.slice(-10)
                })
            });

            const data = await response.json();
            addBotMessage(data.response || "Кешіріңіз, қате шықты.");
            chatHistory.push({role: "bot", content: data.response});
        } catch (e) {
            addBotMessage("ИИ режимде қате шықты. Қарапайым режимге қайтайық.");
            currentMode = 'simple';
        }
    }
}

// Голосовой ввод
function startVoiceInput() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Браузер дауысты тануға қолдау көрсетпейді.");
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "kk-KZ";
    recognition.onresult = (event) => {
        document.getElementById("chatInput").value = event.results[0][0].transcript;
        sendMessage();
    };
    recognition.start();
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    const chatHTML = `
        <div class="chat-widget">
            <button class="chat-button" onclick="toggleChat()">💬 Помощник SOL</button>
            <div class="chat-window" id="chatWindow">
                <div class="chat-header">
                    <h3>🤖 Помощник SOL</h3>
                    <div style="display:flex; gap:8px;">
                        <button id="mode-btn" onclick="toggleMode()" style="background:#333; color:white; border:none; padding:5px 12px; border-radius:20px; font-size:13px;">📋 Қарапайым</button>
                        <button onclick="clearChat()" style="background:none; border:none; color:#ff9800; cursor:pointer;">🗑</button>
                        <button onclick="toggleChat()" class="close-btn">✕</button>
                    </div>
                </div>
                <div class="chat-body" id="chatBody"></div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Сообщение жазыңыз..." onkeypress="if(event.key === 'Enter') sendMessage()">
                    <button onclick="sendMessage()">→</button>
                    <button onclick="startVoiceInput()" style="background:#4caf50;">🎤</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);
});

// ====================== ТЕМА (Dark / Light Mode) ======================

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle-main');
    
    if (!themeToggle) return;

    // Загружаем сохранённую тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');

    if (savedTheme === 'light') {
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }

    // Переключение темы
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    });
});

function bookTable() {
    const name = document.getElementById("bookingName").value.trim();
    const phone = document.getElementById("bookingPhone").value.trim();
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const guests = document.getElementById("bookingGuests").value;

    if (!name || !phone || !date || !time || !guests) {
        alert("Барлық міндетті өрістерді толтырыңыз!");
        return;
    }

    // Успешное сообщение
    document.getElementById("successMessage").style.display = "flex";

    // Форманы тазалау
    document.getElementById("bookingForm").reset();
}

function closeSuccess() {
    document.getElementById("successMessage").style.display = "none";
}