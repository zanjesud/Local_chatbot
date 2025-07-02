
document.addEventListener('DOMContentLoaded', () => {
    let state = {
        model: 'gemma3:4b',
        messages: [],
        loading: false,
    };

    function render() {
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = state.messages.map(message => {
            const isUser = message.role === 'user';
            return `
                <div class="message-row">
                    <div class="avatar ${isUser ? 'user' : 'bot'}">
                        <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
                    </div>
                    <div class="message ${isUser ? 'user' : 'bot'}">
                        ${message.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }).join('');

        // Show typing indicator if loading
        document.getElementById('typing-indicator').style.display = state.loading ? 'flex' : 'none';

        // Auto-scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showAttachedFiles(files) {
        const attachedFilesDiv = document.getElementById('attached-files');
        if (files.length === 0) {
            attachedFilesDiv.innerHTML = '';
            return;
        }
        attachedFilesDiv.innerHTML = Array.from(files)
            .map(f => `<span>${f.name}</span>`)
            .join('');
    }

    function addEventListeners() {
        const chatForm = document.getElementById('chat-form');
        const promptInput = document.getElementById('prompt-input');
        const modelSelector = document.getElementById('model-selector');
        const fileInput = document.getElementById('file-input');

        fileInput.addEventListener('change', (e) => {
            // Optionally show file names or previews
            showAttachedFiles(e.target.files);
            console.log(e.target.files);
        });

        modelSelector.addEventListener('change', (e) => {
            state.model = e.target.value;
        });

        chatForm.addEventListener('submit', handleChatSubmit);
        chatForm.addEventListener('submit', async (e) => {
            showAttachedFiles([]); // Clear after submit
        });

        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.requestSubmit();
            }
        });

        // Auto-resize textarea
        promptInput.addEventListener('input', () => {
            promptInput.style.height = 'auto';
            promptInput.style.height = (promptInput.scrollHeight) + 'px';
        });
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        const promptInput = document.getElementById('prompt-input');
        const fileInput = document.getElementById('file-input');
        const prompt = promptInput.value.trim();

        if (!prompt && fileInput.files.length === 0) return;

        // Add user message to state
        state.messages.push({ role: 'user', content: prompt });

        state.loading = true;
        render();

        promptInput.value = '';
        promptInput.style.height = 'auto';

        // Prepare FormData for files and JSON data
        const formData = new FormData();
        formData.append('model', state.model);
        formData.append('messages', JSON.stringify(state.messages));
        for (const file of fileInput.files) {
            formData.append('files', file);
        }
        fileInput.value = '';

        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData,
        });

        state.loading = false;
        state.messages.push({ role: 'bot', content: '' });
        render();

        // Find the last bot message container
        const chatHistory = document.getElementById('chat-history');
        const botMessageContainers = chatHistory.querySelectorAll('.message.bot');
        const botMessageContainer = botMessageContainers[botMessageContainers.length - 1];

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botMessage = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.message && data.message.content) {
                            botMessage += data.message.content;                            
                            botMessageContainer.innerHTML = botMessage.replace(/\n/g, '<br>');
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        } else if (data.error) {
                            botMessageContainer.innerHTML = `Error: ${data.error}`;
                            return;
                        }
                    } catch (error) {
                        // Ignore JSON parsing errors
                    }
                }
            }
        }
        state.messages[state.messages.length - 1].content = botMessage;
    }

    addEventListeners();
    render();
});