from flask import Flask, render_template, request, jsonify
from checker import check_strength, check_breach

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    password = data.get("password", "")

    if not password:
        return jsonify({"error": "No password provided"}), 400

    strength = check_strength(password)
    breach = check_breach(password)

    return jsonify({
        "score": strength["score"],
        "crack_time": strength["crack_time"],
        "feedback": strength["feedback"],
        "warning": strength["warning"],
        "breached": breach["breached"],
        "breach_count": breach["count"]
    })

if __name__ == "__main__":
    app.run(debug=True)