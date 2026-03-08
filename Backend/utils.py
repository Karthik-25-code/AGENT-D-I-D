from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import re


def extract_float(text: str, default: float = 0.5) -> float:
    """
    Extract first float between 0 and 1 from LLM output.
    Returns default if parsing fails.
    """

    if not text:
        return default

    # find decimals like 0.75 or 1.0
    match = re.search(r"\b(0(\.\d+)?|1(\.0+)?)\b", text)

    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass

    # fallback: detect percentage
    percent_match = re.search(r"(\d+)\s*%", text)
    if percent_match:
        value = float(percent_match.group(1)) / 100
        return min(max(value, 0.0), 1.0)

    return default


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-ultra-secret-key"
ALGORITHM = "HS256"

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440) # 24 hours
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)