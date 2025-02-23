from flask import Flask, render_template, jsonify, request
import json
import random
import os

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
        # Get the absolute path of questions.json
        file_path = os.path.abspath("database/questions.json")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        print(questions)
        if not questions:
            return jsonify({"error": "No questions available."})

        question = random.choice(questions)
        return jsonify(question)
    
    except Exception as e:
        return jsonify({"error": str(e)})
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
