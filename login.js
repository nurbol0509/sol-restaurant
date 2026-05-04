// Бұл функция тек батырманы басқанда орындалады
function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const messageElement = document.getElementById("loginMessage");

    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailCheck.test(email)) {
        messageElement.innerHTML = "<span style='color: red;'>Email форматы дұрыс емес</span>";
        return;
    }

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userName", data.user);
            alert("Кіру сәтті! Қош келдіңіз, " + data.user);
            window.location = "index.html";
        } else {
            messageElement.innerHTML = `<span style='color: red;'>${data.message}</span>`;
        }
    })
    .catch(err => {
        console.error(err);
        messageElement.innerHTML = "<span style='color: orange;'>Сервер қосулы емес! Питонды тексеріңіз.</span>";
    });
}

// Бұл бөлім loginUser-ден бөлек, сыртында тұруы керек!
// Ол бет ашылған бойда email тізімін дайындайды.
window.addEventListener('load', function() {
    let savedEmails = JSON.parse(localStorage.getItem("registeredEmails") || "[]");
    let datalist = document.getElementById("emailOptions");
    
    if (datalist) {
        savedEmails.forEach(email => {
            let option = document.createElement("option");
            option.value = email;
            datalist.appendChild(option);
        });
    }
});