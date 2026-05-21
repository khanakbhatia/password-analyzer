import hashlib
import requests
from zxcvbn import zxcvbn

def check_strength(password):
    result = zxcvbn(password)
    return {
        "score": result["score"],
        "crack_time": result["crack_times_display"]["offline_slow_hashing_1e4_per_second"],
        "feedback": result["feedback"]["suggestions"],
        "warning": result["feedback"]["warning"]
    }

def check_breach(password):
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    response = requests.get(url, timeout=5)
    
    if response.status_code != 200:
        return {"breached": False, "count": 0, "error": "API unavailable"}
    
    hashes = (line.split(":") for line in response.text.splitlines())
    count = next((int(c) for h, c in hashes if h == suffix), 0)
    
    return {"breached": count > 0, "count": count}