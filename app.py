import ollama
from flask import Flask, Response, jsonify, request, render_template
from flask_cors import CORS
import json
import io
import pdfplumber
import docx
import base64

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify(["gemma3:4b", "deepseek-r1:1.5b"])

@app.route('/api/generate', methods=['POST'])
def generate():
    try:
        if request.content_type.startswith('multipart/form-data'):
            model = request.form.get('model')
            messages = json.loads(request.form.get('messages', '[]'))
            files = request.files.getlist('files')
            images = []

            # Read file contents and append to messages
            for file in files:
                filename = file.filename
                ext = filename.lower().split('.')[-1]
                content = ""
                if ext in ['txt', 'md', 'csv']:
                    content = file.read().decode('utf-8', errors='ignore')
                    messages.append({
                        "role": "user",
                        "content": f"[File: {filename}]\n{content[:2500]}"  # Limit to first 2500 chars
                    })
                elif ext == 'pdf':
                    with pdfplumber.open(io.BytesIO(file.read())) as pdf:
                        content = "\n".join(page.extract_text() or "" for page in pdf.pages)
                    messages.append({
                        "role": "user",
                        "content": f"[File: {filename}]\n{content[:2500]}"
                    })
                elif ext in ['docx']:
                    doc = docx.Document(io.BytesIO(file.read()))
                    content = "\n".join([para.text for para in doc.paragraphs])
                    messages.append({
                        "role": "user",
                        "content": f"[File: {filename}]\n{content[:2500]}"
                    })
                elif ext in ['jpg', 'jpeg', 'png']:
                    # Read image as base64
                    image_bytes = file.read()
                    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                    images.append(image_b64)
                else:
                    messages.append({
                        "role": "user",
                        "content": f"[Attached file: {filename}]"
                    })

            # If there are images, add them to the last user message or as a new message
            if images:
                messages.append({
                    "role": "user",
                    "content": "Image(s) attached.",
                    "images": images
                })

        else:
            data = request.get_json()
            model = data.get('model')
            messages = data.get('messages')
            files = []

        if not model or not messages:
            return jsonify({"error": "model and messages are required"}), 400

        def generate_stream():
            try:
                stream = ollama.chat(model=model, messages=messages, stream=True)
                for chunk in stream:
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

