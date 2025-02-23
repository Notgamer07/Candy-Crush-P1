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

