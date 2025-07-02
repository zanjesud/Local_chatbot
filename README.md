# Local Chatbot

A modern web-based chatbot interface for interacting with local language models such as Gemma3:4 and DeepSeek-r1:1.5.  
Frontend is built with vanilla JavaScript, HTML, and CSS. Backend is powered by Python Flask and supports file (text, PDF, DOCX, image) attachments.

---

## Features

- Switch between multiple local models (Gemma3:4, DeepSeek-r1:1.5)
- Chat interface with streaming responses
- Auto-resizing input box
- File attachment support (text, PDF, DOCX, images)
- Modern, responsive UI with avatars and message formatting
- Markdown support in bot responses (bold, code, lists, etc.)
- Fixed input area at the bottom for seamless chat experience

---

## Folder Structure

```
Local_chatbot/
├── static/
│   ├── js/
│   │   └── chat.js           # Frontend logic
│   └── styles/
│       └── style.css         # All UI styles
├── templates/
│   └── index.html            # Main HTML template
├── app.py                    # Flask backend server
├── requirements.txt          # Python dependencies
├── README.md
└── .gitignore
```

---

## Prerequisites

- Python 3.8+
- [Ollama](https://ollama.com/) or compatible local LLM backend
- (Optional) Node.js if you want to use a Node backend

---

## Install Ollama and Supported Models

1. **Install Ollama (Windows/Mac/Linux):**  
   Follow the official instructions at [https://ollama.com/download](https://ollama.com/download)  
   Or, for most systems:
   ```sh
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start the Ollama service:**  
   ```sh
   ollama serve
   ```

3. **Pull a supported model (e.g., Gemma3:4b):**  
   ```sh
   ollama pull gemma3:4b
   ```
   Or for DeepSeek:
   ```sh
   ollama pull deepseek-r1:1.5b
   ```

---

## Setup Instructions

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/Local_chatbot.git
   cd Local_chatbot
   ```

2. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
   Required packages include: `flask`, `flask_cors`, `pdfplumber`, `python-docx`, `ollama` (Python client), etc.

3. **Start your Ollama server** (or ensure your LLM backend is running).

4. **Run the Flask backend:**
   ```sh
   python app.py
   ```
   By default, the app runs on [http://localhost:5000](http://localhost:5000).

5. **Open the app in your browser:**
   - Visit [http://localhost:5000](http://localhost:5000)

---

## API Contract

- **POST `/api/generate`**  
  Accepts `multipart/form-data` for file uploads or JSON for text-only chat.
  - Fields:
    - `model`: Model name (e.g., `gemma3:4b`)
    - `messages`: JSON string of chat history
    - `files`: (optional) attached files
  - Streams responses as:
    ```
    data: {"message": {"content": "Hello, how can I help you?"}}
    ```

- **GET `/api/models`**  
  Returns available model names.

---

## Customization

- Add more models to the dropdown in `templates/index.html` or `static/js/chat.js`.
- Adjust UI in `static/styles/style.css`.
- Extend backend logic in `app.py` for more file types or model features.

---

## License

AiTS License

---

**Need help?**  
Open an issue or discussion on the repository.