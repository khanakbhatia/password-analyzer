"""Serve a browser-only password analyzer on localhost.

No endpoint accepts or processes a password on the Flask server.
"""
from flask import Flask, render_template

app = Flask(__name__)


@app.after_request
def privacy_headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; script-src 'self'; style-src 'self'; "
        "connect-src 'self' https://api.pwnedpasswords.com; "
        "form-action 'none'; frame-ancestors 'none'"
    )
    return response


@app.get('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
