# Password Strength Analyzer & Breach Checker

A web app that evaluates password strength and checks if your password 
has appeared in known data breaches — without ever exposing your actual password.

## Features
- Real-time strength scoring using the zxcvbn algorithm (used by Dropbox)
- Checks against 800M+ breached passwords via HaveIBeenPwned API
- Privacy-first: uses k-anonymity — only a hash prefix is sent, never the full password
- Crack time estimation and improvement suggestions

## Tech Stack
Python · Flask · zxcvbn · HaveIBeenPwned API · HTML/CSS/JS

## How to Run
```bash
git clone https://github.com/khanakbhatia/password-analyzer
cd password-analyzer
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000 in your browser.

## How k-anonymity works
Your password is hashed using SHA-1. Only the first 5 characters of that hash 
are sent to the API. The full list of matching hashes is returned and checked 
locally — so your actual password never leaves your device.
