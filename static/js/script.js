document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt');
    const chatMessages = document.getElementById('chat-messages');

    promptInput.addEventListener('input', function () {
        this.style.height = 'auto';
        const newHeight = Math.min(this.scrollHeight, 150);
        this.style.height = newHeight + 'px';
    });

    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBtn.click();
        }
    });

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            promptInput.focus();
            return;
        }

        appendMessage('user', prompt);

        promptInput.value = '';
        promptInput.style.height = 'auto';
        promptInput.focus();
        promptInput.disabled = true;
        generateBtn.disabled = true;

        const typingId = 'typing-' + Date.now();
        appendTypingIndicator(typingId);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: prompt })
            });
            const data = await response.json();

            removeElement(typingId);

            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al contactar al servidor.');
            }

            appendMessage('bot', data.result);
        } catch (error) {
            removeElement(typingId);
            appendMessage('bot', `❌ Error: ${error.message}`, true);
        } finally {
            promptInput.disabled = false;
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
            promptInput.focus();
        }
    });

    function appendMessage(sender, text, isError = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        if (isError) msgDiv.style.color = '#ef4444';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (sender === 'bot' && typeof marked !== 'undefined' && !isError) {
            contentDiv.innerHTML = marked.parse(text);
        } else {
            const paragraphs = text.split('\n').filter(p => p.trim() !== '');
            if (paragraphs.length === 0) {
                const p = document.createElement('p');
                p.textContent = text;
                contentDiv.appendChild(p);
            } else {
                paragraphs.forEach(pText => {
                    const p = document.createElement('p');
                    p.textContent = pText;
                    contentDiv.appendChild(p);
                });
            }
        }

        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendTypingIndicator(id) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message bot`;
        msgDiv.id = id;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-indicator';

        contentDiv.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function removeElement(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
