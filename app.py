from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from resolution import full_resolution

app = Flask(__name__)
CORS(app)

# Verknüpfen von der URL '/' mit dem Ausliefern von index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Verknüpfen von der URL '/resolve' mit der Ausführung von resolve()
# methods=['POST'] bedeutet: diese Route akzeptiert nur POST-Anfragen
@app.route('/resolve', methods=['POST'])
def resolve():
    data = request.get_json()
    print("Neue Anfrage:", data) # <-- für Debugging
    initial = data['clauses']
    result = full_resolution(initial)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
