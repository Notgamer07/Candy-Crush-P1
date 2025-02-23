document.addEventListener("DOMContentLoaded", function () {
    fetchQuestion();
});

// Function to fetch a random question
async function fetchQuestion() {
    try {
        const response = await fetch('/api/quiz');
        const data = await response.json();

        if (!data.question) {
            document.getElementById('question').innerText = "No questions available.";
            return;
        }

        document.getElementById('question').innerText = data.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        data.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-primary', 'm-2');
            button.innerText = option;
            button.onclick = () => checkAnswer(option, data.correct_answer);
            optionsContainer.appendChild(button);
        });

        document.getElementById('message').innerText = "";
    } catch (error) {
        console.error('Error fetching question:', error);
        document.getElementById('question').innerText = "Error loading question.";
    }
}

// Function to check the answer
async function checkAnswer(selectedOption, correctAnswer) {
    try {
        const response = await fetch('/api/check_answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selected_option: selectedOption, correct_answer: correctAnswer })
        });

        const data = await response.json();
        document.getElementById('message').innerText = data.result;
    } catch (error) {
        console.error('Error checking answer:', error);
        document.getElementById('message').innerText = "Error checking answer.";
    }
}

// Function to skip the question
function skipQuestion() {
    fetchQuestion();
}
