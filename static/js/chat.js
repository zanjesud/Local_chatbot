
document.addEventListener('DOMContentLoaded', () => {
    let state = {
        model: 'gemma3:4b',
        messages: [],
        loading: false,
    };

    // Add this variable to track the current AbortController
    let currentAbortController = null;

    function render() {
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = state.messages.map((message, idx) => {
            const isUser = message.role === 'user';
            // Only add controls for bot messages
            let controls = '';
            if (!isUser) {
                controls = `
                    <div class="message-controls">
                        <button class="copy-code-btn" data-idx="${idx}" title="Copy code"><i class="fas fa-copy"></i></button>
                        <button class="copy-text-btn" data-idx="${idx}" title="Copy text"><i class="fas fa-clipboard"></i></button>
                        <button class="download-btn" data-idx="${idx}" title="Download"><i class="fas fa-download"></i></button>
                    </div>
                `;
            }
            return `
                <div class="message-row">
                    <div class="avatar ${isUser ? 'user' : 'bot'}">
                        <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
                    </div>
                    <div class="message ${isUser ? 'user' : 'bot'}">
                        ${!isUser ? controls : ''}
                        ${message.content}
                    </div>
                </div>
            `;
        }).join('');

        // Show typing indicator if loading
        document.getElementById('typing-indicator').style.display = state.loading ? 'flex' : 'none';

        // Disable/enable input and send button
        document.querySelector('.send-button').disabled = state.loading;
        document.querySelector('.chat-input').disabled = state.loading;

        // Show/hide Stop button
        const stopBtn = document.getElementById('stop-button');
        if (stopBtn) stopBtn.style.display = state.loading ? 'block' : 'none';


        // Auto-scroll to bottom
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Handle copy code button click

    function addCopyDownloadListeners() {
        // Copy code
        document.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const idx = btn.getAttribute('data-idx');
                const msg = state.messages[idx];
                // Extract code blocks only
                const codeMatches = msg.content.match(/<code.*?>([\s\S]*?)<\/code>/g);
                if (codeMatches) {
                    // Remove HTML tags and decode entities
                    const codeText = codeMatches.map(c => c.replace(/<.*?>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')).join('\n\n');
                    navigator.clipboard.writeText(codeText);
                }
            };
        });
        // Copy text
        document.querySelectorAll('.copy-text-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const idx = btn.getAttribute('data-idx');
                const msg = state.messages[idx];
                // Remove all HTML tags for plain text
                const text = msg.content.replace(/<[^>]+>/g, '');
                navigator.clipboard.writeText(text);
            };
        });
        // Download
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const idx = btn.getAttribute('data-idx');
                const msg = state.messages[idx];
                const text = msg.content.replace(/<[^>]+>/g, '');
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "chatbot_response.txt";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        });
    }

    // Copy and download button for code blocks
    function addSingleCodeCopyDownloadListeners() {
        // Copy code
        document.querySelectorAll('.copy-single-code-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const codeId = btn.getAttribute('data-target');
                const codeElem = document.getElementById(codeId);
                if (codeElem) {
                    navigator.clipboard.writeText(codeElem.innerText);
                }
            };
        });
        // Download code
        document.querySelectorAll('.download-single-code-btn').forEach(btn => {
            btn.onclick = function (e) {
                e.stopPropagation();
                const codeId = btn.getAttribute('data-target');
                const codeElem = document.getElementById(codeId);
                if (codeElem) {
                    const blob = new Blob([codeElem.innerText], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "code-block.txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            };
        });
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

    function formatBotMessage(text) {
        // Format code blocks (```lang\ncode```)
        text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            lang = lang || '';
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            return `
            <div class="code-block-wrapper">
                <div class="code-block-header">
                    <span class="code-block-lang">${lang ? lang : 'code'}</span>
                    <div class="message-controls">
                        <button class="copy-single-code-btn" data-target="${codeId}" title="Copy code">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="download-single-code-btn" data-target="${codeId}" title="Download code">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <pre class="chat-code-block"><code id="${codeId}" class="language-${lang}">${escapeHtml(code)}</code></pre>
            </div>
        `;
        });
        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        // Bold and italic
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Line breaks
        return text.replace(/\n/g, '<br>');
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, function (m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[m];
        });
    }

    async function handleChatSubmit(e) {
        e.preventDefault();
        if (state.loading) return; // Prevent double submit
        const promptInput = document.getElementById('prompt-input');
        const fileInput = document.getElementById('file-input');
        const prompt = promptInput.value.trim();

        if (!prompt && fileInput.files.length === 0) return;

        // Add user message to state
        state.messages.push({ role: 'user', content: prompt });

        state.loading = true;
        render();
        addCopyDownloadListeners();
        addSingleCodeCopyDownloadListeners();
        

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

        // Create a new AbortController for this request
        currentAbortController = new AbortController();

        let response;
        try {
            response = await fetch('/api/generate', {
                method: 'POST',
                body: formData,
                signal: currentAbortController.signal, // Pass the signal
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                // Aborted by user
                state.loading = false;
                render();
                addCopyDownloadListeners();
                addSingleCodeCopyDownloadListeners();
                // Optionally, show a message that the response was stopped
                // state.messages.push({ role: 'bot', content: '<em>Response stopped by user.</em>' });
                render();
                addCopyDownloadListeners();
                addSingleCodeCopyDownloadListeners();
                return;
            } else {
                // Other error
                state.loading = false;
                render();
                addCopyDownloadListeners();
                addSingleCodeCopyDownloadListeners();
                // state.messages.push({ role: 'bot', content: `<em>Error: ${err.message}</em>` });
                render();
                addCopyDownloadListeners();
                addSingleCodeCopyDownloadListeners();
                return;
            }
        }

        // Only now add the bot message placeholder
        state.messages.push({ role: 'bot', content: '' });
        render();
        addCopyDownloadListeners();
        addSingleCodeCopyDownloadListeners();

        // Find the last bot message container
        const chatHistory = document.getElementById('chat-history');
        const botMessageContainers = chatHistory.querySelectorAll('.message.bot');
        const botMessageContainer = botMessageContainers[botMessageContainers.length - 1];

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botMessage = '';

        try {
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
                                botMessageContainer.innerHTML = formatBotMessage(botMessage);
                                chatHistory.scrollTop = chatHistory.scrollHeight;
                                if (window.hljs) hljs.highlightAll();
                                addSingleCodeCopyDownloadListeners();
                            } else if (data.error) {
                                botMessageContainer.innerHTML = `Error: ${data.error}`;
                                state.loading = false;
                                render();
                                if (window.hljs) hljs.highlightAll();
                                addCopyDownloadListeners();
                                addSingleCodeCopyDownloadListeners();
                                return;
                            }
                        } catch (error) {
                            // Ignore JSON parsing errors
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                // Aborted during streaming
                botMessageContainer.innerHTML = '<em>Response stopped by user.</em>';
            } else {
                botMessageContainer.innerHTML = `<em>Error: ${err.message}</em>`;
            }
        }

        // After streaming is done, update state and UI
        state.messages[state.messages.length - 1].content = formatBotMessage(botMessage);
        state.loading = false;
        render();
        addCopyDownloadListeners();
        addSingleCodeCopyDownloadListeners();
        currentAbortController = null;
    }

    function addStopButtonListener() {
        const stopBtn = document.getElementById('stop-button');
        if (!stopBtn) return;
        stopBtn.onclick = function (e) {
            e.preventDefault();
            if (state.loading && currentAbortController) {
                currentAbortController.abort();
            }
        };
    }

    addEventListeners();
    render();
    addCopyDownloadListeners();
    addSingleCodeCopyDownloadListeners();
    addStopButtonListener();
});