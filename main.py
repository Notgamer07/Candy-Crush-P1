from flask import Flask, render_template, jsonify, request
import json
import random

app = Flask(__name__, static_folder="static", template_folder="template")

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for the quiz page
@app.route('/quiz')
def quiz_page():
    return render_template('quiz.html')

# API route to fetch a random question
@app.route('/api/quiz', methods=['GET'])
def quiz():
    try:
        with open('database/questions.json', 'r') as f:
            questions = json.load(f)
        question = random.choice(questions)
    except (FileNotFoundError, IndexError):
        question = {}
    return jsonify(question)

# API route to check the answer
@app.route('/api/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    selected_option = data.get('selected_option')
    correct_answer = data.get('correct_answer')
    result = "Correct!" if selected_option == correct_answer else f"Wrong! The correct answer is: {correct_answer}"
    return jsonify({"result": result})

if __name__ == '__main__':
    app.run(debug=True)
