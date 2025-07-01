# Local Chatbot

A simple web-based chatbot interface that allows you to interact with local language models such as Gemma3:4 and DeepSeek-r1:1.5. The frontend is built with vanilla JavaScript, HTML, and CSS.

## Features

- Switch between different local models (Gemma3:4, DeepSeek-r1:1.5)
- Chat interface with streaming responses
- Auto-resizing input box
- Modern, responsive UI

## Project Structure

```
Local_chatbot/
├── static/
│   ├── js/
│   │   └── chat.js
│   └── styles/
│       └── style.css
├── templates/
│   └── index.html
├── app.py (or your backend server)
├── README.md
└── .gitignore
```

## Prerequisites

- [Node.js](https://nodejs.org/) (if using a Node backend) or Python 3 (if using Flask/FastAPI backend)
- A backend server that exposes `/api/generate` endpoint for model inference

## Setup Instructions

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/Local_chatbot.git
   cd Local_chatbot
   ```

2. **Install backend dependencies:**
   - If using Python (Flask/FastAPI):
     ```sh
     pip install -r requirements.txt
     ```
   - If using Node.js:
     ```sh
     npm install
     ```

3. **Configure your backend:**
   - Ensure your backend exposes a POST `/api/generate` endpoint that accepts:
     ```json
     {
       "model": "gemma3:4b",
       "messages": [{ "role": "user", "content": "Hello" }]
     }
     ```
   - The backend should stream responses in the format:
     ```
     data: {"message": {"content": "Hello, how can I help you?"}}
     ```

4. **Run the backend server:**
   - For Flask:
     ```sh
     flask run
     ```
   - For Node.js:
     ```sh
     npm start
     ```

5. **Open the app:**
   - Visit [http://localhost:5000](http://localhost:5000) or the port your backend uses.

## Customization

- Add more models to the dropdown in `static/js/chat.js`.
- Style the UI in `static/styles/style.css`.

## License

MIT License