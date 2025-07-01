document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    let state = {
        model: 'gemma3:4b',
        messages: [],
        loading: false,
    };

    function render() {
        const appContent = `
            <header>
                <h1>Local Chatbot</h1>
                <div class="controls">
                    <select id="model-selector">
                        <option value="gemma3:4b" ${state.model === 'gemma3:4b' ? 'selected' : ''}>Gemma3:4</option>
                        <option value="deepseek-r1:1.5b" ${state.model === 'deepseek-r1:1.5b' ? 'selected' : ''}>DeepSeek-r1:1.5</option>
                    </select>
                </div>
            </header>
            <main>
                <div class="chat-history">
                    ${state.messages.map(message => `
                        <div class="message ${message.role}">${message.content.replace(/\n/g, '<br>')}</div>
                    `).join('')}
                </div>
                ${state.loading ? `
                    <div class="message bot loading-indicator">
                        <div class="dot-flashing"></div>
                    </div>` : ''}
            </main>
            <footer>
                <form class="chat-input" id="chat-form">
                    <textarea id="prompt-input" placeholder="Ask me anything..." rows="1"></textarea>
                    <button type="submit" title="Send">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </footer>
        `;
        app.innerHTML = appContent;

        // Scroll to bottom of chat
        const chatHistory = app.querySelector('.chat-history');
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Add event listeners
        addEventListeners();
    }

    function addEventListeners() {
        const chatForm = document.getElementById('chat-form');
        const promptInput = document.getElementById('prompt-input');
        const modelSelector = document.getElementById('model-selector');

        modelSelector.addEventListener('change', (e) => {
            state.model = e.target.value;
        });

        chatForm.addEventListener('submit', handleChatSubmit);

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
        const prompt = promptInput.value.trim();

        if (!prompt) return;

        // Add user message to state
        state.messages.push({ role: 'user', content: prompt });
        state.loading = true;
        render(); // Re-render to show user message and loading indicator

        // Clear input and reset height
        promptInput.value = '';
        promptInput.style.height = 'auto';

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: state.model,
                messages: state.messages,
            }),
        });

        state.loading = false;
        state.messages.push({ role: 'bot', content: '' });
        render(); // Re-render to remove loading indicator and add empty bot message

        const botMessageContainer = app.querySelector('.message.bot:last-child');
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
                            // Keep scrolling to the bottom
                            const chatHistory = app.querySelector('.chat-history').parentElement;
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        } else if (data.error) {
                            botMessageContainer.innerHTML = `Error: ${data.error}`;
                            return;
                        }
                    } catch (error) {
                        // Ignore JSON parsing errors which can happen with incomplete stream chunks
                    }
                }
            }
        }
        state.messages[state.messages.length - 1].content = botMessage;
    }

    // Initial render
    render();
});