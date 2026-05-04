function checkQuiz() {
    const correctAnswers = {
        q1: "Pizza",
        q2: ["Beshbarmak", "Baursak", "Kuirdak"],
        q3: "McDonalds",
        q4: "ПАЛАУ",
        q5: "Chili",
        q6: "3",
        q7: "Nori",
        q8: "Glass",
        q9: ["Cake", "Eclair", "Croissant"],
        q10: "Menu"
    };

    let score = 0;

    for (let key in correctAnswers) {
        const answer = correctAnswers[key];

        document.querySelectorAll(`input[name="${key}"], select[name="${key}"]`).forEach(el => {
            const label = el.closest("label");
            if (label) label.classList.remove("correct", "wrong");
            el.classList.remove("correct", "wrong");
        });

        if (Array.isArray(answer)) {
            const selected = Array.from(document.querySelectorAll(`input[name="${key}"]:checked`)).map(i => i.value);
            const allInputs = document.querySelectorAll(`input[name="${key}"]`);
            
            allInputs.forEach(inp => {
                const lab = inp.closest("label") || inp.parentNode;
                if (answer.includes(inp.value)) {
                    if (inp.checked) {
                        lab.classList.add("correct");
                    }
                } else if (inp.checked) {
                    lab.classList.add("wrong");
                }
            });

            if (JSON.stringify(selected.sort()) === JSON.stringify(answer.sort())) {
                score++;
            }
        }
        else if (document.querySelector(`select[name="${key}"]`)) {
            const sel = document.querySelector(`select[name="${key}"]`);
            if (sel.value === answer) {
                sel.classList.add("correct");
                score++;
            } else if (sel.value) {
                sel.classList.add("wrong");
            }
        }
        else if (document.querySelector(`input[name="${key}"]`) && 
                (document.querySelector(`input[name="${key}"]`).type === "text" || 
                 document.querySelector(`input[name="${key}"]`).type === "number")) {
            const inp = document.querySelector(`input[name="${key}"]`);
            let val = inp.value.trim().toUpperCase(); // Салыстыру үшін үлкен әріпке айналдыру
            if (inp.type === "number") val = inp.value;

            if (val === answer.toUpperCase() || val === answer) {
                inp.classList.add("correct");
                score++;
            } else if (val) {
                inp.classList.add("wrong");
            }
        }
        else {
            const selected = document.querySelector(`input[name="${key}"]:checked`);
            if (selected) {
                const lab = selected.closest("label") || selected.parentNode;
                if (selected.value === answer) {
                    lab.classList.add("correct");
                    score++;
                } else {
                    lab.classList.add("wrong");
                }
            }
        }
    }

    // Нәтижені шығару
    // Жеңілдікті есептеу логикасы
    let discount = 0;
    if (score > 0 && score <= 5) {
        discount = 5;
    } else if (score > 5 && score <= 7) {
        discount = 7;
    } else if (score > 7) {
        discount = 10;
    }

        // ==================== ЖАҢА НӘТИЖЕ (ПРОМОКОДПЕН) ====================
    let discountText = "";
    let promoCode = "";

    if (score >= 1) {
        promoCode = generatePromoCode();   // Кездейсоқ промокод
        discountText = `Құттықтаймыз! Сіз бірінші доставкаға 5% жеңілдік алдыңыз!\n\n` +
                       `Сіздің промокодыңыз: <strong>${promoCode}</strong>`;
    } else {
        discountText = "Өкінішке орай, жеңілдік алу үшін кемінде 1 сұраққа дұрыс жауап беру керек.";
    }

    const resultText = `Сіздің ұпайыңыз: ${score} / 10.\n\n${discountText}`;

    document.getElementById("quizResult").innerHTML = resultText;  // innerHTML — промокодтың стилі үшін
    document.getElementById("quizResult").style.color = score >= 1 ? "#2ecc71" : "#e74c3c";
    document.getElementById("quizResult").style.fontSize = "18px";
    document.getElementById("quizResult").style.lineHeight = "1.6";
}

// ==================== ПРОМОКОД ГЕНЕРАТОРЫ ====================
function generatePromoCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    let code = "SOLDEL-";

    for (let i = 0; i < 4; i++) {
        code += letters[Math.floor(Math.random() * letters.length)];
    }
    code += "-";
    for (let i = 0; i < 3; i++) {
        code += numbers[Math.floor(Math.random() * numbers.length)];
    }
    return code;
}