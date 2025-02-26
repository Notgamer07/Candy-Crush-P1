document.addEventListener("DOMContentLoaded", async () => {
    if (document.getElementById("quiz-container")) {
        await loadQuiz();
    } else if (document.getElementById("terms-container") && document.getElementById("answers-container")) {
        await loadGame();
    }
});

async function loadGame() {
    const termsContainer = document.getElementById("terms-container");
    const answersContainer = document.getElementById("answers-container");
    const scoreElement = document.getElementById("score");
    const snake = document.getElementById("snake");

    if (!termsContainer || !answersContainer || !scoreElement || !snake) {
        console.error("Error: Game elements not found in the DOM.");
        return;
    }

    window.selectedTerm = null;
    scoreElement.textContent = "0";

    try {
        let response = await fetch("/match_questions");
        if (!response.ok) throw new Error("Failed to load match questions");

        let data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("No match questions found");

        let shuffledAnswers = [...data].sort(() => Math.random() - 0.5);

        // ✅ Clear previous content to prevent overlapping
        termsContainer.innerHTML = "";
        answersContainer.innerHTML = "";

        // ✅ Create mapping for terms and answers
        let termElements = {};
        let answerElements = {};

        data.forEach((item, index) => {
            let termDiv = document.createElement("div");
            termDiv.classList.add("section");
            termDiv.innerText = item.term;
            termDiv.dataset.match = item.answer;
            termsContainer.appendChild(termDiv);
            termElements[item.answer] = termDiv; //  Store reference for hiding later

            let answerDiv = document.createElement("div");
            answerDiv.classList.add("ball");
            answerDiv.innerText = shuffledAnswers[index].answer;
            answerDiv.dataset.answer = shuffledAnswers[index].answer;
            answersContainer.appendChild(answerDiv);
            answerElements[shuffledAnswers[index].answer] = answerDiv; // Store reference
        });

        document.querySelectorAll(".section").forEach(term => {
            term.addEventListener("click", function () {
                document.querySelectorAll(".section").forEach(t => t.classList.remove("selected"));
                this.classList.add("selected");
                window.selectedTerm = this.dataset.match;
            });
        });

        document.querySelectorAll(".ball").forEach(ball => {
            ball.addEventListener("click", function () {
                if (!window.selectedTerm) return;

                let ballRect = this.getBoundingClientRect();
                let snakeX = window.innerWidth - 50;  //  Start snake from right corner
                let snakeY = window.innerHeight - 50;

                //  Make snake visible and move it towards the selected ball
                snake.style.opacity = "1";
                snake.style.left = `${snakeX}px`;
                snake.style.top = `${snakeY}px`;

                setTimeout(() => {
                    snake.style.left = `${ballRect.left}px`;
                    snake.style.top = `${ballRect.top}px`;
                }, 100);

                if (this.dataset.answer === window.selectedTerm) {
                    //  Correct Match: Delay hiding the ball until the snake reaches it
                    setTimeout(() => {
                        snake.classList.add("eat");
                        this.style.transform = "scale(1.2)";
                    }, 500);

                    setTimeout(() => {
                        this.style.visibility = "hidden"; //  Hide ball AFTER snake reaches it
                        termElements[this.dataset.answer].style.visibility = "hidden"; //  Hide matched term
                        scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
                    }, 1000);
                } else {
                    //  Wrong Match: Explosion animation
                    setTimeout(() => {
                        this.classList.add("explode");
                        snake.classList.add("explode");
                    }, 500);

                    setTimeout(() => {
                        this.style.visibility = "hidden"; //  Delayed disappearance
                        termElements[this.dataset.answer].style.visibility = "hidden"; 
                        snake.style.opacity = "0"; //  Snake disappears
                    }, 1000);
                }

                window.selectedTerm = null;
                document.querySelectorAll(".section").forEach(term => term.classList.remove("selected"));
            });
        });

    } catch (error) {
        console.error("Error loading match questions:", error);
        termsContainer.innerHTML = `<p class="error">Failed to load questions. Try again later.</p>`;
    }
}
