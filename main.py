from flask import Flask, render_template, jsonify, request
import os
import json

app = Flask(__name__, static_folder="static", template_folder="template")

# Get absolute path for questions.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_PATH = os.path.join(BASE_DIR, "database", "questions.json")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')  # Ensure game.html is in the templates folder

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/api/quiz')
def get_quiz():
    try:
        with open(QUESTIONS_PATH, 'r', encoding='utf-8') as file:
            questions = json.load(file)
        return jsonify(questions)
    except Exception as e:
        return jsonify({"error": "Could not load questions", "details": str(e)}), 500

@app.route('/api/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    question_id = data.get('question_id')
    selected_option = data.get('selected_option')

    try:
        with open(QUESTIONS_PATH, 'r', encoding='utf-8') as file:
            questions = json.load(file)

        correct_answer = next((q["correct_answer"] for q in questions if q["id"] == question_id), None)

        if correct_answer is None:
            return jsonify({"error": "Invalid question ID"}), 400

        return jsonify({"correct": selected_option == correct_answer})
    
    except Exception as e:
        return jsonify({"error": "Could not check answer", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
