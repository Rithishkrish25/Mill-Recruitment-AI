from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import asyncio
import os
import uuid
import subprocess
import edge_tts


app = Flask(__name__)
CORS(app)

AUDIO_DIR = "generated_audio"
os.makedirs(AUDIO_DIR, exist_ok=True)


async def generate_audio(text, output_file, voice):
    command = [
        "edge-tts",
        "--voice",
        voice,
        "--text",
        text,
        "--write-media",
        output_file
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        raise Exception(result.stderr)

    if not os.path.exists(output_file):
        raise Exception("Audio file was not created")

    if os.path.getsize(output_file) == 0:
        raise Exception("Audio file is empty")


@app.post("/tts")
def text_to_speech():
    data = request.get_json()

    if not data or not data.get("text"):
        return jsonify({
            "success": False,
            "message": "Text is required"
        }), 400

    text = data["text"].strip()
    voice = data.get(
        "voice",
        "ta-IN-PallaviNeural"
    )

    print("Received text:", text)
    print("Voice:", voice)

    filename = f"{uuid.uuid4()}.mp3"
    output_file = os.path.join(
        AUDIO_DIR,
        filename
    )

    max_attempts = 3

    for attempt in range(1, max_attempts + 1):
        try:
            print(
                f"TTS attempt {attempt}/{max_attempts}"
            )

            asyncio.run(
                edge_tts.Communicate(
                    text,
                    voice
                ).save(output_file)
            )

            if not os.path.exists(output_file):
                raise Exception(
                    "Audio file was not created"
                )

            file_size = os.path.getsize(
                output_file
            )

            if file_size == 0:
                raise Exception(
                    "Audio file is empty"
                )

            print(
                "Audio created:",
                output_file
            )
            print(
                "File size:",
                file_size
            )

            return send_file(
                output_file,
                mimetype="audio/mpeg",
                as_attachment=False
            )

        except Exception as error:
            print(
                f"TTS attempt {attempt} failed:",
                repr(error)
            )

            if os.path.exists(output_file):
                try:
                    os.remove(output_file)
                except Exception:
                    pass

            if attempt < max_attempts:
                import time
                time.sleep(1)

    return jsonify({
        "success": False,
        "message": "TTS service temporarily unavailable"
    }), 503

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False
    )