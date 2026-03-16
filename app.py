import os
from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.after_request
def add_header(response):
    response.cache_control.no_store = True
    response.cache_control.max_age = 0
    return response

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/generate", methods=["POST"])
def generate():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No se proporcionó texto de entrada"}), 400
    prompt = data["text"]
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"error": "Se requiere una API key de Gemini."}), 400
    try:
        app_topic = os.environ.get("APP_TOPIC", "Eres un asistente general y amable.")
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                "system_instruction": f"Tu rol, tópico principal o personalidad es el siguiente: {app_topic}. Asegúrate de responder siempre acorde a este contexto."
            }
        )
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8081)
