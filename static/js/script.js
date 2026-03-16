document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt');
    const outputBox = document.getElementById('output-box');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showError("Por favor, introduce un texto para generar.");
            promptInput.focus();
            return;
        }
        setLoadingState(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: prompt
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Ocurrió un error al contactar al servidor.');
            }
            displayResult(data.result);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.textContent = 'Generando...';
            loader.classList.remove('hidden');
            outputBox.innerHTML = '<p class="placeholder-text">Pensando...</p>';
            outputBox.classList.remove('has-content');
        } else {
            generateBtn.disabled = false;
            btnText.textContent = 'Generar Texto';
            loader.classList.add('hidden');
        }
    }

    function displayResult(text) {
        outputBox.innerHTML = '';
        outputBox.classList.add('has-content');
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            outputBox.appendChild(p);
        });
    }

    function showError(message) {
        outputBox.innerHTML = `<p class="error-text">❌ Error: ${message}</p>`;
        outputBox.classList.remove('has-content');
    }
});
