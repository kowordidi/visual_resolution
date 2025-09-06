from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from resolution import full_resolution
import os

app = Flask(__name__)
CORS(app)

# Statische HTML-Datei serven
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')  # index.html im selben Ordner wie app.py

@app.route('/resolve', methods=['POST'])
def resolve():
    data = request.get_json()
    # # Für Tests hardkodiert:
    # data = {"clauses": [["A","B"],["¬A","B"],["¬B"]]}
    print("Neue Anfrage:", data) # <-- für Debugging
    initial = data['clauses']
    result = full_resolution(initial)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
