from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from resolution import full_resolution

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# Verknüpfen von der URL '/' mit dem Ausliefern von index.html
@app.route('/')
def index():
    return app.send_static_file('index.html')
# Route für die Logik
@app.route('/resolve', methods=['POST'])
def resolve():
    data = request.get_json()
    print("Neue Anfrage:", data)
    result = full_resolution(data['clauses'])
    return jsonify(result)

# Route für alle anderen statischen Dateien (CSS)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)


if __name__ == '__main__':
    app.run(debug=True)
