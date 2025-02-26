document.getElementById('startButton').addEventListener('click', async function() {
    try {
        let response = await fetch('/api/quiz');
        let data = await response.json();

        if (!data || data.length === 0) {
            document.getElementById('questionText').innerText = "No questions available.";
            return;
        }

        document.getElementById('quizContainer').style.display = 'block';
        loadQuestion(data, 0);
    } catch (error) {
        console.error("Error fetching quiz data:", error);
    }
});

function loadQuestion(questions, index) {
    if (index >= questions.length) {
        document.getElementById('questionText').innerText = "End of Quiz!";
        return;
    }

    let question = questions[index];
    document.getElementById('questionText').innerText = question.question;

    let optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = "";

    question.options.forEach(option => {
        let li = document.createElement('li');
        li.innerText = option;
        li.onclick = () => checkAnswer(question.id, option, questions, index);
        optionsList.appendChild(li);
    });

    document.getElementById('skipButton').onclick = () => loadQuestion(questions, index + 1);
}

async function checkAnswer(selectedOption, correctAnswer) {
    try {
        const response = await fetch('/api/check_answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selected_option: selectedOption, correct_answer: correctAnswer })
        });

        const data = await response.json();

        if (data.result) {
            document.getElementById('message').innerText = data.result;
        } else {
            document.getElementById('message').innerText = "Error: No response received.";
        }
    } catch (error) {
        console.error("Error checking answer:", error);
        document.getElementById('message').innerText = "Error checking answer.";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const termsContainer = document.getElementById("terms-container");
    const answersContainer = document.getElementById("answers-container");

    if (!termsContainer || !answersContainer) {
        console.error("Error: Game containers not found in the DOM.");
        return;
    }
    
    const snake = document.getElementById("snake");
    const explosion = document.getElementById("explosion");

    let correctMatches = {}; // Stores correct answer mappings
    let selectedTerm = null;

    try {
        // ✅ Fetch questions from API
        let response = await fetch("/match_questions");
        if (!response.ok) throw new Error("Failed to load questions");

        let data = await response.json();
        if (data.length === 0) throw new Error("No match questions found");

        // ✅ Populate the terms and answers
        data.forEach((item, index) => {
            let term = document.createElement("div");
            term.classList.add("section");
            term.innerText = item.term;
            term.dataset.match = item.answer; // Store correct answer
            termsContainer.appendChild(term);

            let answer = document.createElement("div");
            answer.classList.add("ball");
            answer.innerText = item.answer;
            answer.dataset.id = index;
            answersContainer.appendChild(answer);

            correctMatches[item.term] = item.answer;
        });
        document.querySelectorAll(".section").forEach(section => {
            section.addEventListener("click", function () {
                selectedTerm = this.innerText;
            });
        });

        document.querySelectorAll(".ball").forEach(ball => {
            ball.addEventListener("click", function () {
                if (!selectedTerm) return;

                let selectedAnswer = this.innerText;
                let correctAnswer = data.find(q => q.term === selectedTerm)?.answer;

                if (selectedAnswer === correctAnswer) {
                    this.style.visibility = "hidden"; // Hide correct answer
                    document.getElementById("score").textContent++;
                } else {
                    alert("Wrong match!");
                }

                selectedTerm = null;
            });
        });
    } catch (error) {
        console.error("Error loading match questions:", error);
        termsContainer.innerHTML = `<p class="error">Failed to load questions. Try again later.</p>`;
        return; // Prevent further execution if data loading fails
    }

    // ✅ Event listener for selecting a term
    document.querySelectorAll(".section").forEach(section => {
        section.addEventListener("click", function() {
            selectedTerm = this.innerText;
        });
    });

    // ✅ Event listener for selecting an answer
    document.querySelectorAll(".ball").forEach(ball => {
        ball.addEventListener("click", function() {
            if (!selectedTerm) return;

            let selectedAnswer = this.innerText;

            // Move the snake towards the selected ball
            let ballRect = this.getBoundingClientRect();
            snake.style.left = `${ballRect.left}px`;
            snake.style.top = `${ballRect.top}px`;
            snake.classList.remove("hidden");

            if (correctMatches[selectedTerm] === selectedAnswer) {
                // ✅ Correct Match: Snake Eats the Ball
                setTimeout(() => {
                    this.style.visibility = "hidden";
                    document.getElementById("score").textContent++;
                }, 500);
            } else {
                // ❌ Wrong Match: Snake & Ball Explode
                explosion.classList.remove("hidden");
                explosion.style.left = `${ballRect.left}px`;
                explosion.style.top = `${ballRect.top}px`;

                setTimeout(() => {
                    this.style.visibility = "hidden";
                    explosion.classList.add("hidden");
                    snake.classList.add("hidden");
                }, 500);
            }

            selectedTerm = null;  // Reset selection
        });
    });
});
