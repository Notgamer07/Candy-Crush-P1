import json

with open("database/questions.json", "r") as f:
    questions = json.load(f)

print(questions)  # Should print a list of 10 question dictionaries
