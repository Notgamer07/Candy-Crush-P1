let snakeShouldRespawn = false;  // ✅ Global variable to track snake respawn

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

    if (!termsContainer || !answersContainer || !scoreElement) {
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

        // ✅ Clear previous content
        termsContainer.innerHTML = "";
        answersContainer.innerHTML = "";

        let termElements = {};
        let answerElements = {};

        data.forEach((item, index) => {
            let termDiv = document.createElement("div");
            termDiv.classList.add("section");
            termDiv.innerText = item.term;
            termDiv.dataset.match = item.answer;
            termsContainer.appendChild(termDiv);
            termElements[item.answer] = termDiv;

            let answerDiv = document.createElement("div");
            answerDiv.classList.add("ball");
            answerDiv.innerText = shuffledAnswers[index].answer;
            answerDiv.dataset.answer = shuffledAnswers[index].answer;
            answersContainer.appendChild(answerDiv);
            answerElements[shuffledAnswers[index].answer] = answerDiv;
        });

        document.querySelectorAll(".section").forEach(term => {
            term.addEventListener("click", function () {
                document.querySelectorAll(".section").forEach(t => t.classList.remove("selected"));
                this.classList.add("selected");
                window.selectedTerm = this.dataset.match;

                // ✅ If snake was removed, spawn a new one
                if (snakeShouldRespawn) {
                    console.log("Respawning new snake..."); // Debugging log
                    spawnNewSnake();
                    snakeShouldRespawn = false;
                }
            });
        });

        document.querySelectorAll(".ball").forEach(ball => {
            ball.addEventListener("click", function () {
                if (!window.selectedTerm) return;

                let ballRect = this.getBoundingClientRect();
                let snake = document.getElementById("snake");

                if (!snake) {
                    console.error("Snake not found!");
                    return;
                }

                // ✅ Calculate time delay based on distance
                let snakeRect = snake.getBoundingClientRect();
                let distance = Math.sqrt(
                    Math.pow(ballRect.left - snakeRect.left, 2) + Math.pow(ballRect.top - snakeRect.top, 2)
                );
                let timeDelay = Math.min(distance * 3, 1500);  // Dynamic delay (max 1.5s)

                // ✅ Move snake towards the selected ball
                snake.style.opacity = "1";
                snake.style.left = `${ballRect.left}px`;
                snake.style.top = `${ballRect.top}px`;

                setTimeout(() => {
                    if (this.dataset.answer === window.selectedTerm) {
                        // ✅ Correct match animation
                        snake.classList.add("eat");
                        this.style.transform = "scale(1.2)";

                        setTimeout(() => {
                            this.style.visibility = "hidden";
                            termElements[this.dataset.answer].style.visibility = "hidden";
                            scoreElement.textContent = parseInt(scoreElement.textContent) + 1;
                        }, 500);
                    } else {
                        // ❌ Wrong match: Explosion happens only when the snake is near
                        setTimeout(() => {
                            this.classList.add("explode");
                            snake.classList.add("explode");

                            // 💥 Explosion Emoji Effect
                            let explosion = document.createElement("div");
                            explosion.innerHTML = "💥";
                            explosion.classList.add("explosion-emoji");

                            explosion.style.left = `${ballRect.left + ballRect.width / 2}px`;
                            explosion.style.top = `${ballRect.top + ballRect.height / 2}px`;

                            document.body.appendChild(explosion);

                            setTimeout(() => {
                                explosion.remove();
                            }, 500);
                        }, timeDelay); // ✅ Explosion delayed until snake reaches the ball

                        setTimeout(() => {
                            this.style.visibility = "hidden";
                            termElements[this.dataset.answer].style.visibility = "hidden";

                            let oldSnake = document.getElementById("snake");
                            if (oldSnake) oldSnake.remove(); // ✅ Remove the old snake

                            snakeShouldRespawn = true; // ✅ New snake will spawn on next selection
                        }, timeDelay + 500);
                    }

                    window.selectedTerm = null;
                    document.querySelectorAll(".section").forEach(term => term.classList.remove("selected"));
                }, timeDelay); // ✅ Delayed snake movement based on distance
            });
        });

    } catch (error) {
        console.error("Error loading match questions:", error);
        termsContainer.innerHTML = `<p class="error">Failed to load questions. Try again later.</p>`;
    }
}

// ✅ Function to spawn a new snake when needed
function spawnNewSnake() {
    // Remove any existing snake
    let existingSnake = document.getElementById("snake");
    if (existingSnake) {
        existingSnake.remove();
    }

    // ✅ Create new snake
    let newSnake = document.createElement("img");
    newSnake.src = "/static/images/snake.png";
    newSnake.id = "snake";  // ✅ Assign correct ID
    newSnake.classList.add("snake");

    // ✅ Ensure it starts from bottom-right
    newSnake.style.position = "absolute";
    newSnake.style.right = "10px";
    newSnake.style.bottom = "10px";

    document.body.appendChild(newSnake);
}
