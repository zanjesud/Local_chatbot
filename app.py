import ollama
from flask import Flask, Response, jsonify, request, render_template
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models', methods=['GET'])
def get_models():
    # These are example models, you should replace them with your actual models
    return jsonify(["gemma3:4b", "deepseek-r1:1.5b"])

@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        model = data.get('model')
        messages = data.get('messages')

        if not model or not messages:
            return jsonify({"error": "model and messages are required"}), 400

        def generate_stream():
            try:
                stream = ollama.chat(model=model, messages=messages, stream=True)
                for chunk in stream:
                    # Manually construct a dictionary to ensure everything is serializable
                    response_part = {
                        'model': chunk['model'],
                        'created_at': chunk['created_at'],
                        'message': {
                            'role': chunk['message']['role'],
                            'content': chunk['message']['content']
                        },
                        'done': chunk['done']
                    }
                    yield f"data: {json.dumps(response_part)}\n\n"
            except Exception as e:
                error_message = {"error": f"Ollama API error: {str(e)}"}
                yield f"data: {json.dumps(error_message)}\n\n"

        return Response(generate_stream(), mimetype='text/event-stream')
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

