from flask import Flask, render_template, jsonify, request
import json
import random 
import os

app = Flask(__name__, static_folder="static", template_folder="template")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Get the directory of main.py
QUESTIONS_PATH = os.path.join(BASE_DIR, "questions.json")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html') 

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/api/quiz')
def get_quiz():
    try:
        with open(QUESTIONS_PATH, 'r', encoding='utf-8') as file:
            questions = json.load(file)
        if not questions:
            return jsonify({"error": "No questions available."})
        return jsonify(random.choice(questions))  # Return only one question
    except Exception as e:
        return jsonify({"error": "Could not load questions", "details": str(e)}), 500

@app.route('/api/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    selected_option = data.get('selected_option')
    correct_answer = data.get('correct_answer')

    if not selected_option or not correct_answer:
        return jsonify({"error": "Missing data"}), 400

    if selected_option == correct_answer:
        result_text = "✅ Correct!"
    else:
        result_text = f"❌ Wrong! The correct answer was: {correct_answer}"

    return jsonify({"result": result_text})

@app.route("/match_questions")
def get_match_questions():
    with open("data/match_questions.json", "r") as file:
        return jsonify(json.load(file))


if __name__ == '__main__':
    app.run(debug=True)
